import type { Editor } from '@tiptap/core';
import { closeHistory } from '@tiptap/pm/history';
import { DOMSerializer, type Node as ModelNode } from '@tiptap/pm/model';
import { Selection, type EditorState, type Transaction } from '@tiptap/pm/state';
import { z } from 'zod';
import {
  parseCanonicalEditorContent,
  canonicalContentSchemaVersion,
} from '../models/editor-content';
import {
  editorHtmlPolicyId,
  prepareHtmlContent,
  type PreparePilotHtmlResult,
} from './prepare-html-content.service';
import { getRenderableEditorHtmlFromContent } from './serializer.service';
import { serializePreservedHtml } from './preserved-html.service';

export type PreparedHtmlContent = Extract<PreparePilotHtmlResult, { ok: true }>;
export type ApplyPreparedHtmlFailureCode =
  'CANDIDATO_INVALIDO' | 'EDITOR_NO_DISPONIBLE' | 'APLICACION_RECHAZADA';
export type ApplyPreparedHtmlResult =
  | Readonly<{ ok: true; aplicado: boolean; html: string }>
  | Readonly<{ ok: false; codigo: ApplyPreparedHtmlFailureCode }>;

const candidateSchema = z
  .object({
    ok: z.literal(true),
    policyId: z.literal(editorHtmlPolicyId),
    schemaVersion: z.literal(canonicalContentSchemaVersion),
    html: z.string(),
    contentJson: z.unknown(),
    cambios: z.tuple([]),
  })
  .strict();
const supportedEditors = new WeakSet<Editor>();
const availability = new WeakMap<Editor, () => boolean>();
const batchLocks = new WeakSet<Editor>();
const checks = new WeakMap<Transaction, (state: EditorState) => void>();

/** Internal factory hook: runs before Tiptap updates its view or emits change events. */
export function registerPreparedHtmlEditor(editor: Editor): void {
  supportedEditors.add(editor);
  const dispatch = editor.view.props.dispatchTransaction!;
  editor.view.setProps({
    dispatchTransaction(transaction) {
      if (batchLocks.has(editor)) throw new Error('Editor locked during coordinated application.');
      dispatch.call(this, transaction);
    },
  });
  editor.on('beforeTransaction', ({ transaction, nextState }) => {
    checks.get(transaction)?.(nextState);
  });
}

export function renderPreparedDocument(doc: ModelNode, empty: boolean): string {
  const preserved = serializePreservedHtml(doc);
  if (preserved !== null) return preserved;
  const template = document.createElement('template');
  template.content.append(DOMSerializer.fromSchema(doc.type.schema).serializeFragment(doc.content));
  // The schema represents an explicit clear as its empty paragraph, as preparation does.
  return empty
    ? ''
    : getRenderableEditorHtmlFromContent(
        template.innerHTML,
        parseCanonicalEditorContent(doc.toJSON()),
      );
}

/** Internal availability supplied by the existing mounted view. */
export function setPreparedHtmlAvailability(editor: Editor, check: () => boolean): void {
  availability.set(editor, check);
}

export function isPreparedHtmlEditorAvailable(editor: Editor, allowLocked = false): boolean {
  return (
    supportedEditors.has(editor) &&
    !editor.isDestroyed &&
    !editor.isCapturingTransaction &&
    !editor.view.composing &&
    editor.isEditable &&
    (allowLocked || !batchLocks.has(editor)) &&
    (availability.get(editor)?.() ?? true)
  );
}

export function lockPreparedHtmlEditors(editors: readonly Editor[]): () => void {
  editors.forEach((editor) => batchLocks.add(editor));
  return () => editors.forEach((editor) => batchLocks.delete(editor));
}

export interface PreparedHtmlApplicationPlan {
  editor: Editor;
  before: EditorState;
  doc: ModelNode;
  html: string;
  transaction: Transaction | null;
}

/** Shared validation and transaction construction, with no live state mutation. */
export function planPreparedHtmlApplication(
  editor: Editor,
  candidate: PreparedHtmlContent,
):
  | { ok: true; plan: PreparedHtmlApplicationPlan }
  | Extract<ApplyPreparedHtmlResult, { ok: false }> {
  if (!isPreparedHtmlEditorAvailable(editor)) return { ok: false, codigo: 'EDITOR_NO_DISPONIBLE' };
  let doc: ModelNode;
  let html: string;
  try {
    const parsed = candidateSchema.safeParse(candidate);
    if (!parsed.success) return { ok: false, codigo: 'CANDIDATO_INVALIDO' };
    const prepared = prepareHtmlContent({
      html: parsed.data.html,
      policyId: parsed.data.policyId,
    });
    if (!prepared.ok) return { ok: false, codigo: 'CANDIDATO_INVALIDO' };
    doc = editor.schema.nodeFromJSON(parseCanonicalEditorContent(parsed.data.contentJson));
    doc.check();
    if (!doc.eq(editor.schema.nodeFromJSON(prepared.contentJson)))
      return { ok: false, codigo: 'CANDIDATO_INVALIDO' };
    html = prepared.html;
    if (renderPreparedDocument(doc, html === '') !== html)
      return { ok: false, codigo: 'CANDIDATO_INVALIDO' };
  } catch {
    return { ok: false, codigo: 'CANDIDATO_INVALIDO' };
  }

  const before = editor.state;
  if (before.doc.eq(doc) || (html !== '' && renderPreparedDocument(before.doc, false) === html))
    return { ok: true, plan: { editor, before, doc: before.doc, html, transaction: null } };
  const tr = closeHistory(before.tr)
    .replaceWith(0, before.doc.content.size, doc.content)
    .setDocAttribute('preservedDocument', doc.attrs.preservedDocument)
    .setStoredMarks(null)
    .setMeta('preservedImport', true);
  tr.setSelection(Selection.atStart(tr.doc));
  // closeHistory separates the preceding edit; a zero timestamp makes the next
  // ordinary edit start a new history group too (ProseMirror history prevTime).
  tr.setTime(0);
  return { ok: true, plan: { editor, before, doc, html, transaction: tr } };
}

/** Apply to one existing editor, retaining native dispatch and its normal callbacks. */
export function applyPreparedHtml(
  editor: Editor,
  candidate: PreparedHtmlContent,
): ApplyPreparedHtmlResult {
  const result = planPreparedHtmlApplication(editor, candidate);
  if (!result.ok) return result;
  const { before, doc, html, transaction: tr } = result.plan;
  if (!tr) return { ok: true, aplicado: false, html };
  checks.set(tr, (nextState) => {
    if (
      editor.state !== before ||
      !nextState.doc.eq(doc) ||
      renderPreparedDocument(nextState.doc, html === '') !== html
    )
      throw new Error('Prepared HTML transaction rejected before commit.');
  });
  try {
    editor.view.dispatch(tr);
  } catch (cause) {
    // Never report rollback after a host callback already observed a committed edit.
    if (editor.state !== before) throw cause;
    return { ok: false, codigo: 'APLICACION_RECHAZADA' };
  } finally {
    checks.delete(tr);
  }
  return editor.state === before
    ? { ok: false, codigo: 'APLICACION_RECHAZADA' }
    : { ok: true, aplicado: true, html };
}
