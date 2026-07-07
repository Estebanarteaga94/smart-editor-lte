/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it } from 'vitest';

import { createWysiwygEditor } from './create-editor';
import {
  isSafeLinkHref,
  normalizeLinkHref,
  redo,
  setHeading,
  setHeading1,
  setHeading2,
  setHeading3,
  setHeading4,
  setHeading5,
  setHeading6,
  setHorizontalRule,
  setHighlightColor,
  setImageAlign,
  setImageAlignCenter,
  setImageAlignLeft,
  setImageAlignRight,
  setLink,
  setParagraph,
  setTextColor,
  setTextAlign,
  setTextAlignCenter,
  setTextAlignJustify,
  setTextAlignLeft,
  setTextAlignRight,
  toggleBlockquote,
  toggleBold,
  toggleCodeBlock,
  toggleBulletList,
  toggleItalic,
  toggleOrderedList,
  toggleStrike,
  toggleUnderline,
  unsetHighlight,
  unsetLink,
  unsetTextColor,
  undo,
} from './editor-commands';

const mountedEditors = new Set<ReturnType<typeof createWysiwygEditor>>();

function mountEditor(content = '<p>Texto</p>') {
  const element = document.createElement('div');
  document.body.append(element);

  const editor = createWysiwygEditor({
    element,
    initialContent: content,
  });

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

describe('editorCommands', () => {
  it('sets paragraph and headings H1 through H6', () => {
    const editor = mountEditor();

    expect(setHeading1(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({ type: 'heading', attrs: { level: 1 } });
    expect(editor.getHTML()).toContain('<h1>Texto</h1>');

    expect(setHeading2(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({ type: 'heading', attrs: { level: 2 } });

    expect(setHeading3(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({ type: 'heading', attrs: { level: 3 } });

    expect(setHeading4(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({ type: 'heading', attrs: { level: 4 } });

    expect(setHeading5(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({ type: 'heading', attrs: { level: 5 } });

    expect(setHeading6(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({ type: 'heading', attrs: { level: 6 } });
    expect(editor.getHTML()).toContain('<h6>Texto</h6>');

    expect(setParagraph(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({ type: 'paragraph' });
    expect(editor.getHTML()).toContain('<p>Texto</p>');
  });

  it('sets headings through the generic command', () => {
    const editor = mountEditor();

    expect(setHeading(editor, 6)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({ type: 'heading', attrs: { level: 6 } });
  });

  it('toggles bold, italic, underline and strike over selected text', () => {
    const editor = mountEditor();

    editor.commands.selectAll();
    expect(toggleBold(editor)).toBe(true);
    expect(toggleItalic(editor)).toBe(true);
    expect(toggleUnderline(editor)).toBe(true);
    expect(toggleStrike(editor)).toBe(true);

    expect(editor.getJSON()).toMatchObject({
      content: [
        {
          content: [
            {
              text: 'Texto',
              marks: expect.arrayContaining([
                expect.objectContaining({ type: 'bold' }),
                expect.objectContaining({ type: 'italic' }),
                expect.objectContaining({ type: 'underline' }),
                expect.objectContaining({ type: 'strike' }),
              ]),
            },
          ],
        },
      ],
    });
    expect(editor.getHTML()).toContain('<strong><em><s><u>Texto</u></s></em></strong>');
  });

  it('applies and removes text color over selected text', () => {
    const editor = mountEditor();

    editor.commands.selectAll();
    expect(setTextColor(editor, '#b91c1c')).toBe(true);

    expect(editor.getJSON()).toMatchObject({
      content: [
        {
          content: [
            {
              text: 'Texto',
              marks: [
                {
                  type: 'textStyle',
                  attrs: {
                    color: '#b91c1c',
                  },
                },
              ],
            },
          ],
        },
      ],
    });
    expect(editor.getHTML()).toContain('style="color: rgb(185, 28, 28);"');

    expect(unsetTextColor(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]?.content?.[0]).toMatchObject({ text: 'Texto' });
    expect(editor.getJSON().content?.[0]?.content?.[0]).not.toHaveProperty('marks');
    expect(editor.getHTML()).not.toContain('color: rgb(185, 28, 28);');
  });

  it('applies and removes multicolor highlight over selected text', () => {
    const editor = mountEditor();

    editor.commands.selectAll();
    expect(setHighlightColor(editor, '#ffc000')).toBe(true);

    expect(editor.getJSON()).toMatchObject({
      content: [
        {
          content: [
            {
              text: 'Texto',
              marks: [
                {
                  type: 'highlight',
                  attrs: {
                    color: '#ffc000',
                  },
                },
              ],
            },
          ],
        },
      ],
    });
    expect(editor.getHTML()).toContain('<mark');
    expect(editor.getHTML()).toContain('background-color: rgb(255, 192, 0);');

    expect(unsetHighlight(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]?.content?.[0]).toMatchObject({ text: 'Texto' });
    expect(editor.getJSON().content?.[0]?.content?.[0]).not.toHaveProperty('marks');
    expect(editor.getHTML()).not.toContain('background-color: rgb(255, 192, 0);');
  });

  it('creates, edits and removes a safe link over selected text', () => {
    const editor = mountEditor('<p>Texto enlazado</p>');

    editor.commands.selectAll();
    expect(setLink(editor, 'example.com')).toBe(true);

    expect(editor.getJSON()).toMatchObject({
      content: [
        {
          content: [
            {
              text: 'Texto enlazado',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'https://example.com',
                    target: '_blank',
                    rel: 'noopener noreferrer nofollow',
                  },
                },
              ],
            },
          ],
        },
      ],
    });
    expect(editor.getHTML()).toContain('href="https://example.com"');

    expect(setLink(editor, 'https://docs.example.com/guia')).toBe(true);
    expect(editor.getAttributes('link')).toMatchObject({
      href: 'https://docs.example.com/guia',
    });

    expect(unsetLink(editor)).toBe(true);
    expect(editor.getAttributes('link')).not.toHaveProperty('href');
    expect(editor.getHTML()).not.toContain('<a');
  });

  it('normalizes only supported link hrefs', () => {
    expect(normalizeLinkHref(' ejemplo.com/ruta ')).toBe('https://ejemplo.com/ruta');
    expect(normalizeLinkHref('mailto:info@example.com')).toBe('mailto:info@example.com');
    expect(normalizeLinkHref('/documentos/1')).toBe('/documentos/1');
    expect(normalizeLinkHref('./documentos/1')).toBe('./documentos/1');
    expect(normalizeLinkHref('../documentos/1')).toBe('../documentos/1');
    expect(normalizeLinkHref('#seccion')).toBe('#seccion');
    expect(normalizeLinkHref('javascript:alert(1)')).toBeNull();
    expect(normalizeLinkHref('java\nscript:alert(1)')).toBeNull();
    expect(normalizeLinkHref('//evil.example/payload')).toBeNull();
    expect(normalizeLinkHref('tel:123456')).toBeNull();
    expect(isSafeLinkHref('https://example.com')).toBe(true);
    expect(isSafeLinkHref('data:text/html,alert(1)')).toBe(false);
    expect(isSafeLinkHref('ftp://example.com/file.txt')).toBe(false);
  });

  it('aligns paragraphs and headings to left, center, right and justify', () => {
    const editor = mountEditor('<p>Parrafo</p><h2>Titulo</h2>');

    expect(setTextAlignCenter(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'paragraph',
      attrs: { textAlign: 'center' },
    });
    expect(editor.getHTML()).toContain('<p style="text-align: center;">Parrafo</p>');

    expect(setTextAlignRight(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({
      attrs: { textAlign: 'right' },
    });

    expect(setTextAlignJustify(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({
      attrs: { textAlign: 'justify' },
    });

    expect(setTextAlignLeft(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({
      attrs: { textAlign: 'left' },
    });

    editor.commands.setContent('<h2>Titulo</h2>');
    expect(setTextAlign(editor, 'center')).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'heading',
      attrs: { level: 2, textAlign: 'center' },
    });
    expect(editor.getHTML()).toContain('<h2 style="text-align: center;">Titulo</h2>');
  });

  it('aligns selected images without changing the canonical node type', () => {
    const editor = mountEditor();
    editor.commands.setContent({
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: {
            src: '/assets/image.png',
            alt: 'Imagen',
          },
        },
      ],
    });
    editor.commands.setNodeSelection(0);

    expect(setImageAlignCenter(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'image',
      attrs: {
        src: '/assets/image.png',
        alt: 'Imagen',
        align: 'center',
      },
    });
    expect(editor.getHTML()).toContain('align="center"');

    expect(setImageAlignRight(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'image',
      attrs: { align: 'right' },
    });

    expect(setImageAlignLeft(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'image',
      attrs: { align: 'left' },
    });

    expect(setImageAlign(editor, 'center')).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'image',
      attrs: { align: 'center' },
    });
  });

  it('toggles a paragraph into blockquote and back to paragraph', () => {
    const editor = mountEditor('<p>Cita editable</p>');

    expect(toggleBlockquote(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Cita editable' }],
        },
      ],
    });
    expect(editor.getHTML()).toContain('<blockquote><p>Cita editable</p></blockquote>');

    expect(toggleBlockquote(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Cita editable' }],
    });
    expect(editor.getHTML()).toContain('<p>Cita editable</p>');
    expect(editor.getHTML()).not.toContain('<blockquote>');
  });

  it('toggles and edits a code block without losing code text', () => {
    const editor = mountEditor('<p></p>');

    expect(toggleCodeBlock(editor)).toBe(true);
    expect(editor.isActive('codeBlock')).toBe(true);

    editor.commands.insertContent('const total = 1;');
    editor.commands.insertContent('\nconsole.log(total);');

    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'codeBlock',
      attrs: { language: null },
      content: [
        {
          type: 'text',
          text: 'const total = 1;\nconsole.log(total);',
        },
      ],
    });
    expect(editor.getHTML()).toContain(
      '<pre><code>const total = 1;\nconsole.log(total);</code></pre>',
    );

    expect(editor.isActive('codeBlock')).toBe(true);
  });

  it('inserts a horizontal rule as canonical node and renderable HTML', () => {
    const editor = mountEditor('<p>Antes</p>');

    editor.commands.setTextSelection(3);

    expect(setHorizontalRule(editor)).toBe(true);
    expect(editor.getJSON().content).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'horizontalRule' })]),
    );
    expect(editor.getHTML()).toContain('<hr>');
  });

  it('toggles bullet and ordered lists', () => {
    const editor = mountEditor();

    expect(toggleBulletList(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({ type: 'bulletList' });
    expect(editor.getHTML()).toContain('<ul>');

    expect(toggleBulletList(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({ type: 'paragraph' });

    expect(toggleOrderedList(editor)).toBe(true);
    expect(editor.getJSON().content?.[0]).toMatchObject({ type: 'orderedList' });
    expect(editor.getHTML()).toContain('<ol');
  });

  it('undoes and redoes editor history', () => {
    const editor = mountEditor('<p>Uno</p>');

    editor.chain().focus().insertContent(' Dos').run();
    expect(editor.getText()).toContain('Dos');

    expect(undo(editor)).toBe(true);
    expect(editor.getText()).toBe('Uno');

    expect(redo(editor)).toBe(true);
    expect(editor.getText()).toContain('Dos');
  });
});
