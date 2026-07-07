/**
 * @vitest-environment jsdom
 */

import type { JSONContent } from '@tiptap/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type {
  DocumentStoragePayload,
  DocumentStorageService,
} from './services/document-storage.service';
import type { MediaUploadService } from './services/media-upload.service';
import { mountEditorApp, type MountedEditorApp } from './editor-app';

const mountedApps = new Set<MountedEditorApp>();

afterEach(() => {
  for (const app of mountedApps) {
    app.lifecycle.dispose();
  }

  mountedApps.clear();
  document.body.innerHTML = '';
});

describe('mountEditorApp', () => {
  it('restores an existing document from storage before mounting the editor', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble({
      title: 'Documento restaurado',
      contentJson: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: {
              level: 2,
            },
            content: [{ type: 'text', text: 'Restaurado' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Contenido recuperado' }],
          },
        ],
      },
      contentHtml: '<h2>Restaurado</h2><p>Contenido recuperado</p>',
    });
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-restored',
    });
    mountedApps.add(mountedApp);

    expect(storageDouble.loadDocument).toHaveBeenCalledWith('doc-restored');
    expect(mountedApp.editor.getJSON().content?.[0]).toMatchObject({
      type: 'heading',
      attrs: { level: 2 },
    });
    expect(mountedApp.editor.getHTML()).toContain('<h2>Restaurado</h2>');
    expect(mountedApp.editor.getText()).toContain('Contenido recuperado');
    expect(appRoot.querySelector('.editor-preview__content')?.innerHTML).toContain(
      '<h2>Restaurado</h2>',
    );
  });

  it('passes configurable placeholder text to an empty editor', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble({
      title: 'Documento vacio',
      contentJson: {
        type: 'doc',
        content: [{ type: 'paragraph' }],
      },
      contentHtml: '<p></p>',
    });
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-empty-placeholder',
      placeholder: 'Escribe una evolucion...',
    });
    mountedApps.add(mountedApp);

    const placeholderNode = appRoot.querySelector<HTMLElement>(
      '[data-placeholder="Escribe una evolucion..."]',
    );

    expect(placeholderNode).not.toBeNull();
    expect(placeholderNode?.classList.contains('is-editor-empty')).toBe(true);
  });

  it('preserves recovered headings, paragraphs, basic marks and lists', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble({
      title: 'Documento con estructura',
      contentJson: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: {
              level: 1,
            },
            content: [{ type: 'text', text: 'Titulo recuperado' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Parrafo con ' },
              {
                type: 'text',
                text: 'negrita',
                marks: [{ type: 'bold' }],
              },
              { type: 'text', text: ', ' },
              {
                type: 'text',
                text: 'cursiva',
                marks: [{ type: 'italic' }],
              },
              { type: 'text', text: ' y ' },
              {
                type: 'text',
                text: 'subrayado',
                marks: [{ type: 'underline' }],
              },
              { type: 'text', text: '.' },
            ],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Primer punto' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Segundo punto' }],
                  },
                ],
              },
            ],
          },
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Primer paso' }],
                  },
                ],
              },
            ],
          },
        ],
      },
      contentHtml:
        '<h1>Titulo recuperado</h1><p>Parrafo con <strong>negrita</strong>, <em>cursiva</em> y <u>subrayado</u>.</p><ul><li><p>Primer punto</p></li><li><p>Segundo punto</p></li></ul><ol><li><p>Primer paso</p></li></ol>',
    });
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-structured',
    });
    mountedApps.add(mountedApp);

    const restoredJson = mountedApp.editor.getJSON();
    const restoredHtml = mountedApp.editor.getHTML();
    const previewContent = appRoot.querySelector<HTMLElement>('.editor-preview__content');

    expect(restoredJson.content).toMatchObject([
      { type: 'heading', attrs: { level: 1 } },
      {
        type: 'paragraph',
        content: expect.arrayContaining([
          expect.objectContaining({
            text: 'negrita',
            marks: [{ type: 'bold' }],
          }),
          expect.objectContaining({
            text: 'cursiva',
            marks: [{ type: 'italic' }],
          }),
          expect.objectContaining({
            text: 'subrayado',
            marks: [{ type: 'underline' }],
          }),
        ]),
      },
      { type: 'bulletList' },
      { type: 'orderedList' },
    ]);
    expect(restoredHtml).toContain('<h1>Titulo recuperado</h1>');
    expect(restoredHtml).toContain('<strong>negrita</strong>');
    expect(restoredHtml).toContain('<em>cursiva</em>');
    expect(restoredHtml).toContain('<u>subrayado</u>');
    expect(restoredHtml).toContain('<ul>');
    expect(restoredHtml).toContain('<ol>');
    expect(previewContent?.querySelector('h1')?.textContent).toBe('Titulo recuperado');
    expect(previewContent?.querySelector('strong')?.textContent).toBe('negrita');
    expect(previewContent?.querySelector('em')?.textContent).toBe('cursiva');
    expect(previewContent?.querySelector('u')?.textContent).toBe('subrayado');
    expect(
      [...(previewContent?.querySelectorAll('ul li') ?? [])].map((item) => item.textContent),
    ).toEqual(['Primer punto', 'Segundo punto']);
    expect(previewContent?.querySelector('ol li')?.textContent).toBe('Primer paso');
  });

  it('keeps saving canonical JSON and renderable HTML after restoring', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-default',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Nuevo contenido</p>');
    const saveButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="save"]');
    saveButton?.click();

    expect(storageDouble.saveDocument).toHaveBeenCalledWith(
      'doc-default',
      expect.objectContaining({
        title: 'Documento de ejemplo',
        contentJson: expect.objectContaining({ type: 'doc' }),
        contentHtml: '<p>Nuevo contenido</p>',
      }),
    );
  });

  it('persists strike formatting from the toolbar as canonical JSON and renderable HTML', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-strike',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Texto tachado</p>');
    mountedApp.editor.commands.selectAll();

    const strikeButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="strike"]');
    const saveButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="save"]');

    strikeButton?.click();
    saveButton?.click();

    expect(storageDouble.saveDocument).toHaveBeenCalledWith(
      'doc-strike',
      expect.objectContaining({
        contentJson: expect.objectContaining({
          content: [
            expect.objectContaining({
              content: [
                expect.objectContaining({
                  text: 'Texto tachado',
                  marks: [expect.objectContaining({ type: 'strike' })],
                }),
              ],
            }),
          ],
        }),
        contentHtml: '<p><s>Texto tachado</s></p>',
      }),
    );
  });

  it('persists text color from the toolbar as canonical JSON and renderable HTML', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-text-color',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Texto con color</p>');
    mountedApp.editor.commands.selectAll();

    const blueSwatch = appRoot.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="text-color-swatch"][data-text-color="#4472c4"]',
    );
    const colorTrigger = appRoot.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="text-color-trigger"]',
    );
    const saveButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="save"]');

    colorTrigger?.click();
    blueSwatch?.click();
    saveButton?.click();

    expect(storageDouble.saveDocument).toHaveBeenCalledWith(
      'doc-text-color',
      expect.objectContaining({
        contentJson: expect.objectContaining({
          content: [
            expect.objectContaining({
              content: [
                expect.objectContaining({
                  text: 'Texto con color',
                  marks: [
                    expect.objectContaining({
                      type: 'textStyle',
                      attrs: { color: '#4472c4' },
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        contentHtml: '<p><span style="color: rgb(68, 114, 196);">Texto con color</span></p>',
      }),
    );
  });

  it('persists highlight color from the toolbar as canonical JSON and renderable HTML', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-highlight-color',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Texto resaltado</p>');
    mountedApp.editor.commands.selectAll();

    const highlightTrigger = appRoot.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="highlight-color-trigger"]',
    );
    const yellowSwatch = appRoot.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="highlight-color-swatch"][data-text-color="#ffff00"]',
    );
    const saveButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="save"]');

    highlightTrigger?.click();
    yellowSwatch?.click();
    saveButton?.click();

    expect(storageDouble.saveDocument).toHaveBeenCalledWith(
      'doc-highlight-color',
      expect.objectContaining({
        contentJson: expect.objectContaining({
          content: [
            expect.objectContaining({
              content: [
                expect.objectContaining({
                  text: 'Texto resaltado',
                  marks: [
                    expect.objectContaining({
                      type: 'highlight',
                      attrs: { color: '#ffff00' },
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        contentHtml:
          '<p><mark data-color="#ffff00" style="background-color: rgb(255, 255, 0); color: inherit;">Texto resaltado</mark></p>',
      }),
    );
  });

  it('persists paragraph alignment from the toolbar as canonical JSON and renderable HTML', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-alignment',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Texto centrado</p>');
    mountedApp.editor.commands.selectAll();

    const alignCenterButton = appRoot.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="align-center"]',
    );
    const saveButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="save"]');

    alignCenterButton?.click();
    saveButton?.click();

    expect(storageDouble.saveDocument).toHaveBeenCalledWith(
      'doc-alignment',
      expect.objectContaining({
        contentJson: expect.objectContaining({
          content: [
            expect.objectContaining({
              type: 'paragraph',
              attrs: { textAlign: 'center' },
              content: [expect.objectContaining({ text: 'Texto centrado' })],
            }),
          ],
        }),
        contentHtml: '<p style="text-align: center;">Texto centrado</p>',
      }),
    );
  });

  it('persists blockquote from the toolbar as canonical JSON and renderable HTML', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-blockquote',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Texto citado</p>');
    mountedApp.editor.commands.setTextSelection(2);

    const blockquoteButton = appRoot.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="blockquote"]',
    );
    const saveButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="save"]');

    blockquoteButton?.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
    );
    blockquoteButton?.click();
    saveButton?.click();

    expect(storageDouble.saveDocument).toHaveBeenCalledWith(
      'doc-blockquote',
      expect.objectContaining({
        contentJson: expect.objectContaining({
          content: expect.arrayContaining([
            expect.objectContaining({
              type: 'blockquote',
              content: [
                expect.objectContaining({
                  type: 'paragraph',
                  content: [expect.objectContaining({ text: 'Texto citado' })],
                }),
              ],
            }),
          ]),
        }),
        contentHtml: expect.stringContaining('<blockquote><p>Texto citado</p></blockquote>'),
      }),
    );
  });

  it('persists horizontal rule from the toolbar as canonical JSON and renderable HTML', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-horizontal-rule',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Antes</p>');
    mountedApp.editor.commands.setTextSelection(3);

    const horizontalRuleButton = appRoot.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="horizontal-rule"]',
    );
    const saveButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="save"]');

    horizontalRuleButton?.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
    );
    horizontalRuleButton?.click();
    saveButton?.click();

    expect(storageDouble.saveDocument).toHaveBeenCalledWith(
      'doc-horizontal-rule',
      expect.objectContaining({
        contentJson: expect.objectContaining({
          content: expect.arrayContaining([
            expect.objectContaining({
              type: 'horizontalRule',
            }),
          ]),
        }),
        contentHtml: expect.stringContaining('<hr>'),
      }),
    );
  });

  it('persists code block from the toolbar as canonical JSON and renderable HTML', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-code-block',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>const total = 1;</p>');
    mountedApp.editor.commands.setTextSelection(3);

    const codeBlockButton = appRoot.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="code-block"]',
    );
    const saveButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="save"]');

    codeBlockButton?.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
    );
    codeBlockButton?.click();
    mountedApp.editor.commands.insertContent('\nconsole.log(total);');
    saveButton?.click();

    expect(storageDouble.saveDocument).toHaveBeenCalledWith(
      'doc-code-block',
      expect.objectContaining({
        contentJson: expect.objectContaining({
          content: expect.arrayContaining([
            expect.objectContaining({
              type: 'codeBlock',
              attrs: { language: null },
              content: [
                expect.objectContaining({
                  type: 'text',
                  text: expect.stringContaining('console.log(total);'),
                }),
              ],
            }),
          ]),
        }),
        contentHtml: expect.stringContaining('<pre><code>'),
      }),
    );
  });

  it('persists configurable links from the toolbar as canonical JSON and renderable HTML', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-link',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Texto enlazado</p>');
    mountedApp.editor.commands.selectAll();

    const linkTrigger = appRoot.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="link-trigger"]',
    );
    const linkInput = appRoot.querySelector<HTMLInputElement>('[data-toolbar-action="link-input"]');
    const linkApplyButton = appRoot.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="link-apply"]',
    );
    const saveButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="save"]');

    expect(linkTrigger).not.toBeNull();
    expect(linkInput).not.toBeNull();
    expect(linkApplyButton).not.toBeNull();
    expect(saveButton).not.toBeNull();
    expect(saveButton?.disabled).toBe(false);

    linkTrigger?.click();
    if (linkInput) {
      linkInput.value = 'example.com';
    }
    linkApplyButton?.click();
    expect(mountedApp.editor.getAttributes('link')).toMatchObject({
      href: 'https://example.com',
    });

    saveButton?.click();
    await flushPromises();

    expect(storageDouble.saveDocument).toHaveBeenCalledWith(
      'doc-link',
      expect.objectContaining({
        contentJson: expect.objectContaining({
          content: [
            expect.objectContaining({
              content: [
                expect.objectContaining({
                  text: 'Texto enlazado',
                  marks: [
                    expect.objectContaining({
                      type: 'link',
                      attrs: expect.objectContaining({
                        href: 'https://example.com',
                        target: '_blank',
                        rel: 'noopener noreferrer nofollow',
                      }),
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        contentHtml: expect.stringContaining('href="https://example.com"'),
      }),
    );
  });

  it('uploads an image from the dialog and inserts the returned URL with alt text', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    const mediaUploadDouble = createMediaUploadDouble({
      url: 'https://cdn.example.com/assets/logo.png',
      altText: 'Logo cargado',
    });
    const file = createImageFile('logo.png', 'image/png');
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      mediaUpload: mediaUploadDouble.service,
      documentId: 'doc-image-upload',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Antes de la imagen</p>');

    const insertImageButton = appRoot.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="insert-image"]',
    );
    const fileInput = appRoot.querySelector<HTMLInputElement>('[data-image-dialog="file"]');
    const altTextInput = appRoot.querySelector<HTMLInputElement>('[data-image-dialog="alt-text"]');
    const dialogPanel = appRoot.querySelector<HTMLFormElement>('[data-image-dialog="panel"]');

    expect(insertImageButton).not.toBeNull();
    expect(insertImageButton?.disabled).toBe(false);
    expect(fileInput).not.toBeNull();
    expect(altTextInput).not.toBeNull();
    expect(dialogPanel).not.toBeNull();

    insertImageButton?.click();
    setSelectedFiles(fileInput, [file]);
    fileInput?.dispatchEvent(new Event('change'));
    if (altTextInput) {
      altTextInput.value = '  Logo cargado  ';
    }
    dialogPanel?.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await flushPromises();

    expect(mediaUploadDouble.uploadImage).toHaveBeenCalledWith(
      'doc-image-upload',
      file,
      'Logo cargado',
    );
    expect(mountedApp.editor.getJSON().content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'image',
          attrs: expect.objectContaining({
            src: 'https://cdn.example.com/assets/logo.png',
            alt: 'Logo cargado',
          }),
        }),
      ]),
    );
    expect(mountedApp.editor.getHTML()).toContain(
      '<img src="https://cdn.example.com/assets/logo.png" alt="Logo cargado">',
    );
    expect(appRoot.querySelector('.editor-preview__content img')).toMatchObject({
      src: 'https://cdn.example.com/assets/logo.png',
      alt: 'Logo cargado',
    });
    expect(appRoot.querySelector('#editor-status')?.textContent).toBe('Guardado');

    const saveButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="save"]');
    saveButton?.click();
    await flushPromises();

    expect(storageDouble.saveDocument).toHaveBeenCalledWith(
      'doc-image-upload',
      expect.objectContaining({
        contentJson: expect.objectContaining({
          content: expect.arrayContaining([
            expect.objectContaining({
              type: 'image',
              attrs: expect.objectContaining({
                src: 'https://cdn.example.com/assets/logo.png',
                alt: 'Logo cargado',
              }),
            }),
          ]),
        }),
        contentHtml: expect.stringContaining(
          '<img src="https://cdn.example.com/assets/logo.png" alt="Logo cargado">',
        ),
      }),
    );
  });

  it('inserts a visible blob URL when selecting an image with the default local uploader', async () => {
    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
    const createObjectUrl = vi.fn(() => 'blob:http://localhost/dialog-image');
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    const file = createImageFile('local.png', 'image/png');
    document.body.append(appRoot);

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectUrl,
    });

    try {
      const mountedApp = await mountEditorApp({
        app: appRoot,
        storage: storageDouble.service,
        documentId: 'doc-local-image-upload',
      });
      mountedApps.add(mountedApp);

      const insertImageButton = appRoot.querySelector<HTMLButtonElement>(
        '[data-toolbar-action="insert-image"]',
      );
      const fileInput = appRoot.querySelector<HTMLInputElement>('[data-image-dialog="file"]');
      const dialogPanel = appRoot.querySelector<HTMLFormElement>('[data-image-dialog="panel"]');

      insertImageButton?.click();
      setSelectedFiles(fileInput, [file]);
      fileInput?.dispatchEvent(new Event('change'));
      dialogPanel?.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
      await flushPromises();

      expect(createObjectUrl).toHaveBeenCalledWith(file);
      expect(mountedApp.editor.getHTML()).toContain(
        '<img src="blob:http://localhost/dialog-image" alt="">',
      );
      expect(appRoot.querySelector('.editor-preview__content img')).toMatchObject({
        src: 'blob:http://localhost/dialog-image',
      });
      expect(appRoot.querySelector('#editor-status')?.textContent).toBe('Guardado');
    } finally {
      if (originalCreateObjectUrl) {
        Object.defineProperty(URL, 'createObjectURL', originalCreateObjectUrl);
      } else {
        deleteUrlCreateObjectUrl();
      }
    }
  });

  it('uploads an image dropped on the editor and inserts the returned URL', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    const mediaUploadDouble = createMediaUploadDouble({
      url: 'https://cdn.example.com/assets/drop.png',
    });
    const file = createImageFile('drop.png', 'image/png');
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      mediaUpload: mediaUploadDouble.service,
      documentId: 'doc-image-drop',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Antes del drop</p>');

    const dropTarget = getImageDropTarget(appRoot);
    const dragOverEvent = dispatchFileDragEvent(dropTarget, 'dragover', [file]);

    expect(dragOverEvent.defaultPrevented).toBe(true);
    expect(dropTarget.classList.contains('editor-shell__editable--drop-target')).toBe(true);

    const dropEvent = dispatchFileDragEvent(dropTarget, 'drop', [file]);
    await flushPromises();

    expect(dropEvent.defaultPrevented).toBe(true);
    expect(mediaUploadDouble.uploadImage).toHaveBeenCalledWith('doc-image-drop', file, '');
    expect(dropTarget.classList.contains('editor-shell__editable--drop-target')).toBe(false);
    expect(mountedApp.editor.getJSON().content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'image',
          attrs: expect.objectContaining({
            src: 'https://cdn.example.com/assets/drop.png',
            alt: '',
          }),
        }),
      ]),
    );
    expect(mountedApp.editor.getHTML()).toContain(
      '<img src="https://cdn.example.com/assets/drop.png" alt="">',
    );
    expect(appRoot.querySelector('.editor-preview__content img')).toMatchObject({
      src: 'https://cdn.example.com/assets/drop.png',
    });
    expect(appRoot.querySelector('#editor-status')?.textContent).toBe('Guardado');
  });

  it('shows Error and does not insert an image when the dropped file is invalid', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    const invalidFile = new File([new Uint8Array(128)], 'notes.txt', {
      type: 'text/plain',
    });
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-invalid-image-drop',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Sin imagen rota</p>');

    const dropEvent = dispatchFileDragEvent(getImageDropTarget(appRoot), 'drop', [invalidFile]);
    await flushPromises();

    expect(dropEvent.defaultPrevented).toBe(true);
    expect(appRoot.querySelector('#editor-status')?.textContent).toBe('Error');
    expect(mountedApp.editor.getHTML()).toBe('<p>Sin imagen rota</p>');
    expect(mountedApp.editor.getJSON().content).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'image',
        }),
      ]),
    );
  });

  it('uploads an image pasted from the clipboard and inserts the returned URL', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    const mediaUploadDouble = createMediaUploadDouble({
      url: 'https://cdn.example.com/assets/pasted.png',
    });
    const file = createImageFile('pasted.png', 'image/png');
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      mediaUpload: mediaUploadDouble.service,
      documentId: 'doc-image-paste',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Antes del pegado</p>');

    const pasteEvent = dispatchClipboardEvent(getImageDropTarget(appRoot), [createFileItem(file)]);
    await flushPromises();

    expect(pasteEvent.defaultPrevented).toBe(true);
    expect(mediaUploadDouble.uploadImage).toHaveBeenCalledWith('doc-image-paste', file, '');
    expect(mountedApp.editor.getJSON().content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'image',
          attrs: expect.objectContaining({
            src: 'https://cdn.example.com/assets/pasted.png',
            alt: '',
          }),
        }),
      ]),
    );
    expect(mountedApp.editor.getHTML()).toContain(
      '<img src="https://cdn.example.com/assets/pasted.png" alt="">',
    );
    expect(appRoot.querySelector('.editor-preview__content img')).toMatchObject({
      src: 'https://cdn.example.com/assets/pasted.png',
    });
    expect(appRoot.querySelector('#editor-status')?.textContent).toBe('Guardado');
  });

  it('does not block normal text paste when the clipboard has no image files', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    const mediaUploadDouble = createMediaUploadDouble({
      url: 'https://cdn.example.com/assets/unused.png',
    });
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      mediaUpload: mediaUploadDouble.service,
      documentId: 'doc-text-paste',
    });
    mountedApps.add(mountedApp);

    const pasteEvent = dispatchClipboardEvent(getImageDropTarget(appRoot), [
      createTextItem('Texto normal'),
    ]);

    expect(pasteEvent.defaultPrevented).toBe(false);
    expect(mediaUploadDouble.uploadImage).not.toHaveBeenCalled();
  });

  it('shows Error and does not insert an image when the pasted image is invalid', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    const invalidFile = new File([new Uint8Array(128)], 'animation.gif', {
      type: 'image/gif',
    });
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-invalid-image-paste',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Sin imagen pegada</p>');

    const pasteEvent = dispatchClipboardEvent(getImageDropTarget(appRoot), [
      createFileItem(invalidFile),
    ]);
    await flushPromises();

    expect(pasteEvent.defaultPrevented).toBe(true);
    expect(appRoot.querySelector('#editor-status')?.textContent).toBe('Error');
    expect(mountedApp.editor.getHTML()).toBe('<p>Sin imagen pegada</p>');
    expect(mountedApp.editor.getJSON().content).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'image',
        }),
      ]),
    );
  });

  it('mounts the table command group inside the normal toolbar', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-table-menu',
    });
    mountedApps.add(mountedApp);

    const tableMenu = appRoot.querySelector<HTMLElement>('.editor-table-menu');
    const tableMenuTrigger = appRoot.querySelector<HTMLButtonElement>(
      '.editor-table-menu [data-table-menu-trigger="true"]',
    );
    const tableMenuPanel = appRoot.querySelector<HTMLElement>('.editor-table-menu__panel');
    const addRowAfterButton = appRoot.querySelector<HTMLButtonElement>(
      '.editor-table-menu [data-table-menu-action="add-row-after"]',
    );
    const deleteRowButton = appRoot.querySelector<HTMLButtonElement>(
      '.editor-table-menu [data-table-menu-action="delete-row"]',
    );
    const addColumnAfterButton = appRoot.querySelector<HTMLButtonElement>(
      '.editor-table-menu [data-table-menu-action="add-column-after"]',
    );
    const deleteColumnButton = appRoot.querySelector<HTMLButtonElement>(
      '.editor-table-menu [data-table-menu-action="delete-column"]',
    );
    const deleteTableButton = appRoot.querySelector<HTMLButtonElement>(
      '.editor-table-menu [data-table-menu-action="delete-table"]',
    );
    const toggleHeaderRowButton = appRoot.querySelector<HTMLButtonElement>(
      '.editor-table-menu [data-table-menu-action="toggle-header-row"]',
    );
    const mergeCellsButton = appRoot.querySelector<HTMLButtonElement>(
      '.editor-table-menu [data-table-menu-action="merge-cells"]',
    );
    const splitCellButton = appRoot.querySelector<HTMLButtonElement>(
      '.editor-table-menu [data-table-menu-action="split-cell"]',
    );

    expect(tableMenu).not.toBeNull();
    expect(tableMenu?.closest('.editor-toolbar')).not.toBeNull();
    expect(tableMenu?.closest('.editor-shell__toolbar')).not.toBeNull();
    expect(tableMenu?.hidden).toBe(false);
    expect(tableMenuTrigger).not.toBeNull();
    expect(tableMenuTrigger?.disabled).toBe(true);
    expect(tableMenuTrigger?.getAttribute('aria-expanded')).toBe('false');
    expect(tableMenuTrigger?.textContent).not.toContain('Tabla');
    expect(tableMenuTrigger?.querySelector('.editor-table-menu__trigger-label')).toBeNull();
    expect(tableMenuPanel).not.toBeNull();
    expect(tableMenuPanel?.hidden).toBe(true);
    expect(addRowAfterButton).not.toBeNull();
    expect(addRowAfterButton?.disabled).toBe(true);
    expect(deleteRowButton).not.toBeNull();
    expect(deleteRowButton?.disabled).toBe(true);
    expect(addColumnAfterButton).not.toBeNull();
    expect(addColumnAfterButton?.disabled).toBe(true);
    expect(deleteColumnButton).not.toBeNull();
    expect(deleteColumnButton?.disabled).toBe(true);
    expect(deleteTableButton).not.toBeNull();
    expect(deleteTableButton?.disabled).toBe(true);
    expect(toggleHeaderRowButton).not.toBeNull();
    expect(toggleHeaderRowButton?.disabled).toBe(true);
    expect(mergeCellsButton).not.toBeNull();
    expect(mergeCellsButton?.disabled).toBe(true);
    expect(splitCellButton).not.toBeNull();
    expect(splitCellButton?.disabled).toBe(true);

    mountedApp.editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true });
    setSelectionInFirstTableCell(mountedApp.editor);

    expect(tableMenu?.hidden).toBe(false);
    expect(tableMenuTrigger?.disabled).toBe(false);
    expect(tableMenuTrigger?.textContent).not.toContain('Tabla');
    expect(tableMenuTrigger?.querySelector('.editor-table-menu__trigger-label')).toBeNull();
    tableMenuTrigger?.click();
    expect(tableMenuPanel?.hidden).toBe(false);
    expect(tableMenuTrigger?.getAttribute('aria-expanded')).toBe('true');
    expect(addRowAfterButton?.disabled).toBe(false);
    expect(deleteRowButton?.disabled).toBe(false);
    expect(addColumnAfterButton?.disabled).toBe(false);
    expect(deleteColumnButton?.disabled).toBe(false);
    expect(deleteTableButton?.disabled).toBe(false);
    expect(toggleHeaderRowButton?.disabled).toBe(false);
    expect(mergeCellsButton?.disabled).toBe(true);
    expect(splitCellButton?.disabled).toBe(true);

    toggleHeaderRowButton?.click();

    expect(getFirstRowCellTypes(mountedApp.editor.getJSON())).toEqual([
      'tableCell',
      'tableCell',
      'tableCell',
    ]);

    addRowAfterButton?.click();

    expect(getRows(getFirstTable(mountedApp.editor.getJSON()))).toHaveLength(4);

    setSelectionInFirstTableCell(mountedApp.editor);
    addColumnAfterButton?.click();

    expect(getCells(getRows(getFirstTable(mountedApp.editor.getJSON()))[0])).toHaveLength(4);

    setSelectionInFirstTableCell(mountedApp.editor);
    deleteRowButton?.click();

    expect(getRows(getFirstTable(mountedApp.editor.getJSON()))).toHaveLength(3);

    setSelectionInFirstTableCell(mountedApp.editor);
    deleteColumnButton?.click();

    expect(getCells(getRows(getFirstTable(mountedApp.editor.getJSON()))[0])).toHaveLength(3);

    setSelectionInFirstTwoTableCells(mountedApp.editor);
    expect(mergeCellsButton?.disabled).toBe(false);
    mergeCellsButton?.click();

    const mergedFirstRow = getRows(getFirstTable(mountedApp.editor.getJSON()))[0];
    const [mergedCell] = getCells(mergedFirstRow);

    expect(getCells(mergedFirstRow)).toHaveLength(2);
    expect(mergedCell).toMatchObject({
      attrs: expect.objectContaining({ colspan: 2 }),
    });
    expect(splitCellButton?.disabled).toBe(false);

    splitCellButton?.click();

    expect(getCells(getRows(getFirstTable(mountedApp.editor.getJSON()))[0])).toHaveLength(3);

    deleteTableButton?.click();

    expect(getTable(mountedApp.editor.getJSON())).toBeUndefined();
  });

  it('persists and reloads table rows, columns, headers, merged cells and widths', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-table-persistence',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent(createTablePersistenceContent());
    setSelectionInFirstTwoBodyCells(mountedApp.editor);

    expect(mountedApp.editor.commands.mergeCells()).toBe(true);

    const saveButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="save"]');
    saveButton?.click();
    await flushPromises();

    expect(storageDouble.saveDocument).toHaveBeenCalledWith(
      'doc-table-persistence',
      expect.objectContaining({
        title: 'Documento de ejemplo',
        contentJson: expect.objectContaining({ type: 'doc' }),
        contentHtml: expect.stringContaining('<table'),
      }),
    );

    const savedPayload = (
      storageDouble.saveDocument.mock.calls as unknown as [string, DocumentStoragePayload][]
    )[0]?.[1];

    if (!savedPayload) {
      throw new Error('Expected saved document payload');
    }

    const savedTable = getFirstTable(savedPayload.contentJson);
    const [savedHeaderRow, savedBodyRow] = getRows(savedTable);
    const savedHeaderCells = getCells(savedHeaderRow);
    const savedBodyCells = getCells(savedBodyRow);

    expect(getRows(savedTable)).toHaveLength(2);
    expect(savedHeaderCells).toHaveLength(3);
    expect(savedHeaderCells.map((cell) => cell.type)).toEqual([
      'tableHeader',
      'tableHeader',
      'tableHeader',
    ]);
    expect(savedHeaderCells.map((cell) => cell.attrs?.colwidth)).toEqual([[120], [160], [200]]);
    expect(savedBodyCells).toHaveLength(2);
    expect(savedBodyCells[0]).toMatchObject({
      type: 'tableCell',
      attrs: expect.objectContaining({
        colspan: 2,
        rowspan: 1,
        colwidth: [120, 160],
      }),
    });
    expect(savedBodyCells[1]).toMatchObject({
      type: 'tableCell',
      attrs: expect.objectContaining({
        colspan: 1,
        rowspan: 1,
        colwidth: [200],
      }),
    });
    expect(savedPayload.contentHtml).toContain('<colgroup>');
    expect(savedPayload.contentHtml).toContain('<th');
    expect(savedPayload.contentHtml).toContain('colspan="2"');
    expect(savedPayload.contentHtml).toContain('width: 120px');
    expect(savedPayload.contentHtml).toContain('width: 160px');
    expect(savedPayload.contentHtml).toContain('width: 200px');

    mountedApp.lifecycle.dispose();
    mountedApps.delete(mountedApp);
    appRoot.remove();

    const reloadedRoot = document.createElement('div');
    const reloadStorageDouble = createStorageDouble(savedPayload);
    document.body.append(reloadedRoot);

    const reloadedApp = await mountEditorApp({
      app: reloadedRoot,
      storage: reloadStorageDouble.service,
      documentId: 'doc-table-persistence',
    });
    mountedApps.add(reloadedApp);

    const reloadedTable = getFirstTable(reloadedApp.editor.getJSON());
    const previewContent = reloadedRoot.querySelector<HTMLElement>('.editor-preview__content');

    expect(reloadStorageDouble.loadDocument).toHaveBeenCalledWith('doc-table-persistence');
    expect(reloadedTable).toEqual(savedTable);
    expect(previewContent?.querySelectorAll('tr')).toHaveLength(2);
    expect(previewContent?.querySelectorAll('th')).toHaveLength(3);
    expect(previewContent?.querySelector('td[colspan="2"]')?.textContent).toContain(
      'Total combinado',
    );
    expect(previewContent?.innerHTML).toContain('<colgroup>');
    expect(previewContent?.innerHTML).toContain('width: 120px');
    expect(previewContent?.innerHTML).toContain('width: 160px');
    expect(previewContent?.innerHTML).toContain('width: 200px');
  });

  it('shows Error and keeps editor content when saving fails', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null, {
      saveError: new Error('Network error'),
    });
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
      documentId: 'doc-failing-save',
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<p>Contenido no guardado</p>');
    const saveButton = appRoot.querySelector<HTMLButtonElement>('[data-toolbar-action="save"]');
    saveButton?.click();

    await flushPromises();

    const statusBar = appRoot.querySelector<HTMLElement>('.editor-shell__status');

    expect(storageDouble.saveDocument).toHaveBeenCalledOnce();
    expect(appRoot.querySelector('#editor-status')?.textContent).toBe('Error');
    expect(statusBar?.dataset.saveStatus).toBe('error');
    expect(mountedApp.editor.getHTML()).toBe('<p>Contenido no guardado</p>');
  });

  it('updates the basic rendered preview when editor content changes', async () => {
    const appRoot = document.createElement('div');
    const storageDouble = createStorageDouble(null);
    document.body.append(appRoot);

    const mountedApp = await mountEditorApp({
      app: appRoot,
      storage: storageDouble.service,
    });
    mountedApps.add(mountedApp);

    mountedApp.editor.commands.setContent('<h3>Vista basica</h3><p>Render actualizado</p>');

    const previewContent = appRoot.querySelector<HTMLElement>('.editor-preview__content');

    expect(previewContent?.innerHTML).toContain('<h3>Vista basica</h3>');
    expect(previewContent?.innerHTML).toContain('<p>Render actualizado</p>');
  });
});

function createStorageDouble(
  loadedDocument: DocumentStoragePayload | null,
  options: { saveError?: Error } = {},
): {
  service: DocumentStorageService;
  loadDocument: ReturnType<typeof vi.fn<() => Promise<DocumentStoragePayload | null>>>;
  saveDocument: ReturnType<typeof vi.fn<() => Promise<void>>>;
} {
  const loadDocument = vi.fn(() => Promise.resolve(loadedDocument));
  const saveDocument = vi.fn(() =>
    options.saveError ? Promise.reject(options.saveError) : Promise.resolve(),
  );

  return {
    service: {
      loadDocument,
      saveDocument,
    },
    loadDocument,
    saveDocument,
  };
}

function createMediaUploadDouble(asset: { url: string; altText?: string }): {
  service: MediaUploadService;
  uploadImage: ReturnType<typeof vi.fn<MediaUploadService['uploadImage']>>;
} {
  const uploadImage = vi.fn<MediaUploadService['uploadImage']>((documentId, file, altText) =>
    Promise.resolve({
      id: 'asset-uploaded',
      documentId,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      url: asset.url,
      altText: asset.altText ?? altText,
      createdAt: '2026-07-07T00:00:00.000Z',
    }),
  );

  return {
    service: {
      uploadImage,
    },
    uploadImage,
  };
}

function flushPromises(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

function createImageFile(name: string, type: string): File {
  return new File([new Uint8Array(1024)], name, { type });
}

function setSelectedFiles(input: HTMLInputElement | null, files: readonly File[]): void {
  if (!input) {
    throw new Error('Expected file input');
  }

  Object.defineProperty(input, 'files', {
    configurable: true,
    value: files,
  });
}

function getImageDropTarget(root: ParentNode): HTMLElement {
  const dropTarget = root.querySelector<HTMLElement>('.editor-shell__editable');

  if (!dropTarget) {
    throw new Error('Expected image drop target');
  }

  return dropTarget;
}

function dispatchFileDragEvent(
  target: HTMLElement,
  type: 'dragover' | 'drop',
  files: readonly File[],
): Event {
  const event = new Event(type, {
    bubbles: true,
    cancelable: true,
  });
  const dataTransfer = {
    files,
    types: ['Files'],
    dropEffect: 'none',
  };

  Object.defineProperty(event, 'dataTransfer', {
    configurable: true,
    value: dataTransfer,
  });

  target.dispatchEvent(event);

  return event;
}

interface ClipboardItemDouble {
  kind: 'file' | 'string';
  type: string;
  getAsFile: () => File | null;
}

function dispatchClipboardEvent(target: HTMLElement, items: readonly ClipboardItemDouble[]): Event {
  const event = new Event('paste', {
    bubbles: true,
    cancelable: true,
  });

  Object.defineProperty(event, 'clipboardData', {
    configurable: true,
    value: {
      items,
    },
  });

  target.dispatchEvent(event);

  return event;
}

function createFileItem(file: File): ClipboardItemDouble {
  return {
    kind: 'file',
    type: file.type,
    getAsFile: () => file,
  };
}

function createTextItem(text: string): ClipboardItemDouble {
  return {
    kind: 'string',
    type: 'text/plain',
    getAsFile: () => {
      void text;
      return null;
    },
  };
}

function deleteUrlCreateObjectUrl(): void {
  Reflect.deleteProperty(URL, 'createObjectURL');
}

function createTablePersistenceContent(): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              createTableCell('tableHeader', 'Nombre', [120]),
              createTableCell('tableHeader', 'Cantidad', [160]),
              createTableCell('tableHeader', 'Estado', [200]),
            ],
          },
          {
            type: 'tableRow',
            content: [
              createTableCell('tableCell', 'Total combinado', [120]),
              createTableCell('tableCell', 'Detalle combinado', [160]),
              createTableCell('tableCell', 'Activo', [200]),
            ],
          },
        ],
      },
    ],
  };
}

function createTableCell(
  type: 'tableCell' | 'tableHeader',
  text: string,
  colwidth: number[],
  colspan = 1,
): JSONContent {
  return {
    type,
    attrs: {
      colspan,
      rowspan: 1,
      colwidth,
      align: null,
    },
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }],
      },
    ],
  };
}

function getFirstTable(content: JSONContent): JSONContent {
  const table = getTable(content);

  if (!table) {
    throw new Error('Expected table node');
  }

  return table;
}

function getTable(content: JSONContent): JSONContent | undefined {
  return content.content?.find((node) => node.type === 'table');
}

function getRows(table: JSONContent): JSONContent[] {
  return table.content ?? [];
}

function getCells(row: JSONContent | undefined): JSONContent[] {
  return row?.content ?? [];
}

function getFirstRowCellTypes(content: JSONContent): string[] {
  return getCells(getRows(getFirstTable(content))[0]).map((cell) => cell.type ?? '');
}

function setSelectionInFirstTableCell(editor: MountedEditorApp['editor']): void {
  const [cellPosition] = getCellPositions(editor);

  if (cellPosition === undefined) {
    throw new Error('Expected table cell position');
  }

  editor.commands.setCellSelection({ anchorCell: cellPosition });
}

function setSelectionInFirstTwoTableCells(editor: MountedEditorApp['editor']): void {
  const [firstCellPosition, secondCellPosition] = getCellPositions(editor);

  if (firstCellPosition === undefined || secondCellPosition === undefined) {
    throw new Error('Expected two table cell positions');
  }

  editor.commands.setCellSelection({
    anchorCell: firstCellPosition,
    headCell: secondCellPosition,
  });
}

function setSelectionInFirstTwoBodyCells(editor: MountedEditorApp['editor']): void {
  const [, , , firstBodyCellPosition, secondBodyCellPosition] = getCellPositions(editor);

  if (firstBodyCellPosition === undefined || secondBodyCellPosition === undefined) {
    throw new Error('Expected two body table cell positions');
  }

  editor.commands.setCellSelection({
    anchorCell: firstBodyCellPosition,
    headCell: secondBodyCellPosition,
  });
}

function getCellPositions(editor: MountedEditorApp['editor']): number[] {
  const positions: number[] = [];

  editor.state.doc.descendants((node, position) => {
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      positions.push(position);
    }
  });

  return positions;
}
