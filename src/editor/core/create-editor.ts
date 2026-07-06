import { Editor } from '@tiptap/core'

import type { CreateWysiwygEditorOptions } from './editor-types'
import { createEditorExtensions } from './editor-extensions'

export type WysiwygEditorFactory = (
  options: CreateWysiwygEditorOptions,
) => Editor

export const createWysiwygEditor: WysiwygEditorFactory = ({
  element,
  initialContent = '',
  placeholder,
  onChange,
}) =>
  new Editor({
    element,
    content: initialContent,
    extensions: createEditorExtensions({
      placeholder,
    }),
    injectCSS: false,
    onUpdate: ({ editor }) => {
      onChange?.({
        contentJson: editor.getJSON(),
        contentHtml: editor.getHTML(),
      })
    },
  })
