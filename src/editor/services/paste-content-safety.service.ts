import { DOMParser as ProseMirrorDomParser, type Schema } from '@tiptap/pm/model';

import { safeParseCanonicalEditorContent } from '../models/editor-content';
import { invalidSourceHtmlSchemaMessage } from '../utils/source-error-messages';
import { createSanitizerService, type SanitizerService } from './sanitizer.service';

export interface SafePastedHtmlResult {
  ok: boolean;
  html: string;
  error?: string;
}

export interface PasteContentSafetyService {
  sanitizeAndValidateHtml(html: string, schema: Schema): SafePastedHtmlResult;
}

export function createPasteContentSafetyService(
  sanitizer: SanitizerService = createSanitizerService(),
): PasteContentSafetyService {
  return {
    sanitizeAndValidateHtml: (html, schema) =>
      sanitizeAndValidatePastedHtml(html, schema, sanitizer),
  };
}

export function sanitizeAndValidatePastedHtml(
  html: string,
  schema: Schema,
  sanitizer: SanitizerService = createSanitizerService(),
): SafePastedHtmlResult {
  const sanitizedHtml = sanitizer.sanitizeHtml(html);
  const normalizedHtml = normalizePastedHtmlForCanonicalSchema(sanitizedHtml);

  return validateSanitizedHtmlAgainstSchema(normalizedHtml, schema);
}

export function sanitizeAndValidateHtmlAgainstSchema(
  html: string,
  schema: Schema,
  sanitizer: SanitizerService = createSanitizerService(),
): SafePastedHtmlResult {
  const sanitizedHtml = sanitizer.sanitizeHtml(html);

  return validateSanitizedHtmlAgainstSchema(sanitizedHtml, schema);
}

function validateSanitizedHtmlAgainstSchema(
  sanitizedHtml: string,
  schema: Schema,
): SafePastedHtmlResult {
  if (sanitizedHtml.trim().length === 0) {
    return {
      ok: true,
      html: '',
    };
  }

  if (typeof document === 'undefined') {
    return {
      ok: true,
      html: sanitizedHtml,
    };
  }

  try {
    const container = document.createElement('div');
    container.innerHTML = sanitizedHtml;

    const slice = ProseMirrorDomParser.fromSchema(schema).parseSlice(container);
    const sliceContentJson: unknown = slice.content.toJSON();
    const validation = safeParseCanonicalEditorContent({
      type: 'doc',
      content: Array.isArray(sliceContentJson) ? sliceContentJson : [],
    });

    if (!validation.success) {
      return {
        ok: false,
        html: '',
        error: invalidSourceHtmlSchemaMessage,
      };
    }

    return {
      ok: true,
      html: sanitizedHtml,
    };
  } catch {
    return {
      ok: false,
      html: '',
      error: invalidSourceHtmlSchemaMessage,
    };
  }
}

function normalizePastedHtmlForCanonicalSchema(html: string): string {
  if (!/<br\b/i.test(html)) {
    return html;
  }

  if (typeof document === 'undefined') {
    return html.replace(/<br\s*\/?>/gi, ' ');
  }

  const container = document.createElement('div');
  container.innerHTML = html;

  for (const lineBreak of container.querySelectorAll('br')) {
    lineBreak.replaceWith(document.createTextNode(' '));
  }

  return container.innerHTML;
}
