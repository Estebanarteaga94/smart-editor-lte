import { createSanitizerService, type SanitizerService } from '../services/sanitizer.service';
import { needsHtmlPreservation, preservedHtmlPreview } from '../services/preserved-html.service';

export interface PreviewViewOptions {
  title?: string;
  html?: string;
  sanitizer?: SanitizerService;
}

export interface PreviewView {
  element: HTMLElement;
  content: HTMLElement;
  setHtml: (html: string) => void;
}

export function createPreviewView(options: PreviewViewOptions = {}): PreviewView {
  const element = document.createElement('section');
  const title = document.createElement('h2');
  const content = document.createElement('div');
  const sanitizer = options.sanitizer ?? createSanitizerService();

  element.className = 'editor-preview';
  element.setAttribute('aria-label', options.title ?? 'Vista renderizada');

  title.className = 'editor-preview__title';
  title.textContent = options.title ?? 'Vista renderizada';

  content.className = 'editor-preview__content';

  element.append(title, content);

  const setHtml = (html: string): void => {
    if (needsHtmlPreservation(html)) {
      try {
        const frame = document.createElement('iframe');
        frame.title = 'Vista renderizada del documento';
        frame.setAttribute('sandbox', '');
        frame.style.cssText = 'width:100%;min-height:600px;border:0';
        frame.srcdoc = preservedHtmlPreview(html);
        content.replaceChildren(frame);
        return;
      } catch {
        /* Unsafe inputs retain the ordinary sanitized preview. */
      }
    }
    content.innerHTML = sanitizer.sanitizeHtml(html);
  };

  setHtml(options.html ?? '');

  return {
    element,
    content,
    setHtml,
  };
}
