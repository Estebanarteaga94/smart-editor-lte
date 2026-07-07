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
