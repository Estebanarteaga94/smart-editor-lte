import type { EditorAsset } from '../editor/models/editor-asset'

export interface AssetsApi {
  uploadImage(documentId: string, file: File): Promise<EditorAsset>
  deleteAsset(documentId: string, assetId: string): Promise<void>
}
