import type { Editor } from '@tiptap/core';

import { normalizeLinkHref } from '../utils/safe-url';

export { isSafeLinkHref, normalizeLinkHref } from '../utils/safe-url';

export type EditorCommand = (editor: Editor) => boolean;
export type EditorColorCommand = (editor: Editor, color: string) => boolean;
export type EditorLinkCommand = (editor: Editor, href: string) => boolean;
export type EditorImageCommand = (editor: Editor, attrs: EditorImageAttributes) => boolean;

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TextAlignment = 'left' | 'center' | 'right' | 'justify';
export type ImageAlignment = 'left' | 'center' | 'right';

export interface EditorImageAttributes {
  src: string;
  alt?: string;
  title?: string;
}

export interface EditorCommandRegistry {
  setParagraph: EditorCommand;
  setHeading1: EditorCommand;
  setHeading2: EditorCommand;
  setHeading3: EditorCommand;
  setHeading4: EditorCommand;
  setHeading5: EditorCommand;
  setHeading6: EditorCommand;
  toggleBold: EditorCommand;
  toggleItalic: EditorCommand;
  toggleUnderline: EditorCommand;
  toggleStrike: EditorCommand;
  setTextColor: EditorColorCommand;
  unsetTextColor: EditorCommand;
  setHighlightColor: EditorColorCommand;
  unsetHighlight: EditorCommand;
  setLink: EditorLinkCommand;
  unsetLink: EditorCommand;
  insertImage: EditorImageCommand;
  setImageAlignLeft: EditorCommand;
  setImageAlignCenter: EditorCommand;
  setImageAlignRight: EditorCommand;
  setTextAlignLeft: EditorCommand;
  setTextAlignCenter: EditorCommand;
  setTextAlignRight: EditorCommand;
  setTextAlignJustify: EditorCommand;
  toggleBlockquote: EditorCommand;
  toggleCodeBlock: EditorCommand;
  setHorizontalRule: EditorCommand;
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
  setHeading4,
  setHeading5,
  setHeading6,
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrike,
  setTextColor,
  unsetTextColor,
  setHighlightColor,
  unsetHighlight,
  setLink,
  unsetLink,
  insertImage,
  setImageAlignLeft,
  setImageAlignCenter,
  setImageAlignRight,
  setTextAlignLeft,
  setTextAlignCenter,
  setTextAlignRight,
  setTextAlignJustify,
  toggleBlockquote,
  toggleCodeBlock,
  setHorizontalRule,
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

export function setHeading4(editor: Editor): boolean {
  return setHeading(editor, 4);
}

export function setHeading5(editor: Editor): boolean {
  return setHeading(editor, 5);
}

export function setHeading6(editor: Editor): boolean {
  return setHeading(editor, 6);
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

export function toggleStrike(editor: Editor): boolean {
  return editor.chain().focus().toggleStrike().run();
}

export function setTextColor(editor: Editor, color: string): boolean {
  return editor.chain().focus().setColor(color).run();
}

export function unsetTextColor(editor: Editor): boolean {
  return editor.chain().focus().unsetColor().run();
}

export function setHighlightColor(editor: Editor, color: string): boolean {
  return editor.chain().focus().setHighlight({ color }).run();
}

export function unsetHighlight(editor: Editor): boolean {
  return editor.chain().focus().unsetHighlight().run();
}

export function setLink(editor: Editor, href: string): boolean {
  const normalizedHref = normalizeLinkHref(href);

  if (!normalizedHref) {
    return false;
  }

  return editor
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({
      href: normalizedHref,
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
    })
    .run();
}

export function unsetLink(editor: Editor): boolean {
  return editor.chain().focus().extendMarkRange('link').unsetLink().run();
}

export function insertImage(editor: Editor, attrs: EditorImageAttributes): boolean {
  return editor.chain().focus().setImage(attrs).run();
}

export function setImageAlign(editor: Editor, alignment: ImageAlignment): boolean {
  return editor.chain().focus().updateAttributes('image', { align: alignment }).run();
}

export function setImageAlignLeft(editor: Editor): boolean {
  return setImageAlign(editor, 'left');
}

export function setImageAlignCenter(editor: Editor): boolean {
  return setImageAlign(editor, 'center');
}

export function setImageAlignRight(editor: Editor): boolean {
  return setImageAlign(editor, 'right');
}

export function setTextAlign(editor: Editor, alignment: TextAlignment): boolean {
  return editor.chain().focus().setTextAlign(alignment).run();
}

export function setTextAlignLeft(editor: Editor): boolean {
  return setTextAlign(editor, 'left');
}

export function setTextAlignCenter(editor: Editor): boolean {
  return setTextAlign(editor, 'center');
}

export function setTextAlignRight(editor: Editor): boolean {
  return setTextAlign(editor, 'right');
}

export function setTextAlignJustify(editor: Editor): boolean {
  return setTextAlign(editor, 'justify');
}

export function toggleBlockquote(editor: Editor): boolean {
  return editor.chain().focus().toggleBlockquote().run();
}

export function toggleCodeBlock(editor: Editor): boolean {
  return editor.chain().focus().toggleCodeBlock().run();
}

export function setHorizontalRule(editor: Editor): boolean {
  return editor.chain().focus().setHorizontalRule().run();
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
