/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from 'vitest';

import type { CreateEditorVersionPayload } from '../editor/models/editor-version';
import { createHttpVersionsApi, createLocalVersionsApi } from './versions.api';

const payload = {
  title: 'Documento',
  contentJson: { type: 'doc', content: [{ type: 'paragraph' }] },
  contentHtml: '<p></p>',
} satisfies CreateEditorVersionPayload;

describe('versions API', () => {
  it('creates, lists and restores local immutable versions', async () => {
    const storage = createMemoryStorage();
    const api = createLocalVersionsApi(storage);

    const first = await api.createVersion('doc-1', payload);
    const second = await api.createVersion('doc-1', {
      ...payload,
      contentHtml: '<p>Segundo</p>',
    });

    await expect(api.listVersions('doc-1')).resolves.toEqual([second, first]);
    await expect(api.restoreVersion('doc-1', first.id)).resolves.toEqual(first);
    expect(first.versionNumber).toBe(1);
    expect(second.versionNumber).toBe(2);
  });

  it('uses the documented HTTP endpoints and validates responses', async () => {
    const version = {
      id: 'version-1',
      documentId: 'doc remoto/1',
      versionNumber: 1,
      ...payload,
      createdAt: '2026-07-28T00:00:00.000Z',
    };
    const fetchApi = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json([version]))
      .mockResolvedValueOnce(Response.json(version, { status: 201 }))
      .mockResolvedValueOnce(Response.json(version));
    const api = createHttpVersionsApi({ fetch: fetchApi });

    await expect(api.listVersions('doc remoto/1')).resolves.toEqual([version]);
    await expect(api.createVersion('doc remoto/1', payload)).resolves.toEqual(version);
    await expect(api.restoreVersion('doc remoto/1', 'version/1')).resolves.toEqual(version);

    expect(fetchApi.mock.calls.map(([url, init]) => [url, init?.method ?? 'GET'])).toEqual([
      ['/api/documents/doc%20remoto%2F1/versions', 'GET'],
      ['/api/documents/doc%20remoto%2F1/versions', 'POST'],
      ['/api/documents/doc%20remoto%2F1/versions/version%2F1/restore', 'POST'],
    ]);
  });
});

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}
