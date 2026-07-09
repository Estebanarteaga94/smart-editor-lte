import DOMPurify, { type Config } from 'dompurify';

import { allowedHtmlAttributes, allowedHtmlTags, forbiddenHtmlTags } from '../utils/html-policy';

export interface SanitizerService {
  sanitizeHtml(html: string): string;
}

const allowedUriPattern = /^(?:(?:https?|mailto):|\/(?!\/)|#|\.{1,2}\/)/i;
const blobUriPattern = /^blob:/i;
const tableCellSpanAttrs = new Set(['colspan', 'rowspan']);
const tableCellWidthAttrs = new Set(['colwidth']);
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
    node instanceof HTMLImageElement &&
    data.attrName === 'align' &&
    imageAlignments.has(data.attrValue)
  ) {
    data.keepAttr = true;
    data.forceKeepAttr = true;
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

export function createSanitizerService(): SanitizerService {
  return {
    sanitizeHtml,
  };
}
