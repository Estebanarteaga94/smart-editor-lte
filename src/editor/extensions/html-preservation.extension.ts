import { Extension, Mark, Node as TiptapNode } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { CellSelection } from '@tiptap/pm/tables';
import type { Node as ModelNode, ResolvedPos } from '@tiptap/pm/model';
import { Transform } from '@tiptap/pm/transform';
import { preservedHtmlSchema, type PreservedHtml } from '../models/preserved-html';
import {
  preservationAttribute,
  regionAttribute,
  tokenAttribute,
  serializePreservedHtml,
} from '../services/preserved-html.service';

function htmlOf(node: ModelNode): PreservedHtml | undefined {
  return node.attrs.preservedHtml as PreservedHtml | undefined;
}
function regionUpdates(doc: ModelNode, selection: ResolvedPos) {
  const updates: { pos: number; attrs: Record<string, unknown> }[] = [];
  let preferred: string | undefined;
  for (let depth = selection.depth; depth > 0; depth--) {
    const node = selection.node(depth);
    if (node.type.name === 'tableRow') {
      preferred = htmlOf(node)?.region;
      break;
    }
  }
  doc.descendants((table, pos) => {
    const layout = htmlOf(table)?.layout;
    if (table.type.name !== 'table' || !layout) return;
    const allowed = layout.flatMap((item) =>
      'section' in item
        ? item.parts.flatMap((part) => ('region' in part ? [part.region] : []))
        : [],
    );
    table.forEach((row, offset, index) => {
      if (htmlOf(row)?.region) return;
      const previous = index > 0 ? htmlOf(table.child(index - 1))?.region : undefined;
      const next =
        index + 1 < table.childCount ? htmlOf(table.child(index + 1))?.region : undefined;
      const region =
        preferred && allowed.includes(preferred) ? preferred : (previous ?? next ?? allowed[0]);
      if (region)
        updates.push({
          pos: pos + 1 + offset,
          attrs: { ...row.attrs, preservedHtml: { attributes: {}, tag: 'tr', region } },
        });
    });
  });
  return updates;
}
const nodes = [
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'taskList',
  'taskItem',
  'table',
  'tableRow',
  'tableCell',
  'tableHeader',
  'image',
  'blockquote',
  'codeBlock',
  'horizontalRule',
  'hardBreak',
  'htmlContainer',
  'htmlInlineContainer',
];
const marks = [
  'bold',
  'italic',
  'underline',
  'strike',
  'link',
  'highlight',
  'htmlSpan',
];
export const HtmlPreservation = Extension.create<{ onInvalidHtml?: (message: string) => void }>({
  name: 'htmlPreservation',
  priority: 1000,
  addOptions: () => ({}),
  addGlobalAttributes() {
    return [
      {
        types: ['doc'],
        attributes: { preservedDocument: { default: undefined, rendered: false } },
      },
      {
        types: [...nodes, ...marks],
        attributes: {
          preservedHtml: {
            default: undefined,
            parseHTML: (element: HTMLElement) => {
              const value = element.getAttribute(preservationAttribute);
              return value ? preservedHtmlSchema.parse(JSON.parse(value)) : undefined;
            },
            renderHTML: (attrs: Record<string, unknown>) => {
              if (!attrs.preservedHtml) return {};
              const info = preservedHtmlSchema.parse(attrs.preservedHtml);
              return {
                ...info.attributes,
                [preservationAttribute]: JSON.stringify(info),
                ...(info.region ? { [regionAttribute]: info.region } : {}),
              };
            },
          },
        },
      },
    ];
  },
  addProseMirrorPlugins() {
    const widths = (table: ModelNode) => {
      const values: unknown[] = [];
      if (table.childCount)
        table.child(0).forEach((cell) => {
          const columnWidths = cell.attrs.colwidth as (number | null)[] | null;
          for (let c = 0; c < Number(cell.attrs.colspan); c++)
            values.push(columnWidths?.[c] ?? null);
        });
      return JSON.stringify(values);
    };
    const topology = (doc: ModelNode) => {
      const tables: unknown[] = [];
      doc.descendants((node) => {
        if (node.type.name === 'table') {
          const rows: unknown[] = [];
          node.forEach((row) => {
            const cells: unknown[] = [];
            row.forEach((cell) => cells.push([cell.attrs.rowspan, cell.attrs.colspan]));
            rows.push(cells);
          });
          tables.push(rows);
        }
      });
      return JSON.stringify(tables);
    };
    return [
      new Plugin({
        filterTransaction: (transaction, state) => {
          if (transaction.getMeta('preservedImport')) return true;
          if (!transaction.docChanged || !state.doc.attrs.preservedDocument) return true;
          let columnsPreserved = true;
          state.doc.descendants((oldTable) => {
            const layout = htmlOf(oldTable)?.layout;
            if (
              oldTable.type.name !== 'table' ||
              !layout?.some((part) => 'html' in part && /<colgroup\b/i.test(part.html))
            )
              return;
            transaction.doc.descendants((newTable) => {
              if (
                newTable.type.name === 'table' &&
                htmlOf(newTable)?.layout === layout &&
                widths(oldTable) !== widths(newTable)
              )
                columnsPreserved = false;
            });
          });
          if (!columnsPreserved) {
            this.options.onInvalidHtml?.(
              'Esta tabla tiene colgroup explícito; se conservó su definición de columnas sin aplicar el cambio de cantidad o ancho.',
            );
            return false;
          }
          if (state.selection instanceof CellSelection) {
            const regions = new Set<string>();
            state.selection.forEachCell((_cell, pos) => {
              const region = htmlOf(state.doc.resolve(pos).parent)?.region;
              if (region) regions.add(region);
            });
            if (regions.size > 1 && topology(state.doc) !== topology(transaction.doc)) {
              this.options.onInvalidHtml?.(
                'Seleccione celdas de la misma sección y bloque Handlebars.',
              );
              return false;
            }
          }
          let valid = true;
          transaction.doc.descendants((node) => {
            if (node.type.name !== 'table' || !htmlOf(node)?.layout) return;
            node.forEach((row, _offset, r) =>
              row.forEach((cell) => {
                for (
                  let y = r;
                  y < Math.min(node.childCount, r + Number(cell.attrs.rowspan));
                  y++
                ) {
                  const a = htmlOf(row)?.region;
                  const b = htmlOf(node.child(y))?.region;
                  if (a && b && a !== b) valid = false;
                }
              }),
            );
          });
          if (!valid) {
            this.options.onInvalidHtml?.('El cambio cruza secciones o bloques Handlebars.');
            return false;
          }
          try {
            const projection = new Transform(transaction.doc);
            for (const update of regionUpdates(transaction.doc, state.selection.$from))
              projection.setNodeMarkup(update.pos, undefined, update.attrs);
            serializePreservedHtml(projection.doc);
            return true;
          } catch (cause) {
            this.options.onInvalidHtml?.(
              cause instanceof Error
                ? cause.message
                : 'El cambio no conserva el HTML de la plantilla.',
            );
            return false;
          }
        },
        appendTransaction: (transactions, oldState, newState) => {
          if (!transactions.some((tr) => tr.docChanged) || !newState.doc.attrs.preservedDocument)
            return null;
          const tr = newState.tr;
          for (const update of regionUpdates(newState.doc, oldState.selection.$from))
            tr.setNodeMarkup(update.pos, undefined, update.attrs);
          return tr.docChanged ? tr : null;
        },
      }),
    ];
  },
});
function container(name: string, inlineContent: boolean) {
  return TiptapNode.create({
    name,
    group: 'block',
    content: inlineContent ? 'inline*' : 'block*',
    defining: true,
    parseHTML: () => [
      { tag: `[data-editor-container="${inlineContent ? 'inline' : 'block'}"]`, priority: 1000 },
    ],
    renderHTML: ({ node, HTMLAttributes }) => {
      const tag = htmlOf(node)?.tag ?? 'div';
      if (
        ![
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
        ].includes(tag)
      )
        throw new Error('Contenedor HTML no permitido.');
      return [tag, HTMLAttributes, 0];
    },
  });
}
function token(name: string, inline: boolean) {
  return TiptapNode.create({
    name,
    inline,
    group: inline ? 'inline' : 'block',
    atom: true,
    addAttributes: () => ({
      value: {
        default: '',
        parseHTML: (element) => element.getAttribute(tokenAttribute),
        rendered: false,
      },
    }),
    parseHTML: () => [{ tag: `${inline ? 'span' : 'div'}[${tokenAttribute}]`, priority: 2000 }],
    renderHTML: ({ node }) => [
      inline ? 'span' : 'div',
      {
        [tokenAttribute]: node.attrs.value as string,
        class: 'editor-template-token',
        contenteditable: 'false',
        ...(/^<(?:style\b|!--)/i.test(node.attrs.value as string) ? { style: 'display:none' } : {}),
      },
      node.attrs.value as string,
    ],
  });
}
export const HtmlContainer = container('htmlContainer', false);
export const HtmlInlineContainer = container('htmlInlineContainer', true);
export const HtmlToken = token('htmlToken', true);
export const HtmlBlockToken = token('htmlBlockToken', false);
export const HtmlSpan = Mark.create({
  name: 'htmlSpan',
  priority: 1000,
  parseHTML: () => [{ tag: `span[${preservationAttribute}]` }],
  renderHTML: ({ HTMLAttributes }) => ['span', HTMLAttributes, 0],
});
