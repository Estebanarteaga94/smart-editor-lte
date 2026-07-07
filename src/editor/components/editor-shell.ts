export type EditorSaveStatus = 'unchanged' | 'saving' | 'saved' | 'error';

export interface EditorShellElements {
  root: HTMLElement;
  toolbar: HTMLElement;
  editable: HTMLElement;
  statusBar: HTMLElement;
  status: HTMLElement;
  setSaveStatus: (status: EditorSaveStatus, message?: string) => void;
}

export interface EditorShellOptions {
  title?: string;
  description?: string;
  statusLabel?: string;
  saveStatus?: EditorSaveStatus;
}

const saveStatusLabels: Record<EditorSaveStatus, string> = {
  unchanged: 'Sin cambios',
  saving: 'Guardando',
  saved: 'Guardado',
  error: 'Error',
};

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
  const statusBar = root.querySelector<HTMLElement>('.editor-shell__status');
  const statusLabel = root.querySelector<HTMLElement>('.editor-shell__status strong');
  const statusSlot = root.querySelector<HTMLElement>('.editor-shell__status span');

  if (
    !title ||
    !description ||
    !toolbarSlot ||
    !editableSlot ||
    !statusBar ||
    !statusLabel ||
    !statusSlot
  ) {
    throw new Error('Editor shell template is missing required elements');
  }

  title.textContent = options.title ?? 'Smart Editor LTE';
  description.textContent =
    options.description ?? 'Editor WYSIWYG base con Tiptap y JSON canonico de ProseMirror.';
  statusLabel.textContent = options.statusLabel ?? 'Estado';

  const setSaveStatus = (status: EditorSaveStatus, message?: string): void => {
    statusBar.dataset.saveStatus = status;
    statusSlot.textContent = message ?? saveStatusLabels[status];
  };

  setSaveStatus(options.saveStatus ?? 'unchanged');

  return {
    root,
    toolbar: toolbarSlot,
    editable: editableSlot,
    statusBar,
    status: statusSlot,
    setSaveStatus,
  };
}
