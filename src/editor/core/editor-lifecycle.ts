import type { DebouncedFunction } from '../utils/debounce';

export type CleanupCallback = () => void;

export interface DestroyableResource {
  destroy: () => void;
}

export interface LifecycleRegistration {
  cleanup: () => void;
}

interface CleanupEntry {
  cleanup: CleanupCallback;
  active: boolean;
}

export class EditorLifecycle {
  private readonly cleanupEntries: CleanupEntry[] = [];
  private rootElement: HTMLElement | null = null;
  private tiptapEditor: DestroyableResource | null = null;
  private tiptapEditorEntry: CleanupEntry | null = null;
  private sourceView: DestroyableResource | null = null;
  private sourceViewEntry: CleanupEntry | null = null;
  private disposed = false;

  mountRoot(container: HTMLElement, root: HTMLElement): void {
    this.ensureActive();
    this.rootElement?.remove();
    this.rootElement = root;
    container.replaceChildren(root);
  }

  registerTiptapEditor(editor: DestroyableResource): LifecycleRegistration {
    this.ensureActive();
    this.destroyTiptapEditor();
    this.tiptapEditor = editor;

    const entry = this.addCleanupEntry(() => {
      if (this.tiptapEditor === editor) {
        this.tiptapEditor = null;
        this.tiptapEditorEntry = null;
      }

      editor.destroy();
    });

    this.tiptapEditorEntry = entry;

    return {
      cleanup: () => this.runCleanupEntry(entry),
    };
  }

  registerSourceView(view: DestroyableResource): LifecycleRegistration {
    this.ensureActive();
    this.destroySourceView();
    this.sourceView = view;

    const entry = this.addCleanupEntry(() => {
      if (this.sourceView === view) {
        this.sourceView = null;
        this.sourceViewEntry = null;
      }

      view.destroy();
    });

    this.sourceViewEntry = entry;

    return {
      cleanup: () => this.runCleanupEntry(entry),
    };
  }

  destroySourceView(): void {
    this.destroyCurrentResource('sourceView');
  }

  addEventListener<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    listener: (event: WindowEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): LifecycleRegistration;
  addEventListener<K extends keyof DocumentEventMap>(
    target: Document,
    type: K,
    listener: (event: DocumentEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): LifecycleRegistration;
  addEventListener<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): LifecycleRegistration;
  addEventListener(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions,
  ): LifecycleRegistration {
    this.ensureActive();
    target.addEventListener(type, listener, options);

    return this.registerCleanup(() => {
      target.removeEventListener(type, listener, options);
    });
  }

  registerTimer(timerId: number): LifecycleRegistration {
    this.ensureActive();

    return this.registerCleanup(() => {
      window.clearTimeout(timerId);
    });
  }

  registerInterval(intervalId: number): LifecycleRegistration {
    this.ensureActive();

    return this.registerCleanup(() => {
      window.clearInterval(intervalId);
    });
  }

  registerDebounce<TArgs extends readonly unknown[]>(
    debouncedFunction: DebouncedFunction<TArgs>,
  ): LifecycleRegistration {
    this.ensureActive();

    return this.registerCleanup(() => {
      debouncedFunction.cancel();
    });
  }

  registerCleanup(cleanup: CleanupCallback): LifecycleRegistration {
    this.ensureActive();
    const entry = this.addCleanupEntry(cleanup);

    return {
      cleanup: () => this.runCleanupEntry(entry),
    };
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    for (let index = this.cleanupEntries.length - 1; index >= 0; index -= 1) {
      this.runCleanupEntry(this.cleanupEntries[index]);
    }

    this.cleanupEntries.length = 0;
    this.tiptapEditor = null;
    this.tiptapEditorEntry = null;
    this.sourceView = null;
    this.sourceViewEntry = null;
    this.rootElement?.remove();
    this.rootElement = null;
  }

  private addCleanupEntry(cleanup: CleanupCallback): CleanupEntry {
    const entry: CleanupEntry = {
      cleanup,
      active: true,
    };

    this.cleanupEntries.push(entry);

    return entry;
  }

  private destroyTiptapEditor(): void {
    this.destroyCurrentResource('tiptapEditor');
  }

  private destroyCurrentResource(resourceName: 'tiptapEditor' | 'sourceView'): void {
    const cleanupEntry =
      resourceName === 'tiptapEditor' ? this.tiptapEditorEntry : this.sourceViewEntry;

    this.runCleanupEntry(cleanupEntry ?? undefined);
  }

  private runCleanupEntry(entry: CleanupEntry | undefined): void {
    if (!entry?.active) {
      return;
    }

    entry.active = false;
    entry.cleanup();
  }

  private ensureActive(): void {
    if (this.disposed) {
      throw new Error('Editor lifecycle is already disposed');
    }
  }
}

export function createEditorLifecycle(): EditorLifecycle {
  return new EditorLifecycle();
}
