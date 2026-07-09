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
    return {
      normalizedHtml: normalizeHtmlInput(html),
      warnings: [],
      detectedSource: 'html',
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
