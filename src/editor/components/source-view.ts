import {
  validateSourceJsonContent,
  type CanonicalEditorContent,
  type SourceJsonValidationResult,
} from '../models/editor-content';

export type SourceViewLanguage = 'html' | 'json';

export interface SourceViewOptions {
  value: string;
  language: SourceViewLanguage;
  onChange?: (value: string) => void;
}

export interface SourceJsonUpdateResult {
  content: CanonicalEditorContent;
  applied: boolean;
  error: string | null;
}

export function validateSourceJsonInput(source: string): SourceJsonValidationResult {
  return validateSourceJsonContent(source);
}

export function resolveSourceJsonUpdate(
  source: string,
  currentContent: CanonicalEditorContent,
): SourceJsonUpdateResult {
  const validation = validateSourceJsonInput(source);

  if (!validation.ok) {
    return {
      content: currentContent,
      applied: false,
      error: validation.message,
    };
  }

  return {
    content: validation.content,
    applied: true,
    error: null,
  };
}
