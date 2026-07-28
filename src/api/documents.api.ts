import { z } from 'zod';

import { canonicalEditorContentSchema } from '../editor/models/editor-content';
import { editorDocumentStatusSchema, parseEditorDocument } from '../editor/models/editor-document';
import type {
  CreateDocumentRequest,
  CreateDocumentResponse,
  DeleteDocumentResponse,
  GetDocumentResponse,
  UpdateDocumentRequest,
  UpdateDocumentResponse,
} from './api-contracts';
import { assertHttpResponse } from './http-error';
import { createHttpVersionsApi, type VersionsApi } from './versions.api';

const documentWriteSchema = z
  .object({
    title: z.string(),
    contentJson: canonicalEditorContentSchema,
    contentHtml: z.string(),
    status: editorDocumentStatusSchema.optional(),
  })
  .strict();

export interface DocumentsApi extends VersionsApi {
  createDocument(payload: CreateDocumentRequest): Promise<CreateDocumentResponse>;
  getDocument(documentId: string): Promise<GetDocumentResponse>;
  updateDocument(
    documentId: string,
    payload: UpdateDocumentRequest,
  ): Promise<UpdateDocumentResponse>;
  deleteDocument(documentId: string): Promise<DeleteDocumentResponse>;
}

export interface DocumentsApiOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export function createHttpDocumentsApi(options: DocumentsApiOptions = {}): DocumentsApi {
  const fetchApi = options.fetch ?? globalThis.fetch;
  const baseUrl = (options.baseUrl ?? '').replace(/\/+$/, '');

  if (!fetchApi) {
    throw new Error('Fetch API is required to create a documents API client');
  }

  const versionsApi = createHttpVersionsApi({ baseUrl, fetch: fetchApi });

  return {
    ...versionsApi,
    async createDocument(payload) {
      const response = await fetchApi(`${baseUrl}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentWriteSchema.parse(payload)),
      });
      await assertHttpResponse(response, 'Document creation');
      return parseEditorDocument(await response.json());
    },
    async getDocument(documentId) {
      const response = await fetchApi(documentUrl(baseUrl, documentId), {
        headers: { Accept: 'application/json' },
      });
      await assertHttpResponse(response, 'Document retrieval');
      return parseEditorDocument(await response.json());
    },
    async updateDocument(documentId, payload) {
      const response = await fetchApi(documentUrl(baseUrl, documentId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentWriteSchema.parse(payload)),
      });
      await assertHttpResponse(response, 'Document update');
      return parseEditorDocument(await response.json());
    },
    async deleteDocument(documentId) {
      const response = await fetchApi(documentUrl(baseUrl, documentId), {
        method: 'DELETE',
      });
      await assertHttpResponse(response, 'Document deletion');
    },
  };
}

function documentUrl(baseUrl: string, documentId: string): string {
  return `${baseUrl}/api/documents/${encodeURIComponent(documentId)}`;
}
