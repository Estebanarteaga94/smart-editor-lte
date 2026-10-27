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

describe('source-html roundtrip', () => {
  it('preserves hard breaks through public import, HTML source and serialization', async () => {
    const { appRoot, mountedApp } = await mountRoundtripApp('doc-html-hard-breaks');
    const html = '<p><strong>Primera<br>Segunda</strong><br><br>Tercera<br></p>';

    expect(mountedApp.setHtml(html)).toMatchObject({ ok: true });
    expect(mountedApp.editor.getHTML().match(/<br>/g)).toHaveLength(4);
    await expectHtmlRoundtripToPreserveContent(appRoot, mountedApp);
    expect(mountedApp.editor.getHTML().match(/<br>/g)).toHaveLength(4);
  }, 15_000);

  it('preserves simple headings, paragraphs, marks and lists', async () => {
    const { appRoot, mountedApp } = await mountRoundtripApp('doc-html-roundtrip-simple');

    mountedApp.editor.commands.setContent(createSimpleRoundtripContent());

    await expectHtmlRoundtripToPreserveContent(appRoot, mountedApp);
  }, 15_000);

  it('preserves advanced formatting, blocks, tasks, tables and images', async () => {
    const { appRoot, mountedApp } = await mountRoundtripApp('doc-html-roundtrip-advanced');

    mountedApp.editor.commands.setContent(createAdvancedRoundtripContent());

    await expectHtmlRoundtripToPreserveContent(appRoot, mountedApp);
  }, 15_000);
});

async function mountRoundtripApp(documentId: string): Promise<{
  appRoot: HTMLElement;
  mountedApp: MountedEditorApp;
}> {
  const appRoot = document.createElement('div');
  document.body.append(appRoot);

  const mountedApp = await mountEditorApp({
    app: appRoot,
    storage: createEmptyStorage(),
    documentId,
  });
  mountedApps.add(mountedApp);

  return { appRoot, mountedApp };
}

async function expectHtmlRoundtripToPreserveContent(
  appRoot: HTMLElement,
  mountedApp: MountedEditorApp,
): Promise<void> {
  const sourceHtmlButton = appRoot.querySelector<HTMLButtonElement>(
    '[data-toolbar-action="source-html"]',
  );

  if (!sourceHtmlButton) {
    throw new Error('Expected source-html toolbar button');
  }

  const jsonBefore = mountedApp.editor.getJSON();
  const htmlBefore = mountedApp.editor.getHTML();

  sourceHtmlButton.click();
  await flushUpdates();

  expect(mountedApp.getActiveMode()).toBe('source-html');
  expect(mountedApp.getSourceView()?.getValue()).toBe(htmlBefore);

  sourceHtmlButton.click();
  await flushUpdates();

  expect(mountedApp.getActiveMode()).toBe('wysiwyg');
  expect(mountedApp.getSourceHtmlValue()).not.toBeNull();
  expect(normalizeColorValues(mountedApp.editor.getJSON())).toEqual(
    normalizeColorValues(jsonBefore),
  );
  expect(mountedApp.editor.getHTML()).not.toBe('');
  expect(appRoot.querySelector('#editor-status')?.textContent).toBe('HTML aplicado');
}

function createEmptyStorage(): DocumentStorageService {
  return {
    loadDocument: () => Promise.resolve(null),
    saveDocument: () => Promise.resolve(),
  };
}

function createSimpleRoundtripContent(): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2, textAlign: null },
        content: [{ type: 'text', text: 'Titulo simple' }],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: null },
        content: [
          { type: 'text', text: 'Texto ' },
          { type: 'text', text: 'negrita', marks: [{ type: 'bold' }] },
          { type: 'text', text: ', ' },
          { type: 'text', text: 'cursiva', marks: [{ type: 'italic' }] },
          { type: 'text', text: ', ' },
          { type: 'text', text: 'subrayado', marks: [{ type: 'underline' }] },
          { type: 'text', text: ' y ' },
          { type: 'text', text: 'tachado', marks: [{ type: 'strike' }] },
          { type: 'text', text: '.' },
        ],
      },
      {
        type: 'bulletList',
        content: [createListItem('Primer punto'), createListItem('Segundo punto')],
      },
      {
        type: 'orderedList',
        attrs: { start: 3 },
        content: [createListItem('Tercer paso')],
      },
    ],
  };
}

function createAdvancedRoundtripContent(): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 3, textAlign: 'center' },
        content: [{ type: 'text', text: 'Contenido avanzado' }],
      },
      {
        type: 'paragraph',
        attrs: { textAlign: 'justify' },
        content: [
          {
            type: 'text',
            text: 'Color y resaltado',
            marks: [
              { type: 'textStyle', attrs: { color: '#123456' } },
              { type: 'highlight', attrs: { color: '#ffff00' } },
            ],
          },
          { type: 'text', text: ' con ' },
          {
            type: 'text',
            text: 'enlace seguro',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: 'https://example.com/documento',
                  target: '_blank',
                  rel: 'noopener noreferrer nofollow',
                  class: null,
                  title: 'Documento externo',
                },
              },
            ],
          },
        ],
      },
      {
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            attrs: { textAlign: null },
            content: [{ type: 'text', text: 'Una cita conservada' }],
          },
        ],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'typescript' },
        content: [{ type: 'text', text: 'const editor = true;' }],
      },
      { type: 'horizontalRule' },
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: true },
            content: [
              {
                type: 'paragraph',
                attrs: { textAlign: null },
                content: [{ type: 'text', text: 'Tarea completada' }],
              },
            ],
          },
        ],
      },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              createTableCell('tableHeader', 'Nombre', [140]),
              createTableCell('tableHeader', 'Estado', [180]),
            ],
          },
          {
            type: 'tableRow',
            content: [
              createTableCell('tableCell', 'Editor', [140]),
              createTableCell('tableCell', 'Activo', [180]),
            ],
          },
        ],
      },
      {
        type: 'image',
        attrs: {
          src: '/images/diagrama.webp',
          alt: 'Diagrama del editor',
          title: 'Arquitectura',
          width: 320,
          height: 180,
          align: 'center',
        },
      },
    ],
  };
}

function createListItem(text: string): JSONContent {
  return {
    type: 'listItem',
    content: [
      {
        type: 'paragraph',
        attrs: { textAlign: null },
        content: [{ type: 'text', text }],
      },
    ],
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
    content: [
      {
        type: 'paragraph',
        attrs: { textAlign: null },
        content: [{ type: 'text', text }],
      },
    ],
  };
}

function flushUpdates(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

function normalizeColorValues(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeColorValues);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, childValue]) => {
      if (key === 'color' && typeof childValue === 'string') {
        const style = document.createElement('span').style;
        style.color = childValue;
        return [key, style.color];
      }

      return [key, normalizeColorValues(childValue)];
    }),
  );
}
