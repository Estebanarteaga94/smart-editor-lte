import type { DocumentStoragePayload } from './document-storage.service';
import type { EditorVersion } from '../models/editor-version';

export interface VersionComparison {
  titleChanged: boolean;
  contentChanged: boolean;
  htmlChanged: boolean;
  summary: string;
}

export function compareDocumentToVersion(
  current: DocumentStoragePayload,
  version: EditorVersion,
): VersionComparison {
  const titleChanged = current.title !== version.title;
  const contentChanged =
    JSON.stringify(current.contentJson) !== JSON.stringify(version.contentJson);
  const htmlChanged = current.contentHtml !== version.contentHtml;
  const changedFields = [
    titleChanged ? 'titulo' : '',
    contentChanged ? 'contenido' : '',
    htmlChanged && !contentChanged ? 'HTML' : '',
  ].filter(Boolean);

  return {
    titleChanged,
    contentChanged,
    htmlChanged,
    summary: changedFields.length > 0 ? `Cambios en ${changedFields.join(' y ')}` : 'Sin cambios',
  };
}
