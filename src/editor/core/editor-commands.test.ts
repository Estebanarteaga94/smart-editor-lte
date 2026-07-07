/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it } from 'vitest';

import { createWysiwygEditor } from './create-editor';
import {
  setHeading,
  setHeading1,
  setHeading2,
  setHeading3,
  setHeading4,
  setHeading5,
  setHeading6,
  setParagraph,
  toggleBold,
  toggleBulletList,
  toggleItalic,
  toggleOrderedList,
  toggleUnderline,
  undo,
  redo,
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

  it('toggles bold, italic and underline over selected text', () => {
    const editor = mountEditor();

    editor.commands.selectAll();
    expect(toggleBold(editor)).toBe(true);
    expect(toggleItalic(editor)).toBe(true);
    expect(toggleUnderline(editor)).toBe(true);

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
              ]),
            },
          ],
        },
      ],
    });
    expect(editor.getHTML()).toContain('<strong><em><u>Texto</u></em></strong>');
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
