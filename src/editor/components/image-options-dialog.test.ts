/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it } from 'vitest';

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
    const dialog = createImageOptionsDialog({
      editor,
      lifecycle,
    });

    document.body.append(dialog.element);

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
});
