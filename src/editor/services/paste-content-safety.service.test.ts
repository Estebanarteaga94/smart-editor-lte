/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it } from 'vitest';

import { createWysiwygEditor } from '../core/create-editor';
import { sanitizeAndValidatePastedHtml } from './paste-content-safety.service';

const mountedEditors = new Set<ReturnType<typeof createWysiwygEditor>>();

afterEach(() => {
  for (const editor of mountedEditors) {
    editor.destroy();
  }

  mountedEditors.clear();
  document.body.innerHTML = '';
});

describe('sanitizeAndValidatePastedHtml', () => {
  it('sanitizes unsafe pasted HTML before validating it against the editor schema', () => {
    const editor = mountEditor();
    const result = sanitizeAndValidatePastedHtml(
      '<p onclick="alert(1)">Seguro<script>alert(1)</script><a href="javascript:alert(1)">Link</a></p>',
      editor.state.schema,
    );

    expect(result).toEqual({
      ok: true,
      html: '<p>Seguro<a>Link</a></p>',
    });
  });

  it('normalizes line breaks before validating pasted HTML against the canonical schema', () => {
    const editor = mountEditor();
    const result = sanitizeAndValidatePastedHtml(
      '<p>Linea uno<br>Linea dos</p>',
      editor.state.schema,
    );

    expect(result).toEqual({
      ok: true,
      html: '<p>Linea uno Linea dos</p>',
    });
  });
});

function mountEditor(): ReturnType<typeof createWysiwygEditor> {
  const element = document.createElement('div');
  document.body.append(element);

  const editor = createWysiwygEditor({
    element,
    initialContent: '<p></p>',
  });
  mountedEditors.add(editor);

  return editor;
}
