export interface FullscreenState {
  enabled: boolean;
}

export type FullscreenChangeHandler = (state: FullscreenState) => void;

export interface FullscreenController {
  getState: () => FullscreenState;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
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

  const setEnabled = (nextEnabled: boolean): void => {
    if (enabled === nextEnabled) {
      return;
    }

    enabled = nextEnabled;
    root.classList.toggle('editor-shell--fullscreen', enabled);
    root.setAttribute('data-fullscreen', String(enabled));
    onChange?.({ enabled });
  };

  root.classList.toggle('editor-shell--fullscreen', enabled);
  root.setAttribute('data-fullscreen', String(enabled));

  return {
    getState: () => ({ enabled }),
    setEnabled,
    toggle: () => setEnabled(!enabled),
  };
}
