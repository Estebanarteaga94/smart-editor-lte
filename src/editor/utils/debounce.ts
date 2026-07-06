export type DebouncedFunction<TArgs extends readonly unknown[]> = {
  (...args: TArgs): void;
  cancel: () => void;
};

export function debounce<TArgs extends readonly unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs: number,
): DebouncedFunction<TArgs> {
  let timeoutId: number | undefined;

  const debounced = (...args: TArgs): void => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), delayMs);
  };

  debounced.cancel = (): void => {
    window.clearTimeout(timeoutId);
    timeoutId = undefined;
  };

  return debounced;
}
