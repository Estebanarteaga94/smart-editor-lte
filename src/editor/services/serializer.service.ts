import type { Editor } from '@tiptap/core';

import { parseCanonicalEditorContent, type CanonicalEditorContent } from '../models/editor-content';

export interface SerializedEditorContent {
  contentJson: CanonicalEditorContent;
  contentHtml: string;
}

export interface SerializerService {
  serialize(): SerializedEditorContent;
}

export function serializeEditorContent(editor: Editor): SerializedEditorContent {
  return {
    contentJson: parseCanonicalEditorContent(editor.getJSON()),
    contentHtml: editor.getHTML(),
  };
}
