/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountEditorApp, type MountedEditorApp } from './editor-app';
import { tableCommands } from './core/table-commands';
import { serializeEditorContent } from './services/serializer.service';
import { createLocalDocumentStorageService } from './services/document-storage.service';

const source = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>{{title}}</title>
<style>body{font:12pt Arial;color:#222}p{margin-bottom:12pt!important}.data{width:100%;border-collapse:collapse}@media print{tr{break-inside:avoid}}.page-break{page-break-before:always}</style></head>
<body><h1 id="title" class="page-break" style="text-align:center">Acta de {{nombre}}</h1>
<div class="note" style="background:#eee"><p>Texto <span class="label" style="letter-spacing:1px">importante</span>.</p></div>
<table class="data"><thead><tr><th>Nombre</th><th>Cargo</th></tr></thead><tbody id="rows">{{#each participantes}}<tr><td>{{nombre}}</td><td>{{cargo}}</td></tr>{{/each}}</tbody></table>
{{#each temas}}<h3>{{tema}}</h3><div class="topic-content">{{{desarrollo}}}</div>{{#if tieneArchivos}}<ul><li><a class="attachment" href="{{url}}">{{nombre}}</a></li></ul>{{/if}}{{/each}}
{{#unless requiere_firma_otp}}{{#if miembros}}<table class="approval"><tbody>{{#each miembros}}<tr><td>{{nombre}}</td><td>{{#if firmado}}<img class="signature" src="{{firma}}" alt="Firma de {{nombre}}">{{else}}{{firma}}{{/if}}</td></tr>{{/each}}</tbody></table>{{/if}}{{/unless}}</body></html>`;
const mounted: MountedEditorApp[] = [];
afterEach(() => {
  mounted.forEach((app) => app.lifecycle.dispose());
  mounted.length = 0;
  document.body.replaceChildren();
});
async function setup() {
  const root = document.createElement('div');
  document.body.append(root);
  const values = new Map<string, string>();
  const memory: Storage = {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
    key: (index) => [...values.keys()][index] ?? null,
  };
  const storage = createLocalDocumentStorageService({ storage: memory });
  const app = await mountEditorApp({
    app: root,
    storage,
    embedded: true,
    autosave: { enabled: false, debounceMs: 1 },
  });
  mounted.push(app);
  return { root, app, storage };
}
function cells(app: MountedEditorApp, tableIndex = 0) {
  const positions: number[] = [];
  let index = -1;
  app.editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'table') index++;
    if (index === tableIndex && ['tableCell', 'tableHeader'].includes(node.type.name))
      positions.push(pos);
  });
  return positions;
}
function click(root: HTMLElement, action: string) {
  root.querySelector<HTMLButtonElement>(`[data-toolbar-action="${action}"]`)!.click();
}

describe('HTML preservation in the existing editor', () => {
  it('keeps the existing toolbar and saves an untouched template exactly', async () => {
    const { app, root } = await setup();
    expect(app.setHtml(source)).toMatchObject({ ok: true });
    expect(root.querySelector('.ProseMirror')).not.toBeNull();
    expect(root.querySelector('.editor-toolbar')).not.toBeNull();
    expect(root.querySelector('.template-editor')).toBeNull();
    expect(app.editor.getHTML()).toBe(source);
    expect(serializeEditorContent(app.editor).contentHtml).toBe(source);
  });
  it('preserves the full envelope, CSS, attributes, containers and loop placement after a visual text edit', async () => {
    const { app } = await setup();
    app.setHtml(source);
    app.editor.commands.insertContentAt(1, 'Nueva ');
    const saved = serializeEditorContent(app.editor);
    expect(saved.contentHtml).toContain('<!DOCTYPE html>');
    expect(saved.contentHtml).toContain('<html lang="es">');
    expect(saved.contentHtml).toContain('@media print{tr{break-inside:avoid}}');
    expect(saved.contentHtml).toContain('class="note"');
    expect(saved.contentHtml).toContain('letter-spacing:');
    expect(saved.contentHtml).toContain('id="rows"');
    expect(saved.contentHtml).toContain('{{#each participantes}}<tr>');
    expect(saved.contentHtml).toContain('</tr>{{/each}}');
    expect(saved.contentHtml).toContain('{{{desarrollo}}}');
    expect(saved.contentHtml).toContain('src="{{firma}}"');
    expect(saved.contentHtml).toContain('href="{{url}}"');
    expect(saved.contentHtml).toContain('Nueva ');
    expect(saved.contentHtml).not.toContain('data-editor-');
  });
  it('uses the existing table commands for merge, split, insert, undo and redo', async () => {
    const { app } = await setup();
    app.setHtml(source);
    const positions = cells(app);
    app.editor.commands.setCellSelection({ anchorCell: positions[2], headCell: positions[3] });
    expect(tableCommands.mergeCells(app.editor)).toBe(true);
    expect(app.editor.getHTML()).toContain('colspan="2"');
    expect(app.editor.getHTML()).toContain('{{#each participantes}}<tr>');
    expect(tableCommands.splitCell(app.editor)).toBe(true);
    expect(tableCommands.addRowAfter(app.editor)).toBe(true);
    const html = app.editor.getHTML();
    expect(html).toContain('{{/each}}</tbody>');
    expect(app.editor.commands.undo()).toBe(true);
    expect(app.editor.commands.redo()).toBe(true);
    expect(app.editor.getHTML()).toBe(html);
  });
  it('persists and reloads using the same document storage and JSON schema', async () => {
    const { app, root, storage } = await setup();
    app.setHtml(source);
    app.editor.commands.insertContentAt(1, 'Guardado ');
    click(root, 'save');
    await vi.waitFor(async () =>
      expect(await storage.loadDocument('default-document')).not.toBeNull(),
    );
    const saved = await storage.loadDocument('default-document');
    const other = document.createElement('div');
    document.body.append(other);
    const reloaded = await mountEditorApp({ app: other, storage, embedded: true });
    mounted.push(reloaded);
    expect(reloaded.editor.getHTML()).toBe(saved!.contentHtml);
    expect(reloaded.editor.getHTML()).toContain('{{#each participantes}}<tr>');
  });
  it('uses the existing HTML source view without losing the head when returning to visual', async () => {
    const { app, root } = await setup();
    app.setHtml(source);
    click(root, 'source-html');
    expect(app.getSourceView()!.getValue()).toBe(source);
    app.getSourceView()!.setValue(source.replace('Acta de', 'Informe de'));
    click(root, 'source-html');
    expect(app.getActiveMode()).toBe('wysiwyg');
    expect(app.editor.getHTML()).toContain('Informe de');
    expect(app.editor.getHTML()).toContain('<style>');
  });
  it.each([
    '<script>alert(1)</script>',
    '<img src="x" onerror="alert(1)">',
    '<iframe src="x"></iframe>',
  ])('rejects active HTML atomically: %s', async (active) => {
    const { app } = await setup();
    app.setHtml(source);
    expect(app.setHtml(source.replace('</body>', active + '</body>'))).toMatchObject({ ok: false });
    expect(app.editor.getHTML()).toBe(source);
  });
});

describe('preservation boundaries in the original editor', () => {
  it('switches back to ordinary HTML without retaining the previous template envelope', async () => {
    const { app } = await setup();
    app.setHtml(source);
    expect(app.setHtml('<p>Documento normal</p>')).toMatchObject({ ok: true });
    expect(app.editor.getHTML()).toBe('<p>Documento normal</p>');
    expect(serializeEditorContent(app.editor).contentHtml).toBe('<p>Documento normal</p>');
  });
  it('rejects deleting only one Handlebars boundary before notifying changes or saving', async () => {
    const { app, root } = await setup();
    app.setHtml(source);
    const before = app.editor.getHTML();
    let pos = -1;
    let size = 0;
    app.editor.state.doc.descendants((node, at) => {
      if (
        pos < 0 &&
        node.type.name === 'htmlBlockToken' &&
        node.attrs.value === '{{#each temas}}'
      ) {
        pos = at;
        size = node.nodeSize;
      }
    });
    app.editor.commands.deleteRange({ from: pos, to: pos + size });
    expect(app.editor.getHTML()).toBe(before);
    expect(root.querySelector('#editor-status')!.textContent).toContain('Handlebars');
  });
  it('rejects merging header/body cells while allowing the original tools within one region', async () => {
    const { app, root } = await setup();
    app.setHtml(source);
    const before = app.editor.getHTML();
    const positions = cells(app);
    app.editor.commands.setCellSelection({ anchorCell: positions[0], headCell: positions[3] });
    tableCommands.mergeCells(app.editor);
    expect(app.editor.getHTML()).toBe(before);
    expect(root.querySelector('#editor-status')!.textContent).toContain('misma sección');
  });
  it('retains CSS and attributes when existing formatting commands change the document', async () => {
    const { app } = await setup();
    app.setHtml(source);
    app.editor.commands.setTextSelection({ from: 1, to: 5 });
    app.editor.commands.toggleBold();
    app.editor.commands.setTextAlign('right');
    const html = app.editor.getHTML();
    expect(html).toContain('<strong>Acta</strong>');
    expect(html).toContain('text-align: right');
    expect(html).toContain('class="page-break"');
    expect(html).toContain('margin-bottom:12pt!important');
    expect(html).not.toContain('data-editor-');
  });
  it('preserves conditional attributes, trim markers and quoted helper arguments', async () => {
    const { app } = await setup();
    const html =
      '<!DOCTYPE html><html><head><style>p{margin:0}</style></head><body><h1>Título</h1><p {{#if active}}class="active"{{/if}}>{{helper "}}"}}{{~#if active~}}Texto{{~/if~}}</p></body></html>';
    expect(app.setHtml(html)).toMatchObject({ ok: true });
    app.editor.commands.insertContentAt(1, 'Nuevo ');
    const result = app.editor.getHTML();
    expect(result).toContain('{{#if active}}class="active"');
    expect(result).toContain('{{helper "}}"}}');
    expect(result).toContain('{{~#if active~}}');
    expect(result).toContain('{{~/if~}}');
  });
});

describe('fragment and native column-width preservation', () => {
  it('preserves leading/trailing Handlebars and CSS in a fragment after editing', async () => {
    const { app } = await setup();
    const html =
      '{{#if visible}}<style>.note{color:red}</style><p class="note">Contenido</p>{{/if}}';
    expect(app.setHtml(html)).toMatchObject({ ok: true });
    let pos = 0;
    app.editor.state.doc.descendants((node, at) => {
      if (node.type.name === 'paragraph' && node.textContent.includes('Contenido')) pos = at + 1;
    });
    app.editor.commands.insertContentAt(pos, 'Nuevo ');
    expect(app.editor.getHTML()).toContain('{{#if visible}}');
    expect(app.editor.getHTML()).toContain('<style>.note{color:red}</style>');
    expect(app.editor.getHTML()).toContain('Nuevo Contenido');
    expect(app.editor.getHTML()).toContain('{{/if}}');
    expect(app.editor.getHTML()).not.toContain('data-editor-');
  });
  it('retains native column resizing in the exported HTML together with the template envelope', async () => {
    const { app } = await setup();
    app.setHtml(source);
    app.editor.commands.setNodeSelection(cells(app)[2]);
    app.editor.commands.updateAttributes('tableCell', { colwidth: [240] });
    const html = app.editor.getHTML();
    expect(html).toContain('width: 240px');
    expect(html).toContain('<style>');
    expect(html).toContain('{{#each participantes}}');
  });
});

describe('explicit column definition protection', () => {
  it('preserves colgroup styles during content editing and rejects unsynchronized column changes', async () => {
    const { app, root } = await setup();
    const html =
      '<!DOCTYPE html><html><head><style>td{padding:8px}</style></head><body><table><colgroup><col style="width:30%"><col style="width:70%"></colgroup><tbody><tr><td>A</td><td>B</td></tr></tbody></table></body></html>';
    app.setHtml(html);
    app.editor.commands.setTextSelection(cells(app)[0] + 2);
    app.editor.commands.insertContent('Nuevo ');
    const before = app.editor.getHTML();
    expect(before).toContain('<colgroup><col style="width:30%"><col style="width:70%"></colgroup>');
    tableCommands.addColumnAfter(app.editor);
    expect(app.editor.getHTML()).toBe(before);
    expect(root.querySelector('#editor-status')!.textContent).toContain('colgroup');
  });
});

describe('legacy stored template loading', () => {
  it('uses complete stored HTML when older JSON has no preservation metadata, without emitting an edit', async () => {
    const { storage } = await setup();
    await storage.saveDocument('legacy-template', {
      title: 'Plantilla',
      contentJson: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Proyección antigua' }] }],
      },
      contentHtml: source,
    });
    const root = document.createElement('div');
    document.body.append(root);
    const onChange = vi.fn();
    const app = await mountEditorApp({
      app: root,
      storage,
      documentId: 'legacy-template',
      onChange,
    });
    mounted.push(app);
    expect(app.editor.getHTML()).toBe(source);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('existing text-color tools on preserved spans', () => {
  it('changes color without duplicating source IDs or removing other span styles', async () => {
    const { app } = await setup();
    app.setHtml(
      '<!DOCTYPE html><html><head><style>p{margin:0}</style></head><body><p><span id="label" class="label" style="color:blue;letter-spacing:1px">Texto editable</span></p></body></html>',
    );
    app.editor.commands.setTextSelection({ from: 1, to: 6 });
    app.editor.commands.setColor('#ff0000');
    const html = app.editor.getHTML();
    expect(html.match(/id="label"/g)).toHaveLength(1);
    expect(html).toContain('letter-spacing: 1px');
    expect(html).toMatch(/color: (?:rgb\(255, 0, 0\)|#ff0000)/);
    expect(html).toContain('<style>p{margin:0}</style>');
  });
});
