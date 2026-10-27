import type { JSONContent } from '@tiptap/core';

import type { PasteContentSafetyService } from '../services/paste-content-safety.service';
import type { PasteNormalizerService } from '../services/paste-normalizer.service';

export interface EditorChangePayload {
  contentJson: JSONContent;
  contentHtml: string;
}

export type EditorChangeHandler = (payload: EditorChangePayload) => void;

export interface CreateWysiwygEditorOptions {
  element: HTMLElement;
  initialContent?: JSONContent | string;
  placeholder?: string;
  pasteNormalizer?: PasteNormalizerService;
  pasteContentSafety?: PasteContentSafetyService;
  onChange?: EditorChangeHandler;
  onInvalidHtml?: (message: string) => void;
}
