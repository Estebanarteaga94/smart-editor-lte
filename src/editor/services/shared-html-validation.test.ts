/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSchema } from '@tiptap/core';
import { undoDepth, redoDepth } from '@tiptap/pm/history';
import { createEditorExtensions } from '../core/editor-extensions';
import { createWysiwygEditor } from '../core/create-editor';
import { prepareHtmlImport } from './html-import.service';
import * as importer from './html-import.service';
import { prepareHtmlContent, applyPreparedHtml, applyPreparedHtmlBatch, preservedHtmlPreview } from '../../lib';

const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
const image = `<p class="photo"><img src="${png}" alt="Prueba" width="1" style="max-width:100%;height:auto"></p>`;
const table = '<table class="report" style="width:100%;border-collapse:collapse"><thead><tr><th colspan="2">{{titulo}}</th></tr></thead><tbody><tr><td rowspan="2" style="background:#eee">A</td><td>B</td></tr><tr><td>C</td></tr></tbody></table>';
const template = '<!DOCTYPE html><html lang="es"><head><style>.report{color:#23485d} td{padding:6px}</style><title>{{title}}</title></head><body>{{#each filas}}' + table + '{{/each}}<p>{{{desarrollo}}}</p></body></html>';
const editors: ReturnType<typeof createWysiwygEditor>[] = [];
afterEach(() => { vi.restoreAllMocks(); editors.forEach(e => e.destroy()); editors.length = 0; document.body.replaceChildren(); });
function setup() {
  const host = document.createElement('div'); document.body.append(host);
  const editor = createWysiwygEditor({ element: host, initialContent: '<p>Original</p>' });
  editors.push(editor); return editor;
}
function candidate(html: string) {
  const result = prepareHtmlContent({ html });
  if (!result.ok) throw new Error(JSON.stringify(result));
  return result;
}
describe('shared editor HTML validation', () => {
  it.each([image, table, template, '<p style="margin:12pt;text-align:justify">&nbsp;{{literal}}<br/>Fin</p>'])(
    'retains exact source and native history: %s', html => {
      const editor = setup(), before = editor.state, depth = undoDepth(before);
      const result = candidate(html);
      expect(prepareHtmlImport(html, getSchema(createEditorExtensions()), { preserveSource: true })).toMatchObject({ ok: true, html });
      expect(editor.state).toBe(before);
      expect(candidate(html)).toEqual(result);
      expect(applyPreparedHtml(editor, result)).toEqual({ ok: true, aplicado: true, html });
      expect(editor.getHTML()).toBe(html);
      expect(undoDepth(editor.state)).toBe(depth + 1);
      editor.commands.undo(); expect(editor.getHTML()).toBe('<p>Original</p>');
      editor.commands.redo(); expect(editor.getHTML()).toBe(html);
      const applied = editor.state, redo = redoDepth(applied);
      expect(applyPreparedHtml(editor, result)).toMatchObject({ ok: true, aplicado: false });
      expect(editor.state).toBe(applied); expect(redoDepth(editor.state)).toBe(redo);
    });
  it('delegates rejection and lossy adaptation to the shared importer', () => {
    const spy = vi.spyOn(importer, 'prepareHtmlImport');
    spy.mockReturnValueOnce({ ok: false, code: 'unsafe-content', message: 'Rejected' });
    expect(prepareHtmlContent({ html: image })).toMatchObject({ ok: false, codigo: 'HTML_NO_PERMITIDO' });
    spy.mockReturnValueOnce({ ok: true, code: 'applied', html: '<p>Cleaned</p>' });
    expect(prepareHtmlContent({ html: image })).toMatchObject({ ok: false, codigo: 'CONTENIDO_REQUIERE_ADAPTACION' });
  });
  it.each(['<script>alert(1)</script>', '<img src="javascript:alert(1)">', '<p onclick="x()">X</p>',
    '<iframe srcdoc="x"></iframe>', '<p>{{#if x}}sin cierre</p>'])(
    'rejects what the editor rejects without echoing content: %s', html => {
      expect(prepareHtmlContent({ html })).toMatchObject({ ok: false });
      expect(prepareHtmlImport(html, getSchema(createEditorExtensions()), { preserveSource: true }).ok).toBe(false);
    });
  it('replaces an image with a list in a coordinated batch without partial emissions', () => {
    const a = setup(), b = setup();
    applyPreparedHtml(a, candidate(image)); applyPreparedHtml(b, candidate(table));
    const list = '<ul class="formats"><li>Formato uno</li><li>Formato dos</li></ul>';
    const seen: string[][] = [];
    a.on('update', () => seen.push([a.getHTML(), b.getHTML()]));
    b.on('update', () => seen.push([a.getHTML(), b.getHTML()]));
    expect(applyPreparedHtmlBatch([{editor:a,candidate:candidate(list)}, {editor:b,candidate:candidate(template)}]).ok).toBe(true);
    expect(seen).toEqual([[list,template],[list,template]]);
    a.commands.undo(); expect(a.getHTML()).toBe(image);
    b.commands.undo(); expect(b.getHTML()).toBe(table);
  });
  it('isolates rich previews with the existing CSP and retains external references in source', () => {
    const html = '<style>p{color:red;background:url(https://preview.invalid/a)}</style><p>{{nombre}}</p><img src="https://preview.invalid/i.png">';
    expect(candidate(html).html).toBe(html);
    const preview = preservedHtmlPreview(html);
    expect(preview).toContain('Content-Security-Policy');
    expect(preview).toContain("default-src 'none'");
    expect(preview).toContain('img-src data:');
    expect(preview).toContain('{{nombre}}');
  });
});
