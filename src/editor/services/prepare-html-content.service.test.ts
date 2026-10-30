/** @vitest-environment jsdom */
import { undoDepth, redoDepth, closeHistory } from '@tiptap/pm/history';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { prepareHtmlContent, pilotHtmlPolicyId, type PreparePilotHtmlInput } from '../../lib';
import { createWysiwygEditor } from '../core/create-editor';
import { getRenderableEditorHtml } from './serializer.service';
import * as preservation from './preserved-html.service';

const editors: ReturnType<typeof createWysiwygEditor>[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  editors.forEach((editor) => editor.destroy());
  editors.length = 0;
  document.body.replaceChildren();
});
const prepare = (html: string) => prepareHtmlContent({ html, policyId: pilotHtmlPolicyId });

describe('prepareHtmlContent contract', () => {
  it.each([
    '<p>Uno<br>Dos</p>',
    '<p><strong>Texto</strong> y <em>otro</em></p>',
    '<ul><li><p>Uno</p></li></ul>',
    '<ol><li><p>Uno</p></li></ol>',
    '<p><br></p>',
    '<p>{{texto_literal}}</p>',
    '<p>{{#if x}}literal{{else}}otro{{/if}}</p>',
    '<p>{{{valor_literal}}}</p>',
    '<p>Árbol 👩🏽‍⚕️ e\u0301</p>',
    '<p>&lt;script&gt;literal&lt;/script&gt; &amp; texto</p>',
  ])('prepares an exact supported fragment: %s', (html) => {
    const input = Object.freeze({ html, policyId: pilotHtmlPolicyId });
    const result = prepareHtmlContent(input);
    expect(result).toMatchObject({
      ok: true,
      policyId: pilotHtmlPolicyId,
      schemaVersion: 2,
      html,
      cambios: [],
    });
    expect(input).toEqual({ html, policyId: pilotHtmlPolicyId });
    if (!result.ok) throw new Error('Expected a prepared fragment');
    expect(result.contentJson.attrs?.preservedDocument).toMatchObject({ source: html });
    const host = document.createElement('div');
    document.body.append(host);
    const editor = createWysiwygEditor({ element: host, initialContent: result.contentJson });
    editors.push(editor);
    expect(getRenderableEditorHtml(editor)).toBe(result.html);
    expect(editor.schema.nodeFromJSON(result.contentJson).eq(editor.state.doc)).toBe(true);
  });

  it('represents only the explicit empty string as a supported empty document', () => {
    const result = prepare('');
    expect(result).toMatchObject({ ok: true, html: '', cambios: [] });
    if (!result.ok) throw new Error('Expected explicit empty content');
    const host = document.createElement('div');
    document.body.append(host);
    const editor = createWysiwygEditor({ element: host, initialContent: result.contentJson });
    editors.push(editor);
    expect(() => editor.state.doc.check()).not.toThrow();
    expect(editor.state.doc.textContent).toBe('');
    expect(result.html).toBe('');
  });

  it.each([
    '<p data-editor-preserved="{}">Texto</p>',
    '<p onclick="alert(1)">Texto</p>',
    '<iframe src="https://blocked-prepare.invalid/frame"></iframe>',
    '<script src="https://blocked-prepare.invalid/script.js"></script>',
    '<svg><image href="https://blocked-prepare.invalid/image.svg"></image></svg>',
    '<math><mtext>Texto</mtext></math>',
  ])('rejects out-of-policy HTML without echoing input: %s', (html) => {
    const result = prepare(html);
    expect(result).toMatchObject({ ok: false, codigo: 'HTML_NO_PERMITIDO' });
    expect(result).not.toHaveProperty('html');
    expect(result).not.toHaveProperty('contentJson');
    expect(JSON.stringify(result)).not.toContain(html);
  });

  it.each(['<p>Texto<br/></p>', '<p>Texto', 'Texto',
    '<!DOCTYPE html><html><head><style>p{color:red}</style></head><body><p>{{nombre}}</p></body></html>',
    '<p class="x" style="color:red">Texto</p>', '<table><tr><td>Texto</td></tr></table>',
    '<img src="https://blocked-prepare.invalid/image.png">', '<!-- comentario --><h1>Texto</h1>',
    '<a href="https://blocked-prepare.invalid/">Texto</a>', '<div><b>Texto</b></div>'])(
    'preserves original source without normalization: %s',
    (html) => {
      expect(prepare(html)).toMatchObject({ ok: true, html });
    },
  );

  it.each([
    null,
    [],
    {},
    { html: 1, policyId: pilotHtmlPolicyId },
    { html: '<p>Texto</p>', policyId: pilotHtmlPolicyId, mode: 'legacy' },
    { html: '<p>Texto</p>', policyId: pilotHtmlPolicyId, allowedTags: ['script'] },
  ])('rejects invalid inputs and unknown options: %j', (input) => {
    expect(prepareHtmlContent(input as PreparePilotHtmlInput)).toMatchObject({
      ok: false,
      codigo: 'HTML_NO_PERMITIDO',
    });
  });

  it('does not select a more permissive policy', () => {
    expect(
      prepareHtmlContent({
        html: '<p>Texto</p>',
        policyId: 'template',
      } as unknown as PreparePilotHtmlInput),
    ).toMatchObject({ ok: false, codigo: 'POLITICA_NO_SOPORTADA' });
  });

  it('returns independent, immutable candidates with no identity or environmental data', () => {
    const first = prepare('<p>Texto</p>');
    const second = prepare('<p>Texto</p>');
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    if (!first.ok || !second.ok) throw new Error('Expected prepared content');
    expect(first.contentJson).not.toBe(second.contentJson);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.contentJson)).toBe(true);
    expect(Object.isFrozen(first.contentJson.content)).toBe(true);
    expect(() => first.contentJson.content!.push({ type: 'image' })).toThrow();
    expect(JSON.stringify(first)).not.toMatch(/tenant|documentoId|campoId|propuestaId/);
  });

  it('reports unavailable DOM without falling back to a permissive path', () => {
    vi.stubGlobal('document', undefined);
    expect(prepare('<p>Texto</p>')).toMatchObject({ ok: false, codigo: 'HTML_NO_PERMITIDO' });
  });
});

describe('prepareHtmlContent purity', () => {
  it('reuses the editor preservation service without evaluating Handlebars', () => {
    const preserve = vi.spyOn(preservation, 'preparePreservedHtml');
    expect(prepare('<p>{{texto_literal}}</p>')).toMatchObject({ ok: true });
    expect(prepare('<style>p{color:red}</style><p>{{nombre}}</p>')).toMatchObject({ ok: true });
    expect(preserve).toHaveBeenCalledTimes(2);
  });

  it('does not affect an existing editor, history, selection, DOM, callbacks, storage, timers or requests', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const changed = vi.fn();
    const editor = createWysiwygEditor({
      element: host,
      initialContent: '<p>Original</p>',
      onChange: changed,
    });
    editors.push(editor);
    editor.commands.insertContentAt(1, 'Editado ');
    editor.view.dispatch(closeHistory(editor.state.tr));
    editor.commands.insertContentAt(1, 'Segundo ');
    editor.commands.undo();
    editor.commands.setTextSelection({ from: 1, to: 8 });
    editor.view.focus();
    const before = {
      state: editor.state,
      html: editor.getHTML(),
      json: editor.getJSON(),
      undo: undoDepth(editor.state),
      redo: redoDepth(editor.state),
      focus: document.activeElement,
      dom: document.documentElement.outerHTML,
      callbacks: changed.mock.calls.length,
    };
    expect(before.undo).toBeGreaterThan(0);
    expect(before.redo).toBeGreaterThan(0);
    const transactions = vi.fn();
    editor.on('transaction', transactions);
    const observer = new MutationObserver(() => {});
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      childList: true,
      characterData: true,
    });
    const fetch = vi.fn(() => {
      throw new Error('Network forbidden');
    });
    vi.stubGlobal('fetch', fetch);
    const xhr = vi.spyOn(XMLHttpRequest.prototype, 'open');
    const storage = vi.spyOn(Storage.prototype, 'setItem');
    const read = vi.spyOn(Storage.prototype, 'getItem');
    const remove = vi.spyOn(Storage.prototype, 'removeItem');
    const clear = vi.spyOn(Storage.prototype, 'clear');
    const timers = vi.spyOn(window, 'setTimeout');
    const frames = vi.spyOn(window, 'requestAnimationFrame');

    expect(prepare('<p>Preparado<br>Nuevo</p>')).toMatchObject({ ok: true });
    expect(
      prepare('<ul class="wysiwyg-list converted-from-office"><li>{{literal}}</li></ul>'),
    ).toMatchObject({ ok: true });
    expect(prepare('<img src="https://blocked-prepare.invalid/image.png">')).toMatchObject({
      ok: true,
    });
    expect(prepare('<p>Requiere normalización<br/></p>')).toMatchObject({
      ok: true,
      html: '<p>Requiere normalización<br/></p>',
    });
    expect(editor.state).toBe(before.state);
    expect(editor.getHTML()).toBe(before.html);
    expect(editor.getJSON()).toEqual(before.json);
    expect(undoDepth(editor.state)).toBe(before.undo);
    expect(redoDepth(editor.state)).toBe(before.redo);
    expect(document.activeElement).toBe(before.focus);
    expect(document.documentElement.outerHTML).toBe(before.dom);
    expect(changed).toHaveBeenCalledTimes(before.callbacks);
    expect(transactions).not.toHaveBeenCalled();
    expect(observer.takeRecords()).toEqual([]);
    observer.disconnect();
    for (const spy of [fetch, xhr, storage, read, remove, clear, timers, frames])
      expect(spy).not.toHaveBeenCalled();
  });
});
