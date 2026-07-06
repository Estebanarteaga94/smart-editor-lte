import type { Editor } from '@tiptap/core';

import { editorCommands, type EditorCommand } from '../core/editor-commands';
import type { EditorLifecycle } from '../core/editor-lifecycle';

export type ToolbarButtonId =
  | 'paragraph'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'bullet-list'
  | 'ordered-list'
  | 'undo'
  | 'redo'
  | 'save';

export interface ToolbarButtonConfig {
  id: ToolbarButtonId;
  label: string;
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

const toolbarButtons: readonly ToolbarButtonConfig[] = [
  {
    id: 'paragraph',
    label: 'P',
    ariaLabel: 'Convertir a parrafo',
    command: editorCommands.setParagraph,
    isActive: (editor) => editor.isActive('paragraph'),
    pressed: true,
  },
  {
    id: 'heading-1',
    label: 'H1',
    ariaLabel: 'Convertir a encabezado H1',
    command: editorCommands.setHeading1,
    isActive: (editor) => editor.isActive('heading', { level: 1 }),
    pressed: true,
  },
  {
    id: 'heading-2',
    label: 'H2',
    ariaLabel: 'Convertir a encabezado H2',
    command: editorCommands.setHeading2,
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
    pressed: true,
  },
  {
    id: 'heading-3',
    label: 'H3',
    ariaLabel: 'Convertir a encabezado H3',
    command: editorCommands.setHeading3,
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
    pressed: true,
  },
  {
    id: 'bold',
    label: 'B',
    ariaLabel: 'Activar o desactivar negrita',
    command: editorCommands.toggleBold,
    isActive: (editor) => editor.isActive('bold'),
    pressed: true,
  },
  {
    id: 'italic',
    label: 'I',
    ariaLabel: 'Activar o desactivar cursiva',
    command: editorCommands.toggleItalic,
    isActive: (editor) => editor.isActive('italic'),
    pressed: true,
  },
  {
    id: 'underline',
    label: 'U',
    ariaLabel: 'Activar o desactivar subrayado',
    command: editorCommands.toggleUnderline,
    isActive: (editor) => editor.isActive('underline'),
    pressed: true,
  },
  {
    id: 'bullet-list',
    label: 'Lista',
    ariaLabel: 'Activar o desactivar lista no ordenada',
    command: editorCommands.toggleBulletList,
    isActive: (editor) => editor.isActive('bulletList'),
    pressed: true,
  },
  {
    id: 'ordered-list',
    label: '1.',
    ariaLabel: 'Activar o desactivar lista ordenada',
    command: editorCommands.toggleOrderedList,
    isActive: (editor) => editor.isActive('orderedList'),
    pressed: true,
  },
  {
    id: 'undo',
    label: 'Undo',
    ariaLabel: 'Deshacer ultimo cambio',
    command: editorCommands.undo,
    isDisabled: (editor) => !editor.can().chain().focus().undo().run(),
  },
  {
    id: 'redo',
    label: 'Redo',
    ariaLabel: 'Rehacer ultimo cambio',
    command: editorCommands.redo,
    isDisabled: (editor) => !editor.can().chain().focus().redo().run(),
  },
  {
    id: 'save',
    label: 'Guardar',
    ariaLabel: 'Guardar documento',
  },
];

export function createToolbar({ editor, lifecycle, onSave }: EditorToolbarOptions): EditorToolbar {
  const element = document.createElement('div');
  const buttons = new Map<ToolbarButtonId, HTMLButtonElement>();

  element.className = 'editor-toolbar';

  for (const config of toolbarButtons) {
    const button = createToolbarButton(config);
    buttons.set(config.id, button);
    element.append(button);

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

function createToolbarButton(config: ToolbarButtonConfig): HTMLButtonElement {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'editor-shell__tool';
  button.dataset.toolbarAction = config.id;
  button.textContent = config.label;
  button.setAttribute('aria-label', config.ariaLabel);

  if (config.pressed) {
    button.setAttribute('aria-pressed', 'false');
  }

  return button;
}
