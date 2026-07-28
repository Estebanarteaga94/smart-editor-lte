import { debounce, type DebouncedFunction } from '../utils/debounce';

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface AutosaveService {
  readonly status: AutosaveStatus;
  schedule(): void;
  flush(): Promise<void>;
  cancel(): void;
}

export interface AutosaveServiceOptions {
  save: () => Promise<void>;
  debounceMs?: number;
  onStatusChange?: (status: AutosaveStatus) => void;
}

export const minAutosaveDebounceMs = 800;
export const maxAutosaveDebounceMs = 1500;
export const defaultAutosaveDebounceMs = 1000;

export function createAutosaveService({
  save,
  debounceMs = defaultAutosaveDebounceMs,
  onStatusChange,
}: AutosaveServiceOptions): AutosaveService {
  assertValidDebounce(debounceMs);

  let status: AutosaveStatus = 'idle';
  let revision = 0;
  let savedRevision = 0;
  let activeSave: Promise<void> | null = null;
  let cancelled = false;

  const setStatus = (nextStatus: AutosaveStatus): void => {
    if (cancelled || status === nextStatus) {
      return;
    }

    status = nextStatus;
    onStatusChange?.(status);
  };

  const saveLatest = async (): Promise<void> => {
    if (cancelled || savedRevision >= revision) {
      return;
    }

    if (activeSave) {
      await activeSave;

      if (!cancelled && savedRevision < revision) {
        await saveLatest();
      }

      return;
    }

    const savingRevision = revision;
    setStatus('saving');
    const operation = save();
    activeSave = operation;

    try {
      await operation;
      savedRevision = savingRevision;

      if (savedRevision === revision) {
        setStatus('saved');
      } else {
        setStatus('pending');
      }
    } catch (error) {
      setStatus('error');
      throw error;
    } finally {
      activeSave = null;
    }
  };

  const scheduledSave: DebouncedFunction<[]> = debounce(() => {
    void saveLatest().catch(() => {
      // The status callback reports automatic-save failures to the UI.
    });
  }, debounceMs);

  return {
    get status() {
      return status;
    },
    schedule() {
      if (cancelled) {
        return;
      }

      revision += 1;
      setStatus('pending');
      scheduledSave();
    },
    async flush() {
      if (cancelled) {
        return;
      }

      scheduledSave.cancel();

      if (savedRevision === revision && !activeSave) {
        revision += 1;
      }

      await saveLatest();
    },
    cancel() {
      if (cancelled) {
        return;
      }

      scheduledSave.cancel();
      cancelled = true;
      status = 'idle';
    },
  };
}

function assertValidDebounce(debounceMs: number): void {
  if (
    !Number.isInteger(debounceMs) ||
    debounceMs < minAutosaveDebounceMs ||
    debounceMs > maxAutosaveDebounceMs
  ) {
    throw new RangeError(
      `Autosave debounce must be an integer between ${minAutosaveDebounceMs} and ${maxAutosaveDebounceMs} ms.`,
    );
  }
}
