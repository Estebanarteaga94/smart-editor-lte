import type { Editor } from '@tiptap/core';

import {
  editorCommands,
  setHeading,
  type EditorCommand,
  type HeadingLevel,
} from '../core/editor-commands';
import type { EditorLifecycle } from '../core/editor-lifecycle';

export type ToolbarButtonId =
  'bold' | 'italic' | 'underline' | 'bullet-list' | 'ordered-list' | 'undo' | 'redo' | 'save';

export interface ToolbarButtonConfig {
  id: ToolbarButtonId;
  label: string;
  icon: string;
  iconModifier?: string;
  separatorAfter?: boolean;
  ariaLabel: string;
  command?: EditorCommand;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
  pressed?: boolean;
}

export interface EditorToolbarOptions {
  editor: Editor;
  lifecycle: EditorLifecycle;
  onSave: () => Promise<void> | void;
}

export interface EditorToolbar {
  element: HTMLElement;
  updateState: () => void;
}

type BlockFormatValue = 'paragraph' | `heading-${1 | 2 | 3 | 4 | 5 | 6}`;

const blockFormatOptions: readonly { value: BlockFormatValue; label: string }[] = [
  { value: 'paragraph', label: 'Parrafo' },
  { value: 'heading-1', label: 'Titulo H1' },
  { value: 'heading-2', label: 'Titulo H2' },
  { value: 'heading-3', label: 'Titulo H3' },
  { value: 'heading-4', label: 'Titulo H4' },
  { value: 'heading-5', label: 'Titulo H5' },
  { value: 'heading-6', label: 'Titulo H6' },
];

const toolbarButtons: readonly ToolbarButtonConfig[] = [
  {
    id: 'bold',
    label: 'B',
    icon: '\ue87f',
    ariaLabel: 'Activar o desactivar negrita',
    command: editorCommands.toggleBold,
    isActive: (editor) => editor.isActive('bold'),
    pressed: true,
  },
  {
    id: 'italic',
    label: 'I',
    icon: '\ue880',
    ariaLabel: 'Activar o desactivar cursiva',
    command: editorCommands.toggleItalic,
    isActive: (editor) => editor.isActive('italic'),
    pressed: true,
  },
  {
    id: 'underline',
    label: 'U',
    icon: '\uf0cd',
    ariaLabel: 'Activar o desactivar subrayado',
    command: editorCommands.toggleUnderline,
    isActive: (editor) => editor.isActive('underline'),
    pressed: true,
    separatorAfter: true,
  },
  {
    id: 'bullet-list',
    label: 'Lista',
    icon: '\uf0ca',
    ariaLabel: 'Activar o desactivar lista no ordenada',
    command: editorCommands.toggleBulletList,
    isActive: (editor) => editor.isActive('bulletList'),
    pressed: true,
  },
  {
    id: 'ordered-list',
    label: '1.',
    icon: '\uf0cb',
    ariaLabel: 'Activar o desactivar lista ordenada',
    command: editorCommands.toggleOrderedList,
    isActive: (editor) => editor.isActive('orderedList'),
    pressed: true,
    separatorAfter: true,
  },
  {
    id: 'undo',
    label: 'Undo',
    icon: '\ue866',
    ariaLabel: 'Deshacer ultimo cambio',
    command: editorCommands.undo,
    isDisabled: (editor) => !editor.can().chain().focus().undo().run(),
  },
  {
    id: 'redo',
    label: 'Redo',
    icon: '\ue865',
    ariaLabel: 'Rehacer ultimo cambio',
    command: editorCommands.redo,
    isDisabled: (editor) => !editor.can().chain().focus().redo().run(),
    separatorAfter: true,
  },
  {
    id: 'save',
    label: 'Guardar',
    icon: '\ue89b',
    ariaLabel: 'Guardar documento',
  },
];

export function createToolbar({ editor, lifecycle, onSave }: EditorToolbarOptions): EditorToolbar {
  const element = document.createElement('div');
  const blockFormatSelect = createBlockFormatSelect();
  const buttons = new Map<ToolbarButtonId, HTMLButtonElement>();

  element.className = 'editor-toolbar';
  element.append(blockFormatSelect);
  element.append(createToolbarSeparator());

  lifecycle.addEventListener(blockFormatSelect, 'change', () => {
    applyBlockFormat(editor, blockFormatSelect.value as BlockFormatValue);
    updateState();
  });

  for (const config of toolbarButtons) {
    const button = createToolbarButton(config);
    buttons.set(config.id, button);
    element.append(button);

    if (config.separatorAfter) {
      element.append(createToolbarSeparator());
    }

    lifecycle.addEventListener(button, 'click', () => {
      if (button.disabled) {
        return;
      }

      if (config.id === 'save') {
        void onSave();
        return;
      }

      config.command?.(editor);
      updateState();
    });
  }

  const updateState = (): void => {
    blockFormatSelect.disabled = editor.isDestroyed || !editor.isEditable;
    blockFormatSelect.value = getActiveBlockFormat(editor);

    for (const config of toolbarButtons) {
      const button = buttons.get(config.id);

      if (!button) {
        continue;
      }

      const isDisabled = editor.isDestroyed || (config.isDisabled?.(editor) ?? !editor.isEditable);
      const isActive = config.isActive?.(editor) ?? false;

      button.disabled = isDisabled;
      button.dataset.active = String(isActive);

      if (config.pressed) {
        button.setAttribute('aria-pressed', String(isActive));
      }
    }
  };

  const refreshToolbar = (): void => {
    updateState();
  };

  editor.on('selectionUpdate', refreshToolbar);
  editor.on('transaction', refreshToolbar);
  editor.on('update', refreshToolbar);
  lifecycle.registerCleanup(() => {
    editor.off('selectionUpdate', refreshToolbar);
    editor.off('transaction', refreshToolbar);
    editor.off('update', refreshToolbar);
  });

  updateState();

  return {
    element,
    updateState,
  };
}

function createToolbarSeparator(): HTMLSpanElement {
  const separator = document.createElement('span');

  separator.className = 'editor-toolbar__separator';
  separator.setAttribute('aria-hidden', 'true');

  return separator;
}

function createToolbarButton(config: ToolbarButtonConfig): HTMLButtonElement {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'editor-shell__tool';
  button.dataset.toolbarAction = config.id;
  button.title = config.ariaLabel;
  button.setAttribute('aria-label', config.ariaLabel);

  const icon = document.createElement('span');
  icon.className = 'editor-shell__tool-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = config.icon;
  button.append(icon);

  if (config.iconModifier) {
    const modifier = document.createElement('span');
    modifier.className = 'editor-shell__tool-icon-modifier';
    modifier.setAttribute('aria-hidden', 'true');
    modifier.textContent = config.iconModifier;
    button.append(modifier);
  }

  if (config.pressed) {
    button.setAttribute('aria-pressed', 'false');
  }

  return button;
}

function createBlockFormatSelect(): HTMLSelectElement {
  const select = document.createElement('select');

  select.className = 'editor-shell__block-format';
  select.dataset.toolbarAction = 'block-format';
  select.setAttribute('aria-label', 'Seleccionar formato de bloque');
  select.title = 'Seleccionar formato de bloque';

  for (const optionConfig of blockFormatOptions) {
    const option = document.createElement('option');
    option.value = optionConfig.value;
    option.textContent = optionConfig.label;
    select.append(option);
  }

  return select;
}

function applyBlockFormat(editor: Editor, value: BlockFormatValue): void {
  if (value === 'paragraph') {
    editorCommands.setParagraph(editor);
    return;
  }

  const level = Number(value.replace('heading-', '')) as HeadingLevel;
  setHeading(editor, level);
}

function getActiveBlockFormat(editor: Editor): BlockFormatValue {
  for (const level of [1, 2, 3, 4, 5, 6] as const) {
    if (editor.isActive('heading', { level })) {
      return `heading-${level}`;
    }
  }

  return 'paragraph';
}
