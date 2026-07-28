import { describe, expect, it, vi } from 'vitest';

import type { CreateDocumentRequest } from './api-contracts';
import { createHttpDocumentsApi } from './documents.api';
import { HttpApiError } from './http-error';

const payload: CreateDocumentRequest = {
  title: 'Documento',
  contentJson: { type: 'doc', content: [{ type: 'paragraph' }] },
  contentHtml: '<p></p>',
};

const documentResponse = {
  id: 'doc-1',
  ...payload,
  status: 'draft',
  createdAt: '2026-07-28T00:00:00.000Z',
  updatedAt: '2026-07-28T00:00:00.000Z',
};

describe('createHttpDocumentsApi', () => {
  it('creates, retrieves, updates and deletes validated documents', async () => {
    const updated = { ...documentResponse, title: 'Actualizado' };
    const fetchApi = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(documentResponse, { status: 201 }))
      .mockResolvedValueOnce(Response.json(documentResponse))
      .mockResolvedValueOnce(Response.json(updated))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const api = createHttpDocumentsApi({
      baseUrl: 'https://api.example.com/',
      fetch: fetchApi,
    });

    await expect(api.createDocument(payload)).resolves.toEqual(documentResponse);
    await expect(api.getDocument('doc remoto/1')).resolves.toEqual(documentResponse);
    await expect(
      api.updateDocument('doc remoto/1', { ...payload, title: 'Actualizado' }),
    ).resolves.toEqual(updated);
    await expect(api.deleteDocument('doc remoto/1')).resolves.toBeUndefined();

    expect(fetchApi.mock.calls.map(([url, init]) => [url, init?.method ?? 'GET'])).toEqual([
      ['https://api.example.com/api/documents', 'POST'],
      ['https://api.example.com/api/documents/doc%20remoto%2F1', 'GET'],
      ['https://api.example.com/api/documents/doc%20remoto%2F1', 'PUT'],
      ['https://api.example.com/api/documents/doc%20remoto%2F1', 'DELETE'],
    ]);
  });

  it('exposes structured HTTP errors with safe diagnostic context', async () => {
    const fetchApi = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response('Documento bloqueado', { status: 409 })),
    );
    const api = createHttpDocumentsApi({ fetch: fetchApi });

    const error = await api.getDocument('doc-1').catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(HttpApiError);
    expect(error).toMatchObject({
      status: 409,
      operation: 'Document retrieval',
      responseBody: 'Documento bloqueado',
      message: 'Document retrieval failed with status 409',
    });
  });

  it('rejects invalid outbound payloads and inbound documents', async () => {
    const fetchApi = vi.fn<typeof fetch>(() =>
      Promise.resolve(Response.json({ id: 'incompleto' }, { status: 201 })),
    );
    const api = createHttpDocumentsApi({ fetch: fetchApi });

    await expect(
      api.createDocument({
        ...payload,
        contentJson: { type: 'script' },
      } as unknown as CreateDocumentRequest),
    ).rejects.toThrow();
    expect(fetchApi).not.toHaveBeenCalled();

    await expect(api.createDocument(payload)).rejects.toThrow();
  });
});
