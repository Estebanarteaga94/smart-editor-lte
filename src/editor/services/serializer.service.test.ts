/**
 * @vitest-environment jsdom
 */

import type { Editor } from '@tiptap/core';
import { describe, expect, it, vi } from 'vitest';

import {
  createSerializerService,
  getCanonicalEditorJson,
  getRenderableEditorHtml,
  serializeEditorContent,
} from './serializer.service';

describe('serializer service', () => {
  it('gets canonical JSON from the editor', () => {
    const editor = createEditorDouble({
      json: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Titulo' }],
          },
        ],
      },
    });

    expect(getCanonicalEditorJson(editor)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Titulo' }],
        },
      ],
    });
  });

  it('rejects editor JSON outside the canonical schema', () => {
    const editor = createEditorDouble({
      json: {
        type: 'doc',
        content: [{ type: 'iframe', attrs: { src: 'https://example.com' } }],
      },
    });

    expect(() => getCanonicalEditorJson(editor)).toThrow();
  });

  it('gets renderable HTML from the editor', () => {
    const editor = createEditorDouble({
      html: '<h1>Titulo</h1>',
    });

    expect(getRenderableEditorHtml(editor)).toBe('<h1>Titulo</h1>');
  });

  it('sanitizes renderable HTML before persistence', () => {
    const editor = createEditorDouble({
      html: '<p onclick="alert(1)">Seguro</p><a href="javascript:alert(1)">Link</a>',
    });

    expect(getRenderableEditorHtml(editor)).toBe('<p>Seguro</p><a>Link</a>');
  });

  it('serializes canonical JSON and renderable HTML together', () => {
    const editor = createEditorDouble({
      json: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Contenido' }] }],
      },
      html: '<p>Contenido</p>',
    });

    expect(serializeEditorContent(editor)).toEqual({
      contentJson: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Contenido' }] }],
      },
      contentHtml: '<p>Contenido</p>',
    });
  });

  it('preserves resized table column metadata in canonical JSON and sanitized HTML', () => {
    const editor = createEditorDouble({
      json: {
        type: 'doc',
        content: [
          {
            type: 'table',
            content: [
              {
                type: 'tableRow',
                content: [
                  {
                    type: 'tableCell',
                    attrs: { colspan: 1, rowspan: 1, colwidth: [140], align: null },
                    content: [{ type: 'paragraph' }],
                  },
                ],
              },
            ],
          },
        ],
      },
      html: '<table style="width: 140px;"><colgroup><col style="width: 140px;"></colgroup><tbody><tr><td colspan="1" rowspan="1" colwidth="140"><p></p></td></tr></tbody></table>',
    });
    const serialized = serializeEditorContent(editor);

    expect(serialized.contentJson).toMatchObject({
      content: [
        {
          content: [
            {
              content: [
                {
                  attrs: expect.objectContaining({ colwidth: [140], align: null }),
                },
              ],
            },
          ],
        },
      ],
    });
    expect(serialized.contentHtml).toContain('<colgroup>');
    expect(serialized.contentHtml).toContain('<col style="width: 140px;">');
  });

  it('completes merged table cell attributes from canonical JSON before sanitizing HTML', () => {
    const editor = createEditorDouble({
      json: {
        type: 'doc',
        content: [
          {
            type: 'table',
            content: [
              {
                type: 'tableRow',
                content: [
                  {
                    type: 'tableCell',
                    attrs: { colspan: 2, rowspan: 1, colwidth: [120, 160], align: null },
                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Unida' }] }],
                  },
                  {
                    type: 'tableCell',
                    attrs: { colspan: 1, rowspan: 1, colwidth: [200], align: null },
                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Activa' }] }],
                  },
                ],
              },
            ],
          },
        ],
      },
      html: '<table><tbody><tr><td><p>Unida</p></td><td><p>Activa</p></td></tr></tbody></table>',
    });

    expect(getRenderableEditorHtml(editor)).toBe(
      '<table><tbody><tr><td colspan="2" colwidth="120,160"><p>Unida</p></td><td colwidth="200"><p>Activa</p></td></tr></tbody></table>',
    );
  });

  it('completes image attributes from canonical JSON before sanitizing HTML', () => {
    const editor = createEditorDouble({
      json: {
        type: 'doc',
        content: [
          {
            type: 'image',
            attrs: {
              src: '/assets/image.png',
              alt: 'Imagen',
              title: null,
              width: 320,
              height: 180,
              align: 'right',
            },
          },
        ],
      },
      html: '<img src="/assets/image.png" alt="Imagen">',
    });

    const html = getRenderableEditorHtml(editor);

    expect(html).toContain('<img');
    expect(html).toContain('src="/assets/image.png"');
    expect(html).toContain('alt="Imagen"');
    expect(html).toContain('width="320"');
    expect(html).toContain('height="180"');
    expect(html).toContain('align="right"');
  });

  it('creates a serializer service bound to an editor instance', () => {
    const editor = createEditorDouble({
      json: { type: 'doc', content: [] },
      html: '<p></p>',
    });
    const service = createSerializerService(editor);

    expect(service.getContentJson()).toEqual({ type: 'doc', content: [] });
    expect(service.getContentHtml()).toBe('<p></p>');
    expect(service.serialize()).toEqual({
      contentJson: { type: 'doc', content: [] },
      contentHtml: '<p></p>',
    });
  });
});

function createEditorDouble(options: { json?: unknown; html?: string }): Editor {
  return {
    getJSON: vi.fn(() => options.json ?? { type: 'doc', content: [] }),
    getHTML: vi.fn(() => options.html ?? '<p></p>'),
  } as unknown as Editor;
}
