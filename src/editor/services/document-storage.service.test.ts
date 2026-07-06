/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it } from 'vitest';

import { createWysiwygEditor } from '../core/create-editor';
import { createLocalDocumentStorageService } from './document-storage.service';
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
