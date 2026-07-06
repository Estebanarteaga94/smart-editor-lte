import './style.css'

import { createWysiwygEditor } from '@/editor/core/create-editor'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Root element #app was not found')
}

app.innerHTML = `
  <main class="editor-app">
    <header class="editor-app__header">
      <h1>Smart Editor LTE</h1>
      <p>Editor WYSIWYG base con Tiptap y JSON canonico de ProseMirror.</p>
    </header>

    <section class="editor-app__workspace" aria-label="Editor WYSIWYG">
      <div class="editor-app__editor" id="wysiwyg-editor"></div>
      <aside class="editor-app__status" aria-live="polite">
        <strong>Estado</strong>
        <span id="editor-status">Sin cambios</span>
      </aside>
    </section>
  </main>
`

const editorElement = document.querySelector<HTMLDivElement>('#wysiwyg-editor')
const statusElement = document.querySelector<HTMLSpanElement>('#editor-status')

if (!editorElement || !statusElement) {
  throw new Error('Initial editor mount elements were not found')
}

createWysiwygEditor({
  element: editorElement,
  initialContent: `
    <h1>Documento de ejemplo</h1>
    <p>Este contenido se renderiza desde Tiptap y ya emite JSON/HTML al editar.</p>
  `,
  placeholder: 'Escribe el contenido del documento...',
  onChange: ({ contentJson }) => {
    statusElement.textContent = `Actualizado: ${contentJson.type ?? 'doc'}`
  },
})
