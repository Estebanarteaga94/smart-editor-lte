/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createEditorLifecycle } from '../core/editor-lifecycle';
import { createImageDialog } from './image-dialog';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('createImageDialog', () => {
  it('renders an accessible image insertion dialog', () => {
    const lifecycle = createEditorLifecycle();
    const dialog = createImageDialog({
      lifecycle,
      onSubmit: vi.fn(),
    });

    document.body.append(dialog.element);

    expect(dialog.element.hidden).toBe(true);
    expect(dialog.panel.getAttribute('role')).toBe('dialog');
    expect(dialog.panel.getAttribute('aria-modal')).toBe('true');
    expect(dialog.fileInput.type).toBe('file');
    expect(dialog.fileInput.accept).toBe('image/png,image/jpeg,image/webp');
    expect(dialog.altTextInput.type).toBe('text');
    expect(dialog.confirmButton.textContent).toBe('Insertar');
    expect(dialog.confirmButton.disabled).toBe(true);
    expect(dialog.cancelButton.textContent).toBe('Cancelar');

    dialog.open();

    expect(dialog.element.hidden).toBe(false);
    expect(dialog.errorMessage.hidden).toBe(true);

    lifecycle.dispose();
  });

  it('submits a selected image file and trimmed alt text', () => {
    const lifecycle = createEditorLifecycle();
    const onSubmit = vi.fn();
    const dialog = createImageDialog({
      lifecycle,
      onSubmit,
    });
    const file = createImageFile('image/png');

    document.body.append(dialog.element);
    dialog.open();
    setSelectedFiles(dialog.fileInput, [file]);
    dialog.fileInput.dispatchEvent(new Event('change'));
    dialog.altTextInput.value = '  Logo principal  ';
    dialog.panel.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));

    expect(onSubmit).toHaveBeenCalledWith({
      file,
      altText: 'Logo principal',
    });
    expect(dialog.element.hidden).toBe(true);
    expect(dialog.confirmButton.disabled).toBe(true);

    lifecycle.dispose();
  });

  it('cancels and resets the selected file and alt text', () => {
    const lifecycle = createEditorLifecycle();
    const onSubmit = vi.fn();
    const dialog = createImageDialog({
      lifecycle,
      onSubmit,
    });

    document.body.append(dialog.element);
    dialog.open();
    setSelectedFiles(dialog.fileInput, [createImageFile('image/jpeg')]);
    dialog.fileInput.dispatchEvent(new Event('change'));
    dialog.altTextInput.value = 'Imagen';

    expect(dialog.confirmButton.disabled).toBe(false);

    dialog.cancelButton.click();

    expect(dialog.element.hidden).toBe(true);
    expect(dialog.altTextInput.value).toBe('');
    expect(dialog.confirmButton.disabled).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();

    lifecycle.dispose();
  });

  it('shows an error when submitting without a file or with an invalid file', () => {
    const lifecycle = createEditorLifecycle();
    const onSubmit = vi.fn();
    const dialog = createImageDialog({
      lifecycle,
      onSubmit,
    });

    document.body.append(dialog.element);
    dialog.open();
    dialog.panel.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));

    expect(dialog.errorMessage.hidden).toBe(false);
    expect(dialog.errorMessage.textContent).toContain('Selecciona una imagen');
    expect(dialog.fileInput.getAttribute('aria-invalid')).toBe('true');

    setSelectedFiles(dialog.fileInput, [createImageFile('image/gif')]);
    dialog.fileInput.dispatchEvent(new Event('change'));
    dialog.panel.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));

    expect(dialog.errorMessage.hidden).toBe(false);
    expect(dialog.errorMessage.textContent).toContain('image/gif');
    expect(onSubmit).not.toHaveBeenCalled();

    lifecycle.dispose();
  });

  it('closes with Escape and supports disabled state', () => {
    const lifecycle = createEditorLifecycle();
    const dialog = createImageDialog({
      lifecycle,
      onSubmit: vi.fn(),
    });

    document.body.append(dialog.element);
    dialog.setDisabled(true);
    dialog.open();

    expect(dialog.element.hidden).toBe(true);
    expect(dialog.fileInput.disabled).toBe(true);
    expect(dialog.altTextInput.disabled).toBe(true);

    dialog.setDisabled(false);
    dialog.open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(dialog.element.hidden).toBe(true);

    lifecycle.dispose();
  });
});

function createImageFile(type: string): File {
  return new File([new Uint8Array(1024)], 'image', { type });
}

function setSelectedFiles(input: HTMLInputElement, files: readonly File[]): void {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: files,
  });
}
