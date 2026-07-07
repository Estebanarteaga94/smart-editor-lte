/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createWysiwygEditor } from '../core/create-editor';
import { createEditorLifecycle } from '../core/editor-lifecycle';
import { createImageOptionsDialog } from './image-options-dialog';

const mountedEditors = new Set<ReturnType<typeof createWysiwygEditor>>();

function mountEditor() {
  const element = document.createElement('div');
  document.body.append(element);

  const editor = createWysiwygEditor({
    element,
    initialContent: '<p>Texto</p>',
  });

  mountedEditors.add(editor);
  return editor;
}

afterEach(() => {
  vi.restoreAllMocks();

  for (const editor of mountedEditors) {
    editor.destroy();
  }

  mountedEditors.clear();
  document.body.innerHTML = '';
});

describe('createImageOptionsDialog', () => {
  it('shows when an image is selected and applies image actions outside the toolbar', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const { container: imageContainer, image: imageElement } = createImageNodeView();
    const dialog = createImageOptionsDialog({
      editor,
      lifecycle,
    });

    document.body.append(dialog.element);
    vi.spyOn(editor.view, 'nodeDOM').mockReturnValue(imageContainer);
    vi.spyOn(dialog.element, 'getBoundingClientRect').mockReturnValue(
      createRect({ top: 0, left: 0, right: 260, bottom: 44, width: 260, height: 44 }),
    );
    vi.spyOn(imageElement, 'getBoundingClientRect').mockReturnValue(
      createRect({ top: 100, left: 120, right: 420, bottom: 300, width: 300, height: 200 }),
    );

    const alignCenterButton = dialog.element.querySelector<HTMLButtonElement>(
      '[data-image-options="image-options-align-center"]',
    );
    const alignRightButton = dialog.element.querySelector<HTMLButtonElement>(
      '[data-image-options="image-options-align-right"]',
    );
    const widthInput = dialog.element.querySelector<HTMLInputElement>(
      '[data-image-options="image-options-width"]',
    );
    const heightInput = dialog.element.querySelector<HTMLInputElement>(
      '[data-image-options="image-options-height"]',
    );
    const clearDimensionsButton = dialog.element.querySelector<HTMLButtonElement>(
      '[data-image-options="image-options-clear-dimensions"]',
    );

    expect(dialog.element.hidden).toBe(true);
    expect(dialog.element.getAttribute('role')).toBe('dialog');
    expect(dialog.element.getAttribute('aria-label')).toBe('Opciones de imagen');
    expect(alignCenterButton).not.toBeNull();
    expect(alignRightButton).not.toBeNull();
    expect(widthInput).not.toBeNull();
    expect(heightInput).not.toBeNull();
    expect(clearDimensionsButton).not.toBeNull();

    editor.commands.setContent({
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: {
            src: '/assets/image.png',
            alt: 'Imagen',
          },
        },
      ],
    });
    editor.commands.setNodeSelection(0);
    dialog.updateState();

    expect(dialog.element.hidden).toBe(false);
    expect(widthInput?.value).toBe('');
    expect(heightInput?.value).toBe('');

    alignCenterButton?.click();
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'image',
      attrs: {
        align: 'center',
      },
    });
    expect(editor.getHTML()).toContain('align="center"');
    expect(alignCenterButton?.getAttribute('aria-pressed')).toBe('true');

    if (widthInput && heightInput) {
      widthInput.value = '360';
      heightInput.value = '240';
      widthInput.dispatchEvent(new Event('change'));
    }

    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'image',
      attrs: {
        width: 360,
        height: 240,
      },
    });
    expect(editor.getHTML()).toContain('width="360"');
    expect(editor.getHTML()).toContain('height="240"');
    expect(widthInput?.value).toBe('360');
    expect(heightInput?.value).toBe('240');

    if (widthInput) {
      widthInput.value = '0';
      widthInput.dispatchEvent(new Event('change'));
    }

    expect(widthInput?.getAttribute('aria-invalid')).toBe('true');
    expect(editor.getJSON().content?.[0]).toMatchObject({
      attrs: {
        width: 360,
        height: 240,
      },
    });

    clearDimensionsButton?.click();
    expect(editor.getJSON().content?.[0]).toMatchObject({
      attrs: {
        width: null,
        height: null,
      },
    });
    expect(widthInput?.value).toBe('');
    expect(heightInput?.value).toBe('');

    alignRightButton?.click();
    expect(editor.getJSON().content?.[0]).toMatchObject({
      attrs: {
        align: 'right',
      },
    });
    expect(alignRightButton?.getAttribute('aria-pressed')).toBe('true');

    editor.commands.setTextSelection(1);
    dialog.updateState();
    expect(dialog.element.hidden).toBe(true);

    lifecycle.dispose();
  });

  it('positions the dialog outside the selected image rectangle', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const { container: imageContainer, image: imageElement } = createImageNodeView();
    const dialog = createImageOptionsDialog({
      editor,
      lifecycle,
    });

    document.body.append(dialog.element);
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 600,
    });
    vi.spyOn(editor.view, 'nodeDOM').mockReturnValue(imageContainer);
    vi.spyOn(dialog.element, 'getBoundingClientRect').mockReturnValue(
      createRect({ top: 0, left: 0, right: 260, bottom: 44, width: 260, height: 44 }),
    );
    vi.spyOn(imageElement, 'getBoundingClientRect').mockReturnValue(
      createRect({ top: 100, left: 120, right: 420, bottom: 300, width: 300, height: 200 }),
    );

    editor.commands.setContent({
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: {
            src: '/assets/image.png',
            alt: 'Imagen',
          },
        },
      ],
    });
    editor.commands.setNodeSelection(0);
    dialog.updateState();

    expect(dialog.element.style.top).toBe('308px');
    expect(dialog.element.style.left).toBe('120px');

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 340,
    });
    dialog.updateState();

    expect(dialog.element.style.top).toBe('48px');
    expect(dialog.element.style.left).toBe('120px');

    lifecycle.dispose();
  });

  it('repositions after image alignment changes its rectangle', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const { container: imageContainer, image: imageElement } = createImageNodeView();
    let animationCallback: FrameRequestCallback = () => undefined;
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        animationCallback = callback;
        return 1;
      });
    const cancelAnimationFrameSpy = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(() => undefined);
    const dialog = createImageOptionsDialog({
      editor,
      lifecycle,
    });

    document.body.append(dialog.element);
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 600,
    });
    vi.spyOn(editor.view, 'nodeDOM').mockReturnValue(imageContainer);
    vi.spyOn(imageContainer, 'getBoundingClientRect').mockReturnValue(
      createRect({ top: 100, left: 20, right: 780, bottom: 300, width: 760, height: 200 }),
    );
    vi.spyOn(dialog.element, 'getBoundingClientRect').mockReturnValue(
      createRect({ top: 0, left: 0, right: 260, bottom: 44, width: 260, height: 44 }),
    );
    const imageRectSpy = vi
      .spyOn(imageElement, 'getBoundingClientRect')
      .mockReturnValue(
        createRect({ top: 100, left: 120, right: 420, bottom: 300, width: 300, height: 200 }),
      );

    editor.commands.setContent({
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: {
            src: '/assets/image.png',
            alt: 'Imagen',
          },
        },
      ],
    });
    editor.commands.setNodeSelection(0);
    dialog.updateState();
    expect(dialog.element.style.top).toBe('308px');
    expect(dialog.element.style.left).toBe('120px');

    const alignCenterButton = dialog.element.querySelector<HTMLButtonElement>(
      '[data-image-options="image-options-align-center"]',
    );
    const alignRightButton = dialog.element.querySelector<HTMLButtonElement>(
      '[data-image-options="image-options-align-right"]',
    );
    const alignLeftButton = dialog.element.querySelector<HTMLButtonElement>(
      '[data-image-options="image-options-align-left"]',
    );

    alignCenterButton?.click();
    imageRectSpy.mockReturnValue(
      createRect({ top: 120, left: 250, right: 550, bottom: 320, width: 300, height: 200 }),
    );
    animationCallback(performance.now());

    expect(dialog.element.style.top).toBe('328px');
    expect(dialog.element.style.left).toBe('250px');

    alignRightButton?.click();
    imageRectSpy.mockReturnValue(
      createRect({ top: 120, left: 430, right: 730, bottom: 320, width: 300, height: 200 }),
    );
    animationCallback(performance.now());

    expect(requestAnimationFrameSpy).toHaveBeenCalled();
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    expect(dialog.element.style.top).toBe('328px');
    expect(dialog.element.style.left).toBe('430px');

    alignLeftButton?.click();
    imageRectSpy.mockReturnValue(
      createRect({ top: 120, left: 40, right: 340, bottom: 320, width: 300, height: 200 }),
    );
    animationCallback(performance.now());

    expect(dialog.element.style.top).toBe('328px');
    expect(dialog.element.style.left).toBe('40px');

    lifecycle.dispose();
  });

  it('waits for a stable image rectangle before showing the dialog', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const { container: imageContainer, image: imageElement } = createImageNodeView();
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 1);
    const dialog = createImageOptionsDialog({
      editor,
      lifecycle,
    });

    document.body.append(dialog.element);
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 600,
    });
    vi.spyOn(editor.view, 'nodeDOM').mockReturnValue(imageContainer);
    vi.spyOn(dialog.element, 'getBoundingClientRect').mockReturnValue(
      createRect({ top: 0, left: 0, right: 260, bottom: 44, width: 260, height: 44 }),
    );
    const imageRectSpy = vi
      .spyOn(imageElement, 'getBoundingClientRect')
      .mockReturnValue(createRect({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }));

    editor.commands.setContent({
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: {
            src: '/assets/image.png',
            alt: 'Imagen',
          },
        },
      ],
    });
    editor.commands.setNodeSelection(0);
    dialog.updateState();

    expect(dialog.element.hidden).toBe(true);
    expect(requestAnimationFrameSpy).toHaveBeenCalled();

    imageRectSpy.mockReturnValue(
      createRect({ top: 100, left: 120, right: 420, bottom: 300, width: 300, height: 200 }),
    );
    dialog.updateState();

    expect(dialog.element.hidden).toBe(false);
    expect(dialog.element.style.top).toBe('308px');
    expect(dialog.element.style.left).toBe('120px');

    lifecycle.dispose();
  });
});

function createRect(rect: {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}): DOMRect {
  return new DOMRect(rect.left, rect.top, rect.width, rect.height);
}

function createImageNodeView(): { container: HTMLElement; image: HTMLImageElement } {
  const container = document.createElement('span');
  const image = document.createElement('img');

  container.dataset.node = 'image';
  container.append(image);

  return { container, image };
}
