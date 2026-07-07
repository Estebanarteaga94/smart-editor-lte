import type { Editor } from '@tiptap/core';

import type { EditorLifecycle } from '../core/editor-lifecycle';
import { tableCommands } from '../core/table-commands';

export interface TableMenuState {
  isInsideTable: boolean;
  canAddRowBefore: boolean;
  canAddRowAfter: boolean;
  canDeleteRow: boolean;
  canAddColumnBefore: boolean;
  canAddColumnAfter: boolean;
  canDeleteColumn: boolean;
  canDeleteTable: boolean;
  canToggleHeaderRow: boolean;
  canMergeCells: boolean;
  canSplitCell: boolean;
}

export interface TableMenuOptions {
  editor: Editor;
  lifecycle: EditorLifecycle;
}

export interface TableMenu {
  element: HTMLElement;
  updateState: () => void;
}

type TableMenuAction =
  | 'add-row-before'
  | 'add-row-after'
  | 'delete-row'
  | 'add-column-before'
  | 'add-column-after'
  | 'delete-column'
  | 'delete-table'
  | 'toggle-header-row'
  | 'merge-cells'
  | 'split-cell';

interface TableMenuButtonConfig {
  action: TableMenuAction;
  label: string;
  icon: string;
  command: (editor: Editor) => boolean;
  canRun: (editor: Editor) => boolean;
}

const tableButtonConfigs: readonly TableMenuButtonConfig[] = [
  {
    action: 'add-row-before',
    label: 'Fila antes',
    icon: '\uf176',
    command: tableCommands.addRowBefore,
    canRun: (editor) => editor.can().chain().focus().addRowBefore().run(),
  },
  {
    action: 'add-row-after',
    label: 'Fila despues',
    icon: '\uf175',
    command: tableCommands.addRowAfter,
    canRun: (editor) => editor.can().chain().focus().addRowAfter().run(),
  },
  {
    action: 'delete-row',
    label: 'Eliminar fila',
    icon: '\uf1f8',
    command: tableCommands.deleteRow,
    canRun: (editor) => editor.can().chain().focus().deleteRow().run(),
  },
  {
    action: 'add-column-before',
    label: 'Columna antes',
    icon: '\uf177',
    command: tableCommands.addColumnBefore,
    canRun: (editor) => editor.can().chain().focus().addColumnBefore().run(),
  },
  {
    action: 'add-column-after',
    label: 'Columna despues',
    icon: '\uf178',
    command: tableCommands.addColumnAfter,
    canRun: (editor) => editor.can().chain().focus().addColumnAfter().run(),
  },
  {
    action: 'delete-column',
    label: 'Eliminar columna',
    icon: '\uf1f8',
    command: tableCommands.deleteColumn,
    canRun: (editor) => editor.can().chain().focus().deleteColumn().run(),
  },
  {
    action: 'delete-table',
    label: 'Eliminar tabla',
    icon: '\uf1f8',
    command: tableCommands.deleteTable,
    canRun: (editor) => editor.can().chain().focus().deleteTable().run(),
  },
  {
    action: 'toggle-header-row',
    label: 'Alternar encabezado',
    icon: '\uf0ce',
    command: tableCommands.toggleHeaderRow,
    canRun: (editor) => editor.can().chain().focus().toggleHeaderRow().run(),
  },
  {
    action: 'merge-cells',
    label: 'Combinar celdas',
    icon: '\uf247',
    command: tableCommands.mergeCells,
    canRun: (editor) => editor.can().chain().focus().mergeCells().run(),
  },
  {
    action: 'split-cell',
    label: 'Separar celdas',
    icon: '\uf248',
    command: tableCommands.splitCell,
    canRun: (editor) => editor.can().chain().focus().splitCell().run(),
  },
];

let tableMenuId = 0;

export function createTableMenu({ editor, lifecycle }: TableMenuOptions): TableMenu {
  const panelId = `editor-table-menu-panel-${(tableMenuId += 1)}`;
  const element = document.createElement('div');
  const triggerButton = createTableMenuTriggerButton(panelId);
  const panel = document.createElement('div');
  const buttons = new Map<TableMenuAction, HTMLButtonElement>();

  element.className = 'editor-table-menu';
  element.dataset.editorTableMenu = 'true';
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', 'Comandos de tabla');

  panel.id = panelId;
  panel.className = 'editor-table-menu__panel';
  panel.hidden = true;
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', 'Acciones de tabla');

  element.append(triggerButton);
  document.body.append(panel);
  lifecycle.registerCleanup(() => {
    panel.remove();
  });

  for (const config of tableButtonConfigs) {
    const button = createTableMenuButton(config);
    buttons.set(config.action, button);
    panel.append(button);

    lifecycle.addEventListener(button, 'mousedown', (event) => {
      event.preventDefault();
    });

    lifecycle.addEventListener(button, 'click', () => {
      if (button.disabled) {
        return;
      }

      config.command(editor);
      updateState();
      setPanelOpen(false);
    });
  }

  const positionPanel = (): void => {
    positionFloatingPanel(triggerButton, panel);
  };

  const setPanelOpen = (open: boolean): void => {
    panel.hidden = !open;
    element.classList.toggle('is-open', open);
    triggerButton.setAttribute('aria-expanded', String(open));

    if (open) {
      positionPanel();
    }
  };

  lifecycle.addEventListener(triggerButton, 'mousedown', (event) => {
    event.preventDefault();
  });

  lifecycle.addEventListener(triggerButton, 'click', () => {
    if (triggerButton.disabled) {
      return;
    }

    setPanelOpen(panel.hidden === true);
  });

  lifecycle.addEventListener(document, 'pointerdown', (event) => {
    const target = event.target;

    if (
      panel.hidden ||
      !(target instanceof Node) ||
      element.contains(target) ||
      panel.contains(target)
    ) {
      return;
    }

    setPanelOpen(false);
  });

  lifecycle.addEventListener(document, 'keydown', (event) => {
    if (event.key !== 'Escape' || panel.hidden) {
      return;
    }

    setPanelOpen(false);
    triggerButton.focus();
  });

  lifecycle.addEventListener(window, 'resize', () => {
    positionPanel();
  });

  lifecycle.addEventListener(window, 'scroll', () => {
    positionPanel();
  });

  const updateState = (): void => {
    const state = getTableMenuState(editor);
    const menuHidden = editor.isDestroyed;
    const triggerDisabled = editor.isDestroyed || !editor.isEditable || !state.isInsideTable;

    element.hidden = menuHidden;
    triggerButton.disabled = triggerDisabled;

    if (menuHidden || triggerDisabled) {
      setPanelOpen(false);
    }

    for (const config of tableButtonConfigs) {
      const button = buttons.get(config.action);

      if (!button) {
        continue;
      }

      button.disabled = editor.isDestroyed || !editor.isEditable || !getCanRun(state, config);
    }
  };

  const refreshTableMenu = (): void => {
    updateState();
  };

  editor.on('selectionUpdate', refreshTableMenu);
  editor.on('transaction', refreshTableMenu);
  editor.on('update', refreshTableMenu);
  lifecycle.registerCleanup(() => {
    editor.off('selectionUpdate', refreshTableMenu);
    editor.off('transaction', refreshTableMenu);
    editor.off('update', refreshTableMenu);
  });

  updateState();

  return {
    element,
    updateState,
  };
}

function positionFloatingPanel(triggerButton: HTMLButtonElement, panel: HTMLElement): void {
  if (panel.hidden) {
    return;
  }

  const viewportPadding = 16;
  const panelGap = 6;
  const triggerRect = triggerButton.getBoundingClientRect();
  const panelWidth = panel.offsetWidth;
  const panelHeight = panel.offsetHeight;
  const maxLeft = Math.max(viewportPadding, window.innerWidth - panelWidth - viewportPadding);
  const preferredLeft = Math.min(triggerRect.left, maxLeft);
  const left = Math.max(viewportPadding, preferredLeft);
  const belowTop = triggerRect.bottom + panelGap;
  const aboveTop = triggerRect.top - panelHeight - panelGap;
  const hasRoomBelow = belowTop + panelHeight <= window.innerHeight - viewportPadding;
  const top = hasRoomBelow ? belowTop : Math.max(viewportPadding, aboveTop);

  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}

export function getTableMenuState(editor: Editor): TableMenuState {
  const isInsideTable = !editor.isDestroyed && editor.isActive('table');
  const activeTableRowCount = isInsideTable ? getActiveTableRowCount(editor) : 0;
  const activeTableColumnCount = isInsideTable ? getActiveTableColumnCount(editor) : 0;

  return {
    isInsideTable,
    canAddRowBefore: isInsideTable && editor.can().chain().focus().addRowBefore().run(),
    canAddRowAfter: isInsideTable && editor.can().chain().focus().addRowAfter().run(),
    canDeleteRow:
      isInsideTable && activeTableRowCount > 1 && editor.can().chain().focus().deleteRow().run(),
    canAddColumnBefore: isInsideTable && editor.can().chain().focus().addColumnBefore().run(),
    canAddColumnAfter: isInsideTable && editor.can().chain().focus().addColumnAfter().run(),
    canDeleteColumn:
      isInsideTable &&
      activeTableColumnCount > 1 &&
      editor.can().chain().focus().deleteColumn().run(),
    canDeleteTable: isInsideTable && editor.can().chain().focus().deleteTable().run(),
    canToggleHeaderRow: isInsideTable && editor.can().chain().focus().toggleHeaderRow().run(),
    canMergeCells: isInsideTable && editor.can().chain().focus().mergeCells().run(),
    canSplitCell: isInsideTable && editor.can().chain().focus().splitCell().run(),
  };
}

function getActiveTableRowCount(editor: Editor): number {
  const { $from } = editor.state.selection;

  for (let depth = $from.depth; depth >= 0; depth -= 1) {
    const node = $from.node(depth);

    if (node.type.name === 'table') {
      return node.childCount;
    }
  }

  return 0;
}

function getActiveTableColumnCount(editor: Editor): number {
  const { $from } = editor.state.selection;

  for (let depth = $from.depth; depth >= 0; depth -= 1) {
    const node = $from.node(depth);

    if (node.type.name === 'table') {
      return node.firstChild?.childCount ?? 0;
    }
  }

  return 0;
}

function getCanRun(state: TableMenuState, config: TableMenuButtonConfig): boolean {
  switch (config.action) {
    case 'add-row-before':
      return state.canAddRowBefore;
    case 'add-row-after':
      return state.canAddRowAfter;
    case 'delete-row':
      return state.canDeleteRow;
    case 'add-column-before':
      return state.canAddColumnBefore;
    case 'add-column-after':
      return state.canAddColumnAfter;
    case 'delete-column':
      return state.canDeleteColumn;
    case 'delete-table':
      return state.canDeleteTable;
    case 'toggle-header-row':
      return state.canToggleHeaderRow;
    case 'merge-cells':
      return state.canMergeCells;
    case 'split-cell':
      return state.canSplitCell;
  }
}

function createTableMenuButton(config: TableMenuButtonConfig): HTMLButtonElement {
  const button = document.createElement('button');
  const icon = document.createElement('span');
  const label = document.createElement('span');

  button.type = 'button';
  button.className = 'editor-table-menu__button';
  button.dataset.tableMenuAction = config.action;
  button.setAttribute('aria-label', config.label);
  button.title = config.label;

  icon.className = 'editor-table-menu__button-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = config.icon;

  label.className = 'editor-table-menu__button-label';
  label.textContent = config.label;

  button.append(icon, label);

  return button;
}

function createTableMenuTriggerButton(panelId: string): HTMLButtonElement {
  const button = document.createElement('button');
  const icon = document.createElement('span');
  const chevron = document.createElement('span');

  button.type = 'button';
  button.className = 'editor-shell__tool editor-table-menu__trigger';
  button.dataset.tableMenuTrigger = 'true';
  button.setAttribute('aria-label', 'Comandos de tabla');
  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', panelId);
  button.title = 'Comandos de tabla';

  icon.className = 'editor-shell__tool-icon editor-table-menu__button-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '\uf0ce';

  chevron.className = 'editor-table-menu__trigger-chevron';
  chevron.setAttribute('aria-hidden', 'true');
  chevron.textContent = '▾';

  button.append(icon, chevron);

  return button;
}
