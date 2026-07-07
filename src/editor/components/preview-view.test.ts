/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest';

import { createPreviewView } from './preview-view';

describe('createPreviewView', () => {
  it('renders a basic saved-content preview region', () => {
    const preview = createPreviewView({
      title: 'Renderizado',
      html: '<h1>Documento</h1><p>Contenido</p>',
    });

    expect(preview.element.tagName).toBe('SECTION');
    expect(preview.element.getAttribute('aria-label')).toBe('Renderizado');
    expect(preview.element.querySelector('.editor-preview__title')?.textContent).toBe(
      'Renderizado',
    );
    expect(preview.content.innerHTML).toBe('<h1>Documento</h1><p>Contenido</p>');
  });

  it('updates the rendered HTML', () => {
    const preview = createPreviewView();

    preview.setHtml('<p>Actualizado</p>');

    expect(preview.content.innerHTML).toBe('<p>Actualizado</p>');
  });

  it('sanitizes saved HTML before rendering it', () => {
    const preview = createPreviewView({
      html: '<script>alert("xss")</script><p onclick="alert(1)">Seguro</p><a href="javascript:alert(1)">Link</a>',
    });

    expect(preview.content.innerHTML).toContain('<p>Seguro</p>');
    expect(preview.content.innerHTML).toContain('<a>Link</a>');
    expect(preview.content.innerHTML).not.toContain('<script');
    expect(preview.content.innerHTML).not.toContain('onclick');
    expect(preview.content.innerHTML).not.toContain('javascript:');
  });

  it('sanitizes updated HTML before rendering it', () => {
    const preview = createPreviewView();

    preview.setHtml('<img src="/image.png" alt="Imagen" onerror="alert(1)">');

    expect(preview.content.innerHTML).toBe('<img src="/image.png" alt="Imagen">');
  });
});
