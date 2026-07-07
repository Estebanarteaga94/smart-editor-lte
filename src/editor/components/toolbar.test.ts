/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createWysiwygEditor } from '../core/create-editor';
import { createEditorLifecycle } from '../core/editor-lifecycle';
import { createToolbar } from './toolbar';

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

describe('createToolbar', () => {
  it('renders accessible toolbar buttons', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const toolbar = createToolbar({
      editor,
      lifecycle,
      onSave: vi.fn(),
    });
    const buttons = [...toolbar.element.querySelectorAll('button')];
    const blockFormatSelect = toolbar.element.querySelector<HTMLSelectElement>(
      '[data-toolbar-action="block-format"]',
    );

    expect(blockFormatSelect).not.toBeNull();
    expect(blockFormatSelect?.getAttribute('aria-label')).toBe('Seleccionar formato de bloque');
    expect([...(blockFormatSelect?.options ?? [])].map((option) => option.value)).toEqual([
      'paragraph',
      'heading-1',
      'heading-2',
      'heading-3',
      'heading-4',
      'heading-5',
      'heading-6',
    ]);
    expect(buttons).toHaveLength(8);
    expect(buttons.every((button) => button.type === 'button')).toBe(true);
    expect(buttons.every((button) => button.hasAttribute('aria-label'))).toBe(true);
    expect(buttons.every((button) => button.querySelector('.editor-shell__tool-icon'))).toBe(true);
    expect(toolbar.element.querySelector('[data-toolbar-action="save"]')).not.toBeNull();

    lifecycle.dispose();
  });

  it('executes editor commands and updates active state', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const toolbar = createToolbar({
      editor,
      lifecycle,
      onSave: vi.fn(),
    });
    const blockFormatSelect = toolbar.element.querySelector<HTMLSelectElement>(
      '[data-toolbar-action="block-format"]',
    );
    const boldButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="bold"]',
    );

    expect(blockFormatSelect).not.toBeNull();
    expect(boldButton).not.toBeNull();

    if (blockFormatSelect) {
      blockFormatSelect.value = 'heading-6';
      blockFormatSelect.dispatchEvent(new Event('change'));
    }

    expect(editor.isActive('heading', { level: 6 })).toBe(true);
    expect(blockFormatSelect?.value).toBe('heading-6');

    editor.commands.selectAll();
    boldButton?.click();
    expect(editor.isActive('bold')).toBe(true);
    expect(boldButton?.getAttribute('aria-pressed')).toBe('true');

    lifecycle.dispose();
  });

  it('calls save handler from the save button', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const onSave = vi.fn();
    const toolbar = createToolbar({
      editor,
      lifecycle,
      onSave,
    });
    const saveButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="save"]',
    );

    saveButton?.click();

    expect(onSave).toHaveBeenCalledTimes(1);

    lifecycle.dispose();
  });
});
