export interface EditorShellElements {
  root: HTMLElement;
  toolbar: HTMLElement;
  editable: HTMLElement;
  status: HTMLElement;
}

export interface EditorShellOptions {
  title?: string;
  description?: string;
  statusLabel?: string;
  statusText?: string;
}

export function createEditorShell(options: EditorShellOptions = {}): EditorShellElements {
  const root = document.createElement('main');

  root.className = 'editor-app';
  root.innerHTML = `
    <header class="editor-app__header">
      <h1></h1>
      <p></p>
    </header>

    <section class="editor-shell" aria-label="Editor WYSIWYG">
      <div class="editor-shell__toolbar" role="toolbar" aria-label="Herramientas del editor"></div>
      <div class="editor-shell__body">
        <div class="editor-shell__editable" id="wysiwyg-editor"></div>
      </div>
      <footer class="editor-shell__status" aria-live="polite">
        <strong></strong>
        <span id="editor-status"></span>
      </footer>
    </section>
  `;

  const title = root.querySelector<HTMLHeadingElement>('h1');
  const description = root.querySelector<HTMLParagraphElement>('p');
  const toolbarSlot = root.querySelector<HTMLElement>('.editor-shell__toolbar');
  const editableSlot = root.querySelector<HTMLElement>('.editor-shell__editable');
  const statusLabel = root.querySelector<HTMLElement>('.editor-shell__status strong');
  const statusSlot = root.querySelector<HTMLElement>('.editor-shell__status span');

  if (!title || !description || !toolbarSlot || !editableSlot || !statusLabel || !statusSlot) {
    throw new Error('Editor shell template is missing required elements');
  }

  title.textContent = options.title ?? 'Smart Editor LTE';
  description.textContent =
    options.description ?? 'Editor WYSIWYG base con Tiptap y JSON canonico de ProseMirror.';
  statusLabel.textContent = options.statusLabel ?? 'Estado';
  statusSlot.textContent = options.statusText ?? 'Sin cambios';

  toolbarSlot.append(
    createToolbarPlaceholderButton('Parrafo'),
    createToolbarPlaceholderButton('H1'),
    createToolbarPlaceholderButton('H2'),
    createToolbarPlaceholderButton('H3'),
    createToolbarPlaceholderButton('B'),
    createToolbarPlaceholderButton('I'),
    createToolbarPlaceholderButton('U'),
  );

  return {
    root,
    toolbar: toolbarSlot,
    editable: editableSlot,
    status: statusSlot,
  };
}

function createToolbarPlaceholderButton(label: string): HTMLButtonElement {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'editor-shell__tool';
  button.textContent = label;
  button.disabled = true;
  button.setAttribute('aria-label', `${label} no disponible todavia`);

  return button;
}
