import type { Editor } from '@tiptap/core';

export type EditorCommand = (editor: Editor) => boolean;

export type HeadingLevel = 1 | 2 | 3;

export interface EditorCommandRegistry {
  setParagraph: EditorCommand;
  setHeading1: EditorCommand;
  setHeading2: EditorCommand;
  setHeading3: EditorCommand;
  toggleBold: EditorCommand;
  toggleItalic: EditorCommand;
  toggleUnderline: EditorCommand;
  toggleBulletList: EditorCommand;
  toggleOrderedList: EditorCommand;
  undo: EditorCommand;
  redo: EditorCommand;
}

export const editorCommands: EditorCommandRegistry = {
  setParagraph,
  setHeading1,
  setHeading2,
  setHeading3,
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleBulletList,
  toggleOrderedList,
  undo,
  redo,
};

export function setParagraph(editor: Editor): boolean {
  return editor.chain().focus().setParagraph().run();
}

export function setHeading(editor: Editor, level: HeadingLevel): boolean {
  return editor.chain().focus().toggleHeading({ level }).run();
}

export function setHeading1(editor: Editor): boolean {
  return setHeading(editor, 1);
}

export function setHeading2(editor: Editor): boolean {
  return setHeading(editor, 2);
}

export function setHeading3(editor: Editor): boolean {
  return setHeading(editor, 3);
}

export function toggleBold(editor: Editor): boolean {
  return editor.chain().focus().toggleBold().run();
}

export function toggleItalic(editor: Editor): boolean {
  return editor.chain().focus().toggleItalic().run();
}

export function toggleUnderline(editor: Editor): boolean {
  return editor.chain().focus().toggleUnderline().run();
}

export function toggleBulletList(editor: Editor): boolean {
  return editor.chain().focus().toggleBulletList().run();
}

export function toggleOrderedList(editor: Editor): boolean {
  return editor.chain().focus().toggleOrderedList().run();
}

export function undo(editor: Editor): boolean {
  return editor.chain().focus().undo().run();
}

export function redo(editor: Editor): boolean {
  return editor.chain().focus().redo().run();
}
