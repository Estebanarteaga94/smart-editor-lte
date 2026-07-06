import type { EditorDocument } from '../editor/models/editor-document';
import type { DocumentStoragePayload } from '../editor/services/document-storage.service';

export interface DocumentsApi {
  getDocument(documentId: string): Promise<EditorDocument>;
  saveDocument(documentId: string, payload: DocumentStoragePayload): Promise<void>;
  deleteDocument(documentId: string): Promise<void>;
}
