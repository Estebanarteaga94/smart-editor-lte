/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from 'vitest';

import { createHttpMediaUploadService } from './media-upload.service';

describe('media upload service', () => {
  it('validates and uploads image files through POST /api/documents/{id}/assets/images', async () => {
    const asset = createAssetResponse();
    const fetchUpload = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(JSON.stringify(asset), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    const service = createHttpMediaUploadService({ fetch: fetchUpload });
    const file = createImageFile({ type: 'image/png' });

    await expect(service.uploadImage('doc remoto/1', file, 'Logo principal')).resolves.toEqual(
      asset,
    );

    expect(fetchUpload).toHaveBeenCalledTimes(1);
    expect(fetchUpload).toHaveBeenCalledWith('/api/documents/doc%20remoto%2F1/assets/images', {
      method: 'POST',
      body: expect.any(FormData),
    });

    const body = fetchUpload.mock.calls[0]?.[1]?.body;
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('file')).toBe(file);
    expect((body as FormData).get('altText')).toBe('Logo principal');
  });

  it('supports a base URL without setting a manual multipart content type', async () => {
    const fetchUpload = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(JSON.stringify(createAssetResponse()), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    const service = createHttpMediaUploadService({
      baseUrl: 'https://api.example.com/',
      fetch: fetchUpload,
    });

    await service.uploadImage('doc-1', createImageFile({ type: 'image/jpeg' }));

    expect(fetchUpload).toHaveBeenCalledWith(
      'https://api.example.com/api/documents/doc-1/assets/images',
      expect.not.objectContaining({
        headers: expect.anything(),
      }),
    );
  });

  it('rejects invalid files before calling the API', async () => {
    const fetchUpload = vi.fn<typeof fetch>();
    const service = createHttpMediaUploadService({ fetch: fetchUpload });

    await expect(
      service.uploadImage('doc-1', createImageFile({ type: 'image/gif' })),
    ).rejects.toThrow('image/gif');

    expect(fetchUpload).not.toHaveBeenCalled();
  });

  it('rejects non OK upload responses', async () => {
    const fetchUpload = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response('Upload failed', { status: 500 })),
    );
    const service = createHttpMediaUploadService({ fetch: fetchUpload });

    await expect(
      service.uploadImage('doc-1', createImageFile({ type: 'image/webp' })),
    ).rejects.toThrow('Image upload failed with status 500');
  });

  it('rejects API responses that are not valid editor assets', async () => {
    const fetchUpload = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(JSON.stringify({ id: 'asset-1', url: '/assets/image.png' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    const service = createHttpMediaUploadService({ fetch: fetchUpload });

    await expect(
      service.uploadImage('doc-1', createImageFile({ type: 'image/png' })),
    ).rejects.toThrow();
  });
});

function createImageFile({ type, sizeBytes = 1024 }: { type: string; sizeBytes?: number }): File {
  return new File([new Uint8Array(sizeBytes)], 'image', { type });
}

function createAssetResponse() {
  return {
    id: 'asset-1',
    documentId: 'doc-1',
    fileName: 'image.png',
    mimeType: 'image/png',
    size: 1024,
    url: '/assets/image.png',
    altText: 'Logo principal',
    createdAt: '2026-07-07T00:00:00.000Z',
  };
}
