/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import type {
  DocumentStoragePayload,
  DocumentStorageService,
} from './services/document-storage.service';
import { mountEditorApp, type MountedEditorApp } from './editor-app';

const mountedApps = new Set<MountedEditorApp>();

afterEach(() => {
  for (const app of mountedApps) {
    app.lifecycle.dispose();
  }

  mountedApps.clear();
  document.body.innerHTML = '';
});

describe('mountEditorApp', () => {
  it('restores an existing document from storage before mounting the editor', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble({
      title: 'Documento restaurado',
      contentJson: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: {
              level: 2,
            },
            content: [{ type: 'text', text: 'Restaurado' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Contenido recuperado' }],
          },
        ],
      },
      contentHtml: '<h2>Restaurado</h2><p>Contenido recuperado</p>',
    });
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-restored',
    });
    mountedApps.add(mountedApp);

    expect(storageDouble.loadDocument).toHaveBeenCalledWith('doc-restored');
    expect(mountedApp.editor.getJSON().content?.[0]).toMatchObject({
      type: 'heading',
      attrs: { level: 2 },
    });
    expect(mountedApp.editor.getHTML()).toContain('<h2>Restaurado</h2>');
    expect(mountedApp.editor.getText()).toContain('Contenido recuperado');
  });

  it('keeps saving canonical JSON and renderable HTML after restoring', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-default',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Nuevo contenido</p>');
    const saveButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="save"]');
    saveButton?.click();

    expect(storageDouble.saveDocument).toHaveBeenCalledWith(
      'doc-default',
      expect.objectContaining({
        title: 'Documento de ejemplo',
        contentJson: expect.objectContaining({ type: 'doc' }),
        contentHtml: '<p>Nuevo contenido</p>',
      }),
    );
  });

  it('shows Error and keeps editor content when saving fails', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null, {
      saveError: new Error('Network error'),
    });
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-failing-save',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Contenido no guardado</p>');
    const saveButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="save"]');
    saveButton?.click();

    await flushPromises();

    const statusBar = appRoot.querySelector<HTMLElement>('.editor-shell__status');

    expect(storageDouble.saveDocument).toHaveBeenCalledOnce();
    expect(appRoot.querySelector('#editor-status')?.textContent).toBe('Error');
    expect(statusBar?.dataset.saveStatus).toBe('error');
    expect(mountedApp.editor.getHTML()).toBe('<p>Contenido no guardado</p>');
  });
});

function createStorageDouble(
  loadedDocument: DocumentStoragePayload | null,
  options: { saveError?: Error } = {},
): {
  service: DocumentStorageService;
  loadDocument: ReturnType<typeof vi.fn<() => Promise<DocumentStoragePayload | null>>>;
  saveDocument: ReturnType<typeof vi.fn<() => Promise<void>>>;
} {
  const loadDocument = vi.fn(() => Promise.resolve(loadedDocument));
  const saveDocument = vi.fn(() =>
    options.saveError ? Promise.reject(options.saveError) : Promise.resolve(),
  );

  return {
    service: {
      loadDocument,
      saveDocument,
    },
    loadDocument,
    saveDocument,
  };
}

function flushPromises(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}
