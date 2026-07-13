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
  modifier?: string;
  command: (editor: Editor) => boolean;
  canRun: (editor: Editor) => boolean;
}

const tableButtonConfigs: readonly TableMenuButtonConfig[] = [
  {
    action: 'add-row-before',
    label: 'Fila antes',
    icon: '\ue812',
    modifier: '+↑',
    command: tableCommands.addRowBefore,
    canRun: (editor) => editor.can().chain().focus().addRowBefore().run(),
  },
  {
    action: 'add-row-after',
    label: 'Fila despues',
    icon: '\ue812',
    modifier: '+↓',
    command: tableCommands.addRowAfter,
    canRun: (editor) => editor.can().chain().focus().addRowAfter().run(),
  },
  {
    action: 'delete-row',
    label: 'Eliminar fila',
    icon: '\ue812',
    modifier: '−',
    command: tableCommands.deleteRow,
    canRun: (editor) => editor.can().chain().focus().deleteRow().run(),
  },
  {
    action: 'add-column-before',
    label: 'Columna antes',
    icon: '\uf0db',
    modifier: '+←',
    command: tableCommands.addColumnBefore,
    canRun: (editor) => editor.can().chain().focus().addColumnBefore().run(),
  },
  {
    action: 'add-column-after',
    label: 'Columna despues',
    icon: '\uf0db',
    modifier: '+→',
    command: tableCommands.addColumnAfter,
    canRun: (editor) => editor.can().chain().focus().addColumnAfter().run(),
  },
  {
    action: 'delete-column',
    label: 'Eliminar columna',
    icon: '\uf0db',
    modifier: '−',
    command: tableCommands.deleteColumn,
    canRun: (editor) => editor.can().chain().focus().deleteColumn().run(),
  },
  {
    action: 'delete-table',
    label: 'Eliminar tabla',
    icon: '\uf0ce',
    modifier: '×',
    command: tableCommands.deleteTable,
    canRun: (editor) => editor.can().chain().focus().deleteTable().run(),
  },
  {
    action: 'toggle-header-row',
    label: 'Alternar encabezado',
    icon: '\uf0ce',
    modifier: 'H',
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

const dialogGap = 8;
const viewportMargin = 8;
const fallbackDialogWidth = 240;
const fallbackDialogHeight = 92;

export function createTableMenu({ editor, lifecycle }: TableMenuOptions): TableMenu {
  const element = document.createElement('section');
  const title = document.createElement('strong');
  const actions = document.createElement('div');
  const buttons = new Map<TableMenuAction, HTMLButtonElement>();

  element.className = 'editor-table-options';
  element.dataset.tableOptions = 'dialog';
  element.hidden = true;
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-label', 'Opciones de tabla');

  title.className = 'editor-table-options__title';
  title.textContent = 'Tabla';

  actions.className = 'editor-table-options__actions';
  actions.setAttribute('role', 'group');
  actions.setAttribute('aria-label', 'Acciones de tabla');

  element.append(title, actions);

  for (const config of tableButtonConfigs) {
    const button = createTableMenuButton(config);
    buttons.set(config.action, button);
    actions.append(button);

    lifecycle.addEventListener(button, 'mousedown', (event) => {
      event.preventDefault();
    });

    lifecycle.addEventListener(button, 'click', () => {
      if (button.disabled) {
        return;
      }

      config.command(editor);
      updateState();
    });
  }

  lifecycle.addEventListener(window, 'resize', () => {
    updatePosition();
  });

  lifecycle.addEventListener(window, 'scroll', () => {
    updatePosition();
  });

  const scrollContainer = editor.view.dom.closest('.editor-shell__body');

  if (scrollContainer instanceof HTMLElement) {
    lifecycle.addEventListener(scrollContainer, 'scroll', () => {
      updatePosition();
    });
  }

  const updateState = (): void => {
    const state = getTableMenuState(editor);
    const dialogHidden = editor.isDestroyed || !editor.isEditable || !state.isInsideTable;

    element.hidden = dialogHidden;

    for (const config of tableButtonConfigs) {
      const button = buttons.get(config.action);

      if (!button) {
        continue;
      }

      button.disabled = editor.isDestroyed || !editor.isEditable || !getCanRun(state, config);
    }

    if (!dialogHidden) {
      updatePosition();
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

  function updatePosition(): void {
    if (element.hidden) {
      return;
    }

    const selectionRect = getActiveTableSelectionRect(editor);

    if (!selectionRect || !isUsableRect(selectionRect)) {
      return;
    }

    const dialogRect = element.getBoundingClientRect();
    const dialogWidth = dialogRect.width > 0 ? dialogRect.width : fallbackDialogWidth;
    const dialogHeight = dialogRect.height > 0 ? dialogRect.height : fallbackDialogHeight;
    const position = calculateDialogPosition(selectionRect, dialogWidth, dialogHeight);

    element.style.left = `${position.left}px`;
    element.style.top = `${position.top}px`;
  }
}

function getActiveTableSelectionRect(editor: Editor): DOMRect | null {
  const selectedCells = Array.from(
    editor.view.dom.querySelectorAll<HTMLElement>('th.selectedCell, td.selectedCell'),
  );
  const selectedCellRects = selectedCells
    .map((cell) => cell.getBoundingClientRect())
    .filter(isUsableRect);

  if (selectedCellRects.length > 0) {
    return combineRects(selectedCellRects);
  }

  const activeCell = getActiveTableCellElement(editor);
  const activeCellRect = activeCell?.getBoundingClientRect();

  return activeCellRect && isUsableRect(activeCellRect) ? activeCellRect : null;
}

function getActiveTableCellElement(editor: Editor): HTMLElement | null {
  const nodeAtSelection = editor.view.nodeDOM(editor.state.selection.from);
  const cellAtSelection = getClosestTableCell(nodeAtSelection);

  if (cellAtSelection) {
    return cellAtSelection;
  }

  const { $from } = editor.state.selection;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);

    if (node.type.name !== 'tableCell' && node.type.name !== 'tableHeader') {
      continue;
    }

    return getClosestTableCell(editor.view.nodeDOM($from.before(depth)));
  }

  return null;
}

function getClosestTableCell(node: Node | null): HTMLElement | null {
  const element = node instanceof HTMLElement ? node : node?.parentElement;
  const cell = element?.closest('td, th');

  return cell instanceof HTMLElement ? cell : null;
}

function combineRects(rects: readonly DOMRect[]): DOMRect {
  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));

  return new DOMRect(left, top, right - left, bottom - top);
}

function isUsableRect(rect: DOMRect): boolean {
  return rect.width > 1 && rect.height > 1 && rect.right > rect.left && rect.bottom > rect.top;
}

function calculateDialogPosition(
  selectionRect: DOMRect,
  dialogWidth: number,
  dialogHeight: number,
): { top: number; left: number } {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const clampedLeft = clamp(
    selectionRect.left,
    viewportMargin,
    viewportWidth - dialogWidth - viewportMargin,
  );
  const clampedTop = clamp(
    selectionRect.top,
    viewportMargin,
    viewportHeight - dialogHeight - viewportMargin,
  );
  const candidates = [
    {
      top: selectionRect.bottom + dialogGap,
      left: clampedLeft,
      fits: selectionRect.bottom + dialogGap + dialogHeight <= viewportHeight - viewportMargin,
    },
    {
      top: selectionRect.top - dialogGap - dialogHeight,
      left: clampedLeft,
      fits: selectionRect.top - dialogGap - dialogHeight >= viewportMargin,
    },
    {
      top: clampedTop,
      left: selectionRect.right + dialogGap,
      fits: selectionRect.right + dialogGap + dialogWidth <= viewportWidth - viewportMargin,
    },
    {
      top: clampedTop,
      left: selectionRect.left - dialogGap - dialogWidth,
      fits: selectionRect.left - dialogGap - dialogWidth >= viewportMargin,
    },
  ];
  const candidate = candidates.find((item) => item.fits) ?? candidates[0];

  return {
    top: Math.round(
      clamp(candidate.top, viewportMargin, viewportHeight - dialogHeight - viewportMargin),
    ),
    left: Math.round(
      clamp(candidate.left, viewportMargin, viewportWidth - dialogWidth - viewportMargin),
    ),
  };
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
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
  const iconWrapper = document.createElement('span');
  const icon = document.createElement('span');

  button.type = 'button';
  button.className = 'editor-table-options__button';
  button.dataset.tableMenuAction = config.action;
  button.dataset.tooltip = config.label;
  button.setAttribute('aria-label', config.label);
  button.title = config.label;

  iconWrapper.className = 'editor-table-options__button-visual';
  iconWrapper.setAttribute('aria-hidden', 'true');

  icon.className = 'editor-table-options__button-icon';
  icon.textContent = config.icon;

  iconWrapper.append(icon);

  if (config.modifier) {
    const modifier = document.createElement('span');

    modifier.className = 'editor-table-options__button-modifier';
    modifier.textContent = config.modifier;
    iconWrapper.append(modifier);
  }

  button.append(iconWrapper);

  return button;
}
