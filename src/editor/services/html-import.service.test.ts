/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it } from 'vitest';

import { createWysiwygEditor } from '../core/create-editor';
import { prepareHtmlImport } from './html-import.service';

const pngDataUri =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const editors = new Set<ReturnType<typeof createWysiwygEditor>>();

afterEach(() => {
  for (const editor of editors) {
    editor.destroy();
  }
  editors.clear();
  document.body.replaceChildren();
});

describe('prepareHtmlImport', () => {
  it('accepts canonical HTML with remote, relative and supported Base64 images', () => {
    const editor = mountEditor();
    const result = prepareHtmlImport(
      `<h2>Importado</h2><img src="https://cdn.example/image.webp"><img src="/assets/image.jpg"><img src="${pngDataUri}">`,
      editor.state.schema,
    );

    expect(result).toMatchObject({ ok: true, code: 'applied' });
    expect(result.ok && result.html).toContain(pngDataUri);
  });

  it.each([
    '<script>alert(1)</script><p>Texto</p>',
    '<img src="javascript:alert(1)">',
    '<img src="blob:http://localhost/image">',
    '<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=">',
    '<img src="data:image/png;base64,no-es-base64!">',
    '<p onclick="alert(1)">Texto</p>',
  ])('rejects unsafe HTML atomically: %s', (html) => {
    const editor = mountEditor();

    expect(prepareHtmlImport(html, editor.state.schema)).toMatchObject({
      ok: false,
      code: 'unsafe-content',
    });
  });

  it('distinguishes empty and unsupported HTML', () => {
    const editor = mountEditor();

    expect(prepareHtmlImport('  ', editor.state.schema)).toMatchObject({
      ok: false,
      code: 'empty-html',
    });
    expect(
      prepareHtmlImport('<section>Fuera del schema</section>', editor.state.schema),
    ).toMatchObject({
      ok: false,
      code: 'unsupported-schema',
    });
  });
});

function mountEditor(): ReturnType<typeof createWysiwygEditor> {
  const element = document.createElement('div');
  document.body.append(element);
  const editor = createWysiwygEditor({ element });
  editors.add(editor);
  return editor;
}
