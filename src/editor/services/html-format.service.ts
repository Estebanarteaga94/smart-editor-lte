import * as prettier from 'prettier/standalone';
import htmlPlugin from 'prettier/plugins/html';

export interface HtmlFormatService {
  formatHtml(html: string): Promise<HtmlFormatResult>;
}

export type HtmlFormatResult = HtmlFormatSuccess | HtmlFormatFailure;

export interface HtmlFormatSuccess {
  ok: true;
  html: string;
  error: null;
}

export interface HtmlFormatFailure {
  ok: false;
  html: string;
  error: string;
}

export async function formatHtmlSource(html: string): Promise<HtmlFormatResult> {
  try {
    const formattedHtml = await prettier.format(html, {
      parser: 'html',
      plugins: [htmlPlugin],
    });

    return {
      ok: true,
      html: formattedHtml,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      html,
      error: formatHtmlFormatError(error),
    };
  }
}

export function createHtmlFormatService(): HtmlFormatService {
  return {
    formatHtml: formatHtmlSource,
  };
}

function formatHtmlFormatError(error: unknown): string {
  if (!(error instanceof Error) || error.message.trim().length === 0) {
    return 'No se pudo formatear el HTML.';
  }

  return `No se pudo formatear el HTML. ${error.message}`;
}
