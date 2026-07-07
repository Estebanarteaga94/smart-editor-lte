import type { EditorLifecycle } from '../core/editor-lifecycle';
import { validateImageFile } from '../utils/file-validator';

export interface ImageDialogResult {
  file: File;
  altText: string;
}

export type ImageDialogSubmitHandler = (result: ImageDialogResult) => void;

export interface ImageDialogOptions {
  lifecycle: EditorLifecycle;
  onSubmit: ImageDialogSubmitHandler;
}

export interface ImageDialog {
  element: HTMLElement;
  panel: HTMLElement;
  fileInput: HTMLInputElement;
  altTextInput: HTMLInputElement;
  confirmButton: HTMLButtonElement;
  cancelButton: HTMLButtonElement;
  errorMessage: HTMLElement;
  open: () => void;
  close: () => void;
  setDisabled: (disabled: boolean) => void;
}

let imageDialogId = 0;

export function createImageDialog({ lifecycle, onSubmit }: ImageDialogOptions): ImageDialog {
  const dialogId = `editor-image-dialog-${(imageDialogId += 1)}`;
  const errorId = `${dialogId}-error`;
  const element = document.createElement('div');
  const panel = document.createElement('form');
  const title = document.createElement('h2');
  const fileLabel = document.createElement('label');
  const fileInput = document.createElement('input');
  const altTextLabel = document.createElement('label');
  const altTextInput = document.createElement('input');
  const errorMessage = document.createElement('p');
  const actions = document.createElement('div');
  const cancelButton = document.createElement('button');
  const confirmButton = document.createElement('button');
  let disabled = false;
  let selectedFile: File | null = null;

  element.className = 'editor-image-dialog';
  element.dataset.imageDialog = 'root';
  element.hidden = true;

  panel.id = dialogId;
  panel.className = 'editor-image-dialog__panel';
  panel.dataset.imageDialog = 'panel';
  panel.noValidate = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', `${dialogId}-title`);
  panel.setAttribute('aria-describedby', errorId);

  title.id = `${dialogId}-title`;
  title.className = 'editor-image-dialog__title';
  title.textContent = 'Insertar imagen';

  fileLabel.className = 'editor-image-dialog__field';
  fileLabel.textContent = 'Archivo';

  fileInput.type = 'file';
  fileInput.accept = 'image/png,image/jpeg,image/webp';
  fileInput.className = 'editor-image-dialog__input';
  fileInput.dataset.imageDialog = 'file';
  fileInput.setAttribute('aria-describedby', errorId);

  altTextLabel.className = 'editor-image-dialog__field';
  altTextLabel.textContent = 'Texto alternativo';

  altTextInput.type = 'text';
  altTextInput.className = 'editor-image-dialog__input';
  altTextInput.dataset.imageDialog = 'alt-text';
  altTextInput.placeholder = 'Describe la imagen';
  altTextInput.setAttribute('aria-label', 'Texto alternativo de la imagen');

  errorMessage.id = errorId;
  errorMessage.className = 'editor-image-dialog__error';
  errorMessage.dataset.imageDialog = 'error';
  errorMessage.hidden = true;

  actions.className = 'editor-image-dialog__actions';

  cancelButton.type = 'button';
  cancelButton.className = 'editor-image-dialog__button';
  cancelButton.dataset.imageDialog = 'cancel';
  cancelButton.textContent = 'Cancelar';
  cancelButton.setAttribute('aria-label', 'Cancelar insercion de imagen');

  confirmButton.type = 'submit';
  confirmButton.className = 'editor-image-dialog__button editor-image-dialog__button--primary';
  confirmButton.dataset.imageDialog = 'confirm';
  confirmButton.textContent = 'Insertar';
  confirmButton.setAttribute('aria-label', 'Confirmar insercion de imagen');
  confirmButton.disabled = true;

  fileLabel.append(fileInput);
  altTextLabel.append(altTextInput);
  actions.append(cancelButton, confirmButton);
  panel.append(title, fileLabel, altTextLabel, errorMessage, actions);
  element.append(panel);

  lifecycle.addEventListener(fileInput, 'change', () => {
    selectedFile = fileInput.files?.[0] ?? null;
    clearError();
    updateState();
  });

  lifecycle.addEventListener(panel, 'submit', (event) => {
    event.preventDefault();
    submitSelectedFile();
  });

  lifecycle.addEventListener(cancelButton, 'click', () => {
    close();
  });

  lifecycle.addEventListener(element, 'pointerdown', (event) => {
    if (event.target === element) {
      close();
    }
  });

  lifecycle.addEventListener(document, 'keydown', (event) => {
    if (!isOpen() || event.key !== 'Escape') {
      return;
    }

    close();
  });

  const dialog: ImageDialog = {
    element,
    panel,
    fileInput,
    altTextInput,
    confirmButton,
    cancelButton,
    errorMessage,
    open,
    close,
    setDisabled: (nextDisabled) => {
      disabled = nextDisabled;
      updateState();
    },
  };

  updateState();

  return dialog;

  function open(): void {
    if (disabled) {
      return;
    }

    element.hidden = false;
    clearError();
    updateState();
    fileInput.focus();
  }

  function close(): void {
    element.hidden = true;
    clearError();
    selectedFile = null;
    fileInput.value = '';
    altTextInput.value = '';
    updateState();
  }

  function submitSelectedFile(): void {
    if (disabled) {
      return;
    }

    if (!selectedFile) {
      showError('Selecciona una imagen antes de continuar.');
      updateState();
      return;
    }

    const validation = validateImageFile(selectedFile);

    if (!validation.valid) {
      showError(validation.error ?? 'La imagen seleccionada no es valida.');
      updateState();
      return;
    }

    onSubmit({
      file: selectedFile,
      altText: altTextInput.value.trim(),
    });

    close();
  }

  function showError(message: string): void {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    fileInput.setAttribute('aria-invalid', 'true');
  }

  function clearError(): void {
    errorMessage.textContent = '';
    errorMessage.hidden = true;
    fileInput.removeAttribute('aria-invalid');
  }

  function updateState(): void {
    fileInput.disabled = disabled;
    altTextInput.disabled = disabled;
    cancelButton.disabled = disabled;
    confirmButton.disabled = disabled || !selectedFile;
  }

  function isOpen(): boolean {
    return !element.hidden;
  }
}
