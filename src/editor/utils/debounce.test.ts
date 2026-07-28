/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { debounce } from './debounce';

afterEach(() => {
  vi.useRealTimers();
});

describe('debounce', () => {
  it('invokes the callback once with the latest typed arguments', () => {
    vi.useFakeTimers();
    const callback = vi.fn<(value: string, count: number) => void>();
    const debounced = debounce(callback, 1000);

    debounced('primero', 1);
    debounced('ultimo', 2);
    vi.advanceTimersByTime(999);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('ultimo', 2);
  });

  it('cancels a pending invocation', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const debounced = debounce(callback, 800);

    debounced();
    debounced.cancel();
    vi.runAllTimers();

    expect(callback).not.toHaveBeenCalled();
  });
});
