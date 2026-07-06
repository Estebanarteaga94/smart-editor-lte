import type { JSONContent } from '@tiptap/core';

export interface EditorChangePayload {
  contentJson: JSONContent;
  contentHtml: string;
}

export type EditorChangeHandler = (payload: EditorChangePayload) => void;

export interface CreateWysiwygEditorOptions {
  element: HTMLElement;
  initialContent?: JSONContent | string;
  placeholder?: string;
  onChange?: EditorChangeHandler;
}
