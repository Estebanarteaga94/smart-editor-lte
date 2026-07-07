import { describe, expect, it } from 'vitest';

import { createHtmlFormatService, formatHtmlSource } from './html-format.service';

describe('formatHtmlSource', () => {
  it('formats HTML with the Prettier HTML parser', async () => {
    const result = await formatHtmlSource('<ul><li>Uno</li><li>Dos</li></ul>');

    expect(result).toEqual({
      ok: true,
      html: '<ul>\n  <li>Uno</li>\n  <li>Dos</li>\n</ul>\n',
      error: null,
    });
  });

  it('reports format errors without changing the original HTML', async () => {
    const originalHtml = '<div><span></div></span>';

    const result = await formatHtmlSource(originalHtml);

    expect(result.ok).toBe(false);
    expect(result.html).toBe(originalHtml);
    expect(result.error).toContain('No se pudo formatear el HTML.');
    expect(result.error).toContain('Unexpected closing tag "div"');
  });
});

describe('createHtmlFormatService', () => {
  it('exposes the HTML formatter through a service contract', async () => {
    const service = createHtmlFormatService();

    await expect(service.formatHtml('<p>Texto</p>')).resolves.toMatchObject({
      ok: true,
      html: '<p>Texto</p>\n',
      error: null,
    });
  });
});
