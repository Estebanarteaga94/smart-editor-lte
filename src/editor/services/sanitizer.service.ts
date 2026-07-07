import DOMPurify, { type Config } from 'dompurify';

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
  ALLOWED_TAGS: [
    'a',
    'b',
    'blockquote',
    'br',
    'code',
    'col',
    'colgroup',
    'del',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'li',
    'mark',
    'ol',
    'p',
    'pre',
    's',
    'span',
    'strike',
    'strong',
    'table',
    'tbody',
    'td',
    'th',
    'thead',
    'tr',
    'u',
    'ul',
  ],
  ALLOWED_ATTR: [
    'align',
    'alt',
    'checked',
    'class',
    'colspan',
    'colwidth',
    'height',
    'href',
    'rel',
    'rowspan',
    'src',
    'style',
    'target',
    'title',
    'type',
    'width',
  ],
  ADD_ATTR: ['colspan', 'colwidth', 'rowspan'],
  ALLOWED_URI_REGEXP: allowedUriPattern,
  FORBID_TAGS: ['iframe', 'script'],
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
