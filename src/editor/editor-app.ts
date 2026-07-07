import type { JSONContent } from '@tiptap/core';

import { createEditorShell } from './components/editor-shell';
import { createPreviewView } from './components/preview-view';
import { createTableMenu } from './components/table-menu';
import { createToolbar } from './components/toolbar';
import { createWysiwygEditor } from './core/create-editor';
import { createEditorLifecycle } from './core/editor-lifecycle';
import { defaultEditorConfig } from './models/editor-config';
import {
  createLocalDocumentStorageService,
  type DocumentStorageService,
} from './services/document-storage.service';
import { serializeEditorContent } from './services/serializer.service';

export interface MountEditorAppOptions {
  app: HTMLElement;
  storage?: DocumentStorageService;
  documentId?: string;
  documentTitle?: string;
  placeholder?: string;
}

export interface MountedEditorApp {
  lifecycle: ReturnType<typeof createEditorLifecycle>;
  editor: ReturnType<typeof createWysiwygEditor>;
}

const defaultDocumentTitle = 'Documento de ejemplo';

export async function mountEditorApp({
  app,
  storage = createLocalDocumentStorageService(),
  documentId = defaultEditorConfig.documentId,
  documentTitle = defaultDocumentTitle,
  placeholder = defaultEditorConfig.placeholder,
}: MountEditorAppOptions): Promise<MountedEditorApp> {
  const shell = createEditorShell({
    saveStatus: 'unchanged',
  });
  const lifecycle = createEditorLifecycle();
  const loadedDocument = await storage.loadDocument(documentId);
  const activeDocumentTitle = loadedDocument?.title ?? documentTitle;
  const preview = createPreviewView({
    html: loadedDocument?.contentHtml ?? '',
  });

  lifecycle.mountRoot(app, shell.root);
  shell.root.append(preview.element);

  const editor = createWysiwygEditor({
    element: shell.editable,
    initialContent:
      loadedDocument?.contentJson ?? createDefaultDocumentContent(activeDocumentTitle),
    placeholder,
    onChange: ({ contentJson, contentHtml }) => {
      shell.setSaveStatus('saving');
      preview.setHtml(contentHtml);

      if (contentJson.type && contentHtml.length > 0) {
        shell.setSaveStatus('saved');
        return;
      }

      shell.setSaveStatus('error');
    },
  });
  preview.setHtml(editor.getHTML());

  lifecycle.registerTiptapEditor(editor);
  const toolbar = createToolbar({
    editor,
    lifecycle,
    onSave: async () => {
      try {
        shell.setSaveStatus('saving');
        await storage.saveDocument(documentId, {
          title: activeDocumentTitle,
          ...serializeEditorContent(editor),
        });
        shell.setSaveStatus('saved');
      } catch {
        shell.setSaveStatus('error');
      }
    },
  });
  const tableMenu = createTableMenu({
    editor,
    lifecycle,
  });

  shell.toolbar.replaceChildren(toolbar.element);
  toolbar.element.append(tableMenu.element);
  lifecycle.addEventListener(window, 'beforeunload', () => {
    lifecycle.dispose();
  });

  return {
    lifecycle,
    editor,
  };
}

function createDefaultDocumentContent(title: string): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: {
          level: 1,
        },
        content: [
          {
            type: 'text',
            text: title,
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Este contenido se renderiza desde Tiptap y ya emite JSON/HTML al editar.',
          },
        ],
      },
    ],
  };
}
