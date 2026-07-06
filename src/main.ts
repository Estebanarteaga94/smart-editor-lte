import './style.css';

import { createEditorShell } from '@/editor/components/editor-shell';
import { createWysiwygEditor } from '@/editor/core/create-editor';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Root element #app was not found');
}

const shell = createEditorShell();
app.replaceChildren(shell.root);

createWysiwygEditor({
  element: shell.editable,
  initialContent: `
    <h1>Documento de ejemplo</h1>
    <p>Este contenido se renderiza desde Tiptap y ya emite JSON/HTML al editar.</p>
  `,
  placeholder: 'Escribe el contenido del documento...',
  onChange: ({ contentJson }) => {
    shell.status.textContent = `Actualizado: ${contentJson.type ?? 'doc'}`;
  },
});
