export interface DocumentStoragePayload {
  title: string
  contentJson: unknown
  contentHtml: string
}

export interface DocumentStorageService {
  saveDocument(documentId: string, payload: DocumentStoragePayload): Promise<void>
  loadDocument(documentId: string): Promise<DocumentStoragePayload | null>
}
