/**
 * @vitest-environment jsdom
 */

import type { JSONContent } from '@tiptap/core';
import { afterEach, describe, expect, it } from 'vitest';

import type { DocumentStorageService } from './services/document-storage.service';
import { mountEditorApp, type MountedEditorApp } from './editor-app';

const mountedApps = new Set<MountedEditorApp>();

afterEach(() => {
  for (const app of mountedApps) {
    app.lifecycle.dispose();
  }

  mountedApps.clear();
  document.body.replaceChildren();
});

describe('source-json roundtrip', () => {
  it('preserves canonical JSON, renderable HTML and preview structure', async () => {
    const appRoot = document.createElement('div');
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: createEmptyStorage(),
      documentId: 'doc-json-roundtrip',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent(createJsonRoundtripContent());

    const jsonBefore = mountedApp.editor.getJSON();
    const htmlBefore = mountedApp.editor.getHTML();
    const previewBefore = getPreviewHtml(appRoot);
    const sourceJsonButton = getSourceJsonButton(appRoot);

    sourceJsonButton.click();
    await flushUpdates();

    const sourceView = mountedApp.getSourceView();
    const sourceValue = sourceView?.getValue() ?? '';

    expect(mountedApp.getActiveMode()).toBe('source-json');
    expect(sourceView).not.toBeNull();
    expect(JSON.parse(sourceValue)).toEqual(jsonBefore);
    expect(sourceValue).toBe(JSON.stringify(jsonBefore, null, 2));

    sourceJsonButton.click();
    await flushUpdates();

    expect(mountedApp.getActiveMode()).toBe('wysiwyg');
    expect(mountedApp.getSourceView()).toBeNull();
    expect(mountedApp.editor.getJSON()).toEqual(jsonBefore);
    expect(mountedApp.editor.getHTML()).toBe(htmlBefore);
    expect(getPreviewHtml(appRoot)).toBe(previewBefore);
    expect(appRoot.querySelector('#editor-status')?.textContent).toBe('JSON aplicado');
  }, 15_000);
});

function createEmptyStorage(): DocumentStorageService {
  return {
    loadDocument: () => Promise.resolve(null),
    saveDocument: () => Promise.resolve(),
  };
}

function getSourceJsonButton(root: ParentNode): HTMLButtonElement {
  const button = root.querySelector<HTMLButtonElement>('[data-toolbar-action="source-json"]');

  if (!button) {
    throw new Error('Expected source-json toolbar button');
  }

  return button;
}

function getPreviewHtml(root: ParentNode): string {
  const preview = root.querySelector<HTMLElement>('.editor-preview__content');

  if (!preview) {
    throw new Error('Expected preview content');
  }

  return preview.innerHTML;
}

function createJsonRoundtripContent(): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 4, textAlign: 'right' },
        content: [{ type: 'text', text: 'JSON canonico' }],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          {
            type: 'text',
            text: 'Formato combinado',
            marks: [
              { type: 'bold' },
              { type: 'italic' },
              { type: 'underline' },
              { type: 'strike' },
              { type: 'textStyle', attrs: { color: '#123456' } },
              { type: 'highlight', attrs: { color: '#ffff00' } },
            ],
          },
          { type: 'text', text: ' y ' },
          {
            type: 'text',
            text: 'enlace',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: 'https://example.com/json',
                  target: '_blank',
                  rel: 'noopener noreferrer nofollow',
                  class: null,
                  title: 'Referencia JSON',
                },
              },
            ],
          },
        ],
      },
      {
        type: 'orderedList',
        attrs: { start: 4 },
        content: [createListItem('Cuarto paso')],
      },
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: true },
            content: [createParagraph('Tarea validada')],
          },
        ],
      },
      {
        type: 'blockquote',
        content: [createParagraph('Contenido citado')],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'typescript' },
        content: [{ type: 'text', text: 'const canonical = true;' }],
      },
      { type: 'horizontalRule' },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              createTableCell('tableHeader', 'Campo', [150]),
              createTableCell('tableHeader', 'Valor', [210]),
            ],
          },
          {
            type: 'tableRow',
            content: [
              createTableCell('tableCell', 'Formato', [150]),
              createTableCell('tableCell', 'JSON', [210]),
            ],
          },
        ],
      },
      {
        type: 'image',
        attrs: {
          src: '/images/json-roundtrip.webp',
          alt: 'Roundtrip JSON',
          title: 'Contenido canonico',
          width: 360,
          height: 200,
          align: 'right',
        },
      },
    ],
  };
}

function createListItem(text: string): JSONContent {
  return {
    type: 'listItem',
    content: [createParagraph(text)],
  };
}

function createParagraph(text: string): JSONContent {
  return {
    type: 'paragraph',
    attrs: { textAlign: null },
    content: [{ type: 'text', text }],
  };
}

function createTableCell(
  type: 'tableCell' | 'tableHeader',
  text: string,
  colwidth: number[],
): JSONContent {
  return {
    type,
    attrs: {
      colspan: 1,
      rowspan: 1,
      colwidth,
      align: null,
    },
    content: [createParagraph(text)],
  };
}

function flushUpdates(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}
