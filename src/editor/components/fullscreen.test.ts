/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from 'vitest';

import { createFullscreenController } from './fullscreen';

describe('createFullscreenController', () => {
  it('moves the root above ancestor stacking contexts and restores its exact position', () => {
    const container = document.createElement('section');
    const root = document.createElement('main');
    const sibling = document.createElement('aside');
    container.append(root, sibling);
    document.body.append(container);
    const onChange = vi.fn();
    const controller = createFullscreenController({ root, onChange });

    expect(controller.getState()).toEqual({ enabled: false });
    expect(root.classList.contains('editor-shell--fullscreen')).toBe(false);

    controller.toggle();

    expect(controller.getState()).toEqual({ enabled: true });
    expect(root.classList.contains('editor-shell--fullscreen')).toBe(true);
    expect(root.dataset.fullscreen).toBe('true');
    expect(root.parentElement).toBe(document.body);
    expect(onChange).toHaveBeenLastCalledWith({ enabled: true });

    controller.setEnabled(false);

    expect(root.classList.contains('editor-shell--fullscreen')).toBe(false);
    expect(root.parentElement).toBe(container);
    expect(Array.from(container.children)).toEqual([root, sibling]);
    expect(onChange).toHaveBeenLastCalledWith({ enabled: false });
  });

  it('restores a fullscreen root when the controller is destroyed', () => {
    const container = document.createElement('section');
    const root = document.createElement('main');
    container.append(root);
    document.body.append(container);
    const controller = createFullscreenController({ root });

    controller.setEnabled(true);
    controller.destroy();

    expect(root.parentElement).toBe(container);
    expect(root.classList.contains('editor-shell--fullscreen')).toBe(false);
    expect(root.dataset.fullscreen).toBe('false');
  });
});
