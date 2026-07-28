import type { JSONContent } from '@tiptap/core';

import { createEditorShell } from './components/editor-shell';
import { createImageDialog } from './components/image-dialog';
import { createImageOptionsDialog } from './components/image-options-dialog';
import { createFullscreenController } from './components/fullscreen';
import { createPreviewView } from './components/preview-view';
import {
  createSourceView,
  resolveSourceJsonUpdate,
  type SourceView,
} from './components/source-view';
import { createTableMenu } from './components/table-menu';
import { createToolbar } from './components/toolbar';
import { createWysiwygEditor } from './core/create-editor';
import { editorCommands } from './core/editor-commands';
import { createEditorLifecycle } from './core/editor-lifecycle';
import type { PasteContentSafetyService } from './services/paste-content-safety.service';
import type { PasteNormalizerService } from './services/paste-normalizer.service';
import { defaultEditorConfig } from './models/editor-config';
import {
  defaultEditorViewState,
  type EditorMode,
  type EditorViewState,
} from './models/editor-mode';
import {
  createLocalDocumentStorageService,
  type DocumentStorageService,
} from './services/document-storage.service';
import {
  createLocalMediaUploadService,
  type MediaUploadService,
} from './services/media-upload.service';
import { createSanitizerService, type SanitizerService } from './services/sanitizer.service';
import { createHtmlFormatService, type HtmlFormatService } from './services/html-format.service';
import {
  createPasteContentSafetyService,
  sanitizeAndValidateHtmlAgainstSchema,
} from './services/paste-content-safety.service';
import { createPasteNormalizerService } from './services/paste-normalizer.service';
import {
  hasEmbeddedBase64Images,
  uploadEmbeddedPasteImages,
} from './services/embedded-image-paste.service';
import { getCanonicalEditorJson, serializeEditorContent } from './services/serializer.service';
import {
  invalidSourceHtmlSchemaMessage,
  invalidSourceJsonSchemaMessage,
  sourceJsonApplyErrorMessage,
} from './utils/source-error-messages';

export interface MountEditorAppOptions {
  app: HTMLElement;
  storage?: DocumentStorageService;
  mediaUpload?: MediaUploadService;
  htmlFormat?: HtmlFormatService;
  sanitizer?: SanitizerService;
  pasteNormalizer?: PasteNormalizerService;
  pasteContentSafety?: PasteContentSafetyService;
  documentId?: string;
  documentTitle?: string;
  placeholder?: string;
}

export interface MountedEditorApp {
  lifecycle: ReturnType<typeof createEditorLifecycle>;
  editor: ReturnType<typeof createWysiwygEditor>;
  getActiveMode: () => EditorMode;
  getViewState: () => EditorViewState;
  getSourceView: () => SourceView | null;
  getSourceHtmlValue: () => string | null;
  getSourceJsonValue: () => string | null;
  setFullscreen: (enabled: boolean) => void;
}

const defaultDocumentTitle = 'Documento de ejemplo';

export async function mountEditorApp({
  app,
  storage = createLocalDocumentStorageService(),
  mediaUpload = createLocalMediaUploadService(),
  htmlFormat = createHtmlFormatService(),
  sanitizer = createSanitizerService(),
  pasteNormalizer,
  pasteContentSafety,
  documentId = defaultEditorConfig.documentId,
  documentTitle = defaultDocumentTitle,
  placeholder = defaultEditorConfig.placeholder,
}: MountEditorAppOptions): Promise<MountedEditorApp> {
  const activePasteNormalizer = pasteNormalizer ?? createPasteNormalizerService();
  const activePasteContentSafety = pasteContentSafety ?? createPasteContentSafetyService(sanitizer);
  const shell = createEditorShell({
    saveStatus: 'unchanged',
  });
  const lifecycle = createEditorLifecycle();
  const loadedDocument = await storage.loadDocument(documentId);
  const activeDocumentTitle = loadedDocument?.title ?? documentTitle;
  const preview = createPreviewView({
    html: loadedDocument?.contentHtml ?? '',
    sanitizer,
  });
  let preservedImageSelection: { from: number; to: number } | null = null;
  let viewState: EditorViewState = { ...defaultEditorViewState };
  let sourceView: SourceView | null = null;
  let sourceHtmlValue: string | null = null;
  let sourceJsonValue: string | null = null;
  const fullscreen = createFullscreenController({
    root: shell.root,
    onChange: ({ enabled }) => {
      viewState = { ...viewState, fullscreen: enabled };
      toolbar.updateState();
    },
  });

  lifecycle.mountRoot(app, shell.root);
  preview.element.hidden = true;
  shell.source.after(preview.element);

  const editor = createWysiwygEditor({
    element: shell.editable,
    initialContent:
      loadedDocument?.contentJson ?? createDefaultDocumentContent(activeDocumentTitle),
    placeholder,
    pasteNormalizer: activePasteNormalizer,
    pasteContentSafety: activePasteContentSafety,
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
    onToggleSourceHtml: () => {
      if (viewState.mode === 'source-html') {
        if (!applyActiveSourceMode()) {
          return;
        }

        showWysiwygMode();
        return;
      }

      if (applyActiveSourceMode()) {
        showSourceHtmlMode();
      }
    },
    onToggleSourceJson: () => {
      if (viewState.mode === 'source-json') {
        if (!applyActiveSourceMode()) {
          return;
        }

        showWysiwygMode();
        return;
      }

      if (applyActiveSourceMode()) {
        showSourceJsonMode();
      }
    },
    onTogglePreview: () => {
      if (viewState.mode === 'preview') {
        showWysiwygMode();
        return;
      }

      if (applyActiveSourceMode()) {
        showPreviewMode();
      }
    },
    onToggleFullscreen: () => {
      fullscreen.toggle();
    },
    onFormatHtml: () => {
      void formatActiveSourceHtml();
    },
    isSourceHtmlActive: () => viewState.mode === 'source-html',
    isSourceJsonActive: () => viewState.mode === 'source-json',
    isPreviewActive: () => viewState.mode === 'preview',
    isFullscreenActive: () => viewState.fullscreen,
  });
  const tableMenu = createTableMenu({
    editor,
    lifecycle,
  });
  const imageOptionsDialog = createImageOptionsDialog({
    editor,
    lifecycle,
  });

  shell.toolbar.replaceChildren(toolbar.element);
  shell.root.append(tableMenu.element);
  shell.root.append(imageDialog.element);
  shell.root.append(imageOptionsDialog.element);
  registerImageDropUpload();
  registerImagePasteUpload();
  lifecycle.addEventListener(window, 'beforeunload', () => {
    lifecycle.dispose();
  });
  lifecycle.addEventListener(window, 'keydown', (event) => {
    if (event.key === 'Escape' && viewState.fullscreen) {
      fullscreen.setEnabled(false);
    }
  });

  return {
    lifecycle,
    editor,
    getActiveMode: () => viewState.mode,
    getViewState: () => ({ ...viewState }),
    getSourceView: () => sourceView,
    getSourceHtmlValue: () => sourceHtmlValue,
    getSourceJsonValue: () => sourceJsonValue,
    setFullscreen: (enabled) => fullscreen.setEnabled(enabled),
  };

  function showSourceHtmlMode(): void {
    setActiveMode('source-html');
    sourceHtmlValue = editor.getHTML();
    lifecycle.destroySourceView();
    sourceView = createSourceView({
      value: sourceHtmlValue,
      language: 'html',
      onChange: (value) => {
        sourceHtmlValue = value;
      },
    });
    lifecycle.registerSourceView(sourceView);
    shell.source.replaceChildren(sourceView.element);
    shell.source.hidden = false;
    shell.editable.hidden = true;
    preview.element.hidden = true;
    editor.setEditable(false);
    toolbar.updateState();
    tableMenu.updateState();
  }

  function showSourceJsonMode(): void {
    setActiveMode('source-json');
    sourceJsonValue = JSON.stringify(editor.getJSON(), null, 2);
    lifecycle.destroySourceView();
    sourceView = createSourceView({
      value: sourceJsonValue,
      language: 'json',
      onChange: (value) => {
        sourceJsonValue = value;
        validateActiveSourceJsonInput();
      },
    });
    lifecycle.registerSourceView(sourceView);
    shell.source.replaceChildren(sourceView.element);
    shell.source.hidden = false;
    shell.editable.hidden = true;
    preview.element.hidden = true;
    editor.setEditable(false);
    toolbar.updateState();
    tableMenu.updateState();
  }

  function showWysiwygMode(): void {
    setActiveMode('wysiwyg');
    lifecycle.destroySourceView();
    sourceView = null;
    shell.source.replaceChildren();
    shell.source.hidden = true;
    shell.editable.hidden = false;
    preview.element.hidden = true;
    editor.setEditable(true);
    toolbar.updateState();
    tableMenu.updateState();
  }

  function showPreviewMode(): void {
    setActiveMode('preview');
    lifecycle.destroySourceView();
    sourceView = null;
    shell.source.replaceChildren();
    shell.source.hidden = true;
    shell.editable.hidden = true;
    preview.setHtml(editor.getHTML());
    preview.element.hidden = false;
    editor.setEditable(false);
    toolbar.updateState();
    tableMenu.updateState();
  }

  function setActiveMode(mode: EditorMode): void {
    viewState = {
      ...viewState,
      mode,
    };
  }

  function applyActiveSourceMode(): boolean {
    return applyActiveSourceHtml() && applyActiveSourceJson();
  }

  async function formatActiveSourceHtml(): Promise<void> {
    if (viewState.mode !== 'source-html' || !sourceView) {
      return;
    }

    try {
      const result = await htmlFormat.formatHtml(sourceView.getValue());

      if (!result.ok) {
        shell.setSaveStatus('error', formatHtmlSourceError());
        return;
      }

      sourceView.setValue(result.html);
      sourceHtmlValue = result.html;
      shell.setSaveStatus('unchanged', 'HTML formateado');
    } catch {
      shell.setSaveStatus('error', formatHtmlSourceError());
    }
  }

  function applyActiveSourceHtml(): boolean {
    if (viewState.mode !== 'source-html') {
      return true;
    }

    const source = sourceView?.getValue() ?? sourceHtmlValue ?? '';
    const result = sanitizeAndValidateHtmlAgainstSchema(source, editor.state.schema, sanitizer);

    if (!result.ok) {
      shell.setSaveStatus('error', result.error ?? invalidSourceHtmlSchemaMessage);
      return false;
    }

    sourceHtmlValue = result.html;

    if (sourceView && sourceView.getValue() !== result.html) {
      sourceView.setValue(result.html);
    }

    editor.commands.setContent(result.html);
    shell.setSaveStatus('unchanged', 'HTML aplicado');
    window.setTimeout(() => {
      shell.setSaveStatus('unchanged', 'HTML aplicado');
    }, 0);

    return true;
  }

  function validateActiveSourceJsonInput(): boolean {
    if (viewState.mode !== 'source-json') {
      return true;
    }

    const source = sourceView?.getValue() ?? sourceJsonValue ?? '';
    const result = resolveSourceJsonUpdate(source, getCanonicalEditorJson(editor));

    if (!result.applied) {
      shell.setSaveStatus('error', result.error ?? invalidSourceJsonSchemaMessage);
      return false;
    }

    shell.setSaveStatus('unchanged', 'JSON valido');
    return true;
  }

  function applyActiveSourceJson(): boolean {
    if (viewState.mode !== 'source-json') {
      return true;
    }

    const source = sourceView?.getValue() ?? sourceJsonValue ?? '';
    const result = resolveSourceJsonUpdate(source, getCanonicalEditorJson(editor));

    if (!result.applied) {
      shell.setSaveStatus('error', result.error ?? invalidSourceJsonSchemaMessage);
      return false;
    }

    const formattedJson = JSON.stringify(result.content, null, 2);
    sourceJsonValue = formattedJson;

    if (sourceView && sourceView.getValue() !== formattedJson) {
      sourceView.setValue(formattedJson);
    }

    try {
      const applied = editor.commands.setContent(result.content);

      if (!applied) {
        shell.setSaveStatus('error', sourceJsonApplyErrorMessage);
        return false;
      }
    } catch {
      shell.setSaveStatus('error', sourceJsonApplyErrorMessage);
      return false;
    }

    shell.setSaveStatus('unchanged', 'JSON aplicado');
    window.setTimeout(() => {
      shell.setSaveStatus('unchanged', 'JSON aplicado');
    }, 0);

    return true;
  }

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

      shell.setSaveStatus(
        inserted ? 'saved' : 'error',
        inserted ? undefined : 'No se pudo insertar la imagen en el documento.',
      );
    } catch (error) {
      shell.setSaveStatus('error', formatImageUploadError(error));
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
    const clipboardHtml = getClipboardHtml(event);

    if (clipboardHtml && hasEmbeddedBase64Images(clipboardHtml)) {
      event.preventDefault();
      event.stopPropagation();

      const { from, to } = editor.state.selection;
      void insertHtmlWithUploadedEmbeddedImages(clipboardHtml, { from, to });
      return;
    }

    if (clipboardHtml) {
      return;
    }

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

  async function insertHtmlWithUploadedEmbeddedImages(
    html: string,
    selection: { from: number; to: number },
  ): Promise<void> {
    shell.setSaveStatus('saving');

    try {
      const result = await uploadEmbeddedPasteImages({
        html,
        documentId,
        mediaUpload,
      });
      const normalizedHtml = activePasteNormalizer.normalizePaste({
        html: result.html,
      }).normalizedHtml;
      const safeHtml = activePasteContentSafety.sanitizeAndValidateHtml(
        normalizedHtml,
        editor.state.schema,
      );

      if (!safeHtml.ok || safeHtml.html.trim().length === 0) {
        shell.setSaveStatus('error', 'No se pudo insertar el contenido pegado de forma segura.');
        return;
      }

      restorePasteSelection(selection);
      const inserted = editor.commands.insertContent(safeHtml.html, {
        applyPasteRules: false,
      });

      if (!inserted) {
        shell.setSaveStatus('error', 'No se pudo insertar el contenido pegado.');
        return;
      }

      shell.setSaveStatus(
        result.failedCount > 0 ? 'error' : 'saved',
        result.failedCount > 0
          ? `Se pego el contenido, pero ${formatImageCount(result.failedCount)} no se pudo subir.`
          : undefined,
      );
    } catch {
      shell.setSaveStatus('error', 'No se pudo procesar el contenido pegado con imagenes.');
    }
  }

  function restorePasteSelection(selection: { from: number; to: number }): void {
    if (editor.isDestroyed) {
      return;
    }

    const maxPosition = editor.state.doc.content.size;
    const from = Math.min(selection.from, maxPosition);
    const to = Math.min(Math.max(selection.to, from), maxPosition);
    editor.commands.setTextSelection({ from, to });
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

function getClipboardHtml(event: ClipboardEvent): string {
  const clipboardData = event.clipboardData;

  return clipboardData && typeof clipboardData.getData === 'function'
    ? clipboardData.getData('text/html')
    : '';
}

function formatImageCount(count: number): string {
  return count === 1 ? '1 imagen' : `${count} imagenes`;
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

function formatImageUploadError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'No se pudo subir la imagen. Intenta de nuevo.';
  }

  if (isImageValidationError(error.message)) {
    return error.message;
  }

  return 'No se pudo subir la imagen. Revisa la conexion e intenta de nuevo.';
}

function formatHtmlSourceError(): string {
  return 'No se pudo formatear el HTML. Corrige la estructura de etiquetas e intenta de nuevo.';
}

function isImageValidationError(message: string): boolean {
  return (
    message.startsWith('Formato de imagen no permitido:') ||
    message.startsWith('La imagen supera el limite') ||
    message === 'Archivo de imagen invalido'
  );
}
