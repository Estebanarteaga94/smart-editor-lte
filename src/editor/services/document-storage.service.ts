import { z } from 'zod'

export interface DocumentStoragePayload {
  title: string
  contentJson: unknown
  contentHtml: string
}

export const documentStoragePayloadSchema = z.object({
  title: z.string(),
  contentJson: z.unknown(),
  contentHtml: z.string(),
})

export function parseDocumentStoragePayload(input: unknown): DocumentStoragePayload {
  return documentStoragePayloadSchema.parse(input)
}

export interface DocumentStorageService {
  saveDocument(documentId: string, payload: DocumentStoragePayload): Promise<void>
  loadDocument(documentId: string): Promise<DocumentStoragePayload | null>
}
