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

  it('keeps only supported image alignment values', () => {
    const html =
      '<img src="/image.png" align="center" alt="Centrada"><img src="/image.png" align="justify" alt="Invalida">';

    const sanitized = sanitizeHtml(html);

    expect(sanitized).toContain('<img src="/image.png" align="center" alt="Centrada">');
    expect(sanitized).toContain('<img src="/image.png" alt="Invalida">');
    expect(sanitized).not.toContain('align="justify"');
  });

  it('preserves structural attributes required by source HTML roundtrips', () => {
    const sanitized = sanitizeHtml(
      '<ol start="3"><li>Tercero</li></ol><img src="/image.png" width="320" height="180" alt="Diagrama">',
    );

    expect(sanitized).toContain('<ol start="3">');
    expect(sanitized).toContain('width="320"');
    expect(sanitized).toContain('height="180"');
  });
});
