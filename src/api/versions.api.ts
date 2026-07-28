import {
  parseCreateEditorVersionPayload,
  parseEditorVersion,
  parseEditorVersions,
  type CreateEditorVersionPayload,
  type EditorVersion,
} from '../editor/models/editor-version';
import { assertHttpResponse } from './http-error';

export interface VersionsApi {
  listVersions(documentId: string): Promise<EditorVersion[]>;
  createVersion(documentId: string, payload: CreateEditorVersionPayload): Promise<EditorVersion>;
  restoreVersion(documentId: string, versionId: string): Promise<EditorVersion>;
}

export interface VersionsApiOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export function createHttpVersionsApi(options: VersionsApiOptions = {}): VersionsApi {
  const fetchApi = options.fetch ?? globalThis.fetch;
  const baseUrl = (options.baseUrl ?? '').replace(/\/+$/, '');

  if (!fetchApi) {
    throw new Error('Fetch API is required to create a versions API client');
  }

  return {
    async listVersions(documentId) {
      const response = await fetchApi(versionsUrl(baseUrl, documentId), {
        headers: { Accept: 'application/json' },
      });
      await assertHttpResponse(response, 'Version list');
      return parseEditorVersions(await response.json());
    },
    async createVersion(documentId, payload) {
      const response = await fetchApi(versionsUrl(baseUrl, documentId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parseCreateEditorVersionPayload(payload)),
      });
      await assertHttpResponse(response, 'Version creation');
      return parseEditorVersion(await response.json());
    },
    async restoreVersion(documentId, versionId) {
      const response = await fetchApi(
        `${versionsUrl(baseUrl, documentId)}/${encodeURIComponent(versionId)}/restore`,
        { method: 'POST' },
      );
      await assertHttpResponse(response, 'Version restore');
      return parseEditorVersion(await response.json());
    },
  };
}

export function createLocalVersionsApi(storage: Storage = window.localStorage): VersionsApi {
  return {
    listVersions(documentId) {
      return Promise.resolve(readVersions(storage, documentId));
    },
    createVersion(documentId, payload) {
      const versions = readVersions(storage, documentId);
      const parsedPayload = parseCreateEditorVersionPayload(payload);
      const version = parseEditorVersion({
        id: createVersionId(),
        documentId,
        versionNumber: (versions[0]?.versionNumber ?? 0) + 1,
        ...parsedPayload,
        createdAt: new Date().toISOString(),
      });
      storage.setItem(storageKey(documentId), JSON.stringify([version, ...versions]));
      return Promise.resolve(version);
    },
    restoreVersion(documentId, versionId) {
      const version = readVersions(storage, documentId).find((item) => item.id === versionId);
      if (!version) {
        return Promise.reject(new Error('Version not found'));
      }
      return Promise.resolve(version);
    },
  };
}

function readVersions(storage: Storage, documentId: string): EditorVersion[] {
  const value = storage.getItem(storageKey(documentId));
  return value ? parseEditorVersions(JSON.parse(value)) : [];
}

function storageKey(documentId: string): string {
  return `smart-editor-lte:versions:${documentId}`;
}

function versionsUrl(baseUrl: string, documentId: string): string {
  return `${baseUrl}/api/documents/${encodeURIComponent(documentId)}/versions`;
}

function createVersionId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `version-${Date.now()}`;
}
