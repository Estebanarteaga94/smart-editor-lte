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
});
