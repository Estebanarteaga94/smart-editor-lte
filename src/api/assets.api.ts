import type { EditorAsset } from '../editor/models/editor-asset';
import { parseEditorAsset } from '../editor/models/editor-asset';

export interface AssetsApi {
  uploadImage(documentId: string, file: File, altText?: string): Promise<EditorAsset>;
  deleteAsset(documentId: string, assetId: string): Promise<void>;
}

export interface AssetsApiOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export function createHttpAssetsApi(options: AssetsApiOptions = {}): AssetsApi {
  const fetchApi = options.fetch ?? globalThis.fetch;
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? '');

  if (!fetchApi) {
    throw new Error('Fetch API is required to create an HTTP assets API client');
  }

  return {
    async uploadImage(documentId, file, altText) {
      const body = new FormData();
      body.append('file', file);

      if (altText) {
        body.append('altText', altText);
      }

      const response = await fetchApi(createImageUploadUrl(baseUrl, documentId), {
        method: 'POST',
        body,
      });

      if (!response.ok) {
        throw new Error(`Image upload failed with status ${response.status}`);
      }

      return parseEditorAsset(await response.json());
    },
    async deleteAsset(documentId, assetId) {
      const response = await fetchApi(createAssetDeleteUrl(baseUrl, documentId, assetId), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Asset delete failed with status ${response.status}`);
      }
    },
  };
}

function createImageUploadUrl(baseUrl: string, documentId: string): string {
  return `${baseUrl}/api/documents/${encodeURIComponent(documentId)}/assets/images`;
}

function createAssetDeleteUrl(baseUrl: string, documentId: string, assetId: string): string {
  return `${baseUrl}/api/documents/${encodeURIComponent(documentId)}/assets/${encodeURIComponent(assetId)}`;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}
