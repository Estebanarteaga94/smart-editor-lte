import type { Editor } from '@tiptap/core';

import {
  editorCommands,
  setHeading,
  type EditorCommand,
  type HeadingLevel,
} from '../core/editor-commands';
import type { EditorLifecycle } from '../core/editor-lifecycle';
import { tableCommands } from '../core/table-commands';
import { createLinkPopover } from './link-popover';
import { createTextColorPicker, normalizeTextColor } from './text-color-picker';

export type ToolbarButtonId =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'align-left'
  | 'align-center'
  | 'align-right'
  | 'align-justify'
  | 'blockquote'
  | 'code-block'
  | 'horizontal-rule'
  | 'insert-table'
  | 'insert-image'
  | 'source-html'
  | 'source-json'
  | 'preview'
  | 'fullscreen'
  | 'format-html'
  | 'bullet-list'
  | 'ordered-list'
  | 'undo'
  | 'redo'
  | 'save';

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
  onInsertImage?: () => void;
  onToggleSourceHtml?: () => void;
  onToggleSourceJson?: () => void;
  onTogglePreview?: () => void;
  onToggleFullscreen?: () => void;
  onFormatHtml?: () => Promise<void> | void;
  isSourceHtmlActive?: () => boolean;
  isSourceJsonActive?: () => boolean;
  isPreviewActive?: () => boolean;
  isFullscreenActive?: () => boolean;
}

export interface EditorToolbar {
  element: HTMLElement;
  updateState: () => void;
}

type BlockFormatValue = 'paragraph' | `heading-${1 | 2 | 3 | 4 | 5 | 6}`;

const blockFormatOptions: readonly { value: BlockFormatValue; label: string }[] = [
  { value: 'paragraph', label: 'Parrafo' },
  { value: 'heading-1', label: 'Encabezado 1' },
  { value: 'heading-2', label: 'Encabezado 2' },
  { value: 'heading-3', label: 'Encabezado 3' },
  { value: 'heading-4', label: 'Encabezado 4' },
  { value: 'heading-5', label: 'Encabezado 5' },
  { value: 'heading-6', label: 'Encabezado 6' },
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
  },
  {
    id: 'strike',
    label: 'S',
    icon: '\uf0cc',
    ariaLabel: 'Activar o desactivar tachado',
    command: editorCommands.toggleStrike,
    isActive: (editor) => editor.isActive('strike'),
    pressed: true,
    separatorAfter: true,
  },
  {
    id: 'align-left',
    label: 'Izquierda',
    icon: '\ue883',
    ariaLabel: 'Alinear a la izquierda',
    command: editorCommands.setTextAlignLeft,
    isActive: (editor) => editor.isActive({ textAlign: 'left' }),
    isDisabled: (editor) => isImageSelectionActive(editor),
    pressed: true,
  },
  {
    id: 'align-center',
    label: 'Centro',
    icon: '\ue884',
    ariaLabel: 'Alinear al centro',
    command: editorCommands.setTextAlignCenter,
    isActive: (editor) => editor.isActive({ textAlign: 'center' }),
    isDisabled: (editor) => isImageSelectionActive(editor),
    pressed: true,
  },
  {
    id: 'align-right',
    label: 'Derecha',
    icon: '\ue885',
    ariaLabel: 'Alinear a la derecha',
    command: editorCommands.setTextAlignRight,
    isActive: (editor) => editor.isActive({ textAlign: 'right' }),
    isDisabled: (editor) => isImageSelectionActive(editor),
    pressed: true,
  },
  {
    id: 'align-justify',
    label: 'Justificar',
    icon: '\ue886',
    ariaLabel: 'Justificar texto',
    command: editorCommands.setTextAlignJustify,
    isActive: (editor) => editor.isActive({ textAlign: 'justify' }),
    isDisabled: (editor) => isImageSelectionActive(editor),
    pressed: true,
    separatorAfter: true,
  },
  {
    id: 'blockquote',
    label: 'Cita',
    icon: '\uf10d',
    ariaLabel: 'Activar o desactivar cita',
    command: editorCommands.toggleBlockquote,
    isActive: (editor) => editor.isActive('blockquote'),
    pressed: true,
  },
  {
    id: 'code-block',
    label: 'Codigo',
    icon: '\uf1c9',
    ariaLabel: 'Activar o desactivar bloque de codigo',
    command: editorCommands.toggleCodeBlock,
    isActive: (editor) => editor.isActive('codeBlock'),
    pressed: true,
  },
  {
    id: 'horizontal-rule',
    label: 'Separador',
    icon: '\ue81b',
    ariaLabel: 'Insertar separador horizontal',
    command: editorCommands.setHorizontalRule,
  },
  {
    id: 'insert-table',
    label: 'Tabla',
    icon: '\uf0ce',
    ariaLabel: 'Insertar tabla 3 por 3 con encabezado',
    command: tableCommands.insertTable,
  },
  {
    id: 'insert-image',
    label: 'Imagen',
    icon: '\ue80d',
    ariaLabel: 'Insertar imagen',
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
    id: 'source-html',
    label: 'HTML',
    icon: '</>',
    ariaLabel: 'Alternar vista HTML',
    pressed: true,
  },
  {
    id: 'source-json',
    label: 'JSON',
    icon: '{}',
    ariaLabel: 'Alternar vista JSON',
    pressed: true,
  },
  {
    id: 'preview',
    label: 'Preview',
    icon: '\ue825',
    ariaLabel: 'Alternar vista previa',
    pressed: true,
    separatorAfter: true,
  },
  {
    id: 'fullscreen',
    label: 'Pantalla completa',
    icon: '\ue84d',
    ariaLabel: 'Alternar pantalla completa',
    pressed: true,
  },
  {
    id: 'format-html',
    label: 'Formatear',
    icon: '\uf0d0',
    ariaLabel: 'Formatear HTML fuente',
  },
  {
    id: 'save',
    label: 'Guardar',
    icon: '\ue89b',
    ariaLabel: 'Guardar documento',
  },
];

export function createToolbar({
  editor,
  lifecycle,
  onSave,
  onInsertImage,
  onToggleSourceHtml,
  onToggleSourceJson,
  onTogglePreview,
  onToggleFullscreen,
  onFormatHtml,
  isSourceHtmlActive,
  isSourceJsonActive,
  isPreviewActive,
  isFullscreenActive,
}: EditorToolbarOptions): EditorToolbar {
  const element = document.createElement('div');
  const blockFormatSelect = createBlockFormatSelect();
  const textColorPicker = createTextColorPicker({
    lifecycle,
    onChange: (color) => {
      editorCommands.setTextColor(editor, color);
      updateState();
    },
    onClear: () => {
      editorCommands.unsetTextColor(editor);
      updateState();
    },
  });
  const highlightColorPicker = createTextColorPicker({
    lifecycle,
    actionPrefix: 'highlight-color',
    triggerLabel: 'Color de resaltado',
    triggerIcon: 'H',
    automaticLabel: 'Sin resaltado',
    automaticAriaLabel: 'Quitar resaltado',
    inputLabel: 'Seleccionar mas colores de resaltado',
    onChange: (color) => {
      editorCommands.setHighlightColor(editor, color);
      updateState();
    },
    onClear: () => {
      editorCommands.unsetHighlight(editor);
      updateState();
    },
  });
  let preservedLinkSelection: { from: number; to: number } | null = null;
  const linkPopover = createLinkPopover({
    lifecycle,
    onOpen: () => {
      const { from, to } = editor.state.selection;
      preservedLinkSelection = { from, to };
    },
    onApply: (href) => {
      restorePreservedLinkSelection();
      const applied = editorCommands.setLink(editor, href);
      updateState();
      return applied;
    },
    onRemove: () => {
      restorePreservedLinkSelection();
      editorCommands.unsetLink(editor);
      updateState();
    },
  });
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
      if (config.id === 'strike') {
        element.append(textColorPicker.element);
        element.append(highlightColorPicker.element);
        element.append(linkPopover.element);
      }

      element.append(createToolbarSeparator());
    }

    lifecycle.addEventListener(button, 'mousedown', (event) => {
      event.preventDefault();
    });

    lifecycle.addEventListener(button, 'click', () => {
      if (button.disabled) {
        return;
      }

      if (config.id === 'save') {
        void onSave();
        return;
      }

      if (config.id === 'insert-image') {
        onInsertImage?.();
        return;
      }

      if (config.id === 'source-html') {
        onToggleSourceHtml?.();
        updateState();
        return;
      }

      if (config.id === 'source-json') {
        onToggleSourceJson?.();
        updateState();
        return;
      }

      if (config.id === 'preview') {
        onTogglePreview?.();
        updateState();
        return;
      }

      if (config.id === 'fullscreen') {
        onToggleFullscreen?.();
        updateState();
        return;
      }

      if (config.id === 'format-html') {
        void onFormatHtml?.();
        updateState();
        return;
      }

      config.command?.(editor);
      updateState();
    });
  }

  const updateState = (): void => {
    const controlsDisabled = editor.isDestroyed || !editor.isEditable;
    const activeTextColor = getActiveTextColor(editor);
    const activeHighlightColor = getActiveHighlightColor(editor);
    const activeLinkHref = getActiveLinkHref(editor);
    const sourceHtmlActive = isSourceHtmlActive?.() ?? false;
    const sourceJsonActive = isSourceJsonActive?.() ?? false;
    const previewActive = isPreviewActive?.() ?? false;
    const fullscreenActive = isFullscreenActive?.() ?? false;

    blockFormatSelect.disabled = controlsDisabled;
    blockFormatSelect.value = getActiveBlockFormat(editor);
    textColorPicker.setDisabled(controlsDisabled);
    textColorPicker.setValue(activeTextColor);
    highlightColorPicker.setDisabled(controlsDisabled);
    highlightColorPicker.setValue(activeHighlightColor);
    linkPopover.setDisabled(controlsDisabled);
    linkPopover.setHref(activeLinkHref);
    linkPopover.setActive(editor.isActive('link'));

    for (const config of toolbarButtons) {
      const button = buttons.get(config.id);

      if (!button) {
        continue;
      }

      const isDisabled = isToolbarButtonDisabled(config, editor, {
        hasInsertImageAction: Boolean(onInsertImage),
        hasToggleSourceHtmlAction: Boolean(onToggleSourceHtml),
        hasToggleSourceJsonAction: Boolean(onToggleSourceJson),
        hasTogglePreviewAction: Boolean(onTogglePreview),
        hasToggleFullscreenAction: Boolean(onToggleFullscreen),
        hasFormatHtmlAction: Boolean(onFormatHtml),
        sourceHtmlActive,
        sourceJsonActive,
        previewActive,
        fullscreenActive,
      });
      const isActive = getToolbarButtonActiveState(config, editor, {
        sourceHtmlActive,
        sourceJsonActive,
        previewActive,
        fullscreenActive,
      });

      button.disabled = isDisabled;
      button.hidden = config.id === 'format-html' && !sourceHtmlActive;
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

  function restorePreservedLinkSelection(): void {
    if (!preservedLinkSelection || editor.isDestroyed) {
      return;
    }

    editor.commands.setTextSelection(preservedLinkSelection);
  }
}

function isToolbarButtonDisabled(
  config: ToolbarButtonConfig,
  editor: Editor,
  actions: {
    hasInsertImageAction: boolean;
    hasToggleSourceHtmlAction: boolean;
    hasToggleSourceJsonAction: boolean;
    hasTogglePreviewAction: boolean;
    hasToggleFullscreenAction: boolean;
    hasFormatHtmlAction: boolean;
    sourceHtmlActive: boolean;
    sourceJsonActive: boolean;
    previewActive: boolean;
    fullscreenActive: boolean;
  },
): boolean {
  if (editor.isDestroyed) {
    return true;
  }

  if (config.id === 'source-html') {
    return !actions.hasToggleSourceHtmlAction;
  }

  if (config.id === 'source-json') {
    return !actions.hasToggleSourceJsonAction;
  }

  if (config.id === 'preview') {
    return !actions.hasTogglePreviewAction;
  }

  if (config.id === 'fullscreen') {
    return !actions.hasToggleFullscreenAction;
  }

  if (config.id === 'format-html') {
    return !actions.hasFormatHtmlAction || !actions.sourceHtmlActive;
  }

  if (config.id === 'insert-image' && !actions.hasInsertImageAction) {
    return true;
  }

  return config.isDisabled?.(editor) ?? !editor.isEditable;
}

function getToolbarButtonActiveState(
  config: ToolbarButtonConfig,
  editor: Editor,
  sourceState: {
    sourceHtmlActive: boolean;
    sourceJsonActive: boolean;
    previewActive: boolean;
    fullscreenActive: boolean;
  },
): boolean {
  if (config.id === 'source-html') {
    return sourceState.sourceHtmlActive;
  }

  if (config.id === 'source-json') {
    return sourceState.sourceJsonActive;
  }

  if (config.id === 'preview') {
    return sourceState.previewActive;
  }

  if (config.id === 'fullscreen') {
    return sourceState.fullscreenActive;
  }

  return config.isActive?.(editor) ?? false;
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

function getActiveTextColor(editor: Editor) {
  const attrs = editor.getAttributes('textStyle') as { color?: unknown };

  return normalizeTextColor(attrs.color);
}

function getActiveHighlightColor(editor: Editor) {
  const attrs = editor.getAttributes('highlight') as { color?: unknown };

  return normalizeTextColor(attrs.color);
}

function getActiveLinkHref(editor: Editor): string | null {
  const attrs = editor.getAttributes('link') as { href?: unknown };

  return typeof attrs.href === 'string' && attrs.href.trim().length > 0 ? attrs.href : null;
}

function isImageSelectionActive(editor: Editor): boolean {
  return editor.isActive('image');
}
