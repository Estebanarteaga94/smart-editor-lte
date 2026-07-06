/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { debounce } from '../utils/debounce';
import { createEditorLifecycle } from './editor-lifecycle';

afterEach(() => {
  vi.useRealTimers();
});

describe('EditorLifecycle', () => {
  it('mounts and disposes shell roots without duplicating nodes', () => {
    const host = document.createElement('div');
    const firstRoot = document.createElement('main');
    const secondRoot = document.createElement('main');
    const lifecycle = createEditorLifecycle();

    lifecycle.mountRoot(host, firstRoot);
    expect(host.children).toHaveLength(1);
    expect(host.firstElementChild).toBe(firstRoot);

    lifecycle.mountRoot(host, secondRoot);
    expect(host.children).toHaveLength(1);
    expect(host.firstElementChild).toBe(secondRoot);
    expect(firstRoot.isConnected).toBe(false);

    lifecycle.dispose();
    lifecycle.dispose();

    expect(host.children).toHaveLength(0);
  });

  it('destroys the current Tiptap editor on replacement and dispose', () => {
    const lifecycle = createEditorLifecycle();
    const firstEditor = { destroy: vi.fn() };
    const secondEditor = { destroy: vi.fn() };

    lifecycle.registerTiptapEditor(firstEditor);
    lifecycle.registerTiptapEditor(secondEditor);

    expect(firstEditor.destroy).toHaveBeenCalledTimes(1);
    expect(secondEditor.destroy).not.toHaveBeenCalled();

    lifecycle.dispose();
    lifecycle.dispose();

    expect(firstEditor.destroy).toHaveBeenCalledTimes(1);
    expect(secondEditor.destroy).toHaveBeenCalledTimes(1);
  });

  it('destroys CodeMirror-like source views when changing view and disposing', () => {
    const lifecycle = createEditorLifecycle();
    const htmlView = { destroy: vi.fn() };
    const jsonView = { destroy: vi.fn() };

    lifecycle.registerSourceView(htmlView);
    lifecycle.registerSourceView(jsonView);

    expect(htmlView.destroy).toHaveBeenCalledTimes(1);
    expect(jsonView.destroy).not.toHaveBeenCalled();

    lifecycle.destroySourceView();
    lifecycle.destroySourceView();

    expect(jsonView.destroy).toHaveBeenCalledTimes(1);
  });

  it('removes manual event listeners on cleanup', () => {
    const lifecycle = createEditorLifecycle();
    const button = document.createElement('button');
    const onClick = vi.fn();

    lifecycle.addEventListener(button, 'click', onClick);
    button.click();

    lifecycle.dispose();
    button.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('cancels timers and debounced functions on dispose', () => {
    vi.useFakeTimers();

    const lifecycle = createEditorLifecycle();
    const timerCallback = vi.fn();
    const intervalCallback = vi.fn();
    const debounceCallback = vi.fn();
    const timerId = window.setTimeout(timerCallback, 100);
    const intervalId = window.setInterval(intervalCallback, 50);
    const debouncedCallback = debounce(debounceCallback, 100);

    lifecycle.registerTimer(timerId);
    lifecycle.registerInterval(intervalId);
    lifecycle.registerDebounce(debouncedCallback);
    debouncedCallback('value');

    lifecycle.dispose();
    vi.advanceTimersByTime(100);

    expect(timerCallback).not.toHaveBeenCalled();
    expect(intervalCallback).not.toHaveBeenCalled();
    expect(debounceCallback).not.toHaveBeenCalled();
  });

  it('prevents registering new resources after dispose', () => {
    const lifecycle = createEditorLifecycle();

    lifecycle.dispose();

    expect(() => lifecycle.registerCleanup(() => undefined)).toThrow(
      'Editor lifecycle is already disposed',
    );
  });
});
