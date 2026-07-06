import { describe, expect, it } from 'vitest'

import { createEditorExtensions } from './editor-extensions'

describe('createEditorExtensions', () => {
  it('registers the base editor extensions expected by the roadmap', () => {
    const extensionNames = createEditorExtensions({
      placeholder: 'Contenido...',
    }).map((extension) => extension.name)

    expect(extensionNames).toEqual(
      expect.arrayContaining([
        'starterKit',
        'underline',
        'textStyle',
        'color',
        'highlight',
        'textAlign',
        'link',
        'image',
        'table',
        'tableRow',
        'tableHeader',
        'tableCell',
        'taskList',
        'taskItem',
        'placeholder',
      ]),
    )
  })
})
