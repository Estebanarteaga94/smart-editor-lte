import { isSafeLinkHref } from '../utils/safe-url';

export type PasteNormalizationSource = 'word' | 'excel' | 'html' | 'plain-text' | 'unknown';

export type PasteNormalizationWarningCode =
  | 'converted-tabular-text'
  | 'discarded-unsupported-style'
  | 'removed-office-metadata'
  | 'removed-unsafe-content'
  | 'unknown-source';

export type PasteNormalizationWarningSeverity = 'info' | 'warning';

export interface PasteNormalizationWarning {
  code: PasteNormalizationWarningCode;
  severity: PasteNormalizationWarningSeverity;
  message: string;
}

export type PasteNormalizerInput =
  | {
      html: string;
      text?: string;
    }
  | {
      html?: undefined;
      text: string;
    };

export interface PasteNormalizationResult {
  normalizedHtml: string;
  warnings: PasteNormalizationWarning[];
  detectedSource: PasteNormalizationSource;
}

export interface PasteNormalizerService {
  normalizePaste(input: PasteNormalizerInput): PasteNormalizationResult;
}

export function normalizePaste(input: PasteNormalizerInput): PasteNormalizationResult {
  const html = getNonEmptyHtml(input);

  if (html !== null) {
    const inputHtml = normalizeHtmlInput(html);
    const detectedSource = detectHtmlSource(inputHtml);

    return {
      normalizedHtml: detectedSource === 'word' ? normalizeWordHtml(inputHtml) : inputHtml,
      warnings: [],
      detectedSource,
    };
  }

  const text = input.text?.trim() ?? '';

  if (text.length === 0) {
    return {
      normalizedHtml: '',
      warnings: [
        {
          code: 'unknown-source',
          severity: 'info',
          message: 'No se recibio contenido para normalizar.',
        },
      ],
      detectedSource: 'unknown',
    };
  }

  return {
    normalizedHtml: normalizePlainTextInput(text),
    warnings: [],
    detectedSource: 'plain-text',
  };
}

export function createPasteNormalizerService(): PasteNormalizerService {
  return {
    normalizePaste,
  };
}

function getNonEmptyHtml(input: PasteNormalizerInput): string | null {
  if (input.html === undefined || input.html.trim().length === 0) {
    return null;
  }

  return input.html;
}

function normalizeHtmlInput(html: string): string {
  return normalizeLineEndings(html).trim();
}

function detectHtmlSource(html: string): PasteNormalizationSource {
  if (isExcelHtml(html)) {
    return 'excel';
  }

  return isWordHtml(html) ? 'word' : 'html';
}

function isWordHtml(html: string): boolean {
  return wordHtmlMarkers.some((marker) => marker.test(html));
}

function isExcelHtml(html: string): boolean {
  return excelHtmlMarkers.some((marker) => marker.test(html));
}

function normalizeWordHtml(html: string): string {
  if (typeof DOMParser === 'undefined') {
    return fallbackNormalizeWordHtml(html);
  }

  const document = new DOMParser().parseFromString(html, 'text/html');

  return Array.from(document.body.childNodes).map(serializeWordNode).join('').trim();
}

function serializeWordNode(node: ChildNode): string {
  if (node.nodeType === Node.COMMENT_NODE) {
    return '';
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtml(node.textContent ?? '');
  }

  if (!(node instanceof HTMLElement)) {
    return '';
  }

  const tagName = node.tagName.toLowerCase();

  if (metadataTags.has(tagName) || tagName.includes(':')) {
    return '';
  }

  const children = serializeWordChildren(node);

  if (tagName === 'span') {
    return normalizeWordInlineElement(node, children);
  }

  if (!allowedWordTags.has(tagName)) {
    return normalizeWordInlineElement(node, children);
  }

  if (tagName === 'br') {
    return '<br>';
  }

  return `<${tagName}${serializeWordAttributes(node, tagName)}>${normalizeWordInlineElement(
    node,
    children,
    tagName,
  )}</${tagName}>`;
}

function serializeWordChildren(element: HTMLElement): string {
  return Array.from(element.childNodes).map(serializeWordNode).join('');
}

function normalizeWordInlineElement(
  element: HTMLElement,
  children: string,
  currentTag?: string,
): string {
  if (isEmptyHtmlFragment(children)) {
    return '';
  }

  return getFormatTagsFromStyle(element.getAttribute('style') ?? '')
    .filter((tagName) => tagName !== currentTag && !equivalentFormatTags(tagName, currentTag))
    .reduceRight((html, tagName) => `<${tagName}>${html}</${tagName}>`, children);
}

function serializeWordAttributes(element: HTMLElement, tagName: string): string {
  const attributes: string[] = [];

  if (tagName === 'a') {
    const href = element.getAttribute('href')?.trim();
    const title = element.getAttribute('title')?.trim();

    if (href && isSafeLinkHref(href)) {
      attributes.push(`href="${escapeAttribute(href)}"`);
    }

    if (title) {
      attributes.push(`title="${escapeAttribute(title)}"`);
    }
  }

  if (tagName === 'td' || tagName === 'th') {
    for (const attributeName of tableCellSpanAttributes) {
      const value = element.getAttribute(attributeName)?.trim();

      if (value && positiveIntegerPattern.test(value)) {
        attributes.push(`${attributeName}="${value}"`);
      }
    }
  }

  if (tagName === 'ol') {
    const start = element.getAttribute('start')?.trim();

    if (start && positiveIntegerPattern.test(start)) {
      attributes.push(`start="${start}"`);
    }
  }

  return attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
}

function getFormatTagsFromStyle(style: string): string[] {
  const tags: string[] = [];

  if (/\bfont-weight\s*:\s*(?:bold|[6-9]00)\b/i.test(style)) {
    tags.push('strong');
  }

  if (/\bfont-style\s*:\s*italic\b/i.test(style)) {
    tags.push('em');
  }

  const textDecoration = /\btext-decoration(?:-line)?\s*:\s*([^;]+)/i.exec(style)?.[1] ?? '';

  if (/\bunderline\b/i.test(textDecoration)) {
    tags.push('u');
  }

  if (/\b(?:line-through|strikethrough)\b/i.test(textDecoration)) {
    tags.push('s');
  }

  return tags;
}

function equivalentFormatTags(tagName: string, currentTag: string | undefined): boolean {
  if (!currentTag) {
    return false;
  }

  return formatTagEquivalents.get(tagName)?.has(currentTag) ?? false;
}

function isEmptyHtmlFragment(html: string): boolean {
  return html.replace(/[\s\u00a0]/g, '').length === 0;
}

function normalizePlainTextInput(text: string): string {
  return normalizeLineEndings(text)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, '\n');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function fallbackNormalizeWordHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?o:p\b[^>]*>/gi, '')
    .replace(/\s+xmlns:(?:o|w|v|m)=["'][^"']*["']/gi, '')
    .replace(/\s+class=["'][^"']*\bMso[\w-]*[^"']*["']/gi, '')
    .replace(/\s+style=["'][^"']*\bmso-[^"']*["']/gi, '')
    .trim();
}

const wordHtmlMarkers = [
  /\bclass\s*=\s*["'][^"']*\bMso[\w-]*/i,
  /\bstyle\s*=\s*["'][^"']*\bmso-[^"']*/i,
  /<!--\s*\[if\s+[^\]]*mso[^\]]*\]>/i,
  /<!\[endif\]\s*-->/i,
  /\bxmlns:(?:o|w|v|m)\s*=\s*["'][^"']*office/i,
  /<\/?o:p\b/i,
];

const excelHtmlMarkers = [
  /\bclass\s*=\s*["'][^"']*\b(?:xl\d+|xl[\w-]*|Excel[\w-]*|Workbook|Worksheet)\b/i,
  /\bstyle\s*=\s*["'][^"']*\bmso-number-format\s*:/i,
  /\bstyle\s*=\s*["'][^"']*\bmso-displayed-decimal-separator\s*:/i,
  /\bstyle\s*=\s*["'][^"']*\bmso-displayed-thousand-separator\s*:/i,
  /\bxmlns:x\s*=\s*["'][^"']*office:excel/i,
  /<x:(?:ExcelWorkbook|WorksheetOptions|Worksheet|Workbook)\b/i,
  /<(?:table|td|th)\b[^>]*\bx:str\s*=/i,
];

const allowedWordTags = new Set([
  'a',
  'b',
  'br',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'i',
  'li',
  'ol',
  'p',
  's',
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
]);

const metadataTags = new Set(['head', 'link', 'meta', 'script', 'style', 'title', 'xml']);
const tableCellSpanAttributes = ['colspan', 'rowspan'] as const;
const positiveIntegerPattern = /^[1-9]\d*$/;
const formatTagEquivalents = new Map<string, Set<string>>([
  ['strong', new Set(['b'])],
  ['em', new Set(['i'])],
  ['s', new Set(['strike'])],
]);
