/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from 'vitest';

import { createHttpAssetsApi } from './assets.api';

describe('createHttpAssetsApi', () => {
  it('uploads an image through POST /api/documents/{id}/assets/images', async () => {
    const asset = createAssetResponse();
    const fetchApi = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(JSON.stringify(asset), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    const api = createHttpAssetsApi({ fetch: fetchApi });
    const file = new File([new Uint8Array(256)], 'logo.png', { type: 'image/png' });

    await expect(api.uploadImage('doc remoto/1', file, 'Logo')).resolves.toEqual(asset);

    expect(fetchApi).toHaveBeenCalledWith('/api/documents/doc%20remoto%2F1/assets/images', {
      method: 'POST',
      body: expect.any(FormData),
    });

    const body = fetchApi.mock.calls[0]?.[1]?.body;
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('file')).toBe(file);
    expect((body as FormData).get('altText')).toBe('Logo');
  });

  it('deletes an asset through DELETE /api/documents/{id}/assets/{assetId}', async () => {
    const fetchApi = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    );
    const api = createHttpAssetsApi({ fetch: fetchApi });

    await expect(api.deleteAsset('doc remoto/1', 'asset local/2')).resolves.toBeUndefined();

    expect(fetchApi).toHaveBeenCalledWith(
      '/api/documents/doc%20remoto%2F1/assets/asset%20local%2F2',
      {
        method: 'DELETE',
      },
    );
  });

  it('supports a base URL for asset deletion', async () => {
    const fetchApi = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    );
    const api = createHttpAssetsApi({
      baseUrl: 'https://api.example.com/',
      fetch: fetchApi,
    });

    await api.deleteAsset('doc-1', 'asset-1');

    expect(fetchApi).toHaveBeenCalledWith(
      'https://api.example.com/api/documents/doc-1/assets/asset-1',
      {
        method: 'DELETE',
      },
    );
  });

  it('rejects non OK asset deletion responses', async () => {
    const fetchApi = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response('Forbidden', { status: 403 })),
    );
    const api = createHttpAssetsApi({ fetch: fetchApi });

    await expect(api.deleteAsset('doc-1', 'asset-1')).rejects.toThrow(
      'Asset delete failed with status 403',
    );
  });

  it('rejects upload responses that are not valid editor assets', async () => {
    const fetchApi = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(JSON.stringify({ id: 'asset-1', url: '/assets/image.png' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    const api = createHttpAssetsApi({ fetch: fetchApi });
    const file = new File([new Uint8Array(256)], 'logo.png', { type: 'image/png' });

    await expect(api.uploadImage('doc-1', file)).rejects.toThrow();
  });
});

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
