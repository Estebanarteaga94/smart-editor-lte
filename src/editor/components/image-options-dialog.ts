import type { Editor } from '@tiptap/core';

import {
  editorCommands,
  setImageAlign,
  type ImageAlignment,
  type ImageDimensionValue,
} from '../core/editor-commands';
import type { EditorLifecycle } from '../core/editor-lifecycle';

export interface ImageOptionsDialogOptions {
  editor: Editor;
  lifecycle: EditorLifecycle;
}

export interface ImageOptionsDialog {
  element: HTMLElement;
  updateState: () => void;
}

interface ImageDimensions {
  width: ImageDimensionValue;
  height: ImageDimensionValue;
}

const dialogGap = 8;
const viewportMargin = 8;
const fallbackDialogWidth = 312;
const fallbackDialogHeight = 44;
const maxPositionRetries = 12;

const imageAlignments: readonly { alignment: ImageAlignment; icon: string; ariaLabel: string }[] = [
  { alignment: 'left', icon: '\ue883', ariaLabel: 'Alinear imagen a la izquierda' },
  { alignment: 'center', icon: '\ue884', ariaLabel: 'Alinear imagen al centro' },
  { alignment: 'right', icon: '\ue885', ariaLabel: 'Alinear imagen a la derecha' },
];

export function createImageOptionsDialog({
  editor,
  lifecycle,
}: ImageOptionsDialogOptions): ImageOptionsDialog {
  const element = document.createElement('section');
  const title = document.createElement('strong');
  const alignmentGroup = document.createElement('div');
  const dimensionGroup = document.createElement('div');
  const widthInput = createImageDimensionInput('image-options-width', 'Ancho de imagen en pixeles');
  const heightInput = createImageDimensionInput(
    'image-options-height',
    'Alto de imagen en pixeles',
  );
  const clearDimensionsButton = createImageOptionButton({
    action: 'image-options-clear-dimensions',
    ariaLabel: 'Restablecer dimensiones de imagen',
    icon: '\ue81b',
  });
  const alignmentButtons = new Map<ImageAlignment, HTMLButtonElement>();
  let selectedImagePosition: number | null = null;
  let pendingPositionFrame: number | null = null;
  let pendingLayoutFrame: number | null = null;
  let positionRetryCount = 0;

  element.className = 'editor-image-options';
  element.dataset.imageOptions = 'dialog';
  element.hidden = true;
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-label', 'Opciones de imagen');

  title.className = 'editor-image-options__title';
  title.textContent = 'Imagen';

  alignmentGroup.className = 'editor-image-options__group';
  alignmentGroup.setAttribute('role', 'group');
  alignmentGroup.setAttribute('aria-label', 'Alineacion de imagen');

  for (const config of imageAlignments) {
    const button = createImageOptionButton({
      action: `image-options-align-${config.alignment}`,
      ariaLabel: config.ariaLabel,
      icon: config.icon,
    });

    button.setAttribute('aria-pressed', 'false');
    alignmentButtons.set(config.alignment, button);
    alignmentGroup.append(button);

    lifecycle.addEventListener(button, 'mousedown', (event) => {
      event.preventDefault();
    });
    lifecycle.addEventListener(button, 'click', () => {
      restoreSelectedImage();
      setImageAlign(editor, config.alignment);
      updateState();
      scheduleLayoutPositionUpdate();
    });
  }

  dimensionGroup.className = 'editor-image-options__dimensions';
  dimensionGroup.append(widthInput, heightInput, clearDimensionsButton);

  for (const input of [widthInput, heightInput]) {
    lifecycle.addEventListener(input, 'focus', () => {
      preserveSelectedImage();
    });
    lifecycle.addEventListener(input, 'change', applyDimensions);
    lifecycle.addEventListener(input, 'keydown', (event) => {
      if (event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      applyDimensions();
    });
  }

  lifecycle.addEventListener(clearDimensionsButton, 'mousedown', (event) => {
    event.preventDefault();
  });
  lifecycle.addEventListener(clearDimensionsButton, 'click', () => {
    restoreSelectedImage();
    editorCommands.setImageDimensions(editor, { width: null, height: null });
    updateState();
    scheduleLayoutPositionUpdate();
  });

  element.append(title, alignmentGroup, dimensionGroup);

  const refresh = (): void => {
    updateState();

    if (!element.hidden) {
      scheduleLayoutPositionUpdate();
    }
  };

  editor.on('selectionUpdate', refresh);
  editor.on('transaction', refresh);
  editor.on('update', refresh);
  lifecycle.registerCleanup(() => {
    editor.off('selectionUpdate', refresh);
    editor.off('transaction', refresh);
    editor.off('update', refresh);
  });
  lifecycle.registerCleanup(() => {
    cancelScheduledPositionUpdate();
    cancelScheduledLayoutUpdate();
  });

  updateState();

  return {
    element,
    updateState,
  };

  function updateState(): void {
    if (editor.isDestroyed || !editor.isEditable || !editor.isActive('image')) {
      element.hidden = true;
      selectedImagePosition = null;
      positionRetryCount = 0;
      cancelScheduledPositionUpdate();
      cancelScheduledLayoutUpdate();
      return;
    }

    preserveSelectedImage();
    element.hidden = false;
    updateAlignmentState();
    updateDimensionState();

    if (updatePosition()) {
      positionRetryCount = 0;
      cancelScheduledPositionUpdate();
      return;
    }

    element.hidden = true;
    schedulePositionUpdate();
  }

  function updateAlignmentState(): void {
    const attrs = editor.getAttributes('image') as { align?: unknown };

    for (const [alignment, button] of alignmentButtons) {
      button.dataset.active = String(attrs.align === alignment);
      button.setAttribute('aria-pressed', String(attrs.align === alignment));
    }
  }

  function updateDimensionState(): void {
    const dimensions = getActiveImageDimensions();

    widthInput.value = formatImageDimensionInput(dimensions.width);
    heightInput.value = formatImageDimensionInput(dimensions.height);
    widthInput.removeAttribute('aria-invalid');
    heightInput.removeAttribute('aria-invalid');
  }

  function updatePosition(): boolean {
    if (selectedImagePosition === null) {
      return false;
    }

    try {
      const imageRect = getSelectedImageRect();

      if (!imageRect || !isUsableImageRect(imageRect)) {
        return false;
      }

      const dialogRect = element.getBoundingClientRect();
      const dialogWidth = dialogRect.width > 0 ? dialogRect.width : fallbackDialogWidth;
      const dialogHeight = dialogRect.height > 0 ? dialogRect.height : fallbackDialogHeight;
      const position = calculateDialogPosition(imageRect, dialogWidth, dialogHeight);

      element.style.top = `${position.top}px`;
      element.style.left = `${position.left}px`;
      return true;
    } catch {
      element.style.top = '';
      element.style.left = '';
      return false;
    }
  }

  function schedulePositionUpdate(): void {
    if (pendingPositionFrame !== null || positionRetryCount >= maxPositionRetries) {
      return;
    }

    pendingPositionFrame = window.requestAnimationFrame(() => {
      pendingPositionFrame = null;
      positionRetryCount += 1;
      updateState();
    });
  }

  function cancelScheduledPositionUpdate(): void {
    if (pendingPositionFrame === null) {
      return;
    }

    window.cancelAnimationFrame(pendingPositionFrame);
    pendingPositionFrame = null;
  }

  function scheduleLayoutPositionUpdate(): void {
    if (editor.isDestroyed || !editor.isActive('image')) {
      return;
    }

    cancelScheduledLayoutUpdate();
    pendingLayoutFrame = window.requestAnimationFrame(() => {
      pendingLayoutFrame = null;
      updateState();
    });
  }

  function cancelScheduledLayoutUpdate(): void {
    if (pendingLayoutFrame === null) {
      return;
    }

    window.cancelAnimationFrame(pendingLayoutFrame);
    pendingLayoutFrame = null;
  }

  function getSelectedImageRect(): DOMRect | null {
    if (selectedImagePosition === null) {
      return null;
    }

    const node = editor.view.nodeDOM(selectedImagePosition);

    if (!(node instanceof HTMLElement)) {
      return null;
    }

    const imageElement =
      node.matches('img, [data-node="image"]') || node.querySelector('img, [data-node="image"]')
        ? node
        : null;

    return imageElement?.getBoundingClientRect() ?? null;
  }

  function preserveSelectedImage(): void {
    const imagePosition = getSelectedImagePosition();

    if (imagePosition !== null) {
      selectedImagePosition = imagePosition;
    }
  }

  function restoreSelectedImage(): void {
    if (selectedImagePosition === null || editor.isDestroyed) {
      return;
    }

    editor.commands.setNodeSelection(selectedImagePosition);
  }

  function getSelectedImagePosition(): number | null {
    if (!editor.isActive('image')) {
      return null;
    }

    const { selection } = editor.state;
    const selectedNode = selection.$from.nodeAfter;

    return selectedNode?.type.name === 'image' ? selection.from : null;
  }

  function getActiveImageDimensions(): ImageDimensions {
    const attrs = editor.getAttributes('image') as {
      width?: ImageDimensionValue | string;
      height?: ImageDimensionValue | string;
    };

    return {
      width: normalizeImageDimensionAttribute(attrs.width),
      height: normalizeImageDimensionAttribute(attrs.height),
    };
  }

  function applyDimensions(): void {
    const width = parseImageDimensionInput(widthInput);
    const height = parseImageDimensionInput(heightInput);

    if (width === undefined || height === undefined) {
      return;
    }

    restoreSelectedImage();
    editorCommands.setImageDimensions(editor, { width, height });
    updateState();
    scheduleLayoutPositionUpdate();
  }
}

function isUsableImageRect(rect: DOMRect): boolean {
  return rect.width > 1 && rect.height > 1 && rect.right > rect.left && rect.bottom > rect.top;
}

function calculateDialogPosition(
  imageRect: DOMRect,
  dialogWidth: number,
  dialogHeight: number,
): { top: number; left: number } {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const clampedLeft = clamp(
    imageRect.left,
    viewportMargin,
    viewportWidth - dialogWidth - viewportMargin,
  );
  const clampedTop = clamp(
    imageRect.top,
    viewportMargin,
    viewportHeight - dialogHeight - viewportMargin,
  );
  const candidates = [
    {
      top: imageRect.bottom + dialogGap,
      left: clampedLeft,
      fits: imageRect.bottom + dialogGap + dialogHeight <= viewportHeight - viewportMargin,
    },
    {
      top: imageRect.top - dialogGap - dialogHeight,
      left: clampedLeft,
      fits: imageRect.top - dialogGap - dialogHeight >= viewportMargin,
    },
    {
      top: clampedTop,
      left: imageRect.right + dialogGap,
      fits: imageRect.right + dialogGap + dialogWidth <= viewportWidth - viewportMargin,
    },
    {
      top: clampedTop,
      left: imageRect.left - dialogGap - dialogWidth,
      fits: imageRect.left - dialogGap - dialogWidth >= viewportMargin,
    },
  ];
  const candidate = candidates.find((item) => item.fits) ?? candidates[0];

  return {
    top: Math.round(
      clamp(candidate.top, viewportMargin, viewportHeight - dialogHeight - viewportMargin),
    ),
    left: Math.round(
      clamp(candidate.left, viewportMargin, viewportWidth - dialogWidth - viewportMargin),
    ),
  };
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function createImageOptionButton({
  action,
  ariaLabel,
  icon,
}: {
  action: string;
  ariaLabel: string;
  icon: string;
}): HTMLButtonElement {
  const button = document.createElement('button');
  const iconElement = document.createElement('span');

  button.type = 'button';
  button.className = 'editor-image-options__button';
  button.dataset.imageOptions = action;
  button.title = ariaLabel;
  button.setAttribute('aria-label', ariaLabel);

  iconElement.className = 'editor-image-options__button-icon';
  iconElement.setAttribute('aria-hidden', 'true');
  iconElement.textContent = icon;
  button.append(iconElement);

  return button;
}

function createImageDimensionInput(action: string, ariaLabel: string): HTMLInputElement {
  const input = document.createElement('input');

  input.type = 'number';
  input.className = 'editor-image-options__input';
  input.dataset.imageOptions = action;
  input.min = '1';
  input.step = '1';
  input.inputMode = 'numeric';
  input.setAttribute('aria-label', ariaLabel);
  input.placeholder = action.endsWith('width') ? 'W' : 'H';
  input.title = ariaLabel;

  return input;
}

function parseImageDimensionInput(input: HTMLInputElement): ImageDimensionValue | undefined {
  const value = input.value.trim();

  if (value.length === 0) {
    input.removeAttribute('aria-invalid');
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    input.setAttribute('aria-invalid', 'true');
    return undefined;
  }

  input.removeAttribute('aria-invalid');
  return Math.round(numericValue);
}

function formatImageDimensionInput(value: ImageDimensionValue | string | undefined): string {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return String(Math.round(value));
  }

  if (typeof value !== 'string') {
    return '';
  }

  const numericValue = Number.parseFloat(value);

  return Number.isFinite(numericValue) && numericValue > 0 ? String(Math.round(numericValue)) : '';
}

function normalizeImageDimensionAttribute(
  value: ImageDimensionValue | string | undefined,
): ImageDimensionValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
  }

  const numericValue = Number.parseFloat(value);

  return Number.isFinite(numericValue) && numericValue > 0 ? Math.round(numericValue) : null;
}
