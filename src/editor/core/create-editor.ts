import type { Editor } from '@tiptap/core'

import type { CreateWysiwygEditorOptions } from './editor-types'

export type WysiwygEditorFactory = (
  options: CreateWysiwygEditorOptions,
) => Editor
