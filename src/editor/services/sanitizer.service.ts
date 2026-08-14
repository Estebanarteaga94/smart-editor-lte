import DOMPurify, { type Config } from 'dompurify';

import { allowedHtmlAttributes, allowedHtmlTags, forbiddenHtmlTags } from '../utils/html-policy';

export interface SanitizerService {
  sanitizeHtml(html: string): string;
}

const allowedUriPattern =
  /^(?:(?:https?|mailto):\S*|\/(?!\/)\S*|#\S*|\.{1,2}\/\S*|(?![a-z][a-z0-9+.-]*:)(?!\/\/)[^\\\s]+)$/i;
const importedHtmlAllowedUriPattern =
  /^(?:(?:https?|mailto):\S*|\/(?!\/)\S*|#\S*|\.{1,2}\/\S*|(?![a-z][a-z0-9+.-]*:)(?!\/\/)[^\\\s]+|data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/]+={0,2})$/i;
const blobUriPattern = /^blob:/i;
const tableCellSpanAttrs = new Set(['colspan', 'rowspan']);
const tableCellWidthAttrs = new Set(['colwidth']);
const imageDimensionAttrs = new Set(['height', 'width']);
const imageAlignments = new Set(['left', 'center', 'right']);
const positiveIntegerPattern = /^[1-9]\d*$/;
const colwidthPattern = /^[1-9]\d*(?:\s*,\s*[1-9]\d*)*$/;

export const editorSanitizerConfig: Config = {
  ALLOWED_TAGS: [...allowedHtmlTags],
  ALLOWED_ATTR: [...allowedHtmlAttributes],
  ADD_ATTR: ['colspan', 'colwidth', 'rowspan'],
  ALLOWED_URI_REGEXP: allowedUriPattern,
  FORBID_TAGS: [...forbiddenHtmlTags],
};

DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  if (
    node instanceof HTMLOListElement &&
    data.attrName === 'start' &&
    positiveIntegerPattern.test(data.attrValue)
  ) {
    data.keepAttr = true;
    data.forceKeepAttr = true;
    return;
  }

  if (
    node instanceof HTMLImageElement &&
    imageDimensionAttrs.has(data.attrName) &&
    positiveIntegerPattern.test(data.attrValue)
  ) {
    data.keepAttr = true;
    data.forceKeepAttr = true;
    return;
  }

  if (node instanceof HTMLImageElement && data.attrName === 'align') {
    const validAlignment = imageAlignments.has(data.attrValue);
    data.keepAttr = validAlignment;
    data.forceKeepAttr = validAlignment;
    return;
  }

  if (
    node instanceof HTMLImageElement &&
    data.attrName === 'src' &&
    blobUriPattern.test(data.attrValue)
  ) {
    data.keepAttr = true;
    data.forceKeepAttr = true;
    return;
  }

  if (!(node instanceof HTMLTableCellElement)) {
    return;
  }

  if (tableCellSpanAttrs.has(data.attrName) && positiveIntegerPattern.test(data.attrValue)) {
    data.keepAttr = true;
    data.forceKeepAttr = true;
    return;
  }

  if (tableCellWidthAttrs.has(data.attrName) && colwidthPattern.test(data.attrValue)) {
    data.keepAttr = true;
    data.forceKeepAttr = true;
  }
});

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, editorSanitizerConfig);
}

export function sanitizeImportedHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ...editorSanitizerConfig,
    ALLOWED_URI_REGEXP: importedHtmlAllowedUriPattern,
  });
}

export function createSanitizerService(): SanitizerService {
  return {
    sanitizeHtml,
  };
}
