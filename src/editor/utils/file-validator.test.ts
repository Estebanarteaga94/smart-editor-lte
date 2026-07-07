/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest';

import {
  defaultAllowedImageMimeTypes,
  defaultImageMaxSizeBytes,
  validateImageFile,
} from './file-validator';

describe('validateImageFile', () => {
  it('accepts PNG, JPEG and WEBP images by default', () => {
    for (const mimeType of defaultAllowedImageMimeTypes) {
      const file = createFile({ type: mimeType });

      expect(validateImageFile(file)).toEqual({ valid: true });
    }
  });

  it('rejects unsupported MIME types', () => {
    const file = createFile({ type: 'image/gif' });

    expect(validateImageFile(file)).toMatchObject({
      valid: false,
      error: expect.stringContaining('image/gif'),
    });
  });

  it('rejects images larger than 5 MB by default', () => {
    const file = createFile({
      sizeBytes: defaultImageMaxSizeBytes + 1,
      type: 'image/png',
    });

    expect(validateImageFile(file)).toMatchObject({
      valid: false,
      error: expect.stringContaining('5 MB'),
    });
  });

  it('allows custom limits and MIME types', () => {
    const file = createFile({ sizeBytes: 2048, type: 'image/gif' });

    expect(
      validateImageFile(file, {
        maxSizeBytes: 2048,
        allowedMimeTypes: ['image/gif'],
      }),
    ).toEqual({ valid: true });
  });
});

function createFile({ sizeBytes = 1024, type }: { sizeBytes?: number; type: string }): File {
  return new File([new Uint8Array(sizeBytes)], 'image', { type });
}
