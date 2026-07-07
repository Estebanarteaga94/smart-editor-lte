import type { Editor } from '@tiptap/core';

import {
  parseCanonicalEditorContent,
  type CanonicalEditorContent,
  type CanonicalJsonNode,
} from '../models/editor-content';
import { sanitizeHtml } from './sanitizer.service';

export interface SerializedEditorContent {
  contentJson: CanonicalEditorContent;
  contentHtml: string;
}

export interface SerializerService {
  getContentJson(): CanonicalEditorContent;
  getContentHtml(): string;
  serialize(): SerializedEditorContent;
}

export function createSerializerService(editor: Editor): SerializerService {
  return {
    getContentJson() {
      return getCanonicalEditorJson(editor);
    },
    getContentHtml() {
      return getRenderableEditorHtml(editor);
    },
    serialize() {
      return serializeEditorContent(editor);
    },
  };
}

export function getCanonicalEditorJson(editor: Editor): CanonicalEditorContent {
  return parseCanonicalEditorContent(editor.getJSON());
}

export function getRenderableEditorHtml(editor: Editor): string {
  return getRenderableEditorHtmlFromContent(editor.getHTML(), getCanonicalEditorJson(editor));
}

export function serializeEditorContent(editor: Editor): SerializedEditorContent {
  const contentJson = getCanonicalEditorJson(editor);

  return {
    contentJson,
    contentHtml: getRenderableEditorHtmlFromContent(editor.getHTML(), contentJson),
  };
}

function getRenderableEditorHtmlFromContent(
  html: string,
  contentJson: CanonicalEditorContent,
): string {
  const htmlWithCanonicalTableAttrs = applyCanonicalTableCellAttributes(html, contentJson);
  const sanitizedHtml = sanitizeHtml(htmlWithCanonicalTableAttrs);

  return applyCanonicalTableCellAttributes(sanitizedHtml, contentJson);
}

function applyCanonicalTableCellAttributes(
  html: string,
  contentJson: CanonicalEditorContent,
): string {
  if (typeof document === 'undefined') {
    return html;
  }

  const template = document.createElement('template');
  const jsonTables = collectTableNodes(contentJson);

  template.innerHTML = html;

  const htmlTables = Array.from(template.content.querySelectorAll('table'));

  jsonTables.forEach((jsonTable, tableIndex) => {
    const htmlTable = htmlTables[tableIndex];

    if (!htmlTable) {
      return;
    }

    applyTableCellAttributes(htmlTable, jsonTable);
  });

  return template.innerHTML;
}

function applyTableCellAttributes(htmlTable: HTMLTableElement, jsonTable: CanonicalJsonNode): void {
  const jsonRows = jsonTable.content?.filter((node) => node.type === 'tableRow') ?? [];
  const htmlRows = Array.from(htmlTable.querySelectorAll('tr'));

  jsonRows.forEach((jsonRow, rowIndex) => {
    const htmlRow = htmlRows[rowIndex];

    if (!htmlRow) {
      return;
    }

    const jsonCells =
      jsonRow.content?.filter((node) => node.type === 'tableCell' || node.type === 'tableHeader') ??
      [];
    const htmlCells = getDirectHtmlTableCells(htmlRow);

    jsonCells.forEach((jsonCell, cellIndex) => {
      const htmlCell = htmlCells[cellIndex];

      if (!htmlCell) {
        return;
      }

      applyCellAttrs(htmlCell, jsonCell.attrs);
    });
  });
}

function getDirectHtmlTableCells(htmlRow: HTMLTableRowElement): HTMLTableCellElement[] {
  return Array.from(htmlRow.children).filter(
    (child): child is HTMLTableCellElement => child.tagName === 'TD' || child.tagName === 'TH',
  );
}

function applyCellAttrs(htmlCell: HTMLTableCellElement, attrs: CanonicalJsonNode['attrs']): void {
  const colspan = attrs?.colspan;
  const rowspan = attrs?.rowspan;
  const colwidth = attrs?.colwidth;

  if (typeof colspan === 'number' && colspan > 1) {
    htmlCell.setAttribute('colspan', String(colspan));
  }

  if (typeof rowspan === 'number' && rowspan > 1) {
    htmlCell.setAttribute('rowspan', String(rowspan));
  }

  if (Array.isArray(colwidth) && colwidth.some((width) => typeof width === 'number' && width > 0)) {
    htmlCell.setAttribute('colwidth', colwidth.map((width) => width ?? '').join(','));
  }
}

function collectTableNodes(node: CanonicalJsonNode): CanonicalJsonNode[] {
  const nestedTables = node.content?.flatMap(collectTableNodes) ?? [];

  if (node.type === 'table') {
    return [node, ...nestedTables];
  }

  return nestedTables;
}
