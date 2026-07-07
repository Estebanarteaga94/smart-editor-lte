/**
 * @vitest-environment jsdom
 */

import type { JSONContent } from '@tiptap/core';
import { afterEach, describe, expect, it } from 'vitest';

import { createWysiwygEditor } from '../core/create-editor';
import { createEditorLifecycle } from '../core/editor-lifecycle';
import { createTableMenu, getTableMenuState } from './table-menu';

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

describe('createTableMenu', () => {
  it('renders the table trigger visible and disabled outside a table', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const tableMenu = createTableMenu({ editor, lifecycle });
    const triggerButton = getTableMenuTrigger(tableMenu.element);
    const panel = getTableMenuPanel(tableMenu.element);
    const addRowBeforeButton = getTableMenuButton(tableMenu.element, 'add-row-before');
    const addRowAfterButton = getTableMenuButton(tableMenu.element, 'add-row-after');
    const deleteRowButton = getTableMenuButton(tableMenu.element, 'delete-row');
    const addColumnBeforeButton = getTableMenuButton(tableMenu.element, 'add-column-before');
    const addColumnAfterButton = getTableMenuButton(tableMenu.element, 'add-column-after');
    const deleteColumnButton = getTableMenuButton(tableMenu.element, 'delete-column');
    const deleteTableButton = getTableMenuButton(tableMenu.element, 'delete-table');
    const toggleHeaderRowButton = getTableMenuButton(tableMenu.element, 'toggle-header-row');
    const mergeCellsButton = getTableMenuButton(tableMenu.element, 'merge-cells');
    const splitCellButton = getTableMenuButton(tableMenu.element, 'split-cell');

    expect(tableMenu.element.hidden).toBe(false);
    expect(tableMenu.element.getAttribute('role')).toBe('group');
    expect(tableMenu.element.getAttribute('aria-label')).toBe('Comandos de tabla');
    expect(triggerButton).not.toBeNull();
    expect(triggerButton?.disabled).toBe(true);
    expect(triggerButton?.getAttribute('aria-expanded')).toBe('false');
    expect(triggerButton?.textContent).not.toContain('Tabla');
    expect(triggerButton?.querySelector('.editor-table-menu__trigger-label')).toBeNull();
    expect(panel).not.toBeNull();
    expect(panel?.hidden).toBe(true);
    expect(panel?.getAttribute('role')).toBe('group');
    expect(panel?.getAttribute('aria-label')).toBe('Acciones de tabla');
    expect(addRowBeforeButton).not.toBeNull();
    expect(addRowBeforeButton?.disabled).toBe(true);
    expect(addRowBeforeButton?.getAttribute('aria-label')).toBe('Fila antes');
    expect(addRowAfterButton).not.toBeNull();
    expect(addRowAfterButton?.disabled).toBe(true);
    expect(addRowAfterButton?.getAttribute('aria-label')).toBe('Fila despues');
    expect(deleteRowButton).not.toBeNull();
    expect(deleteRowButton?.disabled).toBe(true);
    expect(deleteRowButton?.getAttribute('aria-label')).toBe('Eliminar fila');
    expect(addColumnBeforeButton).not.toBeNull();
    expect(addColumnBeforeButton?.disabled).toBe(true);
    expect(addColumnBeforeButton?.getAttribute('aria-label')).toBe('Columna antes');
    expect(addColumnAfterButton).not.toBeNull();
    expect(addColumnAfterButton?.disabled).toBe(true);
    expect(addColumnAfterButton?.getAttribute('aria-label')).toBe('Columna despues');
    expect(deleteColumnButton).not.toBeNull();
    expect(deleteColumnButton?.disabled).toBe(true);
    expect(deleteColumnButton?.getAttribute('aria-label')).toBe('Eliminar columna');
    expect(deleteTableButton).not.toBeNull();
    expect(deleteTableButton?.disabled).toBe(true);
    expect(deleteTableButton?.getAttribute('aria-label')).toBe('Eliminar tabla');
    expect(toggleHeaderRowButton).not.toBeNull();
    expect(toggleHeaderRowButton?.disabled).toBe(true);
    expect(toggleHeaderRowButton?.getAttribute('aria-label')).toBe('Alternar encabezado');
    expect(mergeCellsButton).not.toBeNull();
    expect(mergeCellsButton?.disabled).toBe(true);
    expect(mergeCellsButton?.getAttribute('aria-label')).toBe('Combinar celdas');
    expect(splitCellButton).not.toBeNull();
    expect(splitCellButton?.disabled).toBe(true);
    expect(splitCellButton?.getAttribute('aria-label')).toBe('Separar celdas');
    expect(getTableMenuState(editor)).toMatchObject({
      isInsideTable: false,
      canAddRowBefore: false,
      canAddRowAfter: false,
      canDeleteRow: false,
      canAddColumnBefore: false,
      canAddColumnAfter: false,
      canDeleteColumn: false,
      canDeleteTable: false,
      canToggleHeaderRow: false,
      canMergeCells: false,
      canSplitCell: false,
    });

    lifecycle.dispose();
  });

  it('groups table commands behind a single contextual trigger', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const tableMenu = createTableMenu({ editor, lifecycle });
    const triggerButton = getTableMenuTrigger(tableMenu.element);
    const panel = getTableMenuPanel(tableMenu.element);

    editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: false });
    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();

    expect(tableMenu.element.hidden).toBe(false);
    expect(triggerButton).not.toBeNull();
    expect(triggerButton?.disabled).toBe(false);
    expect(triggerButton?.textContent).not.toContain('Tabla');
    expect(triggerButton?.querySelector('.editor-table-menu__trigger-label')).toBeNull();
    expect(triggerButton?.getAttribute('aria-haspopup')).toBe('true');
    expect(triggerButton?.getAttribute('aria-expanded')).toBe('false');
    expect(panel?.hidden).toBe(true);
    expect(panel?.parentElement).toBe(document.body);
    expect(tableMenu.element.contains(panel)).toBe(false);

    pressTableMenuButton(triggerButton);

    expect(panel?.hidden).toBe(false);
    expect(triggerButton?.getAttribute('aria-expanded')).toBe('true');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(panel?.hidden).toBe(true);
    expect(triggerButton?.getAttribute('aria-expanded')).toBe('false');

    lifecycle.dispose();
  });

  it('positions the table command panel as a floating overlay inside the viewport', () => {
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const tableMenu = createTableMenu({ editor, lifecycle });
    const triggerButton = getTableMenuTrigger(tableMenu.element);
    const panel = getTableMenuPanel(tableMenu.element);

    editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: false });
    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();

    expect(triggerButton).not.toBeNull();
    expect(panel).not.toBeNull();
    expect(panel?.parentElement).toBe(document.body);
    expect(tableMenu.element.contains(panel)).toBe(false);

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 });
    mockElementRect(triggerButton, {
      left: 760,
      top: 10,
      right: 790,
      bottom: 40,
      width: 30,
      height: 30,
    });
    mockElementSize(panel, 360, 180);

    pressTableMenuButton(triggerButton);

    expect(panel?.hidden).toBe(false);
    expect(panel?.style.left).toBe('424px');
    expect(panel?.style.top).toBe('46px');

    lifecycle.dispose();

    expect(panel?.isConnected).toBe(false);

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    });
  });

  it('adds rows before and after from the contextual table menu', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const tableMenu = createTableMenu({ editor, lifecycle });
    const addRowBeforeButton = getTableMenuButton(tableMenu.element, 'add-row-before');
    const addRowAfterButton = getTableMenuButton(tableMenu.element, 'add-row-after');

    editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true });
    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();

    expect(tableMenu.element.hidden).toBe(false);
    expect(addRowBeforeButton?.disabled).toBe(false);
    expect(addRowAfterButton?.disabled).toBe(false);
    expect(getRows(getFirstTable(editor.getJSON()))).toHaveLength(3);

    pressTableMenuButton(addRowAfterButton);
    expect(getRows(getFirstTable(editor.getJSON()))).toHaveLength(4);

    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();
    pressTableMenuButton(addRowBeforeButton);
    expect(getRows(getFirstTable(editor.getJSON()))).toHaveLength(5);

    editor.commands.setContent('<p>Fuera de tabla</p>');
    tableMenu.updateState();

    expect(tableMenu.element.hidden).toBe(false);
    expect(addRowBeforeButton?.disabled).toBe(true);
    expect(addRowAfterButton?.disabled).toBe(true);

    lifecycle.dispose();
  });

  it('deletes the selected row and handles the last row without errors', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const tableMenu = createTableMenu({ editor, lifecycle });
    const deleteRowButton = getTableMenuButton(tableMenu.element, 'delete-row');

    editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: false });
    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();

    expect(tableMenu.element.hidden).toBe(false);
    expect(deleteRowButton).not.toBeNull();
    expect(deleteRowButton?.disabled).toBe(false);
    expect(getRows(getFirstTable(editor.getJSON()))).toHaveLength(2);

    pressTableMenuButton(deleteRowButton);

    expect(getRows(getFirstTable(editor.getJSON()))).toHaveLength(1);

    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();

    expect(deleteRowButton?.disabled).toBe(true);
    expect(() => pressTableMenuButton(deleteRowButton)).not.toThrow();
    expect(getRows(getFirstTable(editor.getJSON()))).toHaveLength(1);

    lifecycle.dispose();
  });

  it('adds columns before and after from the contextual table menu', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const tableMenu = createTableMenu({ editor, lifecycle });
    const addColumnBeforeButton = getTableMenuButton(tableMenu.element, 'add-column-before');
    const addColumnAfterButton = getTableMenuButton(tableMenu.element, 'add-column-after');

    editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: false });
    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();

    expect(tableMenu.element.hidden).toBe(false);
    expect(addColumnBeforeButton).not.toBeNull();
    expect(addColumnBeforeButton?.disabled).toBe(false);
    expect(addColumnAfterButton).not.toBeNull();
    expect(addColumnAfterButton?.disabled).toBe(false);
    expect(getCells(getRows(getFirstTable(editor.getJSON()))[0])).toHaveLength(2);

    pressTableMenuButton(addColumnAfterButton);
    expect(getCells(getRows(getFirstTable(editor.getJSON()))[0])).toHaveLength(3);

    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();
    pressTableMenuButton(addColumnBeforeButton);
    expect(getCells(getRows(getFirstTable(editor.getJSON()))[0])).toHaveLength(4);

    editor.commands.setContent('<p>Fuera de tabla</p>');
    tableMenu.updateState();

    expect(tableMenu.element.hidden).toBe(false);
    expect(addColumnBeforeButton?.disabled).toBe(true);
    expect(addColumnAfterButton?.disabled).toBe(true);

    lifecycle.dispose();
  });

  it('deletes the selected column and handles the last column without errors', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const tableMenu = createTableMenu({ editor, lifecycle });
    const deleteColumnButton = getTableMenuButton(tableMenu.element, 'delete-column');

    editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: false });
    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();

    expect(tableMenu.element.hidden).toBe(false);
    expect(deleteColumnButton).not.toBeNull();
    expect(deleteColumnButton?.disabled).toBe(false);
    expect(getCells(getRows(getFirstTable(editor.getJSON()))[0])).toHaveLength(2);

    pressTableMenuButton(deleteColumnButton);

    expect(getCells(getRows(getFirstTable(editor.getJSON()))[0])).toHaveLength(1);

    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();

    expect(deleteColumnButton?.disabled).toBe(true);
    expect(() => pressTableMenuButton(deleteColumnButton)).not.toThrow();
    expect(getCells(getRows(getFirstTable(editor.getJSON()))[0])).toHaveLength(1);

    lifecycle.dispose();
  });

  it('deletes the current table without removing surrounding blocks', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const tableMenu = createTableMenu({ editor, lifecycle });
    const deleteTableButton = getTableMenuButton(tableMenu.element, 'delete-table');

    editor.commands.setContent(`
      <p>Antes</p>
      <table>
        <tbody>
          <tr>
            <td><p>A1</p></td>
            <td><p>A2</p></td>
          </tr>
          <tr>
            <td><p>B1</p></td>
            <td><p>B2</p></td>
          </tr>
        </tbody>
      </table>
      <p>Despues</p>
    `);
    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();

    expect(tableMenu.element.hidden).toBe(false);
    expect(deleteTableButton).not.toBeNull();
    expect(deleteTableButton?.disabled).toBe(false);
    expect(getTable(editor.getJSON())).toBeDefined();

    pressTableMenuButton(deleteTableButton);

    expect(getTable(editor.getJSON())).toBeUndefined();
    expect(editor.getText()).toContain('Antes');
    expect(editor.getText()).toContain('Despues');

    lifecycle.dispose();
  });

  it('toggles the first row between body cells and header cells', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const tableMenu = createTableMenu({ editor, lifecycle });
    const toggleHeaderRowButton = getTableMenuButton(tableMenu.element, 'toggle-header-row');

    editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: false });
    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();

    expect(tableMenu.element.hidden).toBe(false);
    expect(toggleHeaderRowButton).not.toBeNull();
    expect(toggleHeaderRowButton?.disabled).toBe(false);
    expect(getFirstRowCellTypes(editor.getJSON())).toEqual(['tableCell', 'tableCell']);

    pressTableMenuButton(toggleHeaderRowButton);

    expect(getFirstRowCellTypes(editor.getJSON())).toEqual(['tableHeader', 'tableHeader']);

    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();
    pressTableMenuButton(toggleHeaderRowButton);

    expect(getFirstRowCellTypes(editor.getJSON())).toEqual(['tableCell', 'tableCell']);

    lifecycle.dispose();
  });

  it('merges a valid selected cell range and keeps cell content', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const tableMenu = createTableMenu({ editor, lifecycle });
    const mergeCellsButton = getTableMenuButton(tableMenu.element, 'merge-cells');

    editor.commands.setContent(`
      <table>
        <tbody>
          <tr>
            <td><p>A1</p></td>
            <td><p>A2</p></td>
          </tr>
          <tr>
            <td><p>B1</p></td>
            <td><p>B2</p></td>
          </tr>
        </tbody>
      </table>
    `);
    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();

    expect(tableMenu.element.hidden).toBe(false);
    expect(mergeCellsButton).not.toBeNull();
    expect(mergeCellsButton?.disabled).toBe(true);

    setSelectionInFirstTwoTableCells(editor);
    tableMenu.updateState();

    expect(mergeCellsButton?.disabled).toBe(false);
    expect(getSelectedTableCells(editor)).toHaveLength(2);

    pressTableMenuButton(mergeCellsButton);

    const mergedFirstRow = getRows(getFirstTable(editor.getJSON()))[0];
    const [mergedCell] = getCells(mergedFirstRow);

    expect(getCells(mergedFirstRow)).toHaveLength(1);
    expect(mergedCell).toMatchObject({
      type: 'tableCell',
      attrs: expect.objectContaining({ colspan: 2 }),
    });
    expect(editor.getText()).toContain('A1');
    expect(editor.getText()).toContain('A2');

    lifecycle.dispose();
  });

  it('splits a merged cell without breaking the table', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const tableMenu = createTableMenu({ editor, lifecycle });
    const splitCellButton = getTableMenuButton(tableMenu.element, 'split-cell');

    editor.commands.setContent(`
      <table>
        <tbody>
          <tr>
            <td><p>A1</p></td>
            <td><p>A2</p></td>
          </tr>
          <tr>
            <td><p>B1</p></td>
            <td><p>B2</p></td>
          </tr>
        </tbody>
      </table>
    `);
    setSelectionInFirstTableCell(editor);
    tableMenu.updateState();

    expect(tableMenu.element.hidden).toBe(false);
    expect(splitCellButton).not.toBeNull();
    expect(splitCellButton?.disabled).toBe(true);

    setSelectionInFirstTwoTableCells(editor);
    expect(editor.chain().focus().mergeCells().run()).toBe(true);
    tableMenu.updateState();

    expect(getCells(getRows(getFirstTable(editor.getJSON()))[0])).toHaveLength(1);
    expect(splitCellButton?.disabled).toBe(false);

    pressTableMenuButton(splitCellButton);

    const splitFirstRow = getRows(getFirstTable(editor.getJSON()))[0];

    expect(getCells(splitFirstRow)).toHaveLength(2);
    expect(editor.getText()).toContain('A1');
    expect(editor.getText()).toContain('A2');

    lifecycle.dispose();
  });
});

function getTableMenuButton(
  element: HTMLElement,
  action:
    | 'add-row-before'
    | 'add-row-after'
    | 'delete-row'
    | 'add-column-before'
    | 'add-column-after'
    | 'delete-column'
    | 'delete-table'
    | 'toggle-header-row'
    | 'merge-cells'
    | 'split-cell',
): HTMLButtonElement | null {
  return (
    getTableMenuPanel(element)?.querySelector<HTMLButtonElement>(
      `[data-table-menu-action="${action}"]`,
    ) ?? null
  );
}

function getTableMenuTrigger(element: HTMLElement): HTMLButtonElement | null {
  return element.querySelector<HTMLButtonElement>('[data-table-menu-trigger="true"]');
}

function getTableMenuPanel(element: HTMLElement): HTMLElement | null {
  const trigger = getTableMenuTrigger(element);
  const panelId = trigger?.getAttribute('aria-controls');

  return panelId ? document.getElementById(panelId) : null;
}

function pressTableMenuButton(button: HTMLButtonElement | null): void {
  button?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  button?.click();
}

function getFirstTable(content: JSONContent): JSONContent {
  const table = getTable(content);

  if (!table) {
    throw new Error('Expected table node');
  }

  return table;
}

function getTable(content: JSONContent): JSONContent | undefined {
  return content.content?.find((node) => node.type === 'table');
}

function getRows(table: JSONContent): JSONContent[] {
  return table.content ?? [];
}

function getCells(row: JSONContent | undefined): JSONContent[] {
  return row?.content ?? [];
}

function getSelectedTableCells(editor: ReturnType<typeof createWysiwygEditor>): Element[] {
  return Array.from(editor.view.dom.querySelectorAll('th.selectedCell, td.selectedCell'));
}

function getFirstRowCellTypes(content: JSONContent): string[] {
  return getCells(getRows(getFirstTable(content))[0]).map((cell) => cell.type ?? '');
}

function setSelectionInFirstTableCell(editor: ReturnType<typeof createWysiwygEditor>): void {
  const [cellPosition] = getCellPositions(editor);

  if (cellPosition === undefined) {
    throw new Error('Expected table cell position');
  }

  editor.commands.setCellSelection({ anchorCell: cellPosition });
}

function setSelectionInFirstTwoTableCells(editor: ReturnType<typeof createWysiwygEditor>): void {
  const [firstCellPosition, secondCellPosition] = getCellPositions(editor);

  if (firstCellPosition === undefined || secondCellPosition === undefined) {
    throw new Error('Expected two table cell positions');
  }

  editor.commands.setCellSelection({
    anchorCell: firstCellPosition,
    headCell: secondCellPosition,
  });
}

function getCellPositions(editor: ReturnType<typeof createWysiwygEditor>): number[] {
  const positions: number[] = [];

  editor.state.doc.descendants((node, position) => {
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      positions.push(position);
    }
  });

  return positions;
}

function mockElementRect(element: Element | null, rect: Partial<DOMRect>): void {
  if (!element) {
    throw new Error('Expected element to mock rect');
  }

  const left = rect.left ?? 0;
  const top = rect.top ?? 0;
  const width = rect.width ?? 0;
  const height = rect.height ?? 0;
  const right = rect.right ?? left + width;
  const bottom = rect.bottom ?? top + height;

  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      x: left,
      y: top,
      left,
      top,
      right,
      bottom,
      width,
      height,
      toJSON: () => ({}),
    }),
  });
}

function mockElementSize(element: HTMLElement | null, width: number, height: number): void {
  if (!element) {
    throw new Error('Expected element to mock size');
  }

  Object.defineProperty(element, 'offsetWidth', {
    configurable: true,
    value: width,
  });
  Object.defineProperty(element, 'offsetHeight', {
    configurable: true,
    value: height,
  });
}
