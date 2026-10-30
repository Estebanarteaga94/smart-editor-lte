import { getSchema } from '@tiptap/core';
import { Fragment } from '@tiptap/pm/model';
import { z } from 'zod';
import { createEditorExtensions } from '../core/editor-extensions';
import {
  canonicalContentSchemaVersion,
  parseCanonicalEditorContent,
  type CanonicalEditorContent,
} from '../models/editor-content';
import { preservedDocumentSchema } from '../models/preserved-html';
import { prepareHtmlImport } from './html-import.service';
import { serializePreservedHtml } from './preserved-html.service';

/** Version of the shared editor contract, not an additional HTML allowlist. */
export const editorHtmlPolicyId = 'editor-html-v1' as const;
/** @deprecated Use editorHtmlPolicyId. The reduced pilot policy has been removed. */
export const pilotHtmlPolicyId = editorHtmlPolicyId;
export type PrepareHtmlInput = Readonly<{ html: string; policyId?: typeof editorHtmlPolicyId }>;
export type PrepareHtmlFailureCode =
  'POLITICA_NO_SOPORTADA' | 'HTML_NO_PERMITIDO' | 'CONTENIDO_REQUIERE_ADAPTACION';
export type PrepareHtmlResult =
  | Readonly<{
      ok: true;
      policyId: typeof editorHtmlPolicyId;
      schemaVersion: typeof canonicalContentSchemaVersion;
      html: string;
      contentJson: CanonicalEditorContent;
      cambios: readonly [];
    }>
  | Readonly<{
      ok: false;
      codigo: PrepareHtmlFailureCode;
      incidencias: readonly Readonly<{ codigo: string; mensaje: string }>[];
    }>;
/** @deprecated Use the shared editor types. */
export type PreparePilotHtmlInput = PrepareHtmlInput;
export type PreparePilotHtmlResult = PrepareHtmlResult;
export type PreparePilotHtmlFailureCode = PrepareHtmlFailureCode;

const inputSchema = z.object({ html: z.string(), policyId: z.literal(editorHtmlPolicyId).optional() }).strict();
function failure(codigo: PrepareHtmlFailureCode): PrepareHtmlResult {
  const mensaje = {
    POLITICA_NO_SOPORTADA: 'La versión del contrato HTML solicitada no está soportada.',
    HTML_NO_PERMITIDO: 'El contenido no es admitido por el importador del editor.',
    CONTENIDO_REQUIERE_ADAPTACION: 'El contenido requiere adaptación antes de poder aplicarse.',
  }[codigo];
  return Object.freeze({ ok: false, codigo,
    incidencias: Object.freeze([Object.freeze({ codigo, mensaje })]) });
}
function freezeContent(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  Object.values(value).forEach(freezeContent);
  Object.freeze(value);
}

/** Pure adapter of the current editor importer. No view, storage, callbacks or template evaluation. */
export function prepareHtmlContent(input: PrepareHtmlInput): PrepareHtmlResult {
  if (input && typeof input === 'object' && 'policyId' in input &&
      input.policyId !== undefined && input.policyId !== editorHtmlPolicyId)
    return failure('POLITICA_NO_SOPORTADA');
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success || typeof document === 'undefined') return failure('HTML_NO_PERMITIDO');
  const { html } = parsed.data;
  try {
    const schema = getSchema(createEditorExtensions());
    // Clearing a field is a local form operation; the interactive importer rejects empty input.
    const imported = html === '' ? null : prepareHtmlImport(html, schema, { mode: 'strict', preserveSource: true });
    if (imported && !imported.ok) return failure('HTML_NO_PERMITIDO');
    if (imported && (imported.html !== html || imported.warnings?.length))
      return failure('CONTENIDO_REQUIERE_ADAPTACION');
    let model = imported?.content ? schema.nodeFromJSON(imported.content) : schema.topNodeType.createAndFill()!;
    // Match the existing trailing-node plugin before application. The cursor paragraph
    // remains internal; the source serializer returns the original HTML unchanged.
    if (model.lastChild?.type.name !== 'paragraph')
      model = model.copy(model.content.append(Fragment.from(schema.nodes.paragraph.create())));
    const contentJson = parseCanonicalEditorContent(JSON.parse(JSON.stringify(model.toJSON())));
    if (contentJson.attrs?.preservedDocument) {
      const envelope = preservedDocumentSchema.parse(contentJson.attrs.preservedDocument);
      contentJson.attrs = { ...contentJson.attrs, preservedDocument: {
        ...envelope, baseline: JSON.stringify(model.toJSON().content),
      } };
    }
    model = schema.nodeFromJSON(contentJson);
    model.check();
    if (html !== '' && serializePreservedHtml(model) !== html)
      return failure('CONTENIDO_REQUIERE_ADAPTACION');
    freezeContent(contentJson);
    return Object.freeze({ ok: true, policyId: editorHtmlPolicyId,
      schemaVersion: canonicalContentSchemaVersion, html, contentJson, cambios: Object.freeze<[]>([]) });
  } catch {
    return failure('HTML_NO_PERMITIDO');
  }
}
