import { z } from 'zod';

import {
  canonicalEditorContentSchema,
  type CanonicalEditorContent,
} from '../models/editor-content';
import { parseEditorDocument } from '../models/editor-document';

export interface DocumentStoragePayload {
  title: string;
  contentJson: CanonicalEditorContent;
  contentHtml: string;
}

export const documentStoragePayloadSchema = z.object({
  title: z.string(),
  contentJson: canonicalEditorContentSchema,
  contentHtml: z.string(),
});

export function parseDocumentStoragePayload(input: unknown): DocumentStoragePayload {
  return documentStoragePayloadSchema.parse(input);
}

export interface DocumentStorageService {
  saveDocument(documentId: string, payload: DocumentStoragePayload): Promise<void>;
  loadDocument(documentId: string): Promise<DocumentStoragePayload | null>;
}

export interface LocalDocumentStorageOptions {
  storage?: Storage;
  keyPrefix?: string;
}

export const defaultLocalDocumentStorageKeyPrefix = 'smart-editor-lte:document';

export interface HttpDocumentStorageOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export function createHttpDocumentStorageService(
  options: HttpDocumentStorageOptions = {},
): DocumentStorageService {
  const fetchDocument = options.fetch ?? globalThis.fetch;
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? '');

  if (!fetchDocument) {
    throw new Error('Fetch API is required to create an HTTP document storage service');
  }

  return {
    async saveDocument(documentId, payload) {
      const parsedPayload = parseDocumentStoragePayload(payload);
      const response = await fetchDocument(createDocumentUrl(baseUrl, documentId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedPayload),
      });

      if (!response.ok) {
        throw new Error(`Document save failed with status ${response.status}`);
      }
    },
    async loadDocument(documentId) {
      const response = await fetchDocument(createDocumentUrl(baseUrl, documentId), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Document load failed with status ${response.status}`);
      }

      const document = parseEditorDocument(await response.json());

      return {
        title: document.title,
        contentJson: document.contentJson,
        contentHtml: document.contentHtml,
      };
    },
  };
}

export function createLocalDocumentStorageService(
  options: LocalDocumentStorageOptions = {},
): DocumentStorageService {
  const storage = options.storage ?? window.localStorage;
  const keyPrefix = options.keyPrefix ?? defaultLocalDocumentStorageKeyPrefix;

  return {
    saveDocument(documentId, payload) {
      const parsedPayload = parseDocumentStoragePayload(payload);
      storage.setItem(createStorageKey(keyPrefix, documentId), JSON.stringify(parsedPayload));
      return Promise.resolve();
    },
    loadDocument(documentId) {
      const rawPayload = storage.getItem(createStorageKey(keyPrefix, documentId));

      if (!rawPayload) {
        return Promise.resolve(null);
      }

      return Promise.resolve(parseDocumentStoragePayload(JSON.parse(rawPayload)));
    },
  };
}

function createStorageKey(prefix: string, documentId: string): string {
  return `${prefix}:${documentId}`;
}

function createDocumentUrl(baseUrl: string, documentId: string): string {
  return `${baseUrl}/api/documents/${encodeURIComponent(documentId)}`;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}
