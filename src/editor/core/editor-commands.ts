import type { Editor } from '@tiptap/core';

export type EditorCommand = (editor: Editor) => boolean;

export interface EditorCommandRegistry {
  setParagraph?: EditorCommand;
  setHeading1?: EditorCommand;
  setHeading2?: EditorCommand;
  setHeading3?: EditorCommand;
  toggleBold?: EditorCommand;
  toggleItalic?: EditorCommand;
  toggleUnderline?: EditorCommand;
  toggleBulletList?: EditorCommand;
  toggleOrderedList?: EditorCommand;
  undo?: EditorCommand;
  redo?: EditorCommand;
}
