import { describe, expect, it } from 'vitest';

import { resolveSourceJsonUpdate } from '../components/source-view';
import { parseDocumentStoragePayload } from '../services/document-storage.service';
import { parseEditorDocument } from './editor-document';
import {
  allowedCanonicalMarkTypes,
  allowedCanonicalNodeTypes,
  canonicalJsonSpecification,
  parseCanonicalEditorContent,
  validateSourceJsonContent,
  type CanonicalEditorContent,
} from './editor-content';

const validContent: CanonicalEditorContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: {
        level: 1,
        textAlign: null,
      },
      content: [
        {
          type: 'text',
          text: 'Titulo',
          marks: [
            {
              type: 'bold',
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: {
        textAlign: 'center',
      },
      content: [
        {
          type: 'text',
          text: 'Texto con link',
          marks: [
            {
              type: 'link',
              attrs: {
                href: 'https://example.com',
                target: '_blank',
                rel: 'noopener noreferrer nofollow',
              },
            },
            {
              type: 'textStyle',
              attrs: {
                color: '#1f2937',
              },
            },
            {
              type: 'highlight',
              attrs: {
                color: '#fef08a',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: {
            checked: false,
          },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Tarea',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableHeader',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
              },
              content: [{ type: 'paragraph' }],
            },
            {
              type: 'tableCell',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: [120],
              },
              content: [{ type: 'paragraph' }],
            },
          ],
        },
      ],
    },
    {
      type: 'image',
      attrs: {
        src: '/assets/image.png',
        alt: 'Imagen',
        width: 320,
        height: '180px',
        align: 'center',
      },
    },
    {
      type: 'blockquote',
      content: [{ type: 'paragraph' }],
    },
    {
      type: 'codeBlock',
      attrs: {
        language: 'ts',
      },
      content: [
        {
          type: 'text',
          text: 'const value = true;',
        },
      ],
    },
    {
      type: 'horizontalRule',
    },
  ],
};

describe('canonical editor content schema', () => {
  it('documents the versioned allowed nodes and marks', () => {
    expect(canonicalJsonSpecification.version).toBe(1);
    expect(canonicalJsonSpecification.nodes).toEqual(allowedCanonicalNodeTypes);
    expect(canonicalJsonSpecification.marks).toEqual(allowedCanonicalMarkTypes);
  });

  it('accepts valid canonical ProseMirror JSON', () => {
    expect(parseCanonicalEditorContent(validContent)).toEqual(validContent);
  });

  it('accepts heading levels from H1 through H6', () => {
    expect(
      parseCanonicalEditorContent({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 6 },
            content: [{ type: 'text', text: 'Titulo H6' }],
          },
        ],
      }),
    ).toMatchObject({
      content: [{ type: 'heading', attrs: { level: 6 } }],
    });
  });

  it('rejects unknown nodes', () => {
    expect(() =>
      parseCanonicalEditorContent({
        type: 'doc',
        content: [{ type: 'video', attrs: { src: 'https://example.com/video.mp4' } }],
      }),
    ).toThrow();
  });

  it('rejects unknown marks', () => {
    expect(() =>
      parseCanonicalEditorContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Texto',
                marks: [{ type: 'scriptMark' }],
              },
            ],
          },
        ],
      }),
    ).toThrow();
  });

  it('rejects unsafe or unknown attributes', () => {
    expect(() =>
      parseCanonicalEditorContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: {
              onclick: 'alert(1)',
            },
          },
        ],
      }),
    ).toThrow();

    expect(() =>
      parseCanonicalEditorContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Link',
                marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
              },
            ],
          },
        ],
      }),
    ).toThrow();
  });

  it('rejects heading levels outside H1 through H6', () => {
    expect(() =>
      parseCanonicalEditorContent({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 7 },
          },
        ],
      }),
    ).toThrow();
  });

  it('validates contentJson received from document API payloads', () => {
    expect(
      parseEditorDocument({
        id: 'doc-1',
        title: 'Documento',
        contentJson: validContent,
        contentHtml: '<h1>Titulo</h1>',
        status: 'draft',
        createdAt: '2026-07-06T00:00:00.000Z',
        updatedAt: '2026-07-06T00:00:00.000Z',
      }).contentJson,
    ).toEqual(validContent);

    expect(() =>
      parseEditorDocument({
        id: 'doc-1',
        title: 'Documento',
        contentJson: {
          type: 'doc',
          content: [{ type: 'iframe', attrs: { src: 'https://example.com' } }],
        },
        contentHtml: '<iframe src="https://example.com"></iframe>',
        status: 'draft',
        createdAt: '2026-07-06T00:00:00.000Z',
        updatedAt: '2026-07-06T00:00:00.000Z',
      }),
    ).toThrow();
  });

  it('validates contentJson before storage payloads are persisted', () => {
    expect(
      parseDocumentStoragePayload({
        title: 'Documento',
        contentJson: validContent,
        contentHtml: '<h1>Titulo</h1>',
      }).contentJson,
    ).toEqual(validContent);

    expect(() =>
      parseDocumentStoragePayload({
        title: 'Documento',
        contentJson: {
          type: 'doc',
          content: [{ type: 'image', attrs: { src: 'javascript:alert(1)' } }],
        },
        contentHtml: '<img src="javascript:alert(1)">',
      }),
    ).toThrow();
  });

  it('validates source-json text without replacing current content on error', () => {
    expect(validateSourceJsonContent(JSON.stringify(validContent))).toMatchObject({
      ok: true,
      content: validContent,
    });

    expect(validateSourceJsonContent('{')).toMatchObject({
      ok: false,
    });

    const result = resolveSourceJsonUpdate(
      JSON.stringify({
        type: 'doc',
        content: [{ type: 'paragraph', attrs: { onmouseover: 'alert(1)' } }],
      }),
      validContent,
    );

    expect(result).toMatchObject({
      applied: false,
      content: validContent,
    });
    expect(result.error).toContain('JSON fuera del schema permitido');
  });
});
