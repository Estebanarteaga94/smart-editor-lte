import { Editor } from '@tiptap/core';

import type { CreateWysiwygEditorOptions } from './editor-types';
import { createEditorExtensions } from './editor-extensions';
import { createPasteContentSafetyService } from '../services/paste-content-safety.service';
import { createPasteNormalizerService } from '../services/paste-normalizer.service';

export type WysiwygEditorFactory = (options: CreateWysiwygEditorOptions) => Editor;

export const createWysiwygEditor: WysiwygEditorFactory = ({
  element,
  initialContent = '',
  placeholder,
  pasteNormalizer = createPasteNormalizerService(),
  pasteContentSafety = createPasteContentSafetyService(),
  onChange,
}) => {
  const editorRef: { current: Editor | null } = { current: null };

  const editor = new Editor({
    element,
    content: initialContent,
    extensions: createEditorExtensions({
      placeholder,
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

  editorRef.current = editor;

  return editor;
};
