/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from './sanitizer.service';

describe('sanitizeHtml', () => {
  it('keeps blob URLs only as image sources for local uploads', () => {
    const html =
      '<img src="blob:http://localhost/local-image" alt="Local"><a href="blob:http://localhost/file">Blob link</a>';

    const sanitized = sanitizeHtml(html);

    expect(sanitized).toContain('src="blob:http://localhost/local-image"');
    expect(sanitized).toContain('alt="Local"');
    expect(sanitized).toContain('<a>Blob link</a>');
    expect(sanitized).not.toContain('href="blob:');
  });
});
