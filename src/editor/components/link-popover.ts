import type { EditorLifecycle } from '../core/editor-lifecycle';

export interface LinkPopoverOptions {
  lifecycle: EditorLifecycle;
  href?: string | null;
  disabled?: boolean;
  onOpen?: () => void;
  onApply: (href: string) => boolean;
  onRemove: () => void;
}

export interface LinkPopover {
  element: HTMLElement;
  triggerButton: HTMLButtonElement;
  panel: HTMLElement;
  input: HTMLInputElement;
  applyButton: HTMLButtonElement;
  removeButton: HTMLButtonElement;
  errorMessage: HTMLElement;
  setHref: (href: string | null) => void;
  setActive: (active: boolean) => void;
  setDisabled: (disabled: boolean) => void;
}

let linkPopoverId = 0;

const invalidUrlMessage =
  'URL no permitida. Usa http, https, mailto, una ruta relativa o un ancla.';

export function createLinkPopover({
  lifecycle,
  href = null,
  disabled = false,
  onOpen,
  onApply,
  onRemove,
}: LinkPopoverOptions): LinkPopover {
  const panelId = `editor-link-popover-panel-${(linkPopoverId += 1)}`;
  const errorId = `${panelId}-error`;
  const element = document.createElement('div');
  const triggerButton = createTriggerButton(panelId);
  const panel = document.createElement('form');
  const input = document.createElement('input');
  const actions = document.createElement('div');
  const applyButton = document.createElement('button');
  const removeButton = document.createElement('button');
  const errorMessage = document.createElement('p');
  let currentHref = normalizeHrefValue(href);
  let currentDisabled = disabled;
  let active = false;
  let open = false;

  element.className = 'editor-link-popover';
  element.dataset.toolbarAction = 'link-popover';

  panel.id = panelId;
  panel.className = 'editor-link-popover__panel';
  panel.dataset.toolbarAction = 'link-panel';
  panel.hidden = true;
  panel.noValidate = true;

  input.type = 'url';
  input.className = 'editor-link-popover__input';
  input.dataset.toolbarAction = 'link-input';
  input.placeholder = 'https://ejemplo.com';
  input.setAttribute('aria-label', 'URL del enlace');
  input.setAttribute('aria-describedby', errorId);

  actions.className = 'editor-link-popover__actions';

  applyButton.type = 'submit';
  applyButton.className = 'editor-link-popover__button editor-link-popover__button--primary';
  applyButton.dataset.toolbarAction = 'link-apply';
  applyButton.textContent = 'Aplicar';
  applyButton.setAttribute('aria-label', 'Aplicar enlace');

  removeButton.type = 'button';
  removeButton.className = 'editor-link-popover__button';
  removeButton.dataset.toolbarAction = 'link-remove';
  removeButton.textContent = 'Quitar';
  removeButton.setAttribute('aria-label', 'Quitar enlace');

  errorMessage.id = errorId;
  errorMessage.className = 'editor-link-popover__error';
  errorMessage.dataset.toolbarAction = 'link-error';
  errorMessage.textContent = invalidUrlMessage;
  errorMessage.hidden = true;

  actions.append(applyButton, removeButton);
  panel.append(input, actions, errorMessage);
  element.append(triggerButton, panel);

  lifecycle.addEventListener(triggerButton, 'mousedown', (event) => {
    event.preventDefault();
  });

  lifecycle.addEventListener(triggerButton, 'click', () => {
    if (triggerButton.disabled) {
      return;
    }

    open = !open;
    if (open) {
      onOpen?.();
    }

    clearError();
    updateState();

    if (open) {
      input.focus();
      input.select();
    }
  });

  lifecycle.addEventListener(panel, 'submit', (event) => {
    event.preventDefault();
    applyCurrentHref();
  });

  lifecycle.addEventListener(applyButton, 'click', (event) => {
    event.preventDefault();
    applyCurrentHref();
  });

  function applyCurrentHref(): void {
    if (currentDisabled) {
      return;
    }

    const applied = onApply(input.value);

    if (!applied) {
      showError();
      input.focus();
      return;
    }

    currentHref = input.value.trim();
    open = false;
    clearError();
    updateState();
  }

  lifecycle.addEventListener(removeButton, 'click', () => {
    if (removeButton.disabled) {
      return;
    }

    onRemove();
    currentHref = null;
    open = false;
    clearError();
    updateState();
  });

  lifecycle.addEventListener(input, 'input', () => {
    clearError();
  });

  lifecycle.addEventListener(document, 'pointerdown', (event) => {
    if (!open || event.target instanceof Node === false || element.contains(event.target)) {
      return;
    }

    open = false;
    clearError();
    updateState();
  });

  const popover: LinkPopover = {
    element,
    triggerButton,
    panel,
    input,
    applyButton,
    removeButton,
    errorMessage,
    setHref: (nextHref) => {
      currentHref = normalizeHrefValue(nextHref);
      if (!open) {
        input.value = currentHref ?? '';
      }

      updateState();
    },
    setActive: (nextActive) => {
      active = nextActive;
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

  return popover;

  function updateState(): void {
    triggerButton.disabled = currentDisabled;
    triggerButton.dataset.active = String(active);
    triggerButton.setAttribute('aria-expanded', String(open));
    triggerButton.setAttribute('aria-pressed', String(active));
    panel.hidden = !open;
    input.disabled = currentDisabled;
    applyButton.disabled = currentDisabled;
    removeButton.disabled = currentDisabled || !currentHref;

    if (!open) {
      input.value = currentHref ?? '';
    }
  }

  function showError(): void {
    errorMessage.hidden = false;
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(): void {
    errorMessage.hidden = true;
    input.removeAttribute('aria-invalid');
  }
}

function createTriggerButton(panelId: string): HTMLButtonElement {
  const button = document.createElement('button');
  const icon = document.createElement('span');

  button.type = 'button';
  button.className = 'editor-shell__tool editor-link-popover__trigger';
  button.dataset.toolbarAction = 'link-trigger';
  button.title = 'Configurar enlace';
  button.setAttribute('aria-label', 'Configurar enlace');
  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', panelId);
  button.setAttribute('aria-pressed', 'false');

  icon.className = 'editor-shell__tool-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '\ue820';

  button.append(icon);

  return button;
}

function normalizeHrefValue(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}
