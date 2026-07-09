/**
 * @vitest-environment jsdom
 */

import type { JSONContent } from '@tiptap/core';
import { Slice } from '@tiptap/pm/model';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createWysiwygEditor } from './create-editor';
import type { PasteNormalizerService } from '../services/paste-normalizer.service';

const mountedEditors = new Set<ReturnType<typeof createWysiwygEditor>>();

function mountEditor(options: Parameters<typeof createWysiwygEditor>[0]) {
  const editor = createWysiwygEditor(options);
  mountedEditors.add(editor);
  return editor;
}

afterEach(() => {
  for (const editor of mountedEditors) {
    editor.destroy();
  }

  mountedEditors.clear();
  document.body.innerHTML = '';
});

describe('createWysiwygEditor', () => {
  it('mounts a Tiptap editor into the provided element', () => {
    const element = document.createElement('div');
    document.body.append(element);

    const editor = mountEditor({
      element,
      initialContent: '<p>Contenido inicial</p>',
    });

    expect(editor.isEditable).toBe(true);
    expect(element.querySelector('.tiptap')).not.toBeNull();
    expect(editor.getHTML()).toBe('<p>Contenido inicial</p>');
  });

  it('emits ProseMirror JSON and renderable HTML on updates', () => {
    const element = document.createElement('div');
    const onChange = vi.fn<(payload: { contentJson: JSONContent; contentHtml: string }) => void>();
    document.body.append(element);

    const editor = mountEditor({
      element,
      initialContent: '<p>Inicial</p>',
      onChange,
    });

    editor.commands.setContent('<h1>Actualizado</h1>');

    const [payload] = onChange.mock.lastCall ?? [];

    expect(payload).toBeDefined();
    expect(payload?.contentHtml).toContain('<h1>Actualizado</h1>');
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
    );
  });

  it('keeps Tiptap CSS injection disabled for project-owned styles', () => {
    const element = document.createElement('div');
    document.body.append(element);

    const editor = mountEditor({
      element,
    });

    expect(editor.options.injectCSS).toBe(false);
  });

  it('preserves resized table column widths in JSON and renderable HTML', () => {
    const element = document.createElement('div');
    const resizedTableContent: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  attrs: { colspan: 1, rowspan: 1, colwidth: [140], align: null },
                  content: [{ type: 'paragraph' }],
                },
                {
                  type: 'tableCell',
                  attrs: { colspan: 1, rowspan: 1, colwidth: [180], align: null },
                  content: [{ type: 'paragraph' }],
                },
              ],
            },
          ],
        },
      ],
    };
    document.body.append(element);

    const editor = mountEditor({
      element,
      initialContent: resizedTableContent,
    });
    const table = editor.getJSON().content?.[0] as JSONContent | undefined;
    const firstRow = table?.content?.[0];
    const [firstCell, secondCell] = firstRow?.content ?? [];

    expect(firstCell?.attrs).toMatchObject({ colwidth: [140] });
    expect(secondCell?.attrs).toMatchObject({ colwidth: [180] });
    expect(editor.getHTML()).toContain('<colgroup>');
    expect(editor.getHTML()).toContain('<col style="width: 140px;">');
    expect(editor.getHTML()).toContain('colwidth="140"');
  });

  it('preserves resizable image attributes in JSON and renderable HTML', () => {
    const element = document.createElement('div');
    const imageContent: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: {
            src: '/assets/image.png',
            alt: 'Imagen de prueba',
            title: null,
            width: 320,
            height: 180,
            align: 'center',
          },
        },
      ],
    };
    document.body.append(element);

    const editor = mountEditor({
      element,
      initialContent: imageContent,
    });
    const [image] = editor.getJSON().content ?? [];
    const html = editor.getHTML();

    expect(image).toMatchObject({
      type: 'image',
      attrs: expect.objectContaining({
        src: '/assets/image.png',
        alt: 'Imagen de prueba',
        width: 320,
        height: 180,
        align: 'center',
      }),
    });
    expect(html).toContain('<img');
    expect(html).toContain('src="/assets/image.png"');
    expect(html).toContain('alt="Imagen de prueba"');
    expect(html).toContain('width="320"');
    expect(html).toContain('height="180"');
    expect(html).toContain('align="center"');
  });

  it('renders selected images with resize affordance elements', () => {
    const element = document.createElement('div');
    const imageContent: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: {
            src: '/assets/image.png',
            alt: 'Imagen redimensionable',
            width: 320,
            height: 180,
          },
        },
      ],
    };
    document.body.append(element);

    const editor = mountEditor({
      element,
      initialContent: imageContent,
    });
    editor.commands.setNodeSelection(0);

    const resizeContainer = element.querySelector<HTMLElement>('.editor-image-resize');
    const resizeWrapper = element.querySelector<HTMLElement>('.editor-image-resize__wrapper');
    const resizeHandles = element.querySelectorAll<HTMLElement>('.editor-image-resize__handle');

    expect(resizeContainer).not.toBeNull();
    expect(resizeContainer?.dataset.resizeContainer).toBe('');
    expect(resizeContainer?.dataset.node).toBe('image');
    expect(resizeContainer?.style.visibility).not.toBe('hidden');
    expect(resizeWrapper).not.toBeNull();
    expect(resizeWrapper?.dataset.resizeWrapper).toBe('');
    expect(resizeHandles).toHaveLength(4);
    expect(Array.from(resizeHandles).map((handle) => handle.dataset.resizeHandle)).toEqual(
      expect.arrayContaining(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
    );
  });

  it('renders configurable placeholder text when the editor is empty', () => {
    const element = document.createElement('div');
    document.body.append(element);

    mountEditor({
      element,
      initialContent: '',
      placeholder: 'Escribe una nota clinica...',
    });

    const placeholderNode = element.querySelector<HTMLElement>(
      '[data-placeholder="Escribe una nota clinica..."]',
    );

    expect(placeholderNode).not.toBeNull();
    expect(placeholderNode?.classList.contains('is-editor-empty')).toBe(true);
  });

  it('does not keep unsafe link marks when loading HTML content', () => {
    const element = document.createElement('div');
    document.body.append(element);

    const editor = mountEditor({
      element,
      initialContent:
        '<p><a href="javascript:alert(1)">Inseguro</a> <a href="https://example.com">Seguro</a></p>',
    });

    const [paragraph] = editor.getJSON().content ?? [];
    const safeLinkText = paragraph?.content?.find(
      (node) => 'text' in node && node.text === 'Seguro',
    );

    expect(paragraph?.content?.[0]).toMatchObject({
      type: 'text',
      text: 'Inseguro ',
    });
    expect(paragraph?.content?.[0]).not.toHaveProperty('marks');
    expect(safeLinkText).toMatchObject({
      type: 'text',
      text: 'Seguro',
      marks: [
        expect.objectContaining({
          type: 'link',
          attrs: expect.objectContaining({ href: 'https://example.com' }),
        }),
      ],
    });
    expect(editor.getHTML()).not.toContain('javascript:');
  });

  it('normalizes pasted HTML through the Tiptap paste pipeline', () => {
    const element = document.createElement('div');
    const normalizePaste = vi.fn<PasteNormalizerService['normalizePaste']>(() => ({
      normalizedHtml: '<p>HTML normalizado</p>',
      warnings: [],
      detectedSource: 'word',
    }));
    document.body.append(element);

    const editor = mountEditor({
      element,
      pasteNormalizer: {
        normalizePaste,
      },
    });
    const transformedHtml = editor.view.props.transformPastedHTML?.(
      '<p class="MsoNormal">HTML de Word</p>',
      editor.view,
    );

    expect(transformedHtml).toBe('<p>HTML normalizado</p>');
    expect(normalizePaste).toHaveBeenCalledWith({
      html: '<p class="MsoNormal">HTML de Word</p>',
    });
  });

  it('sanitizes normalized pasted HTML before Tiptap parses it', () => {
    const element = document.createElement('div');
    const normalizePaste = vi.fn<PasteNormalizerService['normalizePaste']>(() => ({
      normalizedHtml:
        '<p onclick="alert(1)">Seguro<script>alert(1)</script><a href="javascript:alert(1)">Link</a></p>',
      warnings: [],
      detectedSource: 'word',
    }));
    document.body.append(element);

    const editor = mountEditor({
      element,
      pasteNormalizer: {
        normalizePaste,
      },
    });
    const transformedHtml = editor.view.props.transformPastedHTML?.(
      '<p class="MsoNormal">HTML de Word</p>',
      editor.view,
    );

    expect(transformedHtml).toBe('<p>Seguro<a>Link</a></p>');
  });

  it('inserts tabulated plain-text paste as a table through handlePaste', () => {
    const element = document.createElement('div');
    document.body.append(element);

    const editor = mountEditor({
      element,
      initialContent: '<p></p>',
    });
    const pasteEvent = createPasteEvent({
      text: 'Producto\tCantidad\nCafe\t2',
    });
    const handled = editor.view.props.handlePaste?.(editor.view, pasteEvent, Slice.empty);

    expect(handled).toBe(true);
    expect(pasteEvent.defaultPrevented).toBe(true);
    expect(editor.getHTML()).toContain('<table');
    expect(editor.getHTML()).toContain('<th colspan="1" rowspan="1"><p>Producto</p></th>');
    expect(editor.getHTML()).toContain('<td colspan="1" rowspan="1"><p>Cafe</p></td>');
  });

  it('blocks normalized tabulated paste when it does not pass canonical validation', () => {
    const element = document.createElement('div');
    const normalizePaste = vi.fn<PasteNormalizerService['normalizePaste']>(() => ({
      normalizedHtml: '<p>Linea uno<br>Linea dos</p>',
      warnings: [],
      detectedSource: 'excel',
    }));
    document.body.append(element);

    const editor = mountEditor({
      element,
      initialContent: '<p>Base</p>',
      pasteNormalizer: {
        normalizePaste,
      },
    });
    const pasteEvent = createPasteEvent({
      text: 'A\tB\n1\t2',
    });
    const handled = editor.view.props.handlePaste?.(editor.view, pasteEvent, Slice.empty);

    expect(handled).toBe(true);
    expect(pasteEvent.defaultPrevented).toBe(true);
    expect(editor.getHTML()).toBe('<p>Base</p>');
  });

  it('does not intercept normal plain-text paste in handlePaste', () => {
    const element = document.createElement('div');
    document.body.append(element);

    const editor = mountEditor({
      element,
      initialContent: '<p>Base</p>',
    });
    const pasteEvent = createPasteEvent({
      text: 'Texto normal',
    });
    const handled = editor.view.props.handlePaste?.(editor.view, pasteEvent, Slice.empty);

    expect(handled).toBe(false);
    expect(pasteEvent.defaultPrevented).toBe(false);
    expect(editor.getHTML()).toBe('<p>Base</p>');
  });
});

function createPasteEvent(options: { html?: string; text?: string }): ClipboardEvent {
  const event = new Event('paste', {
    bubbles: true,
    cancelable: true,
  });

  Object.defineProperty(event, 'clipboardData', {
    configurable: true,
    value: {
      getData: (type: string) => {
        if (type === 'text/html') {
          return options.html ?? '';
        }

        if (type === 'text/plain') {
          return options.text ?? '';
        }

        return '';
      },
    },
  });

  return event as ClipboardEvent;
}
