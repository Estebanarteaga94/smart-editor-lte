import type { Schema } from '@tiptap/pm/model';

import { allowedHtmlAttributes, allowedHtmlTags, forbiddenHtmlTags } from '../utils/html-policy';
import { isSafeImportedImageSource, isSafeLinkHref } from '../utils/safe-url';
import { sanitizeAndValidateHtmlAgainstSchema } from './paste-content-safety.service';
import { sanitizeImportedHtml } from './sanitizer.service';

export type SetHtmlFailureCode = 'empty-html' | 'unsafe-content' | 'unsupported-schema';

export interface SetHtmlSuccess {
  ok: true;
  code: 'applied';
  html: string;
}

export interface SetHtmlFailure {
  ok: false;
  code: SetHtmlFailureCode;
  message: string;
}

export type SetHtmlResult = SetHtmlSuccess | SetHtmlFailure;

const supportedTags = new Set<string>([...allowedHtmlTags, 'input', 'label']);
const supportedAttributes = new Set<string>([
  ...allowedHtmlAttributes,
  'data-checked',
  'data-type',
  'disabled',
]);
const unsafeStylePattern = /(?:expression\s*\(|url\s*\(|@import|behavior\s*:)/i;

export function prepareHtmlImport(html: string, schema: Schema): SetHtmlResult {
  if (html.trim().length === 0) {
    return failure('empty-html', 'El HTML esta vacio.');
  }

  if (typeof document === 'undefined') {
    return failure('unsupported-schema', 'La importacion HTML requiere un entorno DOM.');
  }

  const container = document.createElement('div');
  container.innerHTML = html;
  const inputValidation = validateImportElements(container);

  if (inputValidation) {
    return inputValidation;
  }

  const result = sanitizeAndValidateHtmlAgainstSchema(html, schema, {
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
  };
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
