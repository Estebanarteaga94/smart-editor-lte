import type { EditorAsset } from '../models/editor-asset';
import { parseEditorAsset } from '../models/editor-asset';
import {
  defaultImageFileValidationOptions,
  validateImageFile,
  type ImageFileValidationOptions,
} from '../utils/file-validator';

export interface UploadedMediaAsset {
  id: string;
  url: string;
  altText?: string;
}

export interface MediaUploadService {
  uploadImage(documentId: string, file: File, altText?: string): Promise<EditorAsset>;
}

export interface HttpMediaUploadServiceOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
  imageValidation?: ImageFileValidationOptions;
}

export function createHttpMediaUploadService(
  options: HttpMediaUploadServiceOptions = {},
): MediaUploadService {
  const fetchUpload = options.fetch ?? globalThis.fetch;
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? '');
  const imageValidation = options.imageValidation ?? defaultImageFileValidationOptions;

  if (!fetchUpload) {
    throw new Error('Fetch API is required to create an HTTP media upload service');
  }

  return {
    async uploadImage(documentId, file, altText) {
      const validation = validateImageFile(file, imageValidation);

      if (!validation.valid) {
        throw new Error(validation.error ?? 'Archivo de imagen invalido');
      }

      const body = new FormData();
      body.append('file', file);

      if (altText) {
        body.append('altText', altText);
      }

      const response = await fetchUpload(createImageUploadUrl(baseUrl, documentId), {
        method: 'POST',
        body,
      });

      if (!response.ok) {
        throw new Error(`Image upload failed with status ${response.status}`);
      }

      return parseEditorAsset(await response.json());
    },
  };
}

export function createLocalMediaUploadService(
  options: { imageValidation?: ImageFileValidationOptions } = {},
): MediaUploadService {
  const imageValidation = options.imageValidation ?? defaultImageFileValidationOptions;

  return {
    uploadImage(documentId, file, altText) {
      const validation = validateImageFile(file, imageValidation);

      if (!validation.valid) {
        return Promise.reject(new Error(validation.error ?? 'Archivo de imagen invalido'));
      }

      const assetId = createLocalAssetId(file);

      return Promise.resolve({
        id: assetId,
        documentId,
        fileName: file.name || 'image',
        mimeType: file.type,
        size: file.size,
        url: `/assets/editor-images/${encodeURIComponent(documentId)}/${encodeURIComponent(assetId)}`,
        altText,
        createdAt: new Date().toISOString(),
      });
    },
  };
}

function createImageUploadUrl(baseUrl: string, documentId: string): string {
  return `${baseUrl}/api/documents/${encodeURIComponent(documentId)}/assets/images`;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

function createLocalAssetId(file: File): string {
  const fileName = file.name.trim().length > 0 ? file.name.trim() : 'image';
  const safeFileName = fileName.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '');

  return `local-${Date.now().toString(36)}-${safeFileName || 'image'}`;
}
