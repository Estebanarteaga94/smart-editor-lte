/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from 'vitest';

import { createHtmlBase64ExportService, HtmlBase64ExportError } from './html-base64-export.service';

const pngDataUri = 'data:image/png;base64,AQID';

describe('HtmlBase64ExportService', () => {
  it('embeds absolute and relative sources, preserves embedded images and deduplicates downloads', async () => {
    let activeRequests = 0;
    let maximumActiveRequests = 0;
    const fetchImage = vi.fn(async (input: string | URL | Request) => {
      activeRequests += 1;
      maximumActiveRequests = Math.max(maximumActiveRequests, activeRequests);
      await Promise.resolve();
      activeRequests -= 1;
      const source =
        typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const mime = source.endsWith('.webp') ? 'image/webp' : 'image/png';
      return imageResponse(mime, [1, 2, 3]);
    });
    const service = createHtmlBase64ExportService({
      baseUrl: 'https://api.example.test/documents/1/',
      fetch: fetchImage,
      concurrency: 2,
    });

    const result = await service.exportHtml(
      `<p>Documento</p><img src="images/a.png" alt="A"><img src="images/a.png" alt="Repetida"><img src="https://cdn.example.test/b.webp" width="20"><img src="${pngDataUri}" srcset="ignored.png 2x">`,
    );

    expect(fetchImage).toHaveBeenCalledTimes(2);
    expect(fetchImage).toHaveBeenCalledWith(
      'https://api.example.test/documents/1/images/a.png',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(maximumActiveRequests).toBeLessThanOrEqual(2);
    expect(result.match(/data:image\/png;base64,AQID/g)).toHaveLength(3);
    expect(result).toContain('data:image/webp;base64,AQID');
    expect(result).toContain('alt="A"');
    expect(result).toContain('width="20"');
    expect(result).not.toMatch(/(?:src|srcset)="(?:https?:|\/|images\/)/);
    expect(result).not.toContain('srcset');
  });

  it.each([
    {
      response: new Response('missing', { status: 404 }),
      code: 'http-error',
    },
    {
      response: imageResponse('image/svg+xml', [1, 2, 3]),
      code: 'unsupported-mime',
    },
    {
      response: imageResponse('image/png', [1, 2, 3, 4]),
      code: 'size-limit',
      maxImageBytes: 3,
    },
  ])('rejects the entire export with typed $code errors', async (testCase) => {
    const service = createHtmlBase64ExportService({
      baseUrl: 'https://api.example.test/',
      fetch: vi.fn().mockResolvedValue(testCase.response),
      maxImageBytes: testCase.maxImageBytes,
    });

    await expect(service.exportHtml('<img src="/asset.png"><p>Texto</p>')).rejects.toMatchObject({
      code: testCase.code,
      source: '/asset.png',
    });
  });

  it('identifies network failures and the original image source', async () => {
    const service = createHtmlBase64ExportService({
      baseUrl: 'https://api.example.test/',
      fetch: vi.fn().mockRejectedValue(new TypeError('CORS blocked')),
    });

    await expect(service.exportHtml('<img src="private/image.png">')).rejects.toMatchObject({
      code: 'network-error',
      source: 'private/image.png',
    });
  });

  it('cancels active downloads through AbortSignal', async () => {
    const fetchImage = vi.fn(
      (_input: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );
    const service = createHtmlBase64ExportService({
      baseUrl: 'https://api.example.test/',
      fetch: fetchImage,
    });
    const controller = new AbortController();
    const exported = service.exportHtml('<img src="/slow.png">', {
      signal: controller.signal,
    });

    controller.abort('consumer-cancelled');

    await expect(exported).rejects.toEqual(
      expect.objectContaining<Partial<HtmlBase64ExportError>>({
        code: 'aborted',
        source: '/slow.png',
      }),
    );
  });

  it('embeds local blob sources created by the default media upload service', async () => {
    const fetchImage = vi.fn().mockResolvedValue(imageResponse('image/png', [1, 2, 3]));
    const service = createHtmlBase64ExportService({ fetch: fetchImage as typeof fetch });

    await expect(service.exportHtml('<img src="blob:http://localhost/image">')).resolves.toBe(
      '<img src="data:image/png;base64,AQID">',
    );
    expect(fetchImage).toHaveBeenCalledWith(
      'blob:http://localhost/image',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});

function imageResponse(mimeType: string, bytes: number[]): Response {
  return new Response(Uint8Array.from(bytes), {
    status: 200,
    headers: {
      'content-type': mimeType,
      'content-length': String(bytes.length),
    },
  });
}

describe('template preservation during existing Base64 export', () => {
  it('keeps CSS, Handlebars loops and dynamic image references while embedding fixed images', async () => {
    const fetchImage = vi.fn().mockResolvedValue(imageResponse('image/png', [1, 2, 3]));
    const service = createHtmlBase64ExportService({
      fetch: fetchImage,
      baseUrl: 'https://example.test/',
    });
    const html =
      '<!DOCTYPE html><html lang="es"><head><style>table{width:100%}@media print{tr{break-inside:avoid}}</style></head><body><table class="data"><tbody>{{#each miembros}}<tr><td>{{nombre}}</td><td><img class="signature" src="{{firma}}"></td></tr>{{/each}}</tbody></table><img src="/logo.png"></body></html>';
    const result = await service.exportHtml(html);
    expect(result).toContain('<html lang="es">');
    expect(result).toContain('@media print{tr{break-inside:avoid}}');
    expect(result).toContain('{{#each miembros}}<tr>');
    expect(result).toContain('</tr>{{/each}}');
    expect(result).toContain('src="{{firma}}"');
    expect(result).toContain('src="data:image/png;base64,AQID"');
    expect(fetchImage).toHaveBeenCalledTimes(1);
    expect(fetchImage).toHaveBeenCalledWith('https://example.test/logo.png', expect.any(Object));
  });
});
