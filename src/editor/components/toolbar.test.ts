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

    expect(buttons).toHaveLength(12);
    expect(buttons.every((button) => button.type === 'button')).toBe(true);
    expect(buttons.every((button) => button.hasAttribute('aria-label'))).toBe(true);
    expect(buttons.every((button) => button.querySelector('.editor-shell__tool-icon'))).toBe(true);
    expect(toolbar.element.querySelector('[data-toolbar-action="paragraph"]')).not.toBeNull();
    expect(toolbar.element.querySelector('[data-toolbar-action="save"]')).not.toBeNull();
    expect(
      toolbar.element.querySelector(
        '[data-toolbar-action="heading-1"] .editor-shell__tool-icon-modifier',
      )?.textContent,
    ).toBe('1');

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
    const headingButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="heading-1"]',
    );
    const boldButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="bold"]',
    );

    expect(headingButton).not.toBeNull();
    expect(boldButton).not.toBeNull();

    headingButton?.click();
    expect(editor.isActive('heading', { level: 1 })).toBe(true);
    expect(headingButton?.getAttribute('aria-pressed')).toBe('true');
    expect(headingButton?.dataset.active).toBe('true');

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
