import { Editor } from '@tiptap/core';

import type { CreateWysiwygEditorOptions } from './editor-types';
import { createEditorExtensions } from './editor-extensions';
import { createPasteNormalizerService } from '../services/paste-normalizer.service';

export type WysiwygEditorFactory = (options: CreateWysiwygEditorOptions) => Editor;

export const createWysiwygEditor: WysiwygEditorFactory = ({
  element,
  initialContent = '',
  placeholder,
  pasteNormalizer = createPasteNormalizerService(),
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
      transformPastedHTML: (html): string =>
        pasteNormalizer.normalizePaste({ html }).normalizedHtml,
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
        return (
          editorRef.current?.commands.insertContent(result.normalizedHtml, {
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
