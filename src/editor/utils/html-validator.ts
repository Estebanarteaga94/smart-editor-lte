import { allowedHtmlAttributes, allowedHtmlTags, forbiddenHtmlTags } from './html-policy';
import { isSafeImageSource, isSafeLinkHref } from './safe-url';

export interface HtmlValidationResult {
  valid: boolean;
  error?: string;
}

export type HtmlValidator = (html: string) => HtmlValidationResult;

const allowedTagSet = new Set<string>(allowedHtmlTags);
const allowedAttributeSet = new Set<string>(allowedHtmlAttributes);
const forbiddenTagSet = new Set<string>(forbiddenHtmlTags);
const eventAttributePattern = /^on/i;
const unsafeStylePattern =
  /\bexpression\s*\(|\burl\s*\(\s*(['"]?)\s*(?:javascript:|data:text\/html|vbscript:)/i;

export const unsupportedHtmlTagMessage = 'El HTML contiene etiquetas no permitidas.';
export const unsupportedHtmlAttributeMessage = 'El HTML contiene atributos no permitidos.';
export const unsafeHtmlProtocolMessage = 'El HTML contiene protocolos no permitidos.';
export const malformedHtmlMessage = 'El HTML no se pudo validar.';

export function validateAllowedHtml(html: string): HtmlValidationResult {
  if (html.trim().length === 0) {
    return {
      valid: true,
    };
  }

  if (typeof document === 'undefined') {
    return validateAllowedHtmlFallback(html);
  }

  try {
    const template = document.createElement('template');
    template.innerHTML = html;

    for (const element of Array.from(template.content.querySelectorAll('*'))) {
      const tagName = element.tagName.toLowerCase();

      if (forbiddenTagSet.has(tagName) || !allowedTagSet.has(tagName)) {
        return {
          valid: false,
          error: unsupportedHtmlTagMessage,
        };
      }

      const attributeResult = validateElementAttributes(element);

      if (!attributeResult.valid) {
        return attributeResult;
      }
    }

    return {
      valid: true,
    };
  } catch {
    return {
      valid: false,
      error: malformedHtmlMessage,
    };
  }
}

export function createHtmlValidator(): HtmlValidator {
  return validateAllowedHtml;
}

function validateElementAttributes(element: Element): HtmlValidationResult {
  for (const attribute of Array.from(element.attributes)) {
    const attributeName = attribute.name.toLowerCase();

    if (eventAttributePattern.test(attributeName) || !allowedAttributeSet.has(attributeName)) {
      return {
        valid: false,
        error: unsupportedHtmlAttributeMessage,
      };
    }

    if (!isAllowedAttributeValue(element, attributeName, attribute.value)) {
      return {
        valid: false,
        error: unsafeHtmlProtocolMessage,
      };
    }
  }

  return {
    valid: true,
  };
}

function isAllowedAttributeValue(element: Element, attributeName: string, value: string): boolean {
  if (attributeName === 'href') {
    return isSafeLinkHref(value);
  }

  if (attributeName === 'src') {
    return element.tagName.toLowerCase() === 'img' && isSafeImageSource(value);
  }

  if (attributeName === 'style') {
    return !unsafeStylePattern.test(value);
  }

  return true;
}

function validateAllowedHtmlFallback(html: string): HtmlValidationResult {
  if (/<\/?\s*(?:iframe|script)\b/i.test(html)) {
    return {
      valid: false,
      error: unsupportedHtmlTagMessage,
    };
  }

  if (/\s+on[a-z]+\s*=/i.test(html)) {
    return {
      valid: false,
      error: unsupportedHtmlAttributeMessage,
    };
  }

  if (/\s+(?:href|src)\s*=\s*["']?\s*(?:javascript:|data:text\/html|vbscript:)/i.test(html)) {
    return {
      valid: false,
      error: unsafeHtmlProtocolMessage,
    };
  }

  return {
    valid: true,
  };
}
