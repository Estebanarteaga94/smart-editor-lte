export interface FullscreenState {
  enabled: boolean;
}

export type FullscreenChangeHandler = (state: FullscreenState) => void;

export interface FullscreenController {
  getState: () => FullscreenState;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
  destroy: () => void;
}

export interface CreateFullscreenControllerOptions {
  root: HTMLElement;
  initialState?: FullscreenState;
  onChange?: FullscreenChangeHandler;
}

/** Controls the visual fullscreen state without changing the editor content mode. */
export function createFullscreenController({
  root,
  initialState = { enabled: false },
  onChange,
}: CreateFullscreenControllerOptions): FullscreenController {
  let enabled = initialState.enabled;
  let restoreMarker: Comment | null = null;

  const moveToDocumentBody = (): void => {
    if (!root.parentNode || root.parentNode === root.ownerDocument.body) {
      return;
    }

    restoreMarker = root.ownerDocument.createComment('smart-editor-fullscreen');
    root.parentNode.insertBefore(restoreMarker, root);
    root.ownerDocument.body.append(root);
  };

  const restoreOriginalPosition = (): void => {
    if (!restoreMarker) {
      return;
    }

    if (restoreMarker.parentNode) {
      restoreMarker.parentNode.replaceChild(root, restoreMarker);
    } else {
      restoreMarker.remove();
    }

    restoreMarker = null;
  };

  const setEnabled = (nextEnabled: boolean): void => {
    if (enabled === nextEnabled) {
      return;
    }

    if (nextEnabled) {
      moveToDocumentBody();
    }

    enabled = nextEnabled;
    root.classList.toggle('editor-shell--fullscreen', enabled);
    root.setAttribute('data-fullscreen', String(enabled));

    if (!nextEnabled) {
      restoreOriginalPosition();
    }

    onChange?.({ enabled });
  };

  root.classList.toggle('editor-shell--fullscreen', enabled);
  root.setAttribute('data-fullscreen', String(enabled));

  return {
    getState: () => ({ enabled }),
    setEnabled,
    toggle: () => setEnabled(!enabled),
    destroy: () => {
      enabled = false;
      root.classList.remove('editor-shell--fullscreen');
      root.setAttribute('data-fullscreen', 'false');
      restoreOriginalPosition();
    },
  };
}
