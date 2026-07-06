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
