export interface DocumentsApi {
  getDocument(documentId: string): Promise<unknown>
  saveDocument(documentId: string, payload: unknown): Promise<void>
  deleteDocument(documentId: string): Promise<void>
}
