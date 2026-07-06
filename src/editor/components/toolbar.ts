export interface ToolbarButtonConfig {
  id: string;
  label: string;
  ariaLabel: string;
  disabled?: boolean;
  active?: boolean;
}

export type ToolbarActionHandler = (buttonId: string) => void;
