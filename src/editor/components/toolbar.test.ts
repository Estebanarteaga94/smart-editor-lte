/**
 * @vitest-environment jsdom
 */

import type { JSONContent } from '@tiptap/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createWysiwygEditor } from '../core/create-editor';
import { createEditorLifecycle } from '../core/editor-lifecycle';
import { createToolbar } from './toolbar';

const mountedEditors = new Set<ReturnType<typeof createWysiwygEditor>>();

function mountEditor() {
  const element = document.createElement('div');
  document.body.append(element);

  const editor = createWysiwygEditor({
    element,
    initialContent: '<p>Texto</p>',
  });

  mountedEditors.add(editor);
  return editor;
}

afterEach(() => {
  for (const editor of mountedEditors) {
    editor.destroy();
  }

  mountedEditors.clear();
  document.body.innerHTML = '';
});

describe('createToolbar', () => {
  it('renders accessible toolbar buttons', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const toolbar = createToolbar({
      editor,
      lifecycle,
      onSave: vi.fn(),
    });
    const buttons = [...toolbar.element.querySelectorAll('button')];
    const iconButtons = [...toolbar.element.querySelectorAll('.editor-shell__tool')];
    const colorSwatches = [
      ...toolbar.element.querySelectorAll<HTMLButtonElement>(
        '[data-toolbar-action="text-color-swatch"]',
      ),
    ];
    const separators = [...toolbar.element.querySelectorAll('.editor-toolbar__separator')];
    const blockFormatSelect = toolbar.element.querySelector<HTMLSelectElement>(
      '[data-toolbar-action="block-format"]',
    );
    const colorPicker = toolbar.element.querySelector<HTMLElement>(
      '[data-toolbar-action="text-color-picker"]',
    );
    const colorTrigger = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="text-color-trigger"]',
    );
    const colorPanel = toolbar.element.querySelector<HTMLElement>(
      '[data-toolbar-action="text-color-panel"]',
    );
    const themeGrid = toolbar.element.querySelector<HTMLElement>(
      '[data-toolbar-action="text-color-theme-grid"]',
    );
    const standardGrid = toolbar.element.querySelector<HTMLElement>(
      '[data-toolbar-action="text-color-standard-grid"]',
    );
    const moreColorsButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="text-color-more"]',
    );
    const colorInput = toolbar.element.querySelector<HTMLInputElement>(
      '[data-toolbar-action="text-color-input"]',
    );
    const automaticButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="text-color-automatic"]',
    );
    const highlightPicker = toolbar.element.querySelector<HTMLElement>(
      '[data-toolbar-action="highlight-color-picker"]',
    );
    const highlightTrigger = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="highlight-color-trigger"]',
    );
    const highlightThemeGrid = toolbar.element.querySelector<HTMLElement>(
      '[data-toolbar-action="highlight-color-theme-grid"]',
    );
    const linkPopover = toolbar.element.querySelector<HTMLElement>(
      '[data-toolbar-action="link-popover"]',
    );
    const linkTrigger = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="link-trigger"]',
    );
    const linkPanel = toolbar.element.querySelector<HTMLElement>(
      '[data-toolbar-action="link-panel"]',
    );
    const linkInput = toolbar.element.querySelector<HTMLInputElement>(
      '[data-toolbar-action="link-input"]',
    );
    const linkApplyButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="link-apply"]',
    );
    const linkRemoveButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="link-remove"]',
    );
    const insertTableButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="insert-table"]',
    );
    const insertImageButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="insert-image"]',
    );
    const sourceHtmlButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="source-html"]',
    );
    const sourceJsonButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="source-json"]',
    );
    const previewButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="preview"]',
    );
    const formatHtmlButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="format-html"]',
    );

    expect(blockFormatSelect).not.toBeNull();
    expect(blockFormatSelect?.getAttribute('aria-label')).toBe('Seleccionar formato de bloque');
    expect([...(blockFormatSelect?.options ?? [])].map((option) => option.value)).toEqual([
      'paragraph',
      'heading-1',
      'heading-2',
      'heading-3',
      'heading-4',
      'heading-5',
      'heading-6',
    ]);
    expect([...(blockFormatSelect?.options ?? [])].map((option) => option.textContent)).toEqual([
      'Parrafo',
      'Encabezado 1',
      'Encabezado 2',
      'Encabezado 3',
      'Encabezado 4',
      'Encabezado 5',
      'Encabezado 6',
    ]);
    expect(buttons).toHaveLength(145);
    expect(iconButtons).toHaveLength(25);
    expect(colorPicker).not.toBeNull();
    expect(colorTrigger).not.toBeNull();
    expect(colorPanel?.hidden).toBe(true);
    expect(colorTrigger?.getAttribute('aria-expanded')).toBe('false');

    colorTrigger?.click();

    expect(colorPanel?.hidden).toBe(false);
    expect(colorTrigger?.getAttribute('aria-expanded')).toBe('true');
    expect(automaticButton?.textContent).toContain('Automatico');
    expect(highlightPicker).not.toBeNull();
    expect(highlightTrigger?.getAttribute('aria-label')).toBe('Color de resaltado');
    expect(highlightThemeGrid?.getAttribute('aria-label')).toBe('Colores de tema');
    expect(linkPopover).not.toBeNull();
    expect(linkTrigger?.getAttribute('aria-label')).toBe('Configurar enlace');
    expect(linkTrigger?.getAttribute('aria-expanded')).toBe('false');
    expect(linkTrigger?.getAttribute('aria-pressed')).toBe('false');
    expect(linkPanel?.hidden).toBe(true);
    expect(linkInput?.type).toBe('url');
    expect(linkInput?.getAttribute('aria-label')).toBe('URL del enlace');
    expect(linkApplyButton?.textContent).toBe('Aplicar');
    expect(linkRemoveButton?.textContent).toBe('Quitar');
    expect(insertTableButton).not.toBeNull();
    expect(insertTableButton?.getAttribute('aria-label')).toBe(
      'Insertar tabla 3 por 3 con encabezado',
    );
    expect(insertTableButton?.querySelector('.editor-shell__tool-icon')?.textContent).toBe(
      '\uf0ce',
    );
    expect(insertImageButton).not.toBeNull();
    expect(insertImageButton?.getAttribute('aria-label')).toBe('Insertar imagen');
    expect(insertImageButton?.querySelector('.editor-shell__tool-icon')?.textContent).toBe(
      '\ue80d',
    );
    expect(insertImageButton?.disabled).toBe(true);
    expect(sourceHtmlButton).not.toBeNull();
    expect(sourceHtmlButton?.getAttribute('aria-label')).toBe('Alternar vista HTML');
    expect(sourceHtmlButton?.getAttribute('aria-pressed')).toBe('false');
    expect(sourceHtmlButton?.disabled).toBe(true);
    expect(sourceJsonButton).not.toBeNull();
    expect(sourceJsonButton?.getAttribute('aria-label')).toBe('Alternar vista JSON');
    expect(sourceJsonButton?.getAttribute('aria-pressed')).toBe('false');
    expect(sourceJsonButton?.querySelector('.editor-shell__tool-icon')?.textContent).toBe('\uf0f6');
    expect(sourceJsonButton?.disabled).toBe(true);
    expect(previewButton).not.toBeNull();
    expect(previewButton?.getAttribute('aria-label')).toBe('Alternar vista previa');
    expect(previewButton?.getAttribute('aria-pressed')).toBe('false');
    expect(previewButton?.querySelector('.editor-shell__tool-icon')?.textContent).toBe('\ue825');
    expect(previewButton?.disabled).toBe(true);
    expect(formatHtmlButton).not.toBeNull();
    expect(formatHtmlButton?.getAttribute('aria-label')).toBe('Formatear HTML fuente');
    expect(formatHtmlButton?.hidden).toBe(true);
    expect(formatHtmlButton?.disabled).toBe(true);
    expect(toolbar.element.querySelector('[data-toolbar-action="image-dimensions"]')).toBeNull();
    expect(toolbar.element.querySelector('[data-toolbar-action="image-width"]')).toBeNull();
    expect(toolbar.element.querySelector('[data-toolbar-action="image-height"]')).toBeNull();

    linkTrigger?.click();

    expect(linkPanel?.hidden).toBe(false);
    expect(linkTrigger?.getAttribute('aria-expanded')).toBe('true');
    expect(themeGrid).not.toBeNull();
    expect(themeGrid?.getAttribute('aria-label')).toBe('Colores de tema');
    expect(standardGrid).not.toBeNull();
    expect(standardGrid?.getAttribute('aria-label')).toBe('Colores estandar');
    expect(colorSwatches).toHaveLength(57);
    expect(colorInput).not.toBeNull();
    expect(colorInput?.type).toBe('color');
    expect(colorInput?.getAttribute('aria-label')).toBe('Seleccionar mas colores');
    expect(
      colorInput?.closest('[data-toolbar-action="text-color-custom"]')?.hasAttribute('hidden'),
    ).toBe(true);

    moreColorsButton?.click();

    expect(
      colorInput?.closest('[data-toolbar-action="text-color-custom"]')?.hasAttribute('hidden'),
    ).toBe(false);
    expect(moreColorsButton?.textContent).toContain('Mas colores...');
    expect(separators).toHaveLength(6);
    expect(separators.every((separator) => separator.getAttribute('aria-hidden') === 'true')).toBe(
      true,
    );
    expect(buttons.every((button) => ['button', 'submit'].includes(button.type))).toBe(true);
    expect(buttons.every((button) => button.hasAttribute('aria-label'))).toBe(true);
    expect(iconButtons.every((button) => button.querySelector('.editor-shell__tool-icon'))).toBe(
      true,
    );
    expect(toolbar.element.querySelector('[data-toolbar-action="save"]')).not.toBeNull();

    lifecycle.dispose();
  });

  it('executes editor commands and updates active state', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const onInsertImage = vi.fn();
    const onToggleSourceHtml = vi.fn();
    const onToggleSourceJson = vi.fn();
    const onTogglePreview = vi.fn();
    const onFormatHtml = vi.fn();
    let sourceMode: 'wysiwyg' | 'source-html' | 'source-json' | 'preview' = 'wysiwyg';
    const toolbar = createToolbar({
      editor,
      lifecycle,
      onSave: vi.fn(),
      onInsertImage,
      onToggleSourceHtml: () => {
        sourceMode = sourceMode === 'source-html' ? 'wysiwyg' : 'source-html';
        onToggleSourceHtml();
      },
      onToggleSourceJson: () => {
        sourceMode = sourceMode === 'source-json' ? 'wysiwyg' : 'source-json';
        onToggleSourceJson();
      },
      onTogglePreview: () => {
        sourceMode = sourceMode === 'preview' ? 'wysiwyg' : 'preview';
        onTogglePreview();
      },
      onFormatHtml,
      isSourceHtmlActive: () => sourceMode === 'source-html',
      isSourceJsonActive: () => sourceMode === 'source-json',
      isPreviewActive: () => sourceMode === 'preview',
    });
    const blockFormatSelect = toolbar.element.querySelector<HTMLSelectElement>(
      '[data-toolbar-action="block-format"]',
    );
    const boldButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="bold"]',
    );
    const strikeButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="strike"]',
    );
    const alignCenterButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="align-center"]',
    );
    const alignRightButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="align-right"]',
    );
    const alignJustifyButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="align-justify"]',
    );
    const alignLeftButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="align-left"]',
    );
    const colorInput = toolbar.element.querySelector<HTMLInputElement>(
      '[data-toolbar-action="text-color-input"]',
    );
    const colorTrigger = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="text-color-trigger"]',
    );
    const moreColorsButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="text-color-more"]',
    );
    const redSwatch = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="text-color-swatch"][data-text-color="#ff0000"]',
    );
    const automaticButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="text-color-automatic"]',
    );
    const highlightTrigger = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="highlight-color-trigger"]',
    );
    const highlightSwatch = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="highlight-color-swatch"][data-text-color="#ffff00"]',
    );
    const clearHighlightButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="highlight-color-automatic"]',
    );
    const horizontalRuleButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="horizontal-rule"]',
    );
    const codeBlockButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="code-block"]',
    );
    const insertTableButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="insert-table"]',
    );
    const insertImageButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="insert-image"]',
    );
    const sourceHtmlButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="source-html"]',
    );
    const sourceJsonButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="source-json"]',
    );
    const previewButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="preview"]',
    );
    const formatHtmlButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="format-html"]',
    );

    expect(blockFormatSelect).not.toBeNull();
    expect(boldButton).not.toBeNull();
    expect(strikeButton).not.toBeNull();
    expect(strikeButton?.querySelector('.editor-shell__tool-icon')?.textContent).toBe('\uf0cc');
    expect(alignCenterButton).not.toBeNull();
    expect(alignRightButton).not.toBeNull();
    expect(alignJustifyButton).not.toBeNull();
    expect(alignLeftButton).not.toBeNull();
    expect(colorInput).not.toBeNull();
    expect(colorTrigger).not.toBeNull();
    expect(moreColorsButton).not.toBeNull();
    expect(redSwatch).not.toBeNull();
    expect(automaticButton).not.toBeNull();
    expect(highlightTrigger).not.toBeNull();
    expect(highlightSwatch).not.toBeNull();
    expect(clearHighlightButton).not.toBeNull();
    expect(horizontalRuleButton).not.toBeNull();
    expect(codeBlockButton).not.toBeNull();
    expect(codeBlockButton?.querySelector('.editor-shell__tool-icon')?.textContent).toBe('\uf1c9');
    expect(insertTableButton).not.toBeNull();
    expect(insertImageButton).not.toBeNull();
    expect(insertImageButton?.disabled).toBe(false);
    expect(sourceHtmlButton).not.toBeNull();
    expect(sourceHtmlButton?.disabled).toBe(false);
    expect(sourceHtmlButton?.querySelector('.editor-shell__tool-icon')?.textContent).toBe('</>');
    expect(sourceJsonButton).not.toBeNull();
    expect(sourceJsonButton?.disabled).toBe(false);
    expect(sourceJsonButton?.querySelector('.editor-shell__tool-icon')?.textContent).toBe('\uf0f6');
    expect(previewButton).not.toBeNull();
    expect(previewButton?.disabled).toBe(false);
    expect(previewButton?.querySelector('.editor-shell__tool-icon')?.textContent).toBe('\ue825');
    expect(formatHtmlButton).not.toBeNull();
    expect(formatHtmlButton?.hidden).toBe(true);
    expect(formatHtmlButton?.disabled).toBe(true);

    previewButton?.click();
    toolbar.updateState();
    expect(onTogglePreview).toHaveBeenCalledOnce();
    expect(sourceJsonButton?.getAttribute('aria-pressed')).toBe('false');
    expect(sourceJsonButton?.dataset.active).toBe('false');
    expect(previewButton?.getAttribute('aria-pressed')).toBe('true');
    expect(previewButton?.dataset.active).toBe('true');

    previewButton?.click();
    toolbar.updateState();
    expect(onTogglePreview).toHaveBeenCalledTimes(2);
    expect(previewButton?.getAttribute('aria-pressed')).toBe('false');
    expect(formatHtmlButton?.querySelector('.editor-shell__tool-icon')?.textContent).toBe('{}');

    if (blockFormatSelect) {
      blockFormatSelect.value = 'heading-6';
      blockFormatSelect.dispatchEvent(new Event('change'));
    }

    expect(editor.isActive('heading', { level: 6 })).toBe(true);
    expect(blockFormatSelect?.value).toBe('heading-6');

    editor.commands.selectAll();
    boldButton?.click();
    expect(editor.isActive('bold')).toBe(true);
    expect(boldButton?.getAttribute('aria-pressed')).toBe('true');

    strikeButton?.click();
    expect(editor.isActive('strike')).toBe(true);
    expect(strikeButton?.getAttribute('aria-pressed')).toBe('true');

    alignCenterButton?.click();
    expect(editor.getAttributes('heading')).toMatchObject({ textAlign: 'center' });
    expect(alignCenterButton?.getAttribute('aria-pressed')).toBe('true');

    alignRightButton?.click();
    expect(editor.getAttributes('heading')).toMatchObject({ textAlign: 'right' });
    expect(alignRightButton?.getAttribute('aria-pressed')).toBe('true');

    alignJustifyButton?.click();
    expect(editor.getAttributes('heading')).toMatchObject({ textAlign: 'justify' });
    expect(alignJustifyButton?.getAttribute('aria-pressed')).toBe('true');

    alignLeftButton?.click();
    expect(editor.getAttributes('heading')).toMatchObject({ textAlign: 'left' });
    expect(alignLeftButton?.getAttribute('aria-pressed')).toBe('true');

    colorTrigger?.click();
    redSwatch?.click();
    expect(editor.getAttributes('textStyle')).toMatchObject({ color: '#ff0000' });
    expect(redSwatch?.dataset.active).toBe('true');
    expect(redSwatch?.getAttribute('aria-pressed')).toBe('true');
    expect(colorInput?.value).toBe('#ff0000');

    colorTrigger?.click();
    moreColorsButton?.click();

    if (colorInput) {
      colorInput.value = '#047857';
      colorInput.dispatchEvent(new Event('input'));
    }

    expect(editor.getAttributes('textStyle')).toMatchObject({ color: '#047857' });

    automaticButton?.click();
    expect(editor.getAttributes('textStyle')).not.toHaveProperty('color');

    highlightTrigger?.click();
    highlightSwatch?.click();
    expect(editor.getAttributes('highlight')).toMatchObject({ color: '#ffff00' });
    expect(highlightSwatch?.dataset.active).toBe('true');
    expect(highlightSwatch?.getAttribute('aria-pressed')).toBe('true');

    clearHighlightButton?.click();
    expect(editor.getAttributes('highlight')).not.toHaveProperty('color');

    insertImageButton?.click();
    expect(onInsertImage).toHaveBeenCalledOnce();

    sourceHtmlButton?.click();
    toolbar.updateState();
    expect(onToggleSourceHtml).toHaveBeenCalledOnce();
    expect(sourceHtmlButton?.getAttribute('aria-pressed')).toBe('true');
    expect(sourceHtmlButton?.dataset.active).toBe('true');
    expect(formatHtmlButton?.hidden).toBe(false);
    expect(formatHtmlButton?.disabled).toBe(false);

    formatHtmlButton?.click();
    expect(onFormatHtml).toHaveBeenCalledOnce();

    sourceJsonButton?.click();
    toolbar.updateState();
    expect(onToggleSourceJson).toHaveBeenCalledOnce();
    expect(sourceHtmlButton?.getAttribute('aria-pressed')).toBe('false');
    expect(sourceHtmlButton?.dataset.active).toBe('false');
    expect(sourceJsonButton?.getAttribute('aria-pressed')).toBe('true');
    expect(sourceJsonButton?.dataset.active).toBe('true');
    expect(formatHtmlButton?.hidden).toBe(true);
    expect(formatHtmlButton?.disabled).toBe(true);

    lifecycle.dispose();
  });

  it('toggles blockquote from the toolbar and preserves active state', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const toolbar = createToolbar({
      editor,
      lifecycle,
      onSave: vi.fn(),
    });
    const blockquoteButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="blockquote"]',
    );

    expect(blockquoteButton).not.toBeNull();
    expect(blockquoteButton?.getAttribute('aria-label')).toBe('Activar o desactivar cita');

    editor.commands.setContent('<p>Texto citado</p>');
    editor.commands.setTextSelection(2);
    toolbar.updateState();

    pressToolbarButton(blockquoteButton);
    expect(editor.isActive('blockquote')).toBe(true);
    expect(blockquoteButton?.getAttribute('aria-pressed')).toBe('true');
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Texto citado' }],
        },
      ],
    });

    pressToolbarButton(blockquoteButton);
    expect(editor.isActive('blockquote')).toBe(false);
    expect(blockquoteButton?.getAttribute('aria-pressed')).toBe('false');
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Texto citado' }],
    });

    lifecycle.dispose();
  });

  it('keeps selected image actions out of the toolbar', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const toolbar = createToolbar({
      editor,
      lifecycle,
      onSave: vi.fn(),
      onInsertImage: vi.fn(),
    });
    const alignLeftButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="align-left"]',
    );
    const alignCenterButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="align-center"]',
    );
    const alignRightButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="align-right"]',
    );
    const alignJustifyButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="align-justify"]',
    );

    editor.commands.setContent({
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: {
            src: '/assets/image.png',
            alt: 'Imagen',
          },
        },
      ],
    });
    editor.commands.setNodeSelection(0);
    toolbar.updateState();

    expect(alignLeftButton?.disabled).toBe(true);
    expect(alignCenterButton?.disabled).toBe(true);
    expect(alignRightButton?.disabled).toBe(true);
    expect(alignJustifyButton?.disabled).toBe(true);
    expect(toolbar.element.querySelector('[data-toolbar-action="image-dimensions"]')).toBeNull();
    expect(toolbar.element.querySelector('[data-toolbar-action="image-width"]')).toBeNull();
    expect(toolbar.element.querySelector('[data-toolbar-action="image-height"]')).toBeNull();

    alignCenterButton?.click();
    alignRightButton?.click();
    alignLeftButton?.click();

    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'image',
      attrs: {
        src: '/assets/image.png',
        alt: 'Imagen',
        align: null,
        width: null,
        height: null,
      },
    });

    lifecycle.dispose();
  });

  it('toggles code block from the toolbar and preserves editable code', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const toolbar = createToolbar({
      editor,
      lifecycle,
      onSave: vi.fn(),
    });
    const codeBlockButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="code-block"]',
    );

    expect(codeBlockButton).not.toBeNull();
    expect(codeBlockButton?.getAttribute('aria-label')).toBe(
      'Activar o desactivar bloque de codigo',
    );

    editor.commands.setContent('<p></p>');
    editor.commands.setTextSelection(1);
    toolbar.updateState();

    pressToolbarButton(codeBlockButton);
    expect(editor.isActive('codeBlock')).toBe(true);
    expect(codeBlockButton?.getAttribute('aria-pressed')).toBe('true');

    editor.commands.insertContent('const activo = true;');
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'codeBlock',
      content: [{ type: 'text', text: 'const activo = true;' }],
    });

    pressToolbarButton(codeBlockButton);
    expect(editor.isActive('codeBlock')).toBe(false);
    expect(codeBlockButton?.getAttribute('aria-pressed')).toBe('false');
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'paragraph',
      content: [{ type: 'text', text: 'const activo = true;' }],
    });

    lifecycle.dispose();
  });

  it('creates, edits, removes and rejects links from the toolbar popover', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const toolbar = createToolbar({
      editor,
      lifecycle,
      onSave: vi.fn(),
    });
    const linkTrigger = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="link-trigger"]',
    );
    const linkInput = toolbar.element.querySelector<HTMLInputElement>(
      '[data-toolbar-action="link-input"]',
    );
    const linkApplyButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="link-apply"]',
    );
    const linkRemoveButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="link-remove"]',
    );
    const linkError = toolbar.element.querySelector<HTMLElement>(
      '[data-toolbar-action="link-error"]',
    );

    expect(linkTrigger).not.toBeNull();
    expect(linkInput).not.toBeNull();
    expect(linkApplyButton).not.toBeNull();
    expect(linkRemoveButton).not.toBeNull();

    editor.commands.setContent('<p>Texto enlazado</p>');
    editor.commands.selectAll();
    toolbar.updateState();

    linkTrigger?.click();
    if (linkInput) {
      linkInput.value = 'example.com';
    }
    linkApplyButton?.click();

    expect(editor.getAttributes('link')).toMatchObject({
      href: 'https://example.com',
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
    });
    expect(linkTrigger?.getAttribute('aria-pressed')).toBe('true');

    editor.commands.setTextSelection(2);
    toolbar.updateState();
    linkTrigger?.click();
    expect(linkInput?.value).toBe('https://example.com');

    if (linkInput) {
      linkInput.value = 'https://docs.example.com/guia';
    }
    linkApplyButton?.click();

    expect(editor.getAttributes('link')).toMatchObject({
      href: 'https://docs.example.com/guia',
    });

    editor.commands.setTextSelection(2);
    toolbar.updateState();
    linkTrigger?.click();
    linkRemoveButton?.click();

    expect(editor.getAttributes('link')).not.toHaveProperty('href');
    expect(linkTrigger?.getAttribute('aria-pressed')).toBe('false');

    editor.commands.selectAll();
    toolbar.updateState();
    linkTrigger?.click();
    if (linkInput) {
      linkInput.value = 'javascript:alert(1)';
    }
    linkApplyButton?.click();

    expect(editor.getAttributes('link')).not.toHaveProperty('href');
    expect(linkError?.hidden).toBe(false);
    expect(linkInput?.getAttribute('aria-invalid')).toBe('true');

    lifecycle.dispose();
  });

  it('inserts a horizontal rule from the toolbar', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const toolbar = createToolbar({
      editor,
      lifecycle,
      onSave: vi.fn(),
    });
    const horizontalRuleButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="horizontal-rule"]',
    );

    expect(horizontalRuleButton).not.toBeNull();
    expect(horizontalRuleButton?.getAttribute('aria-label')).toBe('Insertar separador horizontal');

    editor.commands.setContent('<p>Antes</p>');
    editor.commands.setTextSelection(3);
    toolbar.updateState();

    pressToolbarButton(horizontalRuleButton);

    expect(editor.getJSON().content).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'horizontalRule' })]),
    );
    expect(editor.getHTML()).toContain('<hr>');

    lifecycle.dispose();
  });

  it('inserts a 3x3 table with a header row from the toolbar', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const toolbar = createToolbar({
      editor,
      lifecycle,
      onSave: vi.fn(),
    });
    const insertTableButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="insert-table"]',
    );

    expect(insertTableButton).not.toBeNull();
    expect(insertTableButton?.getAttribute('aria-label')).toBe(
      'Insertar tabla 3 por 3 con encabezado',
    );

    editor.commands.setContent('<p>Antes</p>');
    editor.commands.setTextSelection(3);
    toolbar.updateState();

    pressToolbarButton(insertTableButton);

    const table = editor.getJSON().content?.find((node) => node.type === 'table');
    const rows = table?.content ?? [];

    expect(table).toBeDefined();
    expect(rows).toHaveLength(3);
    expect(getChildTypes(rows[0])).toEqual(['tableHeader', 'tableHeader', 'tableHeader']);
    expect(getChildTypes(rows[1])).toEqual(['tableCell', 'tableCell', 'tableCell']);
    expect(editor.getHTML()).toContain('<table');
    expect(editor.getHTML()).toContain('<th');
    expect(editor.getHTML()).toContain('<td');

    lifecycle.dispose();
  });

  it('calls save handler from the save button', () => {
    const editor = mountEditor();
    const lifecycle = createEditorLifecycle();
    const onSave = vi.fn();
    const toolbar = createToolbar({
      editor,
      lifecycle,
      onSave,
    });
    const saveButton = toolbar.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="save"]',
    );

    saveButton?.click();

    expect(onSave).toHaveBeenCalledTimes(1);

    lifecycle.dispose();
  });
});

function pressToolbarButton(button: HTMLButtonElement | null): void {
  button?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  button?.click();
}

function getChildTypes(node: JSONContent | undefined): string[] {
  return node?.content?.map((child) => child.type ?? '') ?? [];
}
