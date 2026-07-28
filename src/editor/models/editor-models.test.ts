import { describe, expect, it } from 'vitest';

import { parseEditorAsset } from './editor-asset';
import { parseEditorConfig } from './editor-config';
import { parseEditorDocument } from './editor-document';
import { parseEditorMode, parseEditorViewState } from './editor-mode';

describe('editor model validation', () => {
  it('parses a valid editor document payload', () => {
    expect(
      parseEditorDocument({
        id: 'doc-1',
        title: 'Documento',
        contentJson: { type: 'doc', content: [] },
        contentHtml: '<p>Documento</p>',
        status: 'draft',
        createdAt: '2026-07-06T00:00:00.000Z',
        updatedAt: '2026-07-06T00:00:00.000Z',
      }),
    ).toMatchObject({
      id: 'doc-1',
      status: 'draft',
    });
  });

  it('rejects an invalid editor document status', () => {
    expect(() =>
      parseEditorDocument({
        id: 'doc-1',
        title: 'Documento',
        contentJson: { type: 'doc', content: [] },
        contentHtml: '<p>Documento</p>',
        status: 'deleted',
        createdAt: '2026-07-06T00:00:00.000Z',
        updatedAt: '2026-07-06T00:00:00.000Z',
      }),
    ).toThrow();
  });

  it('parses a valid editor asset payload', () => {
    expect(
      parseEditorAsset({
        id: 'asset-1',
        documentId: 'doc-1',
        fileName: 'image.png',
        mimeType: 'image/png',
        size: 1024,
        url: '/assets/image.png',
        altText: 'Imagen',
        createdAt: '2026-07-06T00:00:00.000Z',
      }),
    ).toMatchObject({
      id: 'asset-1',
      documentId: 'doc-1',
    });
  });

  it('rejects invalid asset size', () => {
    expect(() =>
      parseEditorAsset({
        id: 'asset-1',
        documentId: 'doc-1',
        fileName: 'image.png',
        mimeType: 'image/png',
        size: -1,
        url: '/assets/image.png',
        createdAt: '2026-07-06T00:00:00.000Z',
      }),
    ).toThrow();
  });

  it('parses editor config and mode values', () => {
    expect(parseEditorMode('preview')).toBe('preview');
    expect(() => parseEditorMode('fullscreen')).toThrow();
    expect(parseEditorViewState({ mode: 'preview', fullscreen: true })).toEqual({
      mode: 'preview',
      fullscreen: true,
    });
    expect(() => parseEditorViewState({ mode: 'fullscreen', fullscreen: false })).toThrow();
    expect(
      parseEditorConfig({
        documentId: 'doc-1',
        autosave: {
          enabled: true,
          debounceMs: 1000,
        },
        imageLimits: {
          maxSizeBytes: 5 * 1024 * 1024,
          allowedMimeTypes: ['image/png', 'image/jpeg'],
        },
        placeholder: 'Escribe...',
        initialMode: 'wysiwyg',
      }),
    ).toMatchObject({
      documentId: 'doc-1',
      initialMode: 'wysiwyg',
    });
    expect(() =>
      parseEditorConfig({
        documentId: 'doc-1',
        autosave: { enabled: true, debounceMs: 799 },
        imageLimits: {
          maxSizeBytes: 1024,
          allowedMimeTypes: ['image/png'],
        },
        placeholder: 'Escribe...',
        initialMode: 'wysiwyg',
      }),
    ).toThrow();
  });
});
