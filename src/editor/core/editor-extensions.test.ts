import { describe, expect, it } from 'vitest';

import { createEditorExtensions } from './editor-extensions';

describe('createEditorExtensions', () => {
  it('registers the base editor extensions expected by the roadmap', () => {
    const extensionNames = createEditorExtensions({
      placeholder: 'Contenido...',
    }).map((extension) => extension.name);

    expect(extensionNames).toEqual(
      expect.arrayContaining([
        'starterKit',
        'underline',
        'textStyle',
        'color',
        'highlight',
        'textAlign',
        'link',
        'image',
        'table',
        'tableRow',
        'tableHeader',
        'tableCell',
        'taskList',
        'taskItem',
        'placeholder',
      ]),
    );
  });

  it('configures table column resizing with project-owned dimensions', () => {
    const tableExtension = createEditorExtensions().find((extension) => extension.name === 'table');

    expect(tableExtension?.options).toMatchObject({
      resizable: true,
      handleWidth: 6,
      cellMinWidth: 80,
      lastColumnResizable: true,
    });
  });

  it('registers image support through the project resizable image extension', () => {
    const imageExtension = createEditorExtensions().find((extension) => extension.name === 'image');

    expect(imageExtension?.options).toMatchObject({
      allowBase64: true,
      resize: {
        enabled: true,
        minWidth: 80,
        minHeight: 40,
        alwaysPreserveAspectRatio: true,
      },
    });
  });
});
