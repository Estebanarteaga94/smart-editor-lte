import {
  DOMParser as ModelParser,
  DOMSerializer,
  type Node as ModelNode,
  type Schema,
} from '@tiptap/pm/model';
import type { Editor, JSONContent } from '@tiptap/core';
import {
  preservedDocumentSchema,
  preservedHtmlSchema,
  type PreservedHtml,
  type PreservedDocument,
} from '../models/preserved-html';
import { parseCanonicalEditorContent } from '../models/editor-content';

export const preservationAttribute = 'data-editor-preserved';
export const tokenAttribute = 'data-editor-token';
export const regionAttribute = 'data-editor-region';
export function applyPreservedContent(
  editor: Editor,
  content: JSONContent,
  emitUpdate = true,
): void {
  const doc = editor.schema.nodeFromJSON(parseCanonicalEditorContent(content));
  editor.view.dispatch(
    editor.state.tr
      .replaceWith(0, editor.state.doc.content.size, doc.content)
      .setDocAttribute('preservedDocument', doc.attrs.preservedDocument)
      .setMeta('preservedImport', true)
      .setMeta('preventUpdate', !emitUpdate || !!doc.attrs.preservedDocument),
  );
  if (doc.attrs.preservedDocument) {
    const envelope = preservedDocumentSchema.parse(doc.attrs.preservedDocument);
    editor.view.dispatch(
      editor.state.tr
        .setDocAttribute('preservedDocument', {
          ...envelope,
          baseline: JSON.stringify(editor.getJSON().content),
        })
        .setMeta('addToHistory', false)
        .setMeta('preventUpdate', !emitUpdate),
    );
  }
}
const containers = new Set([
  'div',
  'section',
  'article',
  'header',
  'footer',
  'main',
  'aside',
  'address',
  'figure',
  'figcaption',
  'nav',
]);
const blockTags = 'p,h1,h2,h3,h4,h5,h6,div,section,article,table,ul,ol,blockquote,pre,hr,figure';
const supported = new Set([
  'a',
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'strike',
  'del',
  'span',
  'mark',
  'p',
  'br',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'hr',
  'img',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'td',
  'th',
  'colgroup',
  'col',
  'caption',
  ...containers,
]);

export function needsHtmlPreservation(html: string): boolean {
  return (
    /<!doctype\b|<(?:html|head|style)\b|{{/.test(html) ||
    /<!doctype\b|<(?:html|head|style)\b/i.test(html) ||
    /<(?:ul|ol)\b[^>]*\bclass\s*=\s*["'][^"']*\b(?:wysiwyg-list|converted-from-office)\b/i.test(
      html,
    )
  );
}
function parseSource(html: string): Document {
  const full = /<!doctype\b|<(?:html|head|body)\b/i.test(html);
  return new DOMParser().parseFromString(
    full ? html : `<!DOCTYPE html><html><head></head><body>${html}</body></html>`,
    'text/html',
  );
}

export function preservedHtmlPreview(source: string): string {
  const prefix = `html${crypto.randomUUID().replaceAll('-', '')}x`;
  const masked = maskSource(source, prefix);
  const doc = parseSource(masked.html);
  assertSafePreservedHtml(doc);
  const policy = doc.createElement('meta');
  policy.httpEquiv = 'Content-Security-Policy';
  policy.content =
    "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'";
  doc.head.prepend(policy);
  const walker = doc.createTreeWalker(doc.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    masked.tokens.forEach((token, index) => {
      node.data = node.data.replaceAll(`${prefix}${index}z`, token);
    });
  }
  return `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
}

export function handlebarsTokens(source: string): { value: string; start: number; end: number }[] {
  const tokens: { value: string; start: number; end: number }[] = [];
  let cursor = 0;
  while (cursor < source.length) {
    const start = source.indexOf('{{', cursor);
    if (start < 0) break;
    const longComment = source.startsWith('{{!--', start);
    const comment = longComment || /^{{~?\s*!/.test(source.slice(start));
    const close = longComment ? '--}}' : source.startsWith('{{{', start) ? '}}}' : '}}';
    let quote = '';
    let escaped = false;
    let end = -1;
    for (let i = start + (longComment ? 5 : close.length); i < source.length; i++) {
      const char = source[i];
      if (!comment && quote) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === quote) quote = '';
      } else if (!comment && (char === '"' || char === "'")) quote = char;
      else if (source.startsWith(close, i)) {
        end = i + close.length;
        break;
      }
    }
    if (end < 0) throw new Error('Hay una expresión Handlebars sin cerrar.');
    tokens.push({ value: source.slice(start, end), start, end });
    cursor = end;
  }
  const stack: string[] = [];
  for (const { value } of tokens) {
    const open = value.match(/^{{~?\s*[#^]([\w.-]+)/);
    const close = value.match(/^{{~?\s*\/([\w.-]+)/);
    if (open) stack.push(open[1]);
    if (close && stack.pop() !== close[1])
      throw new Error('Los bloques Handlebars no están equilibrados.');
    if (/^{{~?\s*else\b/.test(value) && !stack.length)
      throw new Error('El bloque else no tiene un bloque abierto.');
  }
  if (stack.length) throw new Error('Falta cerrar un bloque Handlebars.');
  return tokens;
}

function maskSource(source: string, prefix: string) {
  const tokens: string[] = [];
  let masked = '';
  let cursor = 0;
  let inTag = false;
  let quote = '';
  for (const { value, start, end } of handlebarsTokens(source)) {
    const literal = source.slice(cursor, start);
    masked += literal;
    for (const char of literal) {
      if (!inTag) {
        if (char === '<') inTag = true;
      } else if (quote) {
        if (char === quote) quote = '';
      } else if (char === '"' || char === "'") quote = char;
      else if (char === '>') inTag = false;
    }
    const marker = `${prefix}${tokens.push(value) - 1}z`;
    masked += !inTag && /^{{~?\s*(?:[#/^!]|else\b)/.test(value) ? `<!--${marker}-->` : marker;
    cursor = end;
  }
  return { html: masked + source.slice(cursor), tokens };
}

export function assertSafePreservedHtml(doc: Document): void {
  if (
    doc.querySelector(
      'script,iframe,object,embed,base,form,link,svg,math,template,meta[http-equiv]',
    )
  )
    throw new Error('El HTML contiene elementos activos no permitidos.');
  for (const element of doc.querySelectorAll('*')) {
    for (const attribute of element.attributes) {
      if (
        /^on/i.test(attribute.name) ||
        attribute.name === 'srcdoc' ||
        attribute.name.startsWith('data-editor-')
      )
        throw new Error('El HTML contiene atributos activos o reservados.');
      if (['href', 'src', 'action', 'xlink:href'].includes(attribute.name)) {
        const value = Array.from(attribute.value)
          .filter((c) => c.charCodeAt(0) > 32)
          .join('');
        if (
          /^(?:javascript|vbscript|file):|^data:(?!image\/(?:png|jpeg|webp);base64,)/i.test(value)
        )
          throw new Error('El HTML contiene una URL no permitida.');
      }
    }
  }
}
function attributesOf(element: Element): Record<string, string> {
  return Object.fromEntries(Array.from(element.attributes, (attr) => [attr.name, attr.value]));
}
function metadata(element: Element, info: PreservedHtml): void {
  element.setAttribute(preservationAttribute, JSON.stringify(info));
}
function restoreTokens(html: string, envelope: PreservedDocument): string {
  envelope.tokens.forEach((token, i) => {
    const marker = `${envelope.prefix}${i}z`;
    html = html
      .replaceAll(`<!--${marker}-->`, token)
      .replaceAll(`${marker}=""`, token)
      .replaceAll(marker, token);
  });
  return html;
}

/** A DOM copy for existing export operations; expressions remain inert and are never fetched. */
export function preparePreservedHtmlExport(source: string) {
  const prefix = `html${crypto.randomUUID().replaceAll('-', '')}x`;
  const masked = maskSource(source, prefix);
  const doc = parseSource(masked.html);
  assertSafePreservedHtml(doc);
  return {
    container: doc.body,
    isExpression: (value: string) => value.includes(prefix),
    serialize: () => {
      const full = /<!doctype\b|<(?:html|head|body)\b/i.test(source);
      const doctype = source.match(/<!doctype\s[^>]*>/i)?.[0] ?? '';
      let html = full
        ? `${doctype}\n${doc.documentElement.outerHTML}`
        : doc.head.innerHTML + doc.body.innerHTML;
      masked.tokens.forEach((token, index) => {
        const marker = `${prefix}${index}z`;
        html = html
          .replaceAll(`<!--${marker}-->`, token)
          .replaceAll(`${marker}=""`, token)
          .replaceAll(marker, token);
      });
      assertSafePreservedHtml(
        new DOMParser().parseFromString(maskSource(html, prefix).html, 'text/html'),
      );
      return html;
    },
  };
}

/** Import a full document into the existing ProseMirror schema, preserving its envelope and table regions. */
export function preparePreservedHtml(
  source: string,
  schema: Schema,
  options: Readonly<{ prefix?: string; literalHandlebars?: boolean }> = {},
): JSONContent {
  const prefix = options.prefix ?? `html${crypto.randomUUID().replaceAll('-', '')}x`;
  const masked = options.literalHandlebars
    ? { html: source, tokens: [] }
    : maskSource(source, prefix);
  const doc = parseSource(masked.html);
  assertSafePreservedHtml(doc);
  const envelope: PreservedDocument = {
    source,
    baseline: '',
    head: doc.head.innerHTML,
    doctype: source.match(/<!doctype\s[^>]*>/i)?.[0] ?? '',
    fullDocument: /<!doctype\b|<(?:html|head|body)\b/i.test(source),
    htmlAttributes: attributesOf(doc.documentElement),
    bodyAttributes: attributesOf(doc.body),
    prefix,
    tokens: masked.tokens,
  };
  const tokenNode = (value: string, inline: boolean) => {
    const node = doc.createElement(inline ? 'span' : 'div');
    node.setAttribute(tokenAttribute, value);
    node.textContent = value;
    return node;
  };
  let nextRegion = 0;
  const processChildren = (parent: Element) => {
    for (const node of Array.from(parent.childNodes)) {
      if (node.nodeType === Node.COMMENT_NODE) {
        const match = node.textContent!.match(new RegExp(`^${prefix}(\\d+)z$`));
        const value = match ? masked.tokens[Number(match[1])] : `<!--${node.textContent}-->`;
        const inline = !!parent.matches('p,h1,h2,h3,h4,h5,h6,span,a,b,strong,em,i,u,s,mark');
        node.replaceWith(tokenNode(value, inline));
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent!.includes(prefix)) {
        const text = node.textContent!;
        const fragment = doc.createDocumentFragment();
        let cursor = 0;
        for (const match of text.matchAll(new RegExp(`${prefix}(\\d+)z`, 'g'))) {
          fragment.append(
            doc.createTextNode(text.slice(cursor, match.index)),
            tokenNode(masked.tokens[Number(match[1])], true),
          );
          cursor = match.index + match[0].length;
        }
        fragment.append(doc.createTextNode(text.slice(cursor)));
        node.replaceWith(fragment);
      } else if (node.nodeType === Node.ELEMENT_NODE) processElement(node as HTMLElement);
    }
  };
  const processElement = (element: HTMLElement) => {
    const tag = element.tagName.toLowerCase();
    if (tag === 'style') {
      element.replaceWith(tokenNode(element.outerHTML, false));
      return;
    }
    if (!supported.has(tag))
      throw new Error(`No se puede conservar <${tag}> en el esquema actual; no se aplicó el HTML.`);
    const info: PreservedHtml = { attributes: attributesOf(element), tag };
    if (tag === 'a' && info.attributes.href?.includes(prefix))
      element.setAttribute('href', `#${info.attributes.href}`);
    if (tag === 'table') {
      const layout: NonNullable<PreservedHtml['layout']> = [];
      const rows: HTMLTableRowElement[] = [];
      for (const child of Array.from(element.childNodes)) {
        if (
          child.nodeType === Node.ELEMENT_NODE &&
          ['THEAD', 'TBODY', 'TFOOT'].includes(child.nodeName)
        ) {
          const section = child as HTMLElement;
          const parts: ({ html: string } | { region: string })[] = [];
          let current = '';
          for (const item of Array.from(section.childNodes)) {
            if (item.nodeName === 'TR') {
              if (!current) {
                current = `${prefix}r${nextRegion++}`;
                parts.push({ region: current });
              }
              const row = item as HTMLTableRowElement;
              metadata(row, { attributes: attributesOf(row), region: current, tag: 'tr' });
              rows.push(row);
            } else {
              if (item.nodeType === Node.COMMENT_NODE) current = '';
              parts.push({
                html:
                  item.nodeType === Node.ELEMENT_NODE
                    ? (item as Element).outerHTML
                    : item.nodeType === Node.COMMENT_NODE
                      ? `<!--${item.textContent}-->`
                      : (item.textContent ?? ''),
              });
            }
          }
          layout.push({
            section: section.tagName.toLowerCase() as 'thead' | 'tbody' | 'tfoot',
            attributes: attributesOf(section),
            parts,
          });
        } else
          layout.push({
            html:
              child.nodeType === Node.ELEMENT_NODE
                ? (child as Element).outerHTML
                : child.nodeType === Node.COMMENT_NODE
                  ? `<!--${child.textContent}-->`
                  : (child.textContent ?? ''),
          });
      }
      info.layout = layout;
      element.replaceChildren(...rows);
      for (const row of rows) {
        if (Array.from(row.childNodes).some((node) => node.nodeType === Node.COMMENT_NODE))
          throw new Error(
            'Las condiciones entre celdas requieren una estructura de tabla explícita. El HTML se conservó sin aplicar.',
          );
        for (const cell of Array.from(row.cells)) processElement(cell);
      }
    } else processChildren(element);
    if (!element.hasAttribute(preservationAttribute)) metadata(element, info);
    if (containers.has(tag))
      element.setAttribute(
        'data-editor-container',
        element.querySelector(blockTags) ? 'block' : 'inline',
      );
  };
  processChildren(doc.body);
  const parsed = ModelParser.fromSchema(schema).parse(doc.body);
  const json = parsed.toJSON() as JSONContent;
  envelope.baseline = JSON.stringify(json.content);
  json.attrs = { ...json.attrs, preservedDocument: envelope };
  return parseCanonicalEditorContent(json);
}

export function serializePreservedHtml(node: ModelNode): string | null {
  if (!node.attrs.preservedDocument) return null;
  const envelope = preservedDocumentSchema.parse(node.attrs.preservedDocument);
  // Validate stored source even on the untouched fast path; JSON storage is not a trust boundary.
  const source = maskSource(envelope.source, envelope.prefix).html;
  assertSafePreservedHtml(new DOMParser().parseFromString(source, 'text/html'));
  assertSafePreservedHtml(
    new DOMParser().parseFromString(
      `<html><head>${envelope.head}</head><body></body></html>`,
      'text/html',
    ),
  );
  if (JSON.stringify(node.toJSON().content) === envelope.baseline) return envelope.source;
  const doc = new DOMParser().parseFromString(
    '<!DOCTYPE html><html><head></head><body></body></html>',
    'text/html',
  );
  doc.body.append(
    DOMSerializer.fromSchema(node.type.schema).serializeFragment(node.content, { document: doc }),
  );
  const literalTokens: string[] = [];
  for (const token of doc.body.querySelectorAll(`[${tokenAttribute}]`)) {
    const value = token.getAttribute(tokenAttribute)!;
    const marker = `${envelope.prefix}literal${literalTokens.push(value) - 1}z`;
    token.replaceWith(doc.createComment(marker));
  }
  for (const table of Array.from(doc.body.querySelectorAll('table')).reverse()) {
    const info = table.getAttribute(preservationAttribute);
    if (!info) continue;
    const layout = preservedHtmlSchema.parse(JSON.parse(info)).layout;
    if (!layout) continue;
    const rows = Array.from(table.querySelectorAll('tr')).filter(
      (row) => row.closest('table') === table,
    );
    const groups = new Map<string, HTMLTableRowElement[]>();
    for (const row of rows) {
      const region = row.getAttribute(regionAttribute);
      if (!region) throw new Error('Una fila perdió su vínculo con la sección de la plantilla.');
      groups.set(region, [...(groups.get(region) ?? []), row]);
    }
    const result = doc.createDocumentFragment();
    const generatedColumns = Array.from(table.children).find(
      (child) => child.tagName === 'COLGROUP',
    );
    for (const entry of layout) {
      if ('html' in entry) {
        const holder = doc.createElement('template');
        holder.innerHTML = entry.html;
        result.append(holder.content);
      } else {
        const section = doc.createElement(entry.section);
        for (const [name, value] of Object.entries(entry.attributes))
          section.setAttribute(name, value);
        for (const part of entry.parts) {
          if ('region' in part) section.append(...(groups.get(part.region) ?? []));
          else {
            // Section literals are whitespace/comments, parsed in a valid table context.
            const holder = doc.createElement('table');
            holder.innerHTML = `<tbody>${part.html}</tbody>`;
            section.append(...holder.querySelector('tbody')!.childNodes);
          }
        }
        result.append(section);
      }
    }
    const hasExplicitWidths = rows.some((row) =>
      Array.from(row.cells).some((cell) => /[1-9]/.test(cell.getAttribute('colwidth') ?? '')),
    );
    const hasOriginalColumns = layout.some(
      (item) => 'html' in item && /<colgroup\b/i.test(item.html),
    );
    if (hasExplicitWidths && generatedColumns && !hasOriginalColumns)
      result.prepend(generatedColumns);
    table.replaceChildren(result);
  }
  for (const element of doc.body.querySelectorAll('*')) {
    const raw = element.getAttribute(preservationAttribute);
    if (raw && element.tagName === 'A') {
      const href = preservedHtmlSchema.parse(JSON.parse(raw)).attributes.href;
      if (href?.includes(envelope.prefix) && element.getAttribute('href') === `#${href}`)
        element.setAttribute('href', href);
    }
    element.removeAttribute(preservationAttribute);
    element.removeAttribute(regionAttribute);
    element.removeAttribute('data-editor-container');
  }
  for (const [name, value] of Object.entries(envelope.htmlAttributes))
    doc.documentElement.setAttribute(name, value);
  for (const [name, value] of Object.entries(envelope.bodyAttributes))
    doc.body.setAttribute(name, value);
  doc.head.innerHTML = envelope.head;
  let html = envelope.fullDocument
    ? `${envelope.doctype}\n${doc.documentElement.outerHTML}`
    : doc.head.innerHTML + doc.body.innerHTML;
  literalTokens.forEach((token, i) => {
    html = html.replaceAll(`<!--${envelope.prefix}literal${i}z-->`, token);
  });
  html = restoreTokens(html, envelope);
  const checked = maskSource(html, envelope.prefix);
  assertSafePreservedHtml(new DOMParser().parseFromString(checked.html, 'text/html'));
  return html;
}
