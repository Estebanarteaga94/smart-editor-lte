/** @vitest-environment jsdom */
import type { Editor } from '@tiptap/core';
import { closeHistory, undoDepth, redoDepth } from '@tiptap/pm/history';
import { Plugin } from '@tiptap/pm/state';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyPreparedHtml,
  applyPreparedHtmlBatch,
  prepareHtmlContent,
  pilotHtmlPolicyId,
  mountEditorApp,
  type MountedEditorApp,
  type PreparedHtmlContent,
  type PreparedHtmlBatchEntry,
} from '../../lib';
import { createWysiwygEditor } from '../core/create-editor';

const editors: Editor[] = [];
const apps: MountedEditorApp[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  apps.forEach((app) => app.lifecycle.dispose());
  editors.forEach((editor) => {
    if (!editor.isDestroyed) editor.destroy();
  });
  apps.length = 0;
  editors.length = 0;
  document.body.replaceChildren();
  vi.useRealTimers();
});
function prepare(html: string): PreparedHtmlContent {
  const result = prepareHtmlContent({ html, policyId: pilotHtmlPolicyId });
  if (!result.ok) throw new Error('Expected prepared HTML');
  return result;
}
function setup(index: number) {
  const host = document.createElement('div');
  document.body.append(host);
  const changed = vi.fn();
  const editor = createWysiwygEditor({
    element: host,
    initialContent: `<p>Original ${index}</p>`,
    onChange: changed,
  });
  editors.push(editor);
  editor.commands.insertContent('Previo ');
  editor.view.dispatch(closeHistory(editor.state.tr));
  editor.commands.insertContent('Rehacer ');
  editor.commands.undo();
  editor.commands.setTextSelection({ from: 2, to: 4 });
  const transaction = vi.fn(),
    update = vi.fn(),
    selection = vi.fn(),
    before = vi.fn();
  editor.on('transaction', transaction);
  editor.on('update', update);
  editor.on('selectionUpdate', selection);
  editor.on('beforeTransaction', before);
  changed.mockClear();
  return { editor, changed, transaction, update, selection, before };
}
function snapshot(editor: Editor) {
  return {
    state: editor.state,
    json: editor.getJSON(),
    html: editor.getHTML(),
    dom: editor.view.dom.outerHTML,
    undo: undoDepth(editor.state),
    redo: redoDepth(editor.state),
  };
}
function assertSilent(
  fixtures: ReturnType<typeof setup>[],
  snapshots: ReturnType<typeof snapshot>[],
) {
  fixtures.forEach((fixture, index) => {
    expect(fixture.editor.state).toBe(snapshots[index].state);
    expect(snapshot(fixture.editor)).toEqual(snapshots[index]);
    for (const spy of [
      fixture.changed,
      fixture.transaction,
      fixture.update,
      fixture.selection,
      fixture.before,
    ])
      expect(spy).not.toHaveBeenCalled();
  });
}

describe('applyPreparedHtmlBatch', () => {
  it('commits every view before observers run and reports the batch once', () => {
    const a = setup(1),
      b = setup(2);
    const original = [snapshot(a.editor), snapshot(b.editor)];
    const seen: string[][] = [];
    const observe = () => seen.push([a.editor.getHTML(), b.editor.getHTML()]);
    a.editor.on('update', observe);
    b.editor.on('update', observe);
    const onApplied = vi.fn(observe);
    const focus = document.activeElement;
    const doms = [a.editor.view.dom, b.editor.view.dom];
    const entries = Object.freeze([
      Object.freeze({ editor: a.editor, candidate: prepare('<p>Uno<br>{{literal}}</p>') }),
      Object.freeze({ editor: b.editor, candidate: prepare('<p><strong>Dos</strong></p>') }),
    ]);
    const result = applyPreparedHtmlBatch(entries, { onApplied });
    expect(result).toEqual({
      ok: true,
      resultados: [
        { indice: 0, aplicado: true, html: entries[0].candidate.html },
        { indice: 1, aplicado: true, html: entries[1].candidate.html },
      ],
      erroresNotificacion: [],
    });
    expect(seen).toEqual(
      Array.from({ length: 3 }, () => entries.map((entry) => entry.candidate.html)),
    );
    expect(onApplied).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(focus);
    [a, b].forEach((fixture, index) => {
      expect(fixture.editor.view.dom).toBe(doms[index]);
      expect(fixture.changed).toHaveBeenCalledTimes(1);
      expect(fixture.update).toHaveBeenCalledTimes(1);
      expect(fixture.transaction).toHaveBeenCalledTimes(1);
      expect(fixture.before).not.toHaveBeenCalled();
      expect(undoDepth(fixture.editor.state)).toBe(original[index].undo + 1);
      expect(redoDepth(fixture.editor.state)).toBe(0);
      fixture.editor.commands.insertContent('Después ');
      fixture.editor.commands.undo();
      expect(fixture.editor.getHTML()).toBe(entries[index].candidate.html);
      fixture.editor.commands.undo();
      expect(fixture.editor.state.doc.eq(original[index].state.doc)).toBe(true);
      expect(fixture.editor.state.selection.eq(original[index].state.selection)).toBe(true);
      fixture.editor.commands.redo();
      expect(fixture.editor.getHTML()).toBe(entries[index].candidate.html);
    });
  });

  it.each([0, 1, 2])(
    'rejects a tampered candidate at index %i without touching any view',
    (index) => {
      const fixtures = [setup(1), setup(2), setup(3)];
      const snapshots = fixtures.map((fixture) => snapshot(fixture.editor));
      const entries = fixtures.map((fixture) => ({
        editor: fixture.editor,
        candidate: prepare('<p>Nuevo</p>'),
      }));
      entries[index].candidate = { ...entries[index].candidate, html: '<p>Otro</p>' };
      const onApplied = vi.fn();
      expect(applyPreparedHtmlBatch(entries, { onApplied })).toEqual({
        ok: false,
        codigo: 'CANDIDATO_INVALIDO',
        indice: index,
      });
      assertSilent(fixtures, snapshots);
      expect(onApplied).not.toHaveBeenCalled();
    },
  );

  it.each(['filter', 'append', 'throw', 'reenter'] as const)(
    'stages all native plugins and aborts on %s in a later editor',
    (kind) => {
      const a = setup(1),
        b = setup(2);
      b.editor.registerPlugin(
        new Plugin({
          filterTransaction: (tr) => {
            if (!tr.docChanged) return true;
            if (kind === 'throw') throw new Error('Plugin failure');
            if (kind === 'reenter') a.editor.commands.insertContent('Prohibido');
            return kind !== 'filter';
          },
          appendTransaction: (transactions, _old, next) =>
            kind === 'append' && transactions.some((tr) => tr.docChanged)
              ? next.tr.insertText('Alterado', 1)
              : null,
        }),
      );
      const snapshots = [snapshot(a.editor), snapshot(b.editor)];
      const updateA = vi.spyOn(a.editor.view, 'updateState');
      const result = applyPreparedHtmlBatch(
        [a, b].map(({ editor }) => ({ editor, candidate: prepare('<p>Nuevo</p>') })),
      );
      expect(result).toEqual({ ok: false, codigo: 'APLICACION_RECHAZADA', indice: 1 });
      expect(updateA).not.toHaveBeenCalled();
      assertSilent([a, b], snapshots);
      expect(applyPreparedHtml(a.editor, prepare('<p>Reintento</p>')).ok).toBe(true);
    },
  );

  it.each([0, 1, 2])(
    'restores exact snapshots if updating view %i throws after mutating its state',
    (index) => {
      const fixtures = [setup(1), setup(2), setup(3)];
      fixtures[1].editor.view.focus();
      fixtures.forEach((fixture) =>
        [
          fixture.changed,
          fixture.transaction,
          fixture.update,
          fixture.selection,
          fixture.before,
        ].forEach((spy) => spy.mockClear()),
      );
      const snapshots = fixtures.map(({ editor }) => snapshot(editor));
      const focus = document.activeElement;
      const dom = document.body.innerHTML;
      const failing = fixtures[index].editor.view;
      const update = failing.updateState.bind(failing);
      vi.spyOn(failing, 'updateState').mockImplementationOnce((state) => {
        update(state);
        throw new Error('View update failed');
      });
      const onApplied = vi.fn();
      const result = applyPreparedHtmlBatch(
        fixtures.map(({ editor }) => ({ editor, candidate: prepare('<p>Nuevo</p>') })),
        { onApplied },
      );
      expect(result).toEqual({ ok: false, codigo: 'APLICACION_RECHAZADA', indice: index });
      assertSilent(fixtures, snapshots);
      expect(onApplied).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(focus);
      expect(document.body.innerHTML).toBe(dom);
      fixtures[1].editor.view.dom.blur();
      fixtures.forEach(({ editor }, i) => {
        expect(undoDepth(editor.state)).toBeGreaterThan(0);
        expect(redoDepth(editor.state)).toBeGreaterThan(0);
        editor.commands.redo();
        expect(editor.getText()).toContain('Rehacer');
        editor.commands.undo();
        expect(editor.state.doc.eq(snapshots[i].state.doc)).toBe(true);
      });
    },
  );

  it('applies a final list in the second editor without normalizing its HTML', () => {
    const a = setup(1),
      b = setup(2);
    const html = '<ul class="wysiwyg-list converted-from-office"><li>Uno</li></ul>';
    expect(
      applyPreparedHtmlBatch([
        { editor: a.editor, candidate: prepare('<p>Nuevo</p>') },
        { editor: b.editor, candidate: prepare(html) },
      ]),
    ).toMatchObject({ ok: true, erroresNotificacion: [] });
    expect(a.editor.getHTML()).toBe('<p>Nuevo</p>');
    expect(b.editor.getHTML()).toBe(html);
    expect(a.changed).toHaveBeenCalledTimes(1);
    expect(b.changed).toHaveBeenCalledTimes(1);
  });

  it('leaves no-op entries and their redo branch untouched in a mixed batch', () => {
    const a = setup(1),
      b = setup(2),
      c = setup(3);
    const before = snapshot(a.editor);
    const result = applyPreparedHtmlBatch([
      { editor: a.editor, candidate: prepare(a.editor.getHTML()) },
      { editor: b.editor, candidate: prepare('') },
      { editor: c.editor, candidate: prepare('<p>Tres</p>') },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected applied batch');
    expect(result.resultados.map((item) => item.aplicado)).toEqual([false, true, true]);
    expect(snapshot(a.editor)).toEqual(before);
    expect(a.changed).not.toHaveBeenCalled();
    expect(b.editor.isEmpty).toBe(true);
    b.editor.commands.undo();
    expect(b.editor.isEmpty).toBe(false);
  });

  it('does not notify for an entirely identical batch', () => {
    const a = setup(1),
      b = setup(2);
    const snapshots = [snapshot(a.editor), snapshot(b.editor)];
    const onApplied = vi.fn();
    const result = applyPreparedHtmlBatch(
      [a, b].map(({ editor }) => ({ editor, candidate: prepare(editor.getHTML()) })),
      { onApplied },
    );
    expect(result.ok).toBe(true);
    assertSilent([a, b], snapshots);
    expect(onApplied).not.toHaveBeenCalled();
  });

  it.each(['readonly', 'destroyed'] as const)(
    'rejects a later %s editor without changing the earlier one',
    (kind) => {
      const a = setup(1),
        b = setup(2);
      if (kind === 'readonly') b.editor.setEditable(false);
      else b.editor.destroy();
      const before = snapshot(a.editor);
      expect(
        applyPreparedHtmlBatch(
          [a, b].map(({ editor }) => ({ editor, candidate: prepare('<p>Nuevo</p>') })),
        ),
      ).toEqual({ ok: false, codigo: 'EDITOR_NO_DISPONIBLE', indice: 1 });
      expect(snapshot(a.editor)).toEqual(before);
      expect(a.changed).not.toHaveBeenCalled();
    },
  );

  it.each(['composition', 'capture'] as const)(
    'rejects an editor with active %s without changing the batch',
    (mode) => {
      const a = setup(1),
        b = setup(2);
      const snapshots = [snapshot(a.editor), snapshot(b.editor)];
      const entries = [a, b].map(({ editor }) => ({ editor, candidate: prepare('<p>Nuevo</p>') }));
      const run = () =>
        expect(applyPreparedHtmlBatch(entries)).toEqual({
          ok: false,
          codigo: 'EDITOR_NO_DISPONIBLE',
          indice: 1,
        });
      if (mode === 'composition') {
        vi.spyOn(b.editor.view, 'composing', 'get').mockReturnValue(true);
        run();
      } else b.editor.captureTransaction(run);
      assertSilent([a, b], snapshots);
    },
  );

  it('rolls back if a view silently ignores its staged update', () => {
    const a = setup(1),
      b = setup(2);
    const snapshots = [snapshot(a.editor), snapshot(b.editor)];
    vi.spyOn(b.editor.view, 'updateState').mockImplementationOnce(() => {});
    expect(
      applyPreparedHtmlBatch(
        [a, b].map(({ editor }) => ({ editor, candidate: prepare('<p>Nuevo</p>') })),
      ),
    ).toEqual({ ok: false, codigo: 'APLICACION_RECHAZADA', indice: 1 });
    assertSilent([a, b], snapshots);
  });

  it('rejects duplicate editors and malformed batches', () => {
    const a = setup(1);
    const candidate = prepare('<p>Nuevo</p>');
    const before = snapshot(a.editor);
    const malformed = [null, [], [null], [{}], [{ editor: a.editor }]];
    for (const entries of malformed)
      expect(
        applyPreparedHtmlBatch(entries as unknown as readonly PreparedHtmlBatchEntry[]).ok,
      ).toBe(false);
    expect(
      applyPreparedHtmlBatch([
        { editor: a.editor, candidate },
        { editor: a.editor, candidate },
      ]),
    ).toEqual({ ok: false, codigo: 'LOTE_INVALIDO', indice: 1 });
    expect(snapshot(a.editor)).toEqual(before);
    expect(a.changed).not.toHaveBeenCalled();
  });

  it('reports postcommit notification errors without claiming rollback or omitting later editors', () => {
    const a = setup(1),
      b = setup(2);
    a.editor.on('update', () => {
      throw new Error('Host error');
    });
    const onApplied = vi.fn(() => {
      throw new Error('Batch observer error');
    });
    const result = applyPreparedHtmlBatch(
      [a, b].map(({ editor }) => ({ editor, candidate: prepare('<p>Nuevo</p>') })),
      { onApplied },
    );
    expect(result).toMatchObject({
      ok: true,
      erroresNotificacion: [
        { indice: 0, evento: 'update' },
        { indice: null, evento: 'lote' },
      ],
    });
    expect(a.editor.getHTML()).toBe('<p>Nuevo</p>');
    expect(b.editor.getHTML()).toBe('<p>Nuevo</p>');
    expect(b.changed).toHaveBeenCalledTimes(1);
    expect(onApplied).toHaveBeenCalledTimes(1);
  });

  it('blocks reentrant edits until all notifications have been released', () => {
    const a = setup(1),
      b = setup(2);
    a.editor.on('update', () => b.editor.commands.insertContent('Reentrante'));
    const result = applyPreparedHtmlBatch(
      [a, b].map(({ editor }) => ({ editor, candidate: prepare('<p>Nuevo</p>') })),
    );
    expect(result).toMatchObject({
      ok: true,
      erroresNotificacion: [{ indice: 0, evento: 'update' }],
    });
    expect(b.editor.getHTML()).toBe('<p>Nuevo</p>');
    expect(b.changed).toHaveBeenCalledTimes(1);
    expect(b.editor.commands.insertContent('Permitido ')).toBe(true);
  });

  it('restores full HTML/CSS/Handlebars and its history when a later commit fails', () => {
    const a = setup(1),
      b = setup(2);
    const original =
      '<!DOCTYPE html><html><head><style>p{color:red}</style></head><body><p>{{valor}}</p></body></html>';
    const templateHost = document.createElement('div');
    document.body.append(templateHost);
    const templateEditor = createWysiwygEditor({ element: templateHost, initialContent: original });
    editors.push(templateEditor);
    const before = snapshot(templateEditor);
    vi.spyOn(b.editor.view, 'updateState').mockImplementationOnce(() => {
      throw new Error('Failed');
    });
    expect(
      applyPreparedHtmlBatch([
        { editor: templateEditor, candidate: prepare('<p>Reemplazo</p>') },
        { editor: b.editor, candidate: prepare('<p>Nuevo</p>') },
      ]),
    ).toEqual({ ok: false, codigo: 'APLICACION_RECHAZADA', indice: 1 });
    expect(snapshot(templateEditor)).toEqual(before);
    expect(templateEditor.getHTML()).toBe(original);
    expect(a.editor.getText()).toContain('Original');
  });

  it.each(['stage', 'commit'] as const)(
    'does not schedule autosave on %s failure and respects mounted view availability',
    async (phase) => {
      vi.useFakeTimers();
      const changed = vi.fn(),
        save = vi.fn(() => Promise.resolve());
      for (let i = 0; i < 2; i++) {
        const host = document.createElement('div');
        document.body.append(host);
        apps.push(
          await mountEditorApp({
            app: host,
            embedded: true,
            onChange: changed,
            autosave: { enabled: true, debounceMs: 800 },
            storage: { loadDocument: () => Promise.resolve(null), saveDocument: save },
          }),
        );
      }
      await vi.advanceTimersByTimeAsync(10);
      changed.mockClear();
      save.mockClear();
      if (phase === 'stage')
        apps[1].editor.registerPlugin(new Plugin({ filterTransaction: (tr) => !tr.docChanged }));
      else {
        const view = apps[1].editor.view;
        const update = view.updateState.bind(view);
        vi.spyOn(view, 'updateState').mockImplementationOnce((state) => {
          update(state);
          throw new Error('View failure');
        });
      }
      const entries = apps.map((app) => ({
        editor: app.editor,
        candidate: prepare('<p>Nuevo</p>'),
      }));
      expect(applyPreparedHtmlBatch(entries)).toEqual({
        ok: false,
        codigo: 'APLICACION_RECHAZADA',
        indice: 1,
      });
      await vi.advanceTimersByTimeAsync(1600);
      expect(changed).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
      document
        .querySelectorAll<HTMLButtonElement>('[data-toolbar-action="source-html"]')[1]
        .click();
      changed.mockClear();
      expect(applyPreparedHtmlBatch(entries)).toEqual({
        ok: false,
        codigo: 'EDITOR_NO_DISPONIBLE',
        indice: 1,
      });
      expect(changed).not.toHaveBeenCalled();
    },
  );
  it('schedules normal autosave only after a complete successful commit', async () => {
    vi.useFakeTimers();
    const seen: string[][] = [];
    const saved = vi.fn(() => {
      seen.push(apps.map((app) => app.editor.getHTML()));
      return Promise.resolve();
    });
    const changed = vi.fn(() => {
      seen.push(apps.map((app) => app.editor.getHTML()));
    });
    for (let i = 0; i < 2; i++) {
      const host = document.createElement('div');
      document.body.append(host);
      apps.push(
        await mountEditorApp({
          app: host,
          embedded: true,
          onChange: changed,
          autosave: { enabled: true, debounceMs: 800 },
          storage: { loadDocument: () => Promise.resolve(null), saveDocument: saved },
        }),
      );
    }
    await vi.advanceTimersByTimeAsync(10);
    changed.mockClear();
    saved.mockClear();
    seen.length = 0;
    const entries = apps.map((app, index) => ({
      editor: app.editor,
      candidate: prepare('<p>Nuevo ' + index + '</p>'),
    }));
    const onApplied = vi.fn();
    expect(applyPreparedHtmlBatch(entries, { onApplied })).toMatchObject({
      ok: true,
      erroresNotificacion: [],
    });
    expect(saved).not.toHaveBeenCalled();
    expect(changed).toHaveBeenCalledTimes(2);
    expect(onApplied).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(800);
    expect(saved).toHaveBeenCalledTimes(2);
    expect(seen).toEqual(
      Array.from({ length: 4 }, () => entries.map((entry) => entry.candidate.html)),
    );
  });

  it('does not return a false rollback result if a broken view also rejects restoration', () => {
    const a = setup(1),
      b = setup(2);
    const observer = vi.fn();
    a.editor.on('update', observer);
    b.editor.on('update', observer);
    const onApplied = vi.fn();
    const spy = vi.spyOn(b.editor.view, 'updateState').mockImplementation(() => {
      throw new Error('Broken view');
    });
    expect(() =>
      applyPreparedHtmlBatch(
        [a, b].map(({ editor }) => ({ editor, candidate: prepare('<p>Nuevo</p>') })),
        { onApplied },
      ),
    ).toThrow(AggregateError);
    expect(observer).not.toHaveBeenCalled();
    expect(onApplied).not.toHaveBeenCalled();
    spy.mockRestore();
    expect(applyPreparedHtml(a.editor, prepare('<p>Recuperado</p>')).ok).toBe(true);
  });
});
