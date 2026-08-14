import type { Schema } from '@tiptap/pm/model';

import { allowedHtmlAttributes, allowedHtmlTags, forbiddenHtmlTags } from '../utils/html-policy';
import { isSafeImportedImageSource, isSafeLinkHref } from '../utils/safe-url';
import { normalizePaste } from './paste-normalizer.service';
import {
  sanitizeAndValidateHtmlAgainstSchema,
  sanitizeAndValidatePastedHtml,
} from './paste-content-safety.service';
import { sanitizeImportedHtml } from './sanitizer.service';

export type SetHtmlFailureCode = 'empty-html' | 'unsafe-content' | 'unsupported-schema';

export interface SetHtmlSuccess {
  ok: true;
  code: 'applied';
  html: string;
  warnings?: string[];
}

export interface SetHtmlFailure {
  ok: false;
  code: SetHtmlFailureCode;
  message: string;
}

export type SetHtmlResult = SetHtmlSuccess | SetHtmlFailure;

export interface SetHtmlOptions {
  mode?: 'strict' | 'legacy';
}

const supportedTags = new Set<string>([...allowedHtmlTags, 'input', 'label']);
const supportedAttributes = new Set<string>([
  ...allowedHtmlAttributes,
  'data-checked',
  'data-type',
  'disabled',
]);
const unsafeStylePattern = /(?:expression\s*\(|url\s*\(|@import|behavior\s*:)/i;

export function prepareHtmlImport(
  html: string,
  schema: Schema,
  options: SetHtmlOptions = {},
): SetHtmlResult {
  if (html.trim().length === 0) {
    return failure('empty-html', 'El HTML esta vacio.');
  }

  if (typeof document === 'undefined') {
    return failure('unsupported-schema', 'La importacion HTML requiere un entorno DOM.');
  }

  const legacyPreparation =
    options.mode === 'legacy' ? prepareLegacyHtml(html) : { html, warnings: [] };
  const container = document.createElement('div');
  container.innerHTML = legacyPreparation.html;
  const inputValidation = validateImportElements(container);

  if (inputValidation) {
    return inputValidation;
  }

  const result =
    options.mode === 'legacy'
      ? sanitizeAndValidatePastedHtml(legacyPreparation.html, schema, {
          sanitizeHtml: sanitizeImportedHtml,
        })
      : sanitizeAndValidateHtmlAgainstSchema(legacyPreparation.html, schema, {
          sanitizeHtml: sanitizeImportedHtml,
        });

  if (!result.ok) {
    return failure('unsupported-schema', 'El HTML contiene una estructura no compatible.');
  }

  if (result.html.trim().length === 0) {
    return failure('empty-html', 'El HTML no contiene contenido importable.');
  }

  return {
    ok: true,
    code: 'applied',
    html: result.html,
    ...(legacyPreparation.warnings.length > 0 ? { warnings: legacyPreparation.warnings } : {}),
  };
}

function prepareLegacyHtml(html: string): { html: string; warnings: string[] } {
  const container = document.createElement('div');
  const adaptedElements = new Set<string>();
  const adaptedAttributes = new Set<string>();
  container.innerHTML = html;

  for (const element of Array.from(container.querySelectorAll('*'))) {
    const tagName = element.tagName.toLowerCase();

    if (!supportedTags.has(tagName)) {
      adaptedElements.add(`<${tagName}>`);
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (
        name.startsWith('on') ||
        !supportedAttributes.has(name) ||
        (name === 'style' && unsafeStylePattern.test(attribute.value))
      ) {
        adaptedAttributes.add(name);
      }
    }

    if (
      element instanceof HTMLAnchorElement &&
      element.hasAttribute('href') &&
      !isSafeLinkHref(element.getAttribute('href') ?? '')
    ) {
      adaptedAttributes.add('href');
    }

    if (
      element instanceof HTMLImageElement &&
      !isSafeImportedImageSource(element.getAttribute('src') ?? '')
    ) {
      adaptedAttributes.add('src');
    }
  }

  for (const font of Array.from(container.querySelectorAll('font'))) {
    const replacement = document.createElement('span');
    const color = font.getAttribute('color')?.trim() ?? '';

    if (color && isSupportedLegacyColor(color)) {
      replacement.style.color = color;
    }

    replacement.append(...Array.from(font.childNodes));
    font.replaceWith(replacement);
  }

  const sanitizedContainer = document.createElement('div');
  sanitizedContainer.innerHTML = sanitizeImportedHtml(
    normalizePaste({ html: container.innerHTML }).normalizedHtml,
  );

  for (const element of Array.from(sanitizedContainer.querySelectorAll('*'))) {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (
        name.startsWith('on') ||
        !supportedAttributes.has(name) ||
        (name === 'style' && unsafeStylePattern.test(attribute.value))
      ) {
        adaptedAttributes.add(name);
        element.removeAttribute(attribute.name);
      }
    }

    if (
      element instanceof HTMLAnchorElement &&
      element.hasAttribute('href') &&
      !isSafeLinkHref(element.getAttribute('href') ?? '')
    ) {
      adaptedAttributes.add('href');
      element.removeAttribute('href');
    }
  }

  for (const image of Array.from(sanitizedContainer.querySelectorAll('img'))) {
    const source = image.getAttribute('src') ?? '';
    if (!isSafeImportedImageSource(source)) {
      adaptedAttributes.add('src');
      image.remove();
    }
  }

  const adapted = [...adaptedElements, ...adaptedAttributes].sort();
  const warnings =
    adapted.length > 0
      ? [
          `Se sanitizo HTML heredado. Se adaptaron o retiraron elementos no compatibles: ${adapted.join(', ')}.`,
        ]
      : [];

  return { html: sanitizedContainer.innerHTML, warnings };
}

function isSupportedLegacyColor(color: string): boolean {
  return /^(#[0-9a-f]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|[a-z]+)$/i.test(
    color,
  );
}

function validateImportElements(container: HTMLElement): SetHtmlFailure | null {
  for (const element of container.querySelectorAll('*')) {
    const tagName = element.tagName.toLowerCase();

    if (forbiddenHtmlTags.includes(tagName as (typeof forbiddenHtmlTags)[number])) {
      return failure('unsafe-content', `El elemento <${tagName}> no es seguro.`);
    }

    if (!supportedTags.has(tagName)) {
      return failure('unsupported-schema', `El elemento <${tagName}> no esta soportado.`);
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();

      if (name.startsWith('on')) {
        return failure('unsafe-content', `El atributo ${name} no es seguro.`);
      }

      if (!supportedAttributes.has(name)) {
        return failure('unsupported-schema', `El atributo ${name} no esta soportado.`);
      }

      if (name === 'style' && unsafeStylePattern.test(attribute.value)) {
        return failure('unsafe-content', 'El atributo style contiene una referencia insegura.');
      }
    }

    if (element instanceof HTMLAnchorElement) {
      const href = element.getAttribute('href');

      if (href !== null && !isSafeLinkHref(href)) {
        return failure('unsafe-content', 'El enlace usa una fuente insegura.');
      }
    }

    if (element instanceof HTMLImageElement) {
      const source = element.getAttribute('src') ?? '';

      if (!isSafeImportedImageSource(source)) {
        return failure('unsafe-content', 'Una imagen usa una fuente insegura o malformada.');
      }

      if (element.hasAttribute('srcset')) {
        return failure(
          'unsupported-schema',
          'El atributo srcset no forma parte del documento canonico.',
        );
      }
    }
  }

  return null;
}

function failure(code: SetHtmlFailureCode, message: string): SetHtmlFailure {
  return { ok: false, code, message };
}
