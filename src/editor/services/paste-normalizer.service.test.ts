import { describe, expect, it } from 'vitest';

import { createPasteNormalizerService, normalizePaste } from './paste-normalizer.service';
import type { PasteNormalizerService } from './paste-normalizer.service';

describe('createPasteNormalizerService', () => {
  it('creates a reusable service that matches the paste normalizer contract', () => {
    const normalizer: PasteNormalizerService = createPasteNormalizerService();

    expect(normalizer.normalizePaste({ html: '<p>Copiado</p>' })).toEqual({
      normalizedHtml: '<p>Copiado</p>',
      warnings: [],
      detectedSource: 'html',
    });
  });
});

describe('normalizePaste', () => {
  it('returns trimmed generic HTML when clipboard HTML is available', () => {
    expect(
      normalizePaste({
        html: '\r\n  <p><strong>Copiado</strong></p>  ',
        text: 'Copiado',
      }),
    ).toEqual({
      normalizedHtml: '<p><strong>Copiado</strong></p>',
      warnings: [],
      detectedSource: 'html',
    });
  });

  it('detects Word HTML by Mso classes', () => {
    expect(
      normalizePaste({
        html: '<p class="MsoNormal">Texto de Word</p>',
      }).detectedSource,
    ).toBe('word');
  });

  it('detects Word HTML by mso styles', () => {
    expect(
      normalizePaste({
        html: '<p style="mso-margin-top-alt:auto">Texto de Word</p>',
      }).detectedSource,
    ).toBe('word');
  });

  it('detects Word HTML by conditional comments', () => {
    expect(
      normalizePaste({
        html: '<!--[if gte mso 9]><xml><w:WordDocument></w:WordDocument></xml><![endif]--><p>Texto</p>',
      }).detectedSource,
    ).toBe('word');
  });

  it('detects Word HTML by Office namespaces', () => {
    expect(
      normalizePaste({
        html: '<html xmlns:o="urn:schemas-microsoft-com:office:office"><body><p>Texto</p></body></html>',
      }).detectedSource,
    ).toBe('word');
  });

  it('detects Word HTML by o:p helper tags', () => {
    expect(
      normalizePaste({
        html: '<p>Texto<o:p></o:p></p>',
      }).detectedSource,
    ).toBe('word');
  });

  it('converts plain text to escaped paragraph HTML', () => {
    expect(
      normalizePaste({
        text: 'Titulo <b>\nLinea & detalle\n\nOtro bloque',
      }),
    ).toEqual({
      normalizedHtml: '<p>Titulo &lt;b&gt;<br>Linea &amp; detalle</p><p>Otro bloque</p>',
      warnings: [],
      detectedSource: 'plain-text',
    });
  });

  it('falls back to text when HTML is empty', () => {
    expect(
      normalizePaste({
        html: '   ',
        text: 'Texto visible',
      }),
    ).toEqual({
      normalizedHtml: '<p>Texto visible</p>',
      warnings: [],
      detectedSource: 'plain-text',
    });
  });

  it('returns an empty result with a warning when there is no content', () => {
    expect(normalizePaste({ text: '   ' })).toEqual({
      normalizedHtml: '',
      warnings: [
        {
          code: 'unknown-source',
          severity: 'info',
          message: 'No se recibio contenido para normalizar.',
        },
      ],
      detectedSource: 'unknown',
    });
  });

  it('handles empty HTML without fallback text', () => {
    expect(normalizePaste({ html: '   ' })).toEqual({
      normalizedHtml: '',
      warnings: [
        {
          code: 'unknown-source',
          severity: 'info',
          message: 'No se recibio contenido para normalizar.',
        },
      ],
      detectedSource: 'unknown',
    });
  });
});
