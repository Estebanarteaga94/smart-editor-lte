import { sanitizeImportedHtml } from './sanitizer.service';
import { isValidEmbeddedImageSource } from '../utils/safe-url';
import { needsHtmlPreservation, preparePreservedHtmlExport } from './preserved-html.service';

export type HtmlBase64ExportErrorCode =
  'aborted' | 'invalid-source' | 'http-error' | 'network-error' | 'unsupported-mime' | 'size-limit';

export class HtmlBase64ExportError extends Error {
  readonly code: HtmlBase64ExportErrorCode;
  readonly source: string;

  constructor(code: HtmlBase64ExportErrorCode, source: string, message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'HtmlBase64ExportError';
    this.code = code;
    this.source = source;
  }
}

export interface HtmlBase64ExportConfig {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  maxImageBytes?: number;
  concurrency?: number;
  requestInit?: Omit<RequestInit, 'signal'>;
}

export interface HtmlBase64ExportOptions {
  signal?: AbortSignal;
}

export interface HtmlBase64ExportService {
  exportHtml(html: string, options?: HtmlBase64ExportOptions): Promise<string>;
}

const supportedMimeTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
const defaultMaxImageBytes = 10 * 1024 * 1024;
const defaultConcurrency = 4;

export function createHtmlBase64ExportService(
  config: HtmlBase64ExportConfig = {},
): HtmlBase64ExportService {
  const fetchImage = config.fetch ?? globalThis.fetch?.bind(globalThis);
  const maxImageBytes = config.maxImageBytes ?? defaultMaxImageBytes;
  const concurrency = Math.max(1, Math.floor(config.concurrency ?? defaultConcurrency));

  return {
    exportHtml: (html, options = {}) =>
      exportHtmlWithBase64Images(html, {
        ...config,
        fetch: fetchImage,
        maxImageBytes,
        concurrency,
        signal: options.signal,
      }),
  };
}

interface ResolvedExportOptions extends HtmlBase64ExportConfig {
  signal?: AbortSignal;
}

async function exportHtmlWithBase64Images(
  html: string,
  options: ResolvedExportOptions,
): Promise<string> {
  if (typeof document === 'undefined') {
    throw exportError('invalid-source', '', 'La exportacion requiere un entorno DOM.');
  }

  throwIfAborted(options.signal);
  let preserved: ReturnType<typeof preparePreservedHtmlExport> | null = null;
  if (needsHtmlPreservation(html)) {
    try {
      preserved = preparePreservedHtmlExport(html);
    } catch (cause) {
      throw exportError(
        'invalid-source',
        '',
        'El HTML de la plantilla no es seguro o está incompleto.',
        cause,
      );
    }
  }
  const container = preserved?.container ?? document.createElement('div');
  if (!preserved) container.innerHTML = sanitizeImportedHtml(html);
  const images = Array.from(container.querySelectorAll('img'));
  const sourcesToDownload = new Map<string, string>();

  for (const image of images) {
    image.removeAttribute('srcset');
    const source = image.getAttribute('src')?.trim() ?? '';

    if (preserved?.isExpression(source) || isValidEmbeddedImageSource(source)) {
      continue;
    }

    const resolvedSource = resolveImageSource(source, options.baseUrl);
    sourcesToDownload.set(resolvedSource, source);
  }

  const controller = new AbortController();
  const removeAbortListener = forwardAbort(options.signal, controller);

  try {
    const embeddedSources = await downloadUniqueSources(sourcesToDownload, options, controller);
    throwIfAborted(controller.signal);

    for (const image of images) {
      const source = image.getAttribute('src')?.trim() ?? '';

      if (preserved?.isExpression(source) || isValidEmbeddedImageSource(source)) {
        continue;
      }

      const resolvedSource = resolveImageSource(source, options.baseUrl);
      const embeddedSource = embeddedSources.get(resolvedSource);

      if (!embeddedSource) {
        throw exportError('invalid-source', source, 'La imagen no pudo embeberse.');
      }

      image.setAttribute('src', embeddedSource);
    }

    const result = preserved ? preserved.serialize() : sanitizeImportedHtml(container.innerHTML);
    if (!preserved) assertSelfContainedHtml(result);
    throwIfAborted(controller.signal);
    return result;
  } finally {
    removeAbortListener();
    controller.abort();
  }
}

async function downloadUniqueSources(
  sources: Map<string, string>,
  options: ResolvedExportOptions,
  controller: AbortController,
): Promise<Map<string, string>> {
  const entries = Array.from(sources.entries());
  const results = new Map<string, string>();
  let nextIndex = 0;
  let primaryError: Error | undefined;
  const workerCount = Math.min(options.concurrency ?? defaultConcurrency, entries.length);

  const workers = Array.from({ length: workerCount }, async () => {
    while (nextIndex < entries.length) {
      throwIfAborted(controller.signal);
      const entry = entries[nextIndex];
      nextIndex += 1;

      if (!entry) {
        return;
      }

      const [resolvedSource, originalSource] = entry;

      try {
        results.set(
          resolvedSource,
          await downloadAsDataUri(resolvedSource, originalSource, options, controller.signal),
        );
      } catch (error) {
        const normalizedError =
          error instanceof Error
            ? error
            : new Error('La descarga de imagen fallo.', { cause: error });
        primaryError ??= normalizedError;
        controller.abort();
        throw normalizedError;
      }
    }
  });

  await Promise.allSettled(workers);

  if (primaryError) {
    throw primaryError;
  }

  return results;
}

async function downloadAsDataUri(
  resolvedSource: string,
  originalSource: string,
  options: ResolvedExportOptions,
  signal: AbortSignal,
): Promise<string> {
  if (!options.fetch) {
    throw exportError('network-error', originalSource, 'No existe una implementacion de fetch.');
  }

  let response: Response;

  try {
    response = await options.fetch(resolvedSource, {
      ...options.requestInit,
      signal,
    });
  } catch (error) {
    if (signal.aborted) {
      throw exportError('aborted', originalSource, 'La exportacion fue cancelada.', error);
    }
    throw exportError('network-error', originalSource, 'No se pudo descargar la imagen.', error);
  }

  if (!response.ok) {
    throw exportError(
      'http-error',
      originalSource,
      `La imagen respondio con HTTP ${response.status}.`,
    );
  }

  const mimeType =
    response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() ?? '';

  if (!supportedMimeTypes.has(mimeType)) {
    throw exportError(
      'unsupported-mime',
      originalSource,
      `MIME de imagen no admitido: ${mimeType}.`,
    );
  }

  const maxImageBytes = options.maxImageBytes ?? defaultMaxImageBytes;
  const declaredSize = Number(response.headers.get('content-length'));

  if (Number.isFinite(declaredSize) && declaredSize > maxImageBytes) {
    throw exportError('size-limit', originalSource, 'La imagen excede el limite de exportacion.');
  }

  let bytes: ArrayBuffer;

  try {
    bytes = await response.arrayBuffer();
  } catch (error) {
    if (signal.aborted) {
      throw exportError('aborted', originalSource, 'La exportacion fue cancelada.', error);
    }
    throw exportError('network-error', originalSource, 'No se pudieron leer los bytes.', error);
  }

  if (bytes.byteLength === 0 || bytes.byteLength > maxImageBytes) {
    throw exportError('size-limit', originalSource, 'La imagen esta vacia o excede el limite.');
  }

  return `data:${mimeType};base64,${arrayBufferToBase64(bytes)}`;
}

function resolveImageSource(source: string, configuredBaseUrl?: string): string {
  if (source.length === 0 || /^blob:/i.test(source) || /^data:/i.test(source)) {
    throw exportError('invalid-source', source, 'La fuente de imagen no es exportable.');
  }

  try {
    const documentBase = document.baseURI || globalThis.location?.href;
    const baseUrl = configuredBaseUrl
      ? new URL(configuredBaseUrl, documentBase).href
      : documentBase;
    const resolved = new URL(source, baseUrl);

    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
      throw new Error('Unsupported protocol');
    }

    return resolved.href;
  } catch (error) {
    throw exportError('invalid-source', source, 'La fuente de imagen no se pudo resolver.', error);
  }
}

function assertSelfContainedHtml(html: string): void {
  const container = document.createElement('div');
  container.innerHTML = html;

  for (const image of container.querySelectorAll('img')) {
    const source = image.getAttribute('src') ?? '';

    if (!isValidEmbeddedImageSource(source) || image.hasAttribute('srcset')) {
      throw exportError('invalid-source', source, 'El HTML resultante no es autocontenido.');
    }
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];

  for (let index = 0; index < bytes.length; index += 32_768) {
    chunks.push(String.fromCharCode(...bytes.subarray(index, index + 32_768)));
  }

  return globalThis.btoa(chunks.join(''));
}

function forwardAbort(signal: AbortSignal | undefined, controller: AbortController): () => void {
  if (!signal) {
    return () => undefined;
  }

  const abort = () => controller.abort(signal.reason);

  if (signal.aborted) {
    abort();
  } else {
    signal.addEventListener('abort', abort, { once: true });
  }

  return () => signal.removeEventListener('abort', abort);
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw exportError('aborted', '', 'La exportacion fue cancelada.', signal.reason);
  }
}

function exportError(
  code: HtmlBase64ExportErrorCode,
  source: string,
  message: string,
  cause?: unknown,
): HtmlBase64ExportError {
  return new HtmlBase64ExportError(code, source, message, cause);
}
