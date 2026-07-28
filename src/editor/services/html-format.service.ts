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
    const { prettier, htmlPlugin } = await loadHtmlFormatter();
    const formattedHtml = await prettier.format(html, {
      parser: 'html',
      plugins: [htmlPlugin],
      printWidth: 100,
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

async function loadHtmlFormatter() {
  const [prettier, htmlPluginModule] = await Promise.all([
    import('prettier/standalone'),
    import('prettier/plugins/html'),
  ]);

  return {
    prettier,
    htmlPlugin: htmlPluginModule.default,
  };
}
