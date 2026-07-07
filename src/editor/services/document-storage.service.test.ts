/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createWysiwygEditor } from '../core/create-editor';
import {
  createHttpDocumentStorageService,
  createLocalDocumentStorageService,
  defaultLocalDocumentStorageKeyPrefix,
  type DocumentStoragePayload,
} from './document-storage.service';
import { serializeEditorContent } from './serializer.service';

const mountedEditors = new Set<ReturnType<typeof createWysiwygEditor>>();
const storage = createMemoryStorage();

function mountEditor() {
  const element = document.createElement('div');
  document.body.append(element);

  const editor = createWysiwygEditor({
    element,
    initialContent: '<h1>Documento</h1><p>Contenido</p>',
  });

  mountedEditors.add(editor);
  return editor;
}

afterEach(() => {
  for (const editor of mountedEditors) {
    editor.destroy();
  }

  mountedEditors.clear();
  storage.clear();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: undefined,
  });
  document.body.innerHTML = '';
});

describe('document storage service', () => {
  it('serializes and persists title, canonical JSON and renderable HTML', async () => {
    const editor = mountEditor();
    const storage = createLocalDocumentStorageService({
      storage: createMemoryStorage(),
      keyPrefix: 'test-document',
    });
    const serializedContent = serializeEditorContent(editor);

    await storage.saveDocument('doc-1', {
      title: 'Documento',
      ...serializedContent,
    });

    const loadedDocument = await storage.loadDocument('doc-1');

    expect(loadedDocument).toEqual({
      title: 'Documento',
      contentJson: serializedContent.contentJson,
      contentHtml: serializedContent.contentHtml,
    });
    expect(loadedDocument?.contentJson).toMatchObject({
      type: 'doc',
      content: expect.arrayContaining([
        expect.objectContaining({
          type: 'heading',
          attrs: expect.objectContaining({ level: 1 }),
        }),
      ]),
    });
    expect(loadedDocument?.contentHtml).toContain('<h1>Documento</h1>');
  });

  it('preserves list structure when content is saved and loaded', async () => {
    const editor = mountEditor();
    const storage = createLocalDocumentStorageService({
      storage: createMemoryStorage(),
      keyPrefix: 'test-list-document',
    });

    editor.commands.selectAll();
    editor.commands.toggleBulletList();

    await storage.saveDocument('doc-list', {
      title: 'Documento con lista',
      ...serializeEditorContent(editor),
    });

    const loadedDocument = await storage.loadDocument('doc-list');

    expect(loadedDocument?.contentJson.content?.[0]).toMatchObject({
      type: 'bulletList',
    });
    expect(loadedDocument?.contentHtml).toContain('<ul>');
  });

  it('uses window.localStorage as the default temporary storage', async () => {
    const browserStorage = createMemoryStorage();

    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: browserStorage,
    });

    const storage = createLocalDocumentStorageService();
    const payload: DocumentStoragePayload = {
      title: 'Documento local',
      contentJson: { type: 'doc', content: [] },
      contentHtml: '<p>Documento local</p>',
    };

    await storage.saveDocument('doc-local', payload);

    expect(browserStorage.getItem(`${defaultLocalDocumentStorageKeyPrefix}:doc-local`)).toBe(
      JSON.stringify(payload),
    );
    await expect(storage.loadDocument('doc-local')).resolves.toEqual(payload);
  });

  it('returns null when a local temporary document does not exist', async () => {
    const storage = createLocalDocumentStorageService({
      storage: createMemoryStorage(),
      keyPrefix: 'missing-document',
    });

    await expect(storage.loadDocument('doc-missing')).resolves.toBeNull();
  });

  it('saves documents through PUT /api/documents/{id}', async () => {
    const payload: DocumentStoragePayload = {
      title: 'Documento remoto',
      contentJson: { type: 'doc', content: [] },
      contentHtml: '<p>Documento remoto</p>',
    };
    const fetchDocument = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    );
    const storage = createHttpDocumentStorageService({
      fetch: fetchDocument,
    });

    await storage.saveDocument('doc remoto/1', payload);

    expect(fetchDocument).toHaveBeenCalledTimes(1);
    expect(fetchDocument).toHaveBeenCalledWith('/api/documents/doc%20remoto%2F1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  });

  it('supports a configured base URL for document PUT requests', async () => {
    const fetchDocument = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    );
    const storage = createHttpDocumentStorageService({
      baseUrl: 'https://editor.example.test/',
      fetch: fetchDocument,
    });

    await storage.saveDocument('doc-1', {
      title: 'Documento',
      contentJson: { type: 'doc', content: [] },
      contentHtml: '<p>Documento</p>',
    });

    expect(fetchDocument).toHaveBeenCalledWith(
      'https://editor.example.test/api/documents/doc-1',
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('rejects invalid payloads before sending them to the API', async () => {
    const fetchDocument = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    );
    const storage = createHttpDocumentStorageService({
      fetch: fetchDocument,
    });

    await expect(
      storage.saveDocument('doc-1', {
        title: 'Documento invalido',
        contentJson: {
          type: 'doc',
          content: [{ type: 'script', text: 'alert(1)' }],
        },
        contentHtml: '<script>alert(1)</script>',
      } as unknown as DocumentStoragePayload),
    ).rejects.toThrow();

    expect(fetchDocument).not.toHaveBeenCalled();
  });

  it('throws when the document PUT request fails', async () => {
    const fetchDocument = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response('Error', { status: 500 })),
    );
    const storage = createHttpDocumentStorageService({
      fetch: fetchDocument,
    });

    await expect(
      storage.saveDocument('doc-1', {
        title: 'Documento',
        contentJson: { type: 'doc', content: [] },
        contentHtml: '<p>Documento</p>',
      }),
    ).rejects.toThrow('Document save failed with status 500');
  });
});

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}
