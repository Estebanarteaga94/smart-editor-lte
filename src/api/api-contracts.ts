import type { EditorAsset } from '../editor/models/editor-asset';
import type { CanonicalEditorContent } from '../editor/models/editor-content';
import type { EditorDocument, EditorDocumentStatus } from '../editor/models/editor-document';
import type { CreateEditorVersionPayload, EditorVersion } from '../editor/models/editor-version';

export interface CreateDocumentRequest {
  title: string;
  contentJson: CanonicalEditorContent;
  contentHtml: string;
  status?: EditorDocumentStatus;
}

export interface UpdateDocumentRequest {
  title: string;
  contentJson: CanonicalEditorContent;
  contentHtml: string;
  status?: EditorDocumentStatus;
}

export type CreateDocumentResponse = EditorDocument;
export type GetDocumentResponse = EditorDocument;
export type UpdateDocumentResponse = EditorDocument;
export type DeleteDocumentResponse = void;

export type ListVersionsResponse = EditorVersion[];
export type CreateVersionRequest = CreateEditorVersionPayload;
export type CreateVersionResponse = EditorVersion;
export type RestoreVersionResponse = EditorVersion;

export interface UploadImageRequest {
  file: File;
  altText?: string;
}

export type UploadImageResponse = EditorAsset;
export type DeleteAssetResponse = void;
