/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it } from 'vitest';

import { createWysiwygEditor } from '../core/create-editor';
import {
  clearAgentSections,
  getAgentSections,
  hasAgentSections,
  isAgentSectionSelectionActive,
  toggleAgentSection,
} from './agent-section.extension';

const editors = new Set<ReturnType<typeof createWysiwygEditor>>();

afterEach(() => {
  for (const editor of editors) {
    editor.destroy();
  }
  editors.clear();
  document.body.replaceChildren();
});

describe('AgentSectionExtension', () => {
  it('marks multiple ranges without changing canonical document content', () => {
    const editor = mountEditor('<p>Primera seccion y segunda seccion.</p>');
    const canonicalBefore = editor.getJSON();

    editor.commands.setTextSelection({ from: 1, to: 16 });
    expect(toggleAgentSection(editor)).toBe(true);
    editor.commands.setTextSelection({ from: 19, to: 34 });
    expect(toggleAgentSection(editor)).toBe(true);

    expect(getAgentSections(editor).map((section) => section.text)).toEqual([
      'Primera seccion',
      'segunda seccion',
    ]);
    expect(editor.getJSON()).toEqual(canonicalBefore);
    expect(document.querySelectorAll('.editor-agent-section')).toHaveLength(2);
    expect(hasAgentSections(editor)).toBe(true);
  });

  it('toggles overlapping marks, maps ranges through edits and clears all sections', () => {
    const editor = mountEditor('<p>Texto seleccionado</p>');

    editor.commands.setTextSelection({ from: 1, to: 6 });
    toggleAgentSection(editor);
    expect(isAgentSectionSelectionActive(editor)).toBe(true);

    editor.commands.insertContentAt(1, 'Nuevo ');
    expect(getAgentSections(editor)[0]).toMatchObject({
      from: 7,
      to: 12,
      text: 'Texto',
    });

    editor.commands.setTextSelection({ from: 7, to: 12 });
    toggleAgentSection(editor);
    expect(hasAgentSections(editor)).toBe(false);

    editor.commands.setTextSelection({ from: 7, to: 12 });
    toggleAgentSection(editor);
    expect(clearAgentSections(editor)).toBe(true);
    expect(getAgentSections(editor)).toEqual([]);
  });

  it('does not mark an empty cursor selection', () => {
    const editor = mountEditor('<p>Texto</p>');
    editor.commands.setTextSelection(1);

    expect(toggleAgentSection(editor)).toBe(false);
    expect(getAgentSections(editor)).toEqual([]);
  });
});

function mountEditor(content: string): ReturnType<typeof createWysiwygEditor> {
  const element = document.createElement('div');
  document.body.append(element);
  const editor = createWysiwygEditor({ element, initialContent: content });
  editors.add(editor);
  return editor;
}
