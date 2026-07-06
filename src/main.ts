import './style.css';

import { createEditorShell } from '@/editor/components/editor-shell';
import { createToolbar } from '@/editor/components/toolbar';
import { createWysiwygEditor } from '@/editor/core/create-editor';
import { createEditorLifecycle } from '@/editor/core/editor-lifecycle';
import { createLocalDocumentStorageService } from '@/editor/services/document-storage.service';
import { serializeEditorContent } from '@/editor/services/serializer.service';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Root element #app was not found');
}

const shell = createEditorShell({
  saveStatus: 'unchanged',
});
const lifecycle = createEditorLifecycle();
const storage = createLocalDocumentStorageService();
const documentId = 'default-document';
const documentTitle = 'Documento de ejemplo';

lifecycle.mountRoot(app, shell.root);

const editor = createWysiwygEditor({
  element: shell.editable,
  initialContent: `
    <h1>${documentTitle}</h1>
    <p>Este contenido se renderiza desde Tiptap y ya emite JSON/HTML al editar.</p>
  `,
  placeholder: 'Escribe el contenido del documento...',
  onChange: ({ contentJson, contentHtml }) => {
    shell.setSaveStatus('saving');

    if (contentJson.type && contentHtml.length > 0) {
      shell.setSaveStatus('saved');
      return;
    }

    shell.setSaveStatus('error');
  },
});

lifecycle.registerTiptapEditor(editor);
const toolbar = createToolbar({
  editor,
  lifecycle,
  onSave: async () => {
    try {
      shell.setSaveStatus('saving');
      await storage.saveDocument(documentId, {
        title: documentTitle,
        ...serializeEditorContent(editor),
      });
      shell.setSaveStatus('saved');
    } catch {
      shell.setSaveStatus('error');
    }
  },
});

shell.toolbar.replaceChildren(toolbar.element);
lifecycle.addEventListener(window, 'beforeunload', () => {
  lifecycle.dispose();
});
