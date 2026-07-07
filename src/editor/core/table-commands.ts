import type { Editor } from '@tiptap/core';

import type { EditorCommand } from './editor-commands';

export interface InsertTableOptions {
  rows?: number;
  cols?: number;
  withHeaderRow?: boolean;
}

export type InsertTableCommand = (editor: Editor, options?: InsertTableOptions) => boolean;

export interface TableCommandRegistry {
  insertTable: InsertTableCommand;
  addRowBefore: EditorCommand;
  addRowAfter: EditorCommand;
  deleteRow: EditorCommand;
  addColumnBefore: EditorCommand;
  addColumnAfter: EditorCommand;
  deleteColumn: EditorCommand;
  deleteTable: EditorCommand;
  toggleHeaderRow: EditorCommand;
  mergeCells: EditorCommand;
  splitCell: EditorCommand;
}

export const defaultInsertTableOptions = {
  rows: 3,
  cols: 3,
  withHeaderRow: true,
} as const satisfies Required<InsertTableOptions>;

export const tableCommands: TableCommandRegistry = {
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
};

export function insertTable(editor: Editor, options: InsertTableOptions = {}): boolean {
  const tableOptions = normalizeInsertTableOptions(options);

  if (!tableOptions) {
    return false;
  }

  return editor.chain().focus().insertTable(tableOptions).run();
}

export function addRowBefore(editor: Editor): boolean {
  return editor.chain().focus().addRowBefore().run();
}

export function addRowAfter(editor: Editor): boolean {
  return editor.chain().focus().addRowAfter().run();
}

export function deleteRow(editor: Editor): boolean {
  return editor.chain().focus().deleteRow().run();
}

export function addColumnBefore(editor: Editor): boolean {
  return editor.chain().focus().addColumnBefore().run();
}

export function addColumnAfter(editor: Editor): boolean {
  return editor.chain().focus().addColumnAfter().run();
}

export function deleteColumn(editor: Editor): boolean {
  return editor.chain().focus().deleteColumn().run();
}

export function deleteTable(editor: Editor): boolean {
  return editor.chain().focus().deleteTable().run();
}

export function toggleHeaderRow(editor: Editor): boolean {
  return editor.chain().focus().toggleHeaderRow().run();
}

export function mergeCells(editor: Editor): boolean {
  return editor.chain().focus().mergeCells().run();
}

export function splitCell(editor: Editor): boolean {
  return editor.chain().focus().splitCell().run();
}

function normalizeInsertTableOptions(
  options: InsertTableOptions,
): Required<InsertTableOptions> | null {
  const rows = options.rows ?? defaultInsertTableOptions.rows;
  const cols = options.cols ?? defaultInsertTableOptions.cols;
  const withHeaderRow = options.withHeaderRow ?? defaultInsertTableOptions.withHeaderRow;

  if (!Number.isInteger(rows) || rows < 1 || !Number.isInteger(cols) || cols < 1) {
    return null;
  }

  return {
    rows,
    cols,
    withHeaderRow,
  };
}
