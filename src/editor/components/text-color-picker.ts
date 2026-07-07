import type { EditorLifecycle } from '../core/editor-lifecycle';

export type TextColorValue = `#${string}`;

export interface TextColorOption {
  value: TextColorValue;
  label: string;
}

export interface TextColorPickerOptions {
  lifecycle: EditorLifecycle;
  value?: TextColorValue | null;
  disabled?: boolean;
  actionPrefix?: string;
  triggerLabel?: string;
  triggerIcon?: string;
  automaticLabel?: string;
  automaticAriaLabel?: string;
  inputLabel?: string;
  moreColorsLabel?: string;
  themeTitle?: string;
  standardTitle?: string;
  onChange: (color: TextColorValue) => void;
  onClear: () => void;
}

export interface TextColorPicker {
  element: HTMLElement;
  triggerButton: HTMLButtonElement;
  panel: HTMLElement;
  automaticButton: HTMLButtonElement;
  colorInput: HTMLInputElement;
  moreColorsButton: HTMLButtonElement;
  swatches: HTMLButtonElement[];
  setValue: (value: TextColorValue | null) => void;
  setDisabled: (disabled: boolean) => void;
}

export const defaultTextColor: TextColorValue = '#1f2937';

const themeColorColumns: readonly (readonly TextColorOption[])[] = [
  [
    { value: '#ffffff', label: 'Blanco' },
    { value: '#f2f2f2', label: 'Blanco 5%' },
    { value: '#d9d9d9', label: 'Blanco 15%' },
    { value: '#bfbfbf', label: 'Blanco 25%' },
    { value: '#a6a6a6', label: 'Blanco 35%' },
    { value: '#808080', label: 'Blanco 50%' },
  ],
  [
    { value: '#000000', label: 'Negro' },
    { value: '#7f7f7f', label: 'Negro 50%' },
    { value: '#595959', label: 'Negro 65%' },
    { value: '#3f3f3f', label: 'Negro 75%' },
    { value: '#262626', label: 'Negro 85%' },
    { value: '#0d0d0d', label: 'Negro 95%' },
  ],
  [
    { value: '#44546a', label: 'Azul gris' },
    { value: '#d6dce5', label: 'Azul gris claro 80%' },
    { value: '#acb9ca', label: 'Azul gris claro 60%' },
    { value: '#8497b0', label: 'Azul gris claro 40%' },
    { value: '#323e4f', label: 'Azul gris oscuro 25%' },
    { value: '#222a35', label: 'Azul gris oscuro 50%' },
  ],
  [
    { value: '#5b9bd5', label: 'Azul' },
    { value: '#deebf7', label: 'Azul claro 80%' },
    { value: '#bdd7ee', label: 'Azul claro 60%' },
    { value: '#9dc3e6', label: 'Azul claro 40%' },
    { value: '#2f75b5', label: 'Azul oscuro 25%' },
    { value: '#1f4e79', label: 'Azul oscuro 50%' },
  ],
  [
    { value: '#ed7d31', label: 'Naranja' },
    { value: '#fce4d6', label: 'Naranja claro 80%' },
    { value: '#f8cbad', label: 'Naranja claro 60%' },
    { value: '#f4b183', label: 'Naranja claro 40%' },
    { value: '#c55a11', label: 'Naranja oscuro 25%' },
    { value: '#833c0c', label: 'Naranja oscuro 50%' },
  ],
  [
    { value: '#ffc000', label: 'Dorado' },
    { value: '#fff2cc', label: 'Dorado claro 80%' },
    { value: '#ffe699', label: 'Dorado claro 60%' },
    { value: '#ffd966', label: 'Dorado claro 40%' },
    { value: '#bf9000', label: 'Dorado oscuro 25%' },
    { value: '#7f6000', label: 'Dorado oscuro 50%' },
  ],
  [
    { value: '#4472c4', label: 'Azul intenso' },
    { value: '#d9e2f3', label: 'Azul intenso claro 80%' },
    { value: '#b4c6e7', label: 'Azul intenso claro 60%' },
    { value: '#8eaadb', label: 'Azul intenso claro 40%' },
    { value: '#2f5597', label: 'Azul intenso oscuro 25%' },
    { value: '#1f3864', label: 'Azul intenso oscuro 50%' },
  ],
  [
    { value: '#70ad47', label: 'Verde' },
    { value: '#e2f0d9', label: 'Verde claro 80%' },
    { value: '#c6e0b4', label: 'Verde claro 60%' },
    { value: '#a9d18e', label: 'Verde claro 40%' },
    { value: '#548235', label: 'Verde oscuro 25%' },
    { value: '#375623', label: 'Verde oscuro 50%' },
  ],
];

const standardColorOptions: readonly TextColorOption[] = [
  { value: '#ff0000', label: 'Rojo' },
  { value: '#ffc000', label: 'Dorado' },
  { value: '#ffff00', label: 'Amarillo' },
  { value: '#92d050', label: 'Verde claro' },
  { value: '#00b050', label: 'Verde' },
  { value: '#00b0f0', label: 'Celeste' },
  { value: '#0070c0', label: 'Azul' },
  { value: '#002060', label: 'Azul oscuro' },
  { value: '#7030a0', label: 'Violeta' },
];

let colorPickerId = 0;

export function createTextColorPicker({
  lifecycle,
  value = null,
  disabled = false,
  actionPrefix = 'text-color',
  triggerLabel = 'Color de texto',
  triggerIcon = 'A',
  automaticLabel = 'Automatico',
  automaticAriaLabel = 'Usar color automatico',
  inputLabel = 'Seleccionar mas colores',
  moreColorsLabel = 'Mas colores...',
  themeTitle = 'Colores de tema',
  standardTitle = 'Colores estandar',
  onChange,
  onClear,
}: TextColorPickerOptions): TextColorPicker {
  const panelId = `editor-text-color-picker-panel-${(colorPickerId += 1)}`;
  const element = document.createElement('div');
  const triggerButton = createTriggerButton(panelId, actionPrefix, triggerLabel, triggerIcon);
  const panel = document.createElement('div');
  const automaticButton = createAutomaticButton(actionPrefix, automaticLabel, automaticAriaLabel);
  const themeTitleElement = createSectionTitle(themeTitle);
  const themeGrid = createThemeGrid(actionPrefix, themeTitle);
  const standardTitleElement = createSectionTitle(standardTitle);
  const standardGrid = createStandardGrid(actionPrefix, standardTitle);
  const moreColorsButton = createMoreColorsButton(actionPrefix, moreColorsLabel);
  const customPanel = document.createElement('div');
  const colorInput = document.createElement('input');
  const swatches = [
    ...themeGrid.querySelectorAll<HTMLButtonElement>(
      `[data-toolbar-action="${actionPrefix}-swatch"]`,
    ),
    ...standardGrid.querySelectorAll<HTMLButtonElement>(
      `[data-toolbar-action="${actionPrefix}-swatch"]`,
    ),
  ];
  let currentValue = normalizeTextColor(value);
  let currentDisabled = disabled;
  let open = false;
  let customOpen = false;

  element.className = 'editor-text-color-picker';
  element.dataset.toolbarAction = `${actionPrefix}-picker`;
  element.setAttribute('aria-label', triggerLabel);

  panel.id = panelId;
  panel.className = 'editor-text-color-picker__panel';
  panel.dataset.toolbarAction = `${actionPrefix}-panel`;
  panel.hidden = true;

  colorInput.type = 'color';
  colorInput.className = 'editor-text-color-picker__input';
  colorInput.dataset.toolbarAction = `${actionPrefix}-input`;
  colorInput.title = inputLabel;
  colorInput.setAttribute('aria-label', inputLabel);

  customPanel.className = 'editor-text-color-picker__custom';
  customPanel.dataset.toolbarAction = `${actionPrefix}-custom`;
  customPanel.hidden = true;
  customPanel.append(colorInput);

  panel.append(
    automaticButton,
    themeTitleElement,
    themeGrid,
    standardTitleElement,
    standardGrid,
    moreColorsButton,
    customPanel,
  );
  element.append(triggerButton, panel);

  lifecycle.addEventListener(triggerButton, 'click', () => {
    if (triggerButton.disabled) {
      return;
    }

    open = !open;
    updateState();
  });

  lifecycle.addEventListener(automaticButton, 'click', () => {
    if (automaticButton.disabled) {
      return;
    }

    currentValue = null;
    customOpen = false;
    open = false;
    updateState();
    onClear();
  });

  lifecycle.addEventListener(moreColorsButton, 'click', () => {
    if (moreColorsButton.disabled) {
      return;
    }

    customOpen = !customOpen;
    updateState();
    colorInput.focus();
  });

  lifecycle.addEventListener(colorInput, 'input', () => {
    const color = normalizeTextColor(colorInput.value);

    if (!color) {
      return;
    }

    currentValue = color;
    updateState();
    onChange(color);
  });

  for (const swatch of swatches) {
    lifecycle.addEventListener(swatch, 'click', () => {
      const color = normalizeTextColor(swatch.dataset.textColor);

      if (!color || swatch.disabled) {
        return;
      }

      currentValue = color;
      customOpen = false;
      open = false;
      updateState();
      onChange(color);
    });
  }

  lifecycle.addEventListener(document, 'pointerdown', (event) => {
    if (!open || event.target instanceof Node === false || element.contains(event.target)) {
      return;
    }

    open = false;
    updateState();
  });

  const picker: TextColorPicker = {
    element,
    triggerButton,
    panel,
    automaticButton,
    colorInput,
    moreColorsButton,
    swatches,
    setValue: (nextValue) => {
      currentValue = normalizeTextColor(nextValue);
      updateState();
    },
    setDisabled: (nextDisabled) => {
      currentDisabled = nextDisabled;
      if (currentDisabled) {
        open = false;
      }

      updateState();
    },
  };

  updateState();

  return picker;

  function updateState(): void {
    triggerButton.disabled = currentDisabled;
    triggerButton.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    automaticButton.disabled = currentDisabled;
    automaticButton.dataset.active = String(currentValue === null);
    colorInput.disabled = currentDisabled;
    colorInput.value = currentValue ?? defaultTextColor;
    moreColorsButton.disabled = currentDisabled;
    moreColorsButton.setAttribute('aria-expanded', String(customOpen));
    customPanel.hidden = !customOpen;
    updateTriggerPreview(triggerButton, currentValue);

    for (const swatch of swatches) {
      const isActive = normalizeTextColor(swatch.dataset.textColor) === currentValue;

      swatch.disabled = currentDisabled;
      swatch.dataset.active = String(isActive);
      swatch.setAttribute('aria-pressed', String(isActive));
    }
  }
}

export function normalizeTextColor(value: unknown): TextColorValue | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.toLowerCase();

  return isSupportedTextColor(normalized) ? normalized : null;
}

export function isSupportedTextColor(value: unknown): value is TextColorValue {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

function createTriggerButton(
  panelId: string,
  actionPrefix: string,
  label: string,
  iconText: string,
): HTMLButtonElement {
  const button = document.createElement('button');
  const icon = document.createElement('span');
  const preview = document.createElement('span');

  button.type = 'button';
  button.className = 'editor-shell__tool editor-text-color-picker__trigger';
  button.dataset.toolbarAction = `${actionPrefix}-trigger`;
  button.title = label;
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', panelId);

  icon.className = 'editor-shell__tool-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = iconText;

  preview.className = 'editor-text-color-picker__preview';
  preview.setAttribute('aria-hidden', 'true');

  button.append(icon, preview);

  return button;
}

function createAutomaticButton(
  actionPrefix: string,
  labelText: string,
  ariaLabel: string,
): HTMLButtonElement {
  const button = document.createElement('button');
  const swatch = document.createElement('span');
  const label = document.createElement('span');

  button.type = 'button';
  button.className = 'editor-text-color-picker__automatic';
  button.dataset.toolbarAction = `${actionPrefix}-automatic`;
  button.setAttribute('aria-label', ariaLabel);

  swatch.className = 'editor-text-color-picker__automatic-swatch';
  swatch.setAttribute('aria-hidden', 'true');

  label.textContent = labelText;

  button.append(swatch, label);

  return button;
}

function createSectionTitle(label: string): HTMLDivElement {
  const title = document.createElement('div');

  title.className = 'editor-text-color-picker__section-title';
  title.textContent = label;

  return title;
}

function createThemeGrid(actionPrefix: string, label: string): HTMLDivElement {
  const grid = document.createElement('div');

  grid.className = 'editor-text-color-picker__theme-grid';
  grid.dataset.toolbarAction = `${actionPrefix}-theme-grid`;
  grid.setAttribute('aria-label', label);

  for (const column of themeColorColumns) {
    const columnElement = document.createElement('div');
    columnElement.className = 'editor-text-color-picker__theme-column';
    columnElement.append(...column.map((color) => createTextColorSwatch(color, actionPrefix)));
    grid.append(columnElement);
  }

  return grid;
}

function createStandardGrid(actionPrefix: string, label: string): HTMLDivElement {
  const grid = document.createElement('div');

  grid.className = 'editor-text-color-picker__standard-grid';
  grid.dataset.toolbarAction = `${actionPrefix}-standard-grid`;
  grid.setAttribute('aria-label', label);
  grid.append(...standardColorOptions.map((color) => createTextColorSwatch(color, actionPrefix)));

  return grid;
}

function createMoreColorsButton(actionPrefix: string, labelText: string): HTMLButtonElement {
  const button = document.createElement('button');
  const icon = document.createElement('span');
  const label = document.createElement('span');

  button.type = 'button';
  button.className = 'editor-text-color-picker__more';
  button.dataset.toolbarAction = `${actionPrefix}-more`;
  button.setAttribute('aria-label', labelText);
  button.setAttribute('aria-expanded', 'false');

  icon.className = 'editor-text-color-picker__more-icon';
  icon.setAttribute('aria-hidden', 'true');

  label.textContent = labelText;

  button.append(icon, label);

  return button;
}

function createTextColorSwatch(config: TextColorOption, actionPrefix: string): HTMLButtonElement {
  const button = document.createElement('button');
  const swatch = document.createElement('span');

  button.type = 'button';
  button.className = 'editor-text-color-picker__swatch-button';
  button.dataset.toolbarAction = `${actionPrefix}-swatch`;
  button.dataset.textColor = config.value;
  button.title = `Aplicar color ${config.label}`;
  button.setAttribute('aria-label', `Aplicar color ${config.label}`);
  button.setAttribute('aria-pressed', 'false');

  swatch.className = 'editor-text-color-picker__swatch';
  swatch.style.backgroundColor = config.value;
  swatch.setAttribute('aria-hidden', 'true');
  button.append(swatch);

  return button;
}

function updateTriggerPreview(button: HTMLButtonElement, color: TextColorValue | null): void {
  const preview = button.querySelector<HTMLElement>('.editor-text-color-picker__preview');

  if (!preview) {
    return;
  }

  preview.style.backgroundColor = color ?? defaultTextColor;
}
