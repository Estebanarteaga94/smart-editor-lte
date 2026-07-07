import { Image, type ImageOptions } from '@tiptap/extension-image';

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
      allowBase64: false,
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
});

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
