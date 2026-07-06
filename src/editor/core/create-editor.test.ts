/**
 * @vitest-environment jsdom
 */

import type { JSONContent } from '@tiptap/core'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createWysiwygEditor } from './create-editor'

const mountedEditors = new Set<ReturnType<typeof createWysiwygEditor>>()

function mountEditor(options: Parameters<typeof createWysiwygEditor>[0]) {
  const editor = createWysiwygEditor(options)
  mountedEditors.add(editor)
  return editor
}

afterEach(() => {
  for (const editor of mountedEditors) {
    editor.destroy()
  }

  mountedEditors.clear()
  document.body.innerHTML = ''
})

describe('createWysiwygEditor', () => {
  it('mounts a Tiptap editor into the provided element', () => {
    const element = document.createElement('div')
    document.body.append(element)

    const editor = mountEditor({
      element,
      initialContent: '<p>Contenido inicial</p>',
    })

    expect(editor.isEditable).toBe(true)
    expect(element.querySelector('.tiptap')).not.toBeNull()
    expect(editor.getHTML()).toBe('<p>Contenido inicial</p>')
  })

  it('emits ProseMirror JSON and renderable HTML on updates', () => {
    const element = document.createElement('div')
    const onChange = vi.fn<(payload: { contentJson: JSONContent; contentHtml: string }) => void>()
    document.body.append(element)

    const editor = mountEditor({
      element,
      initialContent: '<p>Inicial</p>',
      onChange,
    })

    editor.commands.setContent('<h1>Actualizado</h1>')

    const [payload] = onChange.mock.lastCall ?? []

    expect(payload).toBeDefined()
    expect(payload?.contentHtml).toContain('<h1>Actualizado</h1>')
    expect(payload?.contentJson).toEqual(
      expect.objectContaining({
        content: expect.arrayContaining([
          expect.objectContaining({
            attrs: {
              level: 1,
              textAlign: null,
            },
            content: [
              {
                text: 'Actualizado',
                type: 'text',
              },
            ],
            type: 'heading',
          }),
        ]),
        type: 'doc',
      }),
    )
  })

  it('keeps Tiptap CSS injection disabled for project-owned styles', () => {
    const element = document.createElement('div')
    document.body.append(element)

    const editor = mountEditor({
      element,
    })

    expect(editor.options.injectCSS).toBe(false)
  })
})
