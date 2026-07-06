export interface UploadedMediaAsset {
  id: string
  url: string
  altText?: string
}

export interface MediaUploadService {
  uploadImage(documentId: string, file: File, altText?: string): Promise<UploadedMediaAsset>
}
