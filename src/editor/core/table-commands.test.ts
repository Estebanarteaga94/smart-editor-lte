/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it } from 'vitest';
import type { JSONContent } from '@tiptap/core';

import { createWysiwygEditor } from './create-editor';
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  defaultInsertTableOptions,
  deleteColumn,
  deleteRow,
  deleteTable,
  insertTable,
  mergeCells,
  splitCell,
  tableCommands,
  toggleHeaderRow,
} from './table-commands';

const mountedEditors = new Set<ReturnType<typeof createWysiwygEditor>>();

function mountEditor(content = '<p>Texto</p>') {
  const element = document.createElement('div');
  document.body.append(element);

  const editor = createWysiwygEditor({
    element,
    initialContent: content,
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

describe('tableCommands', () => {
  it('exposes the complete typed table command registry', () => {
    expect(tableCommands).toEqual({
      insertTable,
      addRowBefore,
      addRowAfter,
      deleteRow,
      addColumnBefore,
      addColumnAfter,
      deleteColumn,
      deleteTable,
      toggleHeaderRow,
      mergeCells,
      splitCell,
    });
    expect(defaultInsertTableOptions).toEqual({
      rows: 3,
      cols: 3,
      withHeaderRow: true,
    });
  });

  it('inserts a default 3x3 table with a header row', () => {
    const editor = mountEditor();

    expect(insertTable(editor)).toBe(true);

    const table = getFirstTable(editor.getJSON());
    const rows = getRows(table);

    expect(table).toMatchObject({ type: 'table' });
    expect(rows).toHaveLength(3);
    expect(getCells(rows[0]).map((cell) => cell.type)).toEqual([
      'tableHeader',
      'tableHeader',
      'tableHeader',
    ]);
    expect(getCells(rows[1]).map((cell) => cell.type)).toEqual([
      'tableCell',
      'tableCell',
      'tableCell',
    ]);
    expect(editor.getHTML()).toContain('<table');
    expect(editor.getHTML()).toContain('<th');
    expect(editor.getHTML()).toContain('<td');
  });

  it('inserts a custom body-only table and rejects invalid dimensions', () => {
    const editor = mountEditor();

    expect(insertTable(editor, { rows: 2, cols: 2, withHeaderRow: false })).toBe(true);
    expect(insertTable(editor, { rows: 0, cols: 2 })).toBe(false);
    expect(insertTable(editor, { rows: 2, cols: 0 })).toBe(false);

    const rows = getRows(getFirstTable(editor.getJSON()));

    expect(rows).toHaveLength(2);
    expect(rows.every((row) => getCells(row).every((cell) => cell.type === 'tableCell'))).toBe(
      true,
    );
  });

  it('adds and deletes rows and columns inside the current table', () => {
    const editor = mountEditor();

    insertTable(editor, { rows: 2, cols: 2, withHeaderRow: false });

    expect(addRowAfter(editor)).toBe(true);
    expect(getRows(getFirstTable(editor.getJSON()))).toHaveLength(3);

    expect(addRowBefore(editor)).toBe(true);
    expect(getRows(getFirstTable(editor.getJSON()))).toHaveLength(4);

    expect(deleteRow(editor)).toBe(true);
    expect(getRows(getFirstTable(editor.getJSON()))).toHaveLength(3);

    expect(addColumnAfter(editor)).toBe(true);
    expect(getCells(getRows(getFirstTable(editor.getJSON()))[0])).toHaveLength(3);

    expect(addColumnBefore(editor)).toBe(true);
    expect(getCells(getRows(getFirstTable(editor.getJSON()))[0])).toHaveLength(4);

    expect(deleteColumn(editor)).toBe(true);
    expect(getCells(getRows(getFirstTable(editor.getJSON()))[0])).toHaveLength(3);
  });

  it('toggles the first row between body cells and header cells', () => {
    const editor = mountEditor();

    insertTable(editor, { rows: 2, cols: 2, withHeaderRow: false });

    expect(getCells(getRows(getFirstTable(editor.getJSON()))[0]).map((cell) => cell.type)).toEqual([
      'tableCell',
      'tableCell',
    ]);

    expect(toggleHeaderRow(editor)).toBe(true);
    expect(getCells(getRows(getFirstTable(editor.getJSON()))[0]).map((cell) => cell.type)).toEqual([
      'tableHeader',
      'tableHeader',
    ]);
  });

  it('merges and splits a selected cell range', () => {
    const editor = mountEditor();

    insertTable(editor, { rows: 2, cols: 2, withHeaderRow: false });

    const [firstCellPosition, secondCellPosition] = getCellPositions(editor);

    expect(firstCellPosition).toBeDefined();
    expect(secondCellPosition).toBeDefined();
    editor.commands.setCellSelection({
      anchorCell: firstCellPosition,
      headCell: secondCellPosition,
    });

    expect(mergeCells(editor)).toBe(true);

    const mergedFirstRow = getRows(getFirstTable(editor.getJSON()))[0];
    const [mergedCell] = getCells(mergedFirstRow);

    expect(mergedCell).toMatchObject({
      type: 'tableCell',
      attrs: expect.objectContaining({ colspan: 2 }),
    });

    expect(splitCell(editor)).toBe(true);
    expect(getCells(getRows(getFirstTable(editor.getJSON()))[0])).toHaveLength(2);
  });

  it('deletes the current table without affecting surrounding paragraphs', () => {
    const editor = mountEditor(
      '<p>Antes</p><table><tbody><tr><td><p>Celda</p></td></tr></tbody></table><p>Despues</p>',
    );

    const [cellPosition] = getCellPositions(editor);
    editor.commands.setCellSelection({ anchorCell: cellPosition });

    expect(getFirstTable(editor.getJSON())).toBeDefined();
    expect(deleteTable(editor)).toBe(true);
    expect(editor.getJSON().content?.some((node) => node.type === 'table')).toBe(false);
    expect(editor.getText()).toContain('Antes');
    expect(editor.getText()).toContain('Despues');
  });
});

function getFirstTable(content: JSONContent): JSONContent {
  const table = content.content?.find((node) => node.type === 'table');

  if (!table) {
    throw new Error('Expected table node');
  }

  return table;
}

function getRows(table: JSONContent): JSONContent[] {
  return table.content ?? [];
}

function getCells(row: JSONContent | undefined): JSONContent[] {
  return row?.content ?? [];
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
