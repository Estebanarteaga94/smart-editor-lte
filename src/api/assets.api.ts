export interface AssetsApi {
  uploadImage(documentId: string, file: File): Promise<unknown>
  deleteAsset(documentId: string, assetId: string): Promise<void>
}
