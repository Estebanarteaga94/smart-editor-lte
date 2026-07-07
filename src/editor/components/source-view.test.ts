/**
 * @vitest-environment jsdom
 */
import { EditorView } from '@codemirror/view';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSourceEditorState, createSourceView } from './source-view';

const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;

function mountSourceEditor(value: string, language: 'html' | 'json'): EditorView {
  const parent = document.createElement('div');
  document.body.append(parent);

  return new EditorView({
    parent,
    state: createSourceEditorState({
      value,
      language,
    }),
  });
}

describe('source view CodeMirror configuration', () => {
  beforeEach(() => {
    document.body.replaceChildren();

    window.requestAnimationFrame = (callback: FrameRequestCallback): number =>
      window.setTimeout(() => callback(Date.now()), 0);
    window.cancelAnimationFrame = (handle: number): void => {
      window.clearTimeout(handle);
    };
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    document.body.replaceChildren();
  });

  it('configures HTML syntax highlighting', async () => {
    const view = mountSourceEditor('<h1>Documento</h1>', 'html');

    await new Promise((resolve) => window.setTimeout(resolve, 0));

    const content = document.querySelector('.cm-content[data-language="html"]');
    const highlightedTokens = [...document.querySelectorAll('.cm-content span')].map((token) =>
      token.textContent?.trim(),
    );

    expect(content).toBeInstanceOf(HTMLElement);
    expect(highlightedTokens).toContain('h1');

    view.destroy();
  });

  it('configures JSON syntax highlighting', async () => {
    const view = mountSourceEditor('{"title":"Documento"}', 'json');

    await new Promise((resolve) => window.setTimeout(resolve, 0));

    const content = document.querySelector('.cm-content[data-language="json"]');
    const highlightedTokens = [...document.querySelectorAll('.cm-content span')].map(
      (token) => token.textContent,
    );

    expect(content).toBeInstanceOf(HTMLElement);
    expect(highlightedTokens).toContain('"Documento"');

    view.destroy();
  });

  it('emits changes through the configured update listener', () => {
    const onChange = vi.fn();
    const parent = document.createElement('div');
    document.body.append(parent);
    const view = new EditorView({
      parent,
      state: createSourceEditorState({
        value: '{}',
        language: 'json',
        onChange,
      }),
    });

    view.dispatch({
      changes: {
        from: 1,
        insert: '"title":"Documento"',
      },
    });

    expect(onChange).toHaveBeenCalledWith('{"title":"Documento"}');

    view.destroy();
  });

  it('creates a source view component with editable value accessors', () => {
    const onChange = vi.fn();
    const sourceView = createSourceView({
      value: '<p>Inicial</p>',
      language: 'html',
      onChange,
    });

    expect(sourceView.element).toBeInstanceOf(HTMLElement);
    expect(sourceView.element.dataset.sourceLanguage).toBe('html');
    expect(sourceView.element.querySelector('.cm-editor')).toBeInstanceOf(HTMLElement);
    expect(sourceView.getValue()).toBe('<p>Inicial</p>');

    sourceView.setValue('<h1>Editado</h1>');

    expect(sourceView.getValue()).toBe('<h1>Editado</h1>');
    expect(onChange).toHaveBeenLastCalledWith('<h1>Editado</h1>');

    sourceView.cleanup();
  });

  it('destroys the CodeMirror instance through an idempotent cleanup function', () => {
    const sourceView = createSourceView({
      value: '{"title":"Documento"}',
      language: 'json',
    });
    const destroySpy = vi.spyOn(sourceView.editorView, 'destroy');

    sourceView.cleanup();
    sourceView.cleanup();
    sourceView.destroy();

    expect(destroySpy).toHaveBeenCalledTimes(1);
  });
});
