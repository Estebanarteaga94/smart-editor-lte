export interface PreviewViewOptions {
  title?: string;
  html?: string;
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

  element.className = 'editor-preview';
  element.setAttribute('aria-label', options.title ?? 'Vista renderizada');

  title.className = 'editor-preview__title';
  title.textContent = options.title ?? 'Vista renderizada';

  content.className = 'editor-preview__content';

  element.append(title, content);

  const setHtml = (html: string): void => {
    content.innerHTML = html;
  };

  setHtml(options.html ?? '');

  return {
    element,
    content,
    setHtml,
  };
}
