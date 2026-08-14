import { Image, type ImageOptions } from '@tiptap/extension-image';
import { mergeAttributes, ResizableNodeView } from '@tiptap/core';

export interface ResizableImageAttributes {
  src: string;
  title?: string | null;
  alt?: string;
  width?: number | string | null;
  height?: number | string | null;
  align?: ImageAlignment | null;
}

export type ImageAlignment = 'left' | 'center' | 'right';

export const resizableImageExtensionName = 'image';

const validImageAlignments = new Set<ImageAlignment>(['left', 'center', 'right']);

export const ResizableImage = Image.extend<ImageOptions>({
  addOptions() {
    const parentOptions = this.parent?.() ?? {
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
      resize: false,
    };

    return {
      ...parentOptions,
      allowBase64: false,
      resize: {
        enabled: true,
        minWidth: 80,
        minHeight: 40,
        alwaysPreserveAspectRatio: true,
      },
    };
  },

  addAttributes() {
    const parentAttributes = this.parent?.() ?? {};

    return {
      ...parentAttributes,
      width: {
        default: null,
        parseHTML: (element) => parseImageDimension(element.getAttribute('width')),
        renderHTML: (attributes) => renderDimensionAttribute('width', attributes.width),
      },
      height: {
        default: null,
        parseHTML: (element) => parseImageDimension(element.getAttribute('height')),
        renderHTML: (attributes) => renderDimensionAttribute('height', attributes.height),
      },
      align: {
        default: null,
        parseHTML: (element) => parseImageAlignment(element.getAttribute('align')),
        renderHTML: (attributes) => renderAlignAttribute(attributes.align),
      },
    };
  },

  addNodeView() {
    if (!this.options.resize || !this.options.resize.enabled || typeof document === 'undefined') {
      return null;
    }

    const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } = this.options.resize;

    return ({ node, getPos, HTMLAttributes, editor }) => {
      const imageElement = document.createElement('img');

      imageElement.draggable = false;
      syncImageElementAttributes(imageElement, this.options.HTMLAttributes, HTMLAttributes);

      if (HTMLAttributes.src !== null) {
        imageElement.src = HTMLAttributes.src;
      }

      const nodeView = new ResizableNodeView({
        element: imageElement,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          imageElement.style.width = `${width}px`;
          imageElement.style.height = `${height}px`;
        },
        onCommit: (width, height) => {
          const pos = getPos();

          if (pos === undefined) {
            return;
          }

          this.editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes(this.name, {
              width,
              height,
            })
            .run();
        },
        onUpdate: (updatedNode) => {
          if (updatedNode.type !== node.type) {
            return false;
          }

          syncImageElementAttributes(imageElement, this.options.HTMLAttributes, updatedNode.attrs);
          applyImageNodeViewAlignment(nodeView.dom, updatedNode.attrs.align);

          return true;
        },
        options: {
          directions,
          className: {
            container: 'editor-image-resize',
            wrapper: 'editor-image-resize__wrapper',
            handle: 'editor-image-resize__handle',
            resizing: 'editor-image-resize--resizing',
          },
          min: {
            width: minWidth,
            height: minHeight,
          },
          preserveAspectRatio: alwaysPreserveAspectRatio === true,
        },
      });

      const dom = nodeView.dom;

      applyImageNodeViewAlignment(dom, node.attrs.align);

      return nodeView;
    };
  },
});

function syncImageElementAttributes(
  imageElement: HTMLImageElement,
  extensionAttributes: Record<string, unknown>,
  nodeAttributes: Record<string, unknown>,
): void {
  const mergedAttributes = mergeAttributes(extensionAttributes, nodeAttributes);

  Object.entries(mergedAttributes).forEach(([key, value]) => {
    if (value == null) {
      imageElement.removeAttribute(key);
      return;
    }

    switch (key) {
      case 'width':
      case 'height':
        break;
      default:
        imageElement.setAttribute(key, String(value));
        break;
    }
  });

  if (typeof mergedAttributes.src === 'string') {
    imageElement.src = mergedAttributes.src;
  }
}

function applyImageNodeViewAlignment(container: HTMLElement, value: unknown): void {
  const alignment = parseImageAlignment(typeof value === 'string' ? value : null);

  if (!alignment) {
    delete container.dataset.imageAlign;
    container.style.justifyContent = '';
    return;
  }

  container.dataset.imageAlign = alignment;
  container.style.justifyContent = alignmentToFlexJustification(alignment);
}

function alignmentToFlexJustification(alignment: ImageAlignment): string {
  if (alignment === 'center') {
    return 'center';
  }

  if (alignment === 'right') {
    return 'flex-end';
  }

  return 'flex-start';
}

function parseImageDimension(value: string | null): number | string | null {
  if (!value) {
    return null;
  }

  const numericValue = Number(value);

  if (Number.isFinite(numericValue) && numericValue > 0) {
    return numericValue;
  }

  return value;
}

function renderDimensionAttribute(
  name: 'width' | 'height',
  value: unknown,
): Record<string, string> {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return { [name]: String(value) };
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return { [name]: value.trim() };
  }

  return {};
}

function parseImageAlignment(value: string | null): ImageAlignment | null {
  if (value === 'left' || value === 'center' || value === 'right') {
    return value;
  }

  return null;
}

function renderAlignAttribute(value: unknown): Record<string, string> {
  if (typeof value !== 'string' || !validImageAlignments.has(value as ImageAlignment)) {
    return {};
  }

  return {
    align: value,
  };
}
