import { z } from 'zod';

import {
  canonicalEditorContentSchema,
  type CanonicalEditorContent,
} from '../models/editor-content';

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

export function createLocalDocumentStorageService(
  options: LocalDocumentStorageOptions = {},
): DocumentStorageService {
  const storage = options.storage ?? window.localStorage;
  const keyPrefix = options.keyPrefix ?? 'smart-editor-lte:document';

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
