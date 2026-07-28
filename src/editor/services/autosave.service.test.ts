/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAutosaveService } from './autosave.service';

afterEach(() => {
  vi.useRealTimers();
});

describe('createAutosaveService', () => {
  it('debounces repeated changes and reports the save lifecycle', async () => {
    vi.useFakeTimers();
    const save = vi.fn(() => Promise.resolve());
    const onStatusChange = vi.fn();
    const autosave = createAutosaveService({
      save,
      debounceMs: 800,
      onStatusChange,
    });

    autosave.schedule();
    autosave.schedule();
    expect(autosave.status).toBe('pending');

    await vi.advanceTimersByTimeAsync(799);
    expect(save).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(save).toHaveBeenCalledOnce();
    expect(autosave.status).toBe('saved');
    expect(onStatusChange.mock.calls.map(([status]) => status)).toEqual([
      'pending',
      'saving',
      'saved',
    ]);
  });

  it('flushes pending changes immediately for manual save', async () => {
    vi.useFakeTimers();
    const save = vi.fn(() => Promise.resolve());
    const autosave = createAutosaveService({ save, debounceMs: 1500 });

    autosave.schedule();
    await autosave.flush();

    expect(save).toHaveBeenCalledOnce();
    expect(autosave.status).toBe('saved');
    await vi.runAllTimersAsync();
    expect(save).toHaveBeenCalledOnce();
  });

  it('serializes saves and ignores stale completion state', async () => {
    vi.useFakeTimers();
    const firstSave = createDeferred();
    const secondSave = createDeferred();
    const save = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(() => firstSave.promise)
      .mockImplementationOnce(() => secondSave.promise);
    const autosave = createAutosaveService({ save, debounceMs: 800 });

    autosave.schedule();
    await vi.advanceTimersByTimeAsync(800);
    expect(autosave.status).toBe('saving');

    autosave.schedule();
    await vi.advanceTimersByTimeAsync(800);
    expect(save).toHaveBeenCalledOnce();

    firstSave.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(autosave.status).not.toBe('saved');

    secondSave.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(save).toHaveBeenCalledTimes(2);
    expect(autosave.status).toBe('saved');
  });

  it('reports errors, retries, validates delay and cancels pending work', async () => {
    vi.useFakeTimers();
    const save = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce();
    const autosave = createAutosaveService({ save, debounceMs: 1000 });

    autosave.schedule();
    await vi.advanceTimersByTimeAsync(1000);
    expect(autosave.status).toBe('error');

    autosave.schedule();
    await vi.advanceTimersByTimeAsync(1000);
    expect(save).toHaveBeenCalledTimes(2);
    expect(autosave.status).toBe('saved');

    autosave.schedule();
    autosave.cancel();
    await vi.runAllTimersAsync();
    expect(save).toHaveBeenCalledTimes(2);
    expect(autosave.status).toBe('idle');

    expect(() => createAutosaveService({ save, debounceMs: 799 })).toThrow(RangeError);
    expect(() => createAutosaveService({ save, debounceMs: 1501 })).toThrow(RangeError);
  });
});

function createDeferred(): {
  promise: Promise<void>;
  resolve: () => void;
} {
  let resolve = (): void => undefined;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}
