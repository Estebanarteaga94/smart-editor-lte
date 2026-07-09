export type PasteNormalizationSource = 'word' | 'excel' | 'html' | 'plain-text' | 'unknown';

export type PasteNormalizationWarningCode =
  | 'converted-tabular-text'
  | 'discarded-unsupported-style'
  | 'removed-office-metadata'
  | 'removed-unsafe-content'
  | 'unknown-source';

export type PasteNormalizationWarningSeverity = 'info' | 'warning';

export interface PasteNormalizationWarning {
  code: PasteNormalizationWarningCode;
  severity: PasteNormalizationWarningSeverity;
  message: string;
}

export type PasteNormalizerInput =
  | {
      html: string;
      text?: string;
    }
  | {
      html?: undefined;
      text: string;
    };

export interface PasteNormalizationResult {
  normalizedHtml: string;
  warnings: PasteNormalizationWarning[];
  detectedSource: PasteNormalizationSource;
}

export interface PasteNormalizerService {
  normalizePaste(input: PasteNormalizerInput): PasteNormalizationResult;
}
