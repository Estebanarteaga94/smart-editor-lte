import type { JSONContent } from '@tiptap/core';

import { createEditorShell } from './components/editor-shell';
import { createImageDialog } from './components/image-dialog';
import { createPreviewView } from './components/preview-view';
import { createTableMenu } from './components/table-menu';
import { createToolbar } from './components/toolbar';
import { createWysiwygEditor } from './core/create-editor';
import { editorCommands } from './core/editor-commands';
import { createEditorLifecycle } from './core/editor-lifecycle';
import { defaultEditorConfig } from './models/editor-config';
import {
  createLocalDocumentStorageService,
  type DocumentStorageService,
} from './services/document-storage.service';
import {
  createLocalMediaUploadService,
  type MediaUploadService,
} from './services/media-upload.service';
import { serializeEditorContent } from './services/serializer.service';

export interface MountEditorAppOptions {
  app: HTMLElement;
  storage?: DocumentStorageService;
  mediaUpload?: MediaUploadService;
  documentId?: string;
  documentTitle?: string;
  placeholder?: string;
}

export interface MountedEditorApp {
  lifecycle: ReturnType<typeof createEditorLifecycle>;
  editor: ReturnType<typeof createWysiwygEditor>;
}

const defaultDocumentTitle = 'Documento de ejemplo';

export async function mountEditorApp({
  app,
  storage = createLocalDocumentStorageService(),
  mediaUpload = createLocalMediaUploadService(),
  documentId = defaultEditorConfig.documentId,
  documentTitle = defaultDocumentTitle,
  placeholder = defaultEditorConfig.placeholder,
}: MountEditorAppOptions): Promise<MountedEditorApp> {
  const shell = createEditorShell({
    saveStatus: 'unchanged',
  });
  const lifecycle = createEditorLifecycle();
  const loadedDocument = await storage.loadDocument(documentId);
  const activeDocumentTitle = loadedDocument?.title ?? documentTitle;
  const preview = createPreviewView({
    html: loadedDocument?.contentHtml ?? '',
  });
  let preservedImageSelection: { from: number; to: number } | null = null;

  lifecycle.mountRoot(app, shell.root);
  shell.root.append(preview.element);

  const editor = createWysiwygEditor({
    element: shell.editable,
    initialContent:
      loadedDocument?.contentJson ?? createDefaultDocumentContent(activeDocumentTitle),
    placeholder,
    onChange: ({ contentJson, contentHtml }) => {
      shell.setSaveStatus('saving');
      preview.setHtml(contentHtml);

      if (contentJson.type && contentHtml.length > 0) {
        shell.setSaveStatus('saved');
        return;
      }

      shell.setSaveStatus('error');
    },
  });
  preview.setHtml(editor.getHTML());

  lifecycle.registerTiptapEditor(editor);
  const imageDialog = createImageDialog({
    lifecycle,
    onSubmit: ({ file, altText }) => {
      void insertUploadedImage(file, altText);
    },
  });
  const toolbar = createToolbar({
    editor,
    lifecycle,
    onInsertImage: () => {
      const { from, to } = editor.state.selection;
      preservedImageSelection = { from, to };
      imageDialog.open();
    },
    onSave: async () => {
      try {
        shell.setSaveStatus('saving');
        await storage.saveDocument(documentId, {
          title: activeDocumentTitle,
          ...serializeEditorContent(editor),
        });
        shell.setSaveStatus('saved');
      } catch {
        shell.setSaveStatus('error');
      }
    },
  });
  const tableMenu = createTableMenu({
    editor,
    lifecycle,
  });

  shell.toolbar.replaceChildren(toolbar.element);
  toolbar.element.append(tableMenu.element);
  shell.root.append(imageDialog.element);
  registerImageDropUpload();
  registerImagePasteUpload();
  lifecycle.addEventListener(window, 'beforeunload', () => {
    lifecycle.dispose();
  });

  return {
    lifecycle,
    editor,
  };

  async function insertUploadedImage(file: File, altText: string): Promise<void> {
    try {
      imageDialog.setDisabled(true);
      shell.setSaveStatus('saving');
      restorePreservedImageSelection();

      const asset = await mediaUpload.uploadImage(documentId, file, altText);
      restorePreservedImageSelection();
      const inserted = editorCommands.insertImage(editor, {
        src: asset.url,
        alt: asset.altText ?? altText,
      });

      shell.setSaveStatus(inserted ? 'saved' : 'error');
    } catch {
      shell.setSaveStatus('error');
    } finally {
      imageDialog.setDisabled(false);
      preservedImageSelection = null;
    }
  }

  function restorePreservedImageSelection(): void {
    if (!preservedImageSelection || editor.isDestroyed) {
      return;
    }

    editor.commands.setTextSelection(preservedImageSelection);
  }

  function registerImageDropUpload(): void {
    lifecycle.addEventListener(shell.editable, 'dragenter', handleImageDragEnter, {
      capture: true,
    });
    lifecycle.addEventListener(shell.editable, 'dragover', handleImageDragOver, {
      capture: true,
    });
    lifecycle.addEventListener(shell.editable, 'dragleave', handleImageDragLeave, {
      capture: true,
    });
    lifecycle.addEventListener(shell.editable, 'drop', handleImageDrop, {
      capture: true,
    });
  }

  function handleImageDragEnter(event: DragEvent): void {
    if (!hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    shell.editable.classList.add('editor-shell__editable--drop-target');
  }

  function handleImageDragOver(event: DragEvent): void {
    if (!hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    shell.editable.classList.add('editor-shell__editable--drop-target');

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  function handleImageDragLeave(event: DragEvent): void {
    if (event.relatedTarget instanceof Node && shell.editable.contains(event.relatedTarget)) {
      return;
    }

    shell.editable.classList.remove('editor-shell__editable--drop-target');
  }

  function handleImageDrop(event: DragEvent): void {
    const file = getFirstDroppedFile(event);

    if (!file) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    shell.editable.classList.remove('editor-shell__editable--drop-target');
    preserveImageSelectionFromDrop(event);
    void insertUploadedImage(file, '');
  }

  function preserveImageSelectionFromDrop(event: DragEvent): void {
    const dropPosition = getDropPosition(event);

    if (dropPosition !== null) {
      preservedImageSelection = {
        from: dropPosition,
        to: dropPosition,
      };
      return;
    }

    const { from, to } = editor.state.selection;
    preservedImageSelection = { from, to };
  }

  function getDropPosition(event: DragEvent): number | null {
    try {
      const result = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });

      return result?.pos ?? null;
    } catch {
      return null;
    }
  }

  function registerImagePasteUpload(): void {
    lifecycle.addEventListener(shell.editable, 'paste', handleImagePaste, {
      capture: true,
    });
  }

  function handleImagePaste(event: ClipboardEvent): void {
    const file = getFirstPastedImageFile(event);

    if (!file) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const { from, to } = editor.state.selection;
    preservedImageSelection = { from, to };
    void insertUploadedImage(file, '');
  }
}

function hasDraggedFiles(event: DragEvent): boolean {
  const dataTransfer = event.dataTransfer;

  if (!dataTransfer) {
    return false;
  }

  return dataTransfer.files.length > 0 || Array.from(dataTransfer.types).includes('Files');
}

function getFirstDroppedFile(event: DragEvent): File | null {
  const files = event.dataTransfer?.files;

  if (!files || files.length === 0) {
    return null;
  }

  return files[0] ?? null;
}

function getFirstPastedImageFile(event: ClipboardEvent): File | null {
  const items = event.clipboardData?.items;

  if (!items) {
    return null;
  }

  for (const item of Array.from(items)) {
    if (item.kind !== 'file' || !item.type.startsWith('image/')) {
      continue;
    }

    const file = item.getAsFile();

    if (file) {
      return file;
    }
  }

  return null;
}

function createDefaultDocumentContent(title: string): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: {
          level: 1,
        },
        content: [
          {
            type: 'text',
            text: title,
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Este contenido se renderiza desde Tiptap y ya emite JSON/HTML al editar.',
          },
        ],
      },
    ],
  };
}
