/** @vitest-environment jsdom */
import { Plugin } from '@tiptap/pm/state';
import { closeHistory, undoDepth, redoDepth } from '@tiptap/pm/history';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyPreparedHtml,
  prepareHtmlContent,
  pilotHtmlPolicyId,
  type PreparedHtmlContent,
  mountEditorApp,
  type MountedEditorApp,
} from '../../lib';
import { createWysiwygEditor } from '../core/create-editor';
import { getRenderableEditorHtml } from './serializer.service';

const editors: ReturnType<typeof createWysiwygEditor>[] = [];
const apps: MountedEditorApp[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  apps.forEach((app) => app.lifecycle.dispose());
  editors.forEach((editor) => {
    if (!editor.isDestroyed) editor.destroy();
  });
  apps.length = 0;
  editors.length = 0;
  document.body.replaceChildren();
});
function prepare(html: string): PreparedHtmlContent {
  const candidate = prepareHtmlContent({ html, policyId: pilotHtmlPolicyId });
  if (!candidate.ok) throw new Error('Expected valid candidate');
  return candidate;
}
function setup(initialContent = '<p>Original</p>') {
  const element = document.createElement('div');
  document.body.append(element);
  const onChange = vi.fn();
  const editor = createWysiwygEditor({ element, initialContent, onChange });
  editors.push(editor);
  return { editor, onChange };
}
function snapshot(editor: ReturnType<typeof createWysiwygEditor>) {
  return {
    state: editor.state,
    json: editor.getJSON(),
    html: editor.getHTML(),
    dom: document.body.innerHTML,
    focus: document.activeElement,
    undo: undoDepth(editor.state),
    redo: redoDepth(editor.state),
  };
}

describe('applyPreparedHtml', () => {
  it.each([
    '<p>Uno<br>Dos</p>',
    '<p>https://example.com</p>',
    '<p><strong>Texto</strong> y <em>otro</em></p>',
    '<ul><li><p>Uno</p></li></ul><p></p>',
    '<ol><li><p>Uno</p></li></ol><p></p>',
    '<p>{{#if x}}{{{valor}}}{{else}}otro{{/if}}</p>',
    '<p><br></p>',
  ])('applies exact JSON on the same editor and supports undo/redo: %s', (html) => {
    const { editor, onChange } = setup();
    editor.commands.setTextSelection({ from: 2, to: 5 });
    const before = editor.state;
    const dom = editor.view.dom;
    const transaction = vi.fn();
    editor.on('transaction', transaction);
    const focus = document.activeElement;
    expect(applyPreparedHtml(editor, prepare(html))).toEqual({ ok: true, aplicado: true, html });
    expect(editor.view.dom).toBe(dom);
    expect(document.activeElement).toBe(focus);
    expect(getRenderableEditorHtml(editor)).toBe(html);
    expect(editor.state.doc.eq(editor.schema.nodeFromJSON(prepare(html).contentJson))).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(undoDepth(editor.state)).toBe(1);
    expect(editor.commands.undo()).toBe(true);
    expect(editor.state.doc.eq(before.doc)).toBe(true);
    expect(editor.state.selection.eq(before.selection)).toBe(true);
    expect(editor.commands.redo()).toBe(true);
    expect(getRenderableEditorHtml(editor)).toBe(html);
  });

  it('accepts a copied candidate with equivalent JSON property ordering', () => {
    const { editor } = setup();
    const candidate = prepare('<p>Transferido</p>');
    const copied: PreparedHtmlContent = {
      ...candidate,
      contentJson: {
        content: candidate.contentJson.content,
        attrs: candidate.contentJson.attrs,
        type: 'doc',
      },
    };
    expect(applyPreparedHtml(editor, copied)).toEqual({
      ok: true,
      aplicado: true,
      html: candidate.html,
    });
    expect(editor.getHTML()).toBe(candidate.html);
  });

  it('keeps preceding and subsequent edits in separate history groups', () => {
    const { editor } = setup();
    editor.commands.insertContent('Antes ');
    const previous = editor.getHTML();
    const depth = undoDepth(editor.state);
    expect(applyPreparedHtml(editor, prepare('<p>Propuesta</p>')).ok).toBe(true);
    expect(undoDepth(editor.state)).toBe(depth + 1);
    editor.commands.insertContent('Después ');
    expect(undoDepth(editor.state)).toBe(depth + 2);
    editor.commands.undo();
    expect(editor.getHTML()).toBe('<p>Propuesta</p>');
    editor.commands.undo();
    expect(editor.getHTML()).toBe(previous);
    editor.commands.undo();
    expect(editor.getHTML()).toBe('<p>Original</p>');
    editor.commands.redo();
    expect(editor.getHTML()).toBe(previous);
    editor.commands.redo();
    expect(editor.getHTML()).toBe('<p>Propuesta</p>');
    editor.commands.redo();
    expect(editor.getText()).toContain('Después');
  });

  it('clears explicitly with normal empty schema semantics and undo', () => {
    const { editor, onChange } = setup();
    expect(applyPreparedHtml(editor, prepare(''))).toEqual({ ok: true, aplicado: true, html: '' });
    expect(editor.isEmpty).toBe(true);
    expect(editor.getHTML()).toBe('<p></p>');
    expect(onChange).toHaveBeenCalledTimes(1);
    editor.commands.undo();
    expect(editor.getHTML()).toBe('<p>Original</p>');
    editor.commands.redo();
    expect(editor.isEmpty).toBe(true);
  });

  it('does not dispatch or erase redo for an identical document', () => {
    const { editor, onChange } = setup();
    editor.commands.insertContent('Cambio');
    editor.commands.undo();
    const before = snapshot(editor);
    onChange.mockClear();
    const transaction = vi.fn();
    editor.on('transaction', transaction);
    expect(applyPreparedHtml(editor, prepare('<p>Original</p>'))).toEqual({
      ok: true,
      aplicado: false,
      html: '<p>Original</p>',
    });
    expect(snapshot(editor)).toEqual(before);
    expect(onChange).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
  });

  it.each([
    null,
    {},
    { ok: false },
    { ...prepare('<p>Nuevo</p>'), policyId: 'otra' },
    { ...prepare('<p>Nuevo</p>'), schemaVersion: 1 },
    { ...prepare('<p>Nuevo</p>'), html: '<p>Distinto</p>' },
    { ...prepare('<p>Nuevo</p>'), contentJson: { type: 'doc', content: [] } },
    { ...prepare('<p>Nuevo</p>'), cambios: ['limpieza'] },
    { ...prepare('<p>Nuevo</p>'), html: '<p style="color:red">Nuevo</p>' },
    { ...prepare('<p>Nuevo</p>'), extra: true },
    {
      ...prepare('<p>Nuevo</p>'),
      contentJson: { ...prepare('<p>Nuevo</p>').contentJson, attrs: { preservedDocument: {} } },
    },
  ])('rejects invalid or tampered candidates without effects: %j', (candidate) => {
    const { editor, onChange } = setup();
    editor.commands.insertContent('Cambio');
    editor.view.dispatch(closeHistory(editor.state.tr));
    editor.commands.insertContent('Otro');
    editor.commands.undo();
    editor.commands.setTextSelection({ from: 2, to: 4 });
    editor.view.focus();
    const before = snapshot(editor);
    onChange.mockClear();
    const transaction = vi.fn();
    editor.on('transaction', transaction);
    expect(applyPreparedHtml(editor, candidate as PreparedHtmlContent)).toEqual({
      ok: false,
      codigo: 'CANDIDATO_INVALIDO',
    });
    expect(snapshot(editor)).toEqual(before);
    expect(onChange).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
    expect(before.undo).toBeGreaterThan(0);
    expect(before.redo).toBeGreaterThan(0);
  });

  it.each(['filter', 'append', 'throw'] as const)(
    'rejects plugin %s before visible state or callbacks change',
    (kind) => {
      const { editor, onChange } = setup();
      editor.commands.insertContent('Cambio');
      editor.commands.undo();
      editor.registerPlugin(
        new Plugin({
          filterTransaction: (tr) => {
            if (!tr.docChanged) return true;
            if (kind === 'throw') throw new Error('Plugin failure');
            return kind !== 'filter';
          },
          appendTransaction: (transactions, _old, next) =>
            kind === 'append' && transactions.some((tr) => tr.docChanged)
              ? next.tr.insertText('Alterado', 1)
              : null,
        }),
      );
      const before = snapshot(editor);
      onChange.mockClear();
      const transaction = vi.fn();
      editor.on('transaction', transaction);
      expect(applyPreparedHtml(editor, prepare('<p>Nuevo</p>'))).toEqual({
        ok: false,
        codigo: 'APLICACION_RECHAZADA',
      });
      expect(snapshot(editor)).toEqual(before);
      expect(onChange).not.toHaveBeenCalled();
      expect(transaction).not.toHaveBeenCalled();
    },
  );

  it.each(['<ul><li><p>Uno</p></li></ul>', '<ol><li><p>Uno</p></li></ol>'])(
    'applies a final list without changing its serialized HTML: %s',
    (html) => {
      const { editor, onChange } = setup();
      expect(applyPreparedHtml(editor, prepare(html))).toEqual({ ok: true, aplicado: true, html });
      expect(editor.getHTML()).toBe(html);
      expect(onChange).toHaveBeenCalledTimes(1);
      editor.commands.undo();
      expect(editor.getHTML()).toBe('<p>Original</p>');
      editor.commands.redo();
      expect(editor.getHTML()).toBe(html);
    },
  );

  it('replaces preserved HTML with plain prepared content and restores its envelope on undo', () => {
    const original =
      '<!DOCTYPE html><html><head><style>p{color:red}</style></head><body><p>{{valor}}</p></body></html>';
    const { editor } = setup(original);
    const before = editor.getJSON();
    expect(applyPreparedHtml(editor, prepare('<p>{{literal}}</p>')).ok).toBe(true);
    expect(editor.getJSON().attrs?.preservedDocument).toMatchObject({ source: '<p>{{literal}}</p>', head: '' });
    expect(editor.getHTML()).not.toContain('color:red');
    editor.commands.undo();
    expect(editor.getJSON()).toEqual(before);
    expect(editor.getHTML()).toBe(original);
    editor.commands.redo();
    expect(editor.getHTML()).toBe('<p>{{literal}}</p>');
  });

  it('rejects read-only and destroyed editors', () => {
    const { editor, onChange } = setup();
    editor.setEditable(false);
    onChange.mockClear();
    const before = snapshot(editor);
    expect(applyPreparedHtml(editor, prepare('<p>Nuevo</p>'))).toEqual({
      ok: false,
      codigo: 'EDITOR_NO_DISPONIBLE',
    });
    expect(snapshot(editor)).toEqual(before);
    expect(onChange).not.toHaveBeenCalled();
    editor.destroy();
    expect(applyPreparedHtml(editor, prepare('<p>Nuevo</p>'))).toEqual({
      ok: false,
      codigo: 'EDITOR_NO_DISPONIBLE',
    });
  });

  it('propagates host callback errors after commit instead of claiming rollback', () => {
    const { editor } = setup();
    editor.on('update', () => {
      throw new Error('Host callback failed');
    });
    expect(() => applyPreparedHtml(editor, prepare('<p>Nuevo</p>'))).toThrow(
      'Host callback failed',
    );
    expect(editor.getHTML()).toBe('<p>Nuevo</p>');
    expect(undoDepth(editor.state)).toBe(1);
  });

  it('exposes application on the existing mounted editor with normal change callbacks', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const saveDocument = vi.fn();
    const onChange = vi.fn();
    const app = await mountEditorApp({
      app: host,
      embedded: true,
      autosave: { enabled: false, debounceMs: 1000 },
      storage: { loadDocument: () => Promise.resolve(null), saveDocument },
      onChange,
    });
    apps.push(app);
    expect(app.applyPreparedHtml(prepare('<p>Montado</p>')).ok).toBe(true);
    expect(app.editor.getHTML()).toBe('<p>Montado</p>');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(saveDocument).not.toHaveBeenCalled();
    app.editor.commands.undo();
    expect(app.editor.isEmpty).toBe(true);
    host.querySelector<HTMLButtonElement>('[data-toolbar-action="source-html"]')!.click();
    const before = snapshot(app.editor);
    const source = app.getSourceHtmlValue();
    onChange.mockClear();
    expect(app.applyPreparedHtml(prepare('<p>No aplicar</p>'))).toEqual({
      ok: false,
      codigo: 'EDITOR_NO_DISPONIBLE',
    });
    expect(snapshot(app.editor)).toEqual(before);
    expect(app.getSourceHtmlValue()).toBe(source);
    expect(onChange).not.toHaveBeenCalled();
  });
});
