import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorState, type Extension } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';

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

export interface SourceView {
  element: HTMLElement;
  editorView: EditorView;
  getValue: () => string;
  setValue: (value: string) => void;
  cleanup: () => void;
  destroy: () => void;
}

export interface SourceJsonUpdateResult {
  content: CanonicalEditorContent;
  applied: boolean;
  error: string | null;
}

export function validateSourceJsonInput(source: string): SourceJsonValidationResult {
  return validateSourceJsonContent(source);
}

export function createSourceEditorExtensions(
  options: Pick<SourceViewOptions, 'language' | 'onChange'>,
): Extension[] {
  const languageExtension = options.language === 'html' ? html() : json();
  const extensions: Extension[] = [
    lineNumbers(),
    EditorView.lineWrapping,
    EditorView.contentAttributes.of({
      'data-language': options.language,
    }),
    syntaxHighlighting(defaultHighlightStyle),
    languageExtension,
  ];

  if (options.onChange) {
    extensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          options.onChange?.(update.state.doc.toString());
        }
      }),
    );
  }

  return extensions;
}

export function createSourceEditorState(options: SourceViewOptions): EditorState {
  return EditorState.create({
    doc: options.value,
    extensions: createSourceEditorExtensions(options),
  });
}

export function createSourceView(options: SourceViewOptions): SourceView {
  const element = document.createElement('section');
  element.className = `editor-source-view editor-source-view--${options.language}`;
  element.dataset.sourceLanguage = options.language;

  const editorView = new EditorView({
    parent: element,
    state: createSourceEditorState(options),
  });

  let destroyed = false;

  const destroy = (): void => {
    if (destroyed) {
      return;
    }

    destroyed = true;
    editorView.destroy();
  };

  return {
    element,
    editorView,
    getValue: () => editorView.state.doc.toString(),
    setValue: (value: string) => {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: value,
        },
      });
    },
    cleanup: destroy,
    destroy,
  };
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
