import { describe, expect, it } from 'vitest';

import type { PasteNormalizerService } from './paste-normalizer.service';

describe('PasteNormalizerService contract', () => {
  it('receives clipboard HTML or text and returns normalized HTML, warnings and detected source', () => {
    const normalizer: PasteNormalizerService = {
      normalizePaste(input) {
        return {
          normalizedHtml: input.html ?? `<p>${input.text}</p>`,
          warnings: [
            {
              code: 'unknown-source',
              severity: 'info',
              message: 'No se detecto un origen especializado.',
            },
          ],
          detectedSource: input.html ? 'html' : 'plain-text',
        };
      },
    };

    const htmlResult = normalizer.normalizePaste({
      html: '<p><strong>Copiado</strong></p>',
      text: 'Copiado',
    });
    const textResult = normalizer.normalizePaste({
      text: 'Fila 1\tFila 2',
    });

    expect(htmlResult).toEqual({
      normalizedHtml: '<p><strong>Copiado</strong></p>',
      warnings: [
        {
          code: 'unknown-source',
          severity: 'info',
          message: 'No se detecto un origen especializado.',
        },
      ],
      detectedSource: 'html',
    });
    expect(textResult.normalizedHtml).toBe('<p>Fila 1\tFila 2</p>');
    expect(textResult.detectedSource).toBe('plain-text');
  });
});
