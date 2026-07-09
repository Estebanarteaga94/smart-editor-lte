/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest';

import {
  createHtmlValidator,
  unsafeHtmlProtocolMessage,
  unsupportedHtmlAttributeMessage,
  unsupportedHtmlTagMessage,
  validateAllowedHtml,
} from './html-validator';

describe('validateAllowedHtml', () => {
  it('accepts HTML that uses the editor allowlist', () => {
    expect(
      validateAllowedHtml(
        '<table><tbody><tr><th colwidth="120">Nombre</th><td colspan="2"><p>Valor</p></td></tr></tbody></table><img src="blob:http://localhost/image" alt="Local">',
      ),
    ).toEqual({
      valid: true,
    });
  });

  it('rejects forbidden tags before HTML is applied', () => {
    expect(validateAllowedHtml('<p>Seguro</p><script>alert(1)</script>')).toEqual({
      valid: false,
      error: unsupportedHtmlTagMessage,
    });
    expect(validateAllowedHtml('<iframe src="https://example.com"></iframe>')).toEqual({
      valid: false,
      error: unsupportedHtmlTagMessage,
    });
  });

  it('rejects inline event handlers and unknown attributes', () => {
    expect(validateAllowedHtml('<p onclick="alert(1)">Seguro</p>')).toEqual({
      valid: false,
      error: unsupportedHtmlAttributeMessage,
    });
    expect(validateAllowedHtml('<p data-id="1">Dato</p>')).toEqual({
      valid: false,
      error: unsupportedHtmlAttributeMessage,
    });
  });

  it('rejects unsafe href, src and style protocols', () => {
    expect(validateAllowedHtml('<a href="javascript:alert(1)">Link</a>')).toEqual({
      valid: false,
      error: unsafeHtmlProtocolMessage,
    });
    expect(validateAllowedHtml('<img src="data:text/html,alert(1)" alt="X">')).toEqual({
      valid: false,
      error: unsafeHtmlProtocolMessage,
    });
    expect(
      validateAllowedHtml('<span style="background:url(javascript:alert(1))">X</span>'),
    ).toEqual({
      valid: false,
      error: unsafeHtmlProtocolMessage,
    });
  });

  it('creates a reusable HTML validator function', () => {
    const validator = createHtmlValidator();

    expect(validator('<p>Texto</p>')).toEqual({
      valid: true,
    });
  });
});
