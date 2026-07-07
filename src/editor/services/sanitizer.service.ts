import DOMPurify, { type Config } from 'dompurify';

export interface SanitizerService {
  sanitizeHtml(html: string): string;
}

const allowedUriPattern = /^(?:(?:https?|mailto):|\/|#)/i;

export const editorSanitizerConfig: Config = {
  ALLOWED_TAGS: [
    'a',
    'b',
    'blockquote',
    'br',
    'code',
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
  ALLOWED_URI_REGEXP: allowedUriPattern,
  FORBID_TAGS: ['iframe', 'script'],
};

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, editorSanitizerConfig);
}

export function createSanitizerService(): SanitizerService {
  return {
    sanitizeHtml,
  };
}
