import './style.css';

import { createEditorShell } from '@/editor/components/editor-shell';
import { createWysiwygEditor } from '@/editor/core/create-editor';
import { createEditorLifecycle } from '@/editor/core/editor-lifecycle';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Root element #app was not found');
}

const shell = createEditorShell({
  saveStatus: 'unchanged',
});
const lifecycle = createEditorLifecycle();

lifecycle.mountRoot(app, shell.root);

const editor = createWysiwygEditor({
  element: shell.editable,
  initialContent: `
    <h1>Documento de ejemplo</h1>
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
lifecycle.addEventListener(window, 'beforeunload', () => {
  lifecycle.dispose();
});
