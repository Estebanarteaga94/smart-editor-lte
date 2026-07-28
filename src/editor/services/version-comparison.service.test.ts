import { expect, it } from 'vitest';

import type { CanonicalEditorContent } from '../models/editor-content';
import { compareDocumentToVersion } from './version-comparison.service';

it('summarizes canonical content and metadata differences', () => {
  const contentJson: CanonicalEditorContent = {
    type: 'doc',
    content: [{ type: 'paragraph' }],
  };
  const comparison = compareDocumentToVersion(
    { title: 'Actual', contentJson, contentHtml: '<p></p>' },
    {
      id: 'v1',
      documentId: 'doc-1',
      versionNumber: 1,
      title: 'Anterior',
      contentJson,
      contentHtml: '<p></p>',
      createdAt: '2026-07-28T00:00:00.000Z',
    },
  );

  expect(comparison).toMatchObject({
    titleChanged: true,
    contentChanged: false,
    htmlChanged: false,
    summary: 'Cambios en titulo',
  });
});
