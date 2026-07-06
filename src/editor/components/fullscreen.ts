export interface FullscreenState {
  enabled: boolean;
}

export type FullscreenChangeHandler = (state: FullscreenState) => void;
