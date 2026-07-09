/**
 * @vitest-environment jsdom
 */

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

  it('normalizes Word metadata, comments, namespaces, mso styles and helper tags', () => {
    expect(
      normalizePaste({
        html: [
          '<html xmlns:o="urn:schemas-microsoft-com:office:office">',
          '<head><meta name="Generator" content="Microsoft Word"><style>.MsoNormal{}</style></head>',
          '<body><!--[if gte mso 9]><xml><o:OfficeDocumentSettings></o:OfficeDocumentSettings></xml><![endif]-->',
          '<p class="MsoNormal" style="mso-margin-top-alt:auto;font-weight:bold">Texto<span> </span><o:p>&nbsp;</o:p></p>',
          '</body></html>',
        ].join(''),
      }),
    ).toEqual({
      normalizedHtml: '<p><strong>Texto</strong></p>',
      warnings: [],
      detectedSource: 'word',
    });
  });

  it('removes unsupported attributes and keeps safe links', () => {
    expect(
      normalizePaste({
        html: [
          '<p class="MsoNormal" id="x" data-id="1" onclick="alert(1)">',
          '<a href="javascript:alert(1)" title="Malo" onclick="alert(1)">Malo</a>',
          '<a href="https://example.com" title="Seguro" target="_blank">Seguro</a>',
          '</p>',
        ].join(''),
      }),
    ).toEqual({
      normalizedHtml:
        '<p><a title="Malo">Malo</a><a href="https://example.com" title="Seguro">Seguro</a></p>',
      warnings: [],
      detectedSource: 'word',
    });
  });

  it('preserves simple tables and safe cell spans from Word HTML', () => {
    expect(
      normalizePaste({
        html: [
          '<table class="MsoTableGrid" style="mso-yfti-tbllook:1184">',
          '<tr><th colspan="2" style="mso-style-name:Header">Cabecera</th></tr>',
          '<tr><td rowspan="2">A</td><td>B</td></tr>',
          '</table>',
        ].join(''),
      }),
    ).toEqual({
      normalizedHtml:
        '<table><tbody><tr><th colspan="2">Cabecera</th></tr><tr><td rowspan="2">A</td><td>B</td></tr></tbody></table>',
      warnings: [],
      detectedSource: 'word',
    });
  });

  it('converts Word list paragraphs into semantic lists while preserving marks and safe links', () => {
    expect(
      normalizePaste({
        html: [
          '<html xmlns:o="urn:schemas-microsoft-com:office:office"><body>',
          '<p class="MsoNormal" style="mso-margin-top-alt:auto">',
          '<span style="font-weight:bold">Negrita</span> ',
          '<span style="font-style:italic">cursiva</span> ',
          '<span style="text-decoration:underline">subrayado</span> ',
          '<a href="javascript:alert(1)">Inseguro</a>',
          '<a href="https://example.com" title="Seguro">Seguro</a>',
          '</p>',
          '<p class="MsoListParagraphCxSpFirst" style="mso-list:l0 level1 lfo1">',
          '<span style="mso-list:Ignore">·<span style="font:7.0pt Times New Roman">&nbsp;&nbsp;</span></span>',
          '<span style="font-weight:bold">Primer item</span>',
          '</p>',
          '<p class="MsoListParagraphCxSpLast" style="mso-list:l0 level1 lfo1">',
          '<span style="mso-list:Ignore">·<span style="font:7.0pt Times New Roman">&nbsp;&nbsp;</span></span>',
          '<span style="font-style:italic">Segundo item</span>',
          '</p>',
          '</body></html>',
        ].join(''),
      }),
    ).toEqual({
      normalizedHtml:
        '<p><strong>Negrita</strong> <em>cursiva</em> <u>subrayado</u> <a>Inseguro</a><a href="https://example.com" title="Seguro">Seguro</a></p><ul><li><strong>Primer item</strong></li><li><em>Segundo item</em></li></ul>',
      warnings: [],
      detectedSource: 'word',
    });
  });

  it('unwraps empty and redundant Word spans without losing text', () => {
    expect(
      normalizePaste({
        html: '<p class="MsoNormal"><span><span>Texto</span></span><span> </span></p>',
      }),
    ).toEqual({
      normalizedHtml: '<p>Texto</p>',
      warnings: [],
      detectedSource: 'word',
    });
  });

  it('detects Excel HTML by table cell workbook classes', () => {
    expect(
      normalizePaste({
        html: '<table><tr><td class="xl65">100</td></tr></table>',
      }).detectedSource,
    ).toBe('excel');
  });

  it('detects Excel HTML by mso number format styles', () => {
    expect(
      normalizePaste({
        html: '<table><tr><td style="mso-number-format:&quot;0.00&quot;">12.50</td></tr></table>',
      }).detectedSource,
    ).toBe('excel');
  });

  it('detects Excel HTML by workbook metadata and namespaces', () => {
    expect(
      normalizePaste({
        html: [
          '<html xmlns:x="urn:schemas-microsoft-com:office:excel">',
          '<body><x:ExcelWorkbook><x:Worksheet></x:Worksheet></x:ExcelWorkbook>',
          '<table class="Workbook"><tr><td>Dato</td></tr></table></body></html>',
        ].join(''),
      }).detectedSource,
    ).toBe('excel');
  });

  it('detects tabulated plain text as Excel content', () => {
    expect(
      normalizePaste({
        text: 'Columna A\tColumna B\n1\t2',
      }).detectedSource,
    ).toBe('excel');
  });

  it('normalizes Excel tables to Tiptap-compatible table markup', () => {
    expect(
      normalizePaste({
        html: [
          '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><body>',
          '<table class="Workbook" style="mso-displayed-decimal-separator:&quot;.&quot;">',
          '<tr><td class="header" style="font-weight:bold;width:72pt">Nombre</td><td class="header" style="font-weight:bold;width:80px">Total</td></tr>',
          '<tr><td style="mso-number-format:&quot;@&quot;">Cafe</td><td style="mso-number-format:&quot;0.00&quot;" x:fmla="=SUM(A1:A2)">12.5</td></tr>',
          '</table></body></html>',
        ].join(''),
      }),
    ).toEqual({
      normalizedHtml:
        '<table><tbody><tr><th colwidth="96">Nombre</th><th colwidth="80">Total</th></tr><tr><td>Cafe</td><td>12.5</td></tr></tbody></table>',
      warnings: [],
      detectedSource: 'excel',
    });
  });

  it('preserves safe colspan and rowspan in Excel tables', () => {
    expect(
      normalizePaste({
        html: [
          '<table><tr><td class="xl65" colspan="2">Grupo</td></tr>',
          '<tr><td rowspan="2">A</td><td>B</td></tr></table>',
        ].join(''),
      }),
    ).toEqual({
      normalizedHtml:
        '<table><tbody><tr><td colspan="2">Grupo</td></tr><tr><td rowspan="2">A</td><td>B</td></tr></tbody></table>',
      warnings: [],
      detectedSource: 'excel',
    });
  });

  it('drops unsafe Excel formulas, scripts and proprietary styles while keeping cell text', () => {
    expect(
      normalizePaste({
        html: [
          '<table class="Workbook"><tr>',
          '<td style="mso-number-format:&quot;0&quot;" onclick="alert(1)" x:fmla="=cmd|evil">42<script>alert(1)</script></td>',
          '</tr></table>',
        ].join(''),
      }),
    ).toEqual({
      normalizedHtml: '<table><tbody><tr><td>42</td></tr></tbody></table>',
      warnings: [],
      detectedSource: 'excel',
    });
  });

  it('converts tabulated plain text into an Excel table', () => {
    expect(
      normalizePaste({
        text: 'Producto\tCantidad\nCafe\t2\nPan\t5',
      }),
    ).toEqual({
      normalizedHtml:
        '<table><tbody><tr><th>Producto</th><th>Cantidad</th></tr><tr><td>Cafe</td><td>2</td></tr><tr><td>Pan</td><td>5</td></tr></tbody></table>',
      warnings: [
        {
          code: 'converted-tabular-text',
          severity: 'info',
          message: 'El texto tabulado se convirtio en tabla.',
        },
      ],
      detectedSource: 'excel',
    });
  });

  it('preserves empty cells in tabulated plain text tables', () => {
    expect(
      normalizePaste({
        text: 'A\tB\tC\n1\t\t3',
      }).normalizedHtml,
    ).toBe(
      '<table><tbody><tr><th>A</th><th>B</th><th>C</th></tr><tr><td>1</td><td></td><td>3</td></tr></tbody></table>',
    );
  });

  it('keeps a single tabbed plain-text line as a paragraph', () => {
    expect(
      normalizePaste({
        text: 'Parrafo con\tindentacion',
      }),
    ).toEqual({
      normalizedHtml: '<p>Parrafo con\tindentacion</p>',
      warnings: [],
      detectedSource: 'plain-text',
    });
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
