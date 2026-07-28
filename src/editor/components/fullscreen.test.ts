/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from 'vitest';

import { createFullscreenController } from './fullscreen';

describe('createFullscreenController', () => {
  it('toggles only the visual fullscreen class and reports changes', () => {
    const root = document.createElement('main');
    const onChange = vi.fn();
    const controller = createFullscreenController({ root, onChange });

    expect(controller.getState()).toEqual({ enabled: false });
    expect(root.classList.contains('editor-shell--fullscreen')).toBe(false);

    controller.toggle();

    expect(controller.getState()).toEqual({ enabled: true });
    expect(root.classList.contains('editor-shell--fullscreen')).toBe(true);
    expect(root.dataset.fullscreen).toBe('true');
    expect(onChange).toHaveBeenLastCalledWith({ enabled: true });

    controller.setEnabled(false);

    expect(root.classList.contains('editor-shell--fullscreen')).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith({ enabled: false });
  });
});
