import type { EditorCommand } from './editor-commands'

export interface TableCommandRegistry {
  insertTable?: EditorCommand
  addRowBefore?: EditorCommand
  addRowAfter?: EditorCommand
  deleteRow?: EditorCommand
  addColumnBefore?: EditorCommand
  addColumnAfter?: EditorCommand
  deleteColumn?: EditorCommand
  deleteTable?: EditorCommand
  toggleHeaderRow?: EditorCommand
  mergeCells?: EditorCommand
  splitCell?: EditorCommand
}
