import { Editor } from '@tiptap/core';
import { registerPreparedHtmlEditor } from '../services/apply-prepared-html.service';

import type { CreateWysiwygEditorOptions } from './editor-types';
import { createEditorExtensions } from './editor-extensions';
import { createPasteContentSafetyService } from '../services/paste-content-safety.service';
import { createPasteNormalizerService } from '../services/paste-normalizer.service';
import {
  applyPreservedContent,
  needsHtmlPreservation,
  preparePreservedHtml,
  serializePreservedHtml,
} from '../services/preserved-html.service';
import { attachPreservedHtmlStyles } from '../services/preserved-html-styles.service';

export type WysiwygEditorFactory = (options: CreateWysiwygEditorOptions) => Editor;

export const createWysiwygEditor: WysiwygEditorFactory = ({
  element,
  initialContent = '',
  placeholder,
  pasteNormalizer = createPasteNormalizerService(),
  pasteContentSafety = createPasteContentSafetyService(),
  onChange,
  onInvalidHtml,
}) => {
  const editorRef: { current: Editor | null } = { current: null };

  const editor = new Editor({
    element,
    content:
      typeof initialContent === 'string' && needsHtmlPreservation(initialContent)
        ? ''
        : initialContent,
    extensions: createEditorExtensions({
      placeholder,
      onInvalidHtml,
    }),
    editorProps: {
      transformPastedHTML: (html, view): string => {
        const normalizedHtml = pasteNormalizer.normalizePaste({ html }).normalizedHtml;
        const safeHtml = pasteContentSafety.sanitizeAndValidateHtml(
          normalizedHtml,
          view.state.schema,
        );

        return safeHtml.ok ? safeHtml.html : '';
      },
      handlePaste: (_view, event): boolean => {
        const clipboardData = event.clipboardData;

        if (!clipboardData || clipboardData.getData('text/html').trim().length > 0) {
          return false;
        }

        const text = clipboardData.getData('text/plain');
        const result = pasteNormalizer.normalizePaste({ text });

        if (result.detectedSource !== 'excel' || result.normalizedHtml.trim().length === 0) {
          return false;
        }

        event.preventDefault();

        const editor = editorRef.current;

        if (!editor) {
          return true;
        }

        const safeHtml = pasteContentSafety.sanitizeAndValidateHtml(
          result.normalizedHtml,
          editor.state.schema,
        );

        if (!safeHtml.ok || safeHtml.html.trim().length === 0) {
          return true;
        }

        return (
          editor.commands.insertContent(safeHtml.html, {
            applyPasteRules: false,
          }) ?? false
        );
      },
    },
    injectCSS: false,
    onUpdate: ({ editor }) => {
      onChange?.({
        contentJson: editor.getJSON(),
        contentHtml: editor.getHTML(),
      });
    },
  });

  registerPreparedHtmlEditor(editor);
  editorRef.current = editor;
  const getJson = editor.getJSON.bind(editor);
  editor.getJSON = () =>
    JSON.parse(
      JSON.stringify(getJson(), (key: string, value: unknown) => {
        if (key !== 'attrs' || !value || typeof value !== 'object') return value;
        const attrs = Object.fromEntries(
          Object.entries(value).filter(([, item]) => item !== undefined),
        );
        return Object.keys(attrs).length ? attrs : undefined;
      }),
    ) as ReturnType<typeof getJson>;
  const getHtml = editor.getHTML.bind(editor);
  editor.getHTML = () => serializePreservedHtml(editor.state.doc) ?? getHtml();
  try {
    attachPreservedHtmlStyles(editor, element);
    if (typeof initialContent === 'string' && needsHtmlPreservation(initialContent)) {
      applyPreservedContent(editor, preparePreservedHtml(initialContent, editor.schema), false);
    }
  } catch (cause) {
    editor.destroy();
    throw cause;
  }

  return editor;
};
