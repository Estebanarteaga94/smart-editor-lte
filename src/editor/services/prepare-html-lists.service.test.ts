/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  prepareHtmlContent,
  pilotHtmlPolicyId,
  applyPreparedHtml,
  applyPreparedHtmlBatch,
  type PreparePilotHtmlInput,
} from '../../lib';
import { createWysiwygEditor } from '../core/create-editor';
import * as importer from './html-import.service';
const editors: ReturnType<typeof createWysiwygEditor>[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  editors.forEach((editor) => editor.destroy());
  editors.length = 0;
  document.body.replaceChildren();
});
const prepare = (html: string) => prepareHtmlContent({ html, policyId: pilotHtmlPolicyId });
function setup() {
  const host = document.createElement('div');
  document.body.append(host);
  const editor = createWysiwygEditor({ element: host, initialContent: '<p>Original</p>' });
  editors.push(editor);
  return editor;
}
const officeList =
  '<ul class="wysiwyg-list converted-from-office">' +
  Array.from(
    { length: 13 },
    (_, i) => `<li>Recomendación ${i + 1}: imágenes diagnósticas, operación y trazabilidad.</li>`,
  ).join('') +
  '</ul>';

describe('restricted list preservation through the existing validator', () => {
  it.each([
    officeList,
    '<ul><li>Uno</li><li>Dos<br><strong>Tres</strong></li></ul>',
    '<ol class="converted-from-office wysiwyg-list"><li>Uno</li></ol>',
    '<ul class="wysiwyg-list"><li><p>Uno</p><ul><li>Dos</li></ul></li></ul>',
    '<ul class="converted-from-office"><li>{{#if x}}{{{literal}}}{{/if}}</li></ul>',
    '<p>Introducción</p><ul class="wysiwyg-list converted-from-office"><li>html0x1z y {{literal}}</li></ul>',
  ])('preserves source, classes and literals on prepare/apply/undo/redo: %s', (html) => {
    const first = prepare(html);
    const second = prepare(html);
    expect(first).toEqual(second);
    expect(first).toMatchObject({ ok: true, html, cambios: [] });
    if (!first.ok) throw new Error('Expected supported list');
    expect(Object.isFrozen(first.contentJson.attrs?.preservedDocument)).toBe(true);
    const editor = setup();
    expect(applyPreparedHtml(editor, first)).toEqual({ ok: true, aplicado: true, html });
    expect(editor.getHTML()).toBe(html);
    expect(editor.view.dom.querySelectorAll('li').length).toBe(
      new DOMParser().parseFromString(html, 'text/html').querySelectorAll('li').length,
    );
    const sourceClasses = new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector('ul,ol')
      ?.getAttribute('class');
    expect(editor.view.dom.querySelector('ul,ol')?.getAttribute('class')).toBe(sourceClasses);
    editor.commands.undo();
    expect(editor.getHTML()).toBe('<p>Original</p>');
    editor.commands.redo();
    expect(editor.getHTML()).toBe(html);
  });

  it.each([
    '<ul onclick="alert(1)"><li>Uno</li></ul>',
    '<ul data-editor-preserved="{}"><li>Uno</li></ul>',
    '<ul><li><script>alert(1)</script></li></ul>',
  ])('still rejects out-of-policy markup before preserving it: %s', (html) => {
    expect(prepare(html)).toMatchObject({ ok: false, codigo: 'HTML_NO_PERMITIDO' });
  });

  it('uses the existing validator, and does not override its rejection', () => {
    const validate = vi
      .spyOn(importer, 'prepareHtmlImport')
      .mockReturnValue({ ok: false, code: 'unsupported-schema', message: 'Rejected by editor' });
    expect(prepare(officeList)).toMatchObject({ ok: false, codigo: 'HTML_NO_PERMITIDO' });
    expect(validate).toHaveBeenCalledOnce();
  });

  it('does not mount, mutate a view or use randomness during list preparation', () => {
    const editor = setup(),
      state = editor.state,
      dom = document.documentElement.outerHTML;
    const transaction = vi.fn();
    editor.on('transaction', transaction);
    const random = vi.spyOn(crypto, 'randomUUID');
    expect(prepare(officeList)).toMatchObject({ ok: true, html: officeList });
    expect(editor.state).toBe(state);
    expect(document.documentElement.outerHTML).toBe(dom);
    expect(transaction).not.toHaveBeenCalled();
    expect(random).not.toHaveBeenCalled();
  });

  it('revalidates source, metadata and classes before application', () => {
    const candidate = prepare(officeList);
    if (!candidate.ok) throw new Error('Expected list');
    const editor = setup(),
      before = editor.state;
    const tampered = JSON.parse(JSON.stringify(candidate)) as typeof candidate;
    tampered.contentJson.attrs!.preservedDocument = {
      ...(tampered.contentJson.attrs!.preservedDocument as object),
      head: '<style>p{display:none}</style>',
    };
    expect(applyPreparedHtml(editor, tampered)).toEqual({
      ok: false,
      codigo: 'CANDIDATO_INVALIDO',
    });
    expect(editor.state).toBe(before);
  });

  it('applies lists as a batch without partial callbacks', () => {
    const a = setup(),
      b = setup();
    const candidate = prepare(officeList);
    if (!candidate.ok) throw new Error('Expected list');
    const seen: string[][] = [];
    a.on('update', () => seen.push([a.getHTML(), b.getHTML()]));
    b.on('update', () => seen.push([a.getHTML(), b.getHTML()]));
    expect(
      applyPreparedHtmlBatch([
        { editor: a, candidate },
        { editor: b, candidate },
      ]),
    ).toMatchObject({ ok: true, erroresNotificacion: [] });
    expect(seen).toEqual([
      [officeList, officeList],
      [officeList, officeList],
    ]);
  });

  it('does not silently broaden the old policy id', () => {
    expect(
      prepareHtmlContent({
        html: officeList,
        policyId: 'gd-html-piloto-v1',
      } as unknown as PreparePilotHtmlInput),
    ).toMatchObject({ ok: false, codigo: 'POLITICA_NO_SOPORTADA' });
  });
});
