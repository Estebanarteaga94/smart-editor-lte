/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest';

import { createEditorShell } from './editor-shell';

describe('createEditorShell', () => {
  it('renders the main editor shell structure', () => {
    const shell = createEditorShell({
      title: 'Titulo',
      description: 'Descripcion',
      statusLabel: 'Guardado',
      saveStatus: 'unchanged',
    });

    expect(shell.root.tagName).toBe('MAIN');
    expect(shell.root.querySelector('h1')?.textContent).toBe('Titulo');
    expect(shell.root.querySelector('p')?.textContent).toBe('Descripcion');
    expect(shell.toolbar.getAttribute('role')).toBe('toolbar');
    expect(shell.root.querySelector('.editor-shell__table-menu-slot')).toBeNull();
    expect(shell.editable.id).toBe('wysiwyg-editor');
    expect(shell.status.id).toBe('editor-status');
    expect(shell.status.textContent).toBe('Sin cambios');
    expect(shell.statusBar.dataset.saveStatus).toBe('unchanged');
  });

  it('renders an empty toolbar slot for the functional toolbar', () => {
    const shell = createEditorShell();

    expect(shell.toolbar.querySelectorAll('button')).toHaveLength(0);
  });

  it('renders all supported save status states', () => {
    const shell = createEditorShell();

    shell.setSaveStatus('saving');
    expect(shell.status.textContent).toBe('Guardando');
    expect(shell.statusBar.dataset.saveStatus).toBe('saving');

    shell.setSaveStatus('saved');
    expect(shell.status.textContent).toBe('Guardado');
    expect(shell.statusBar.dataset.saveStatus).toBe('saved');

    shell.setSaveStatus('error');
    expect(shell.status.textContent).toBe('Error');
    expect(shell.statusBar.dataset.saveStatus).toBe('error');

    shell.setSaveStatus('unchanged');
    expect(shell.status.textContent).toBe('Sin cambios');
    expect(shell.statusBar.dataset.saveStatus).toBe('unchanged');
  });
});
