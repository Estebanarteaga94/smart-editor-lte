import type { Editor } from '@tiptap/core';

import { parseCanonicalEditorContent, type CanonicalEditorContent } from '../models/editor-content';

export interface SerializedEditorContent {
  contentJson: CanonicalEditorContent;
  contentHtml: string;
}

export interface SerializerService {
  getContentJson(): CanonicalEditorContent;
  getContentHtml(): string;
  serialize(): SerializedEditorContent;
}

export function createSerializerService(editor: Editor): SerializerService {
  return {
    getContentJson() {
      return getCanonicalEditorJson(editor);
    },
    getContentHtml() {
      return getRenderableEditorHtml(editor);
    },
    serialize() {
      return serializeEditorContent(editor);
    },
  };
}

export function getCanonicalEditorJson(editor: Editor): CanonicalEditorContent {
  return parseCanonicalEditorContent(editor.getJSON());
}

export function getRenderableEditorHtml(editor: Editor): string {
  return editor.getHTML();
}

export function serializeEditorContent(editor: Editor): SerializedEditorContent {
  return {
    contentJson: getCanonicalEditorJson(editor),
    contentHtml: getRenderableEditorHtml(editor),
  };
}
