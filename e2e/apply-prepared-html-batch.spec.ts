import { expect, test } from 'playwright/test';

test('coordinated application publishes complete state and keeps native keyboard history per editor', async ({
  page,
}) => {
  await page.goto('/');
  const fixture = await page.evaluateHandle(async () => {
    const api = await import('/src/lib.ts');
    const apps = [],
      hosts = [];
    const seen: string[][] = [];
    let batches = 0;
    for (let i = 0; i < 2; i++) {
      const host = document.createElement('div');
      host.id = `batch-editor-${i}`;
      document.body.append(host);
      hosts.push(host);
      const app = await api.mountEditorApp({
        app: host,
        embedded: true,
        autosave: { enabled: false, debounceMs: 1000 },
        storage: {
          loadDocument: () => Promise.resolve(null),
          saveDocument: () => Promise.resolve(),
        },
        onChange: () => seen.push(apps.map((item) => item.editor.getHTML())),
      });
      apps.push(app);
      app.setHtml(`<p>Original ${i}</p>`);
      app.editor.commands.setTextSelection({ from: 2, to: 4 });
    }
    apps[1].editor.view.focus();
    const before = apps.map((app) => ({
      doc: app.editor.state.doc,
      selection: app.editor.state.selection,
      dom: app.editor.view.dom,
    }));
    const active = document.activeElement;
    seen.length = 0;
    const entries = apps.map((app, index) => {
      const candidate = api.prepareHtmlContent({
        html: `<p>Nuevo ${index}<br>{{literal}}</p>`,
        policyId: api.pilotHtmlPolicyId,
      });
      if (!candidate.ok) throw new Error('Expected prepared content');
      return { editor: app.editor, candidate };
    });
    const result = api.applyPreparedHtmlBatch(entries, {
      onApplied: () => {
        batches++;
        seen.push(apps.map((app) => app.editor.getHTML()));
      },
    });
    return {
      apps,
      hosts,
      before,
      result,
      seen,
      batches,
      entries,
      sameViews: apps.every((app, index) => app.editor.view.dom === before[index].dom),
      sameFocus: document.activeElement === active,
    };
  });
  try {
    expect(
      await fixture.evaluate((f) => ({
        result: f.result,
        sameViews: f.sameViews,
        sameFocus: f.sameFocus,
        batches: f.batches,
        complete:
          f.seen.length === 3 &&
          f.seen.every((values) => values.every((html, i) => html === f.entries[i].candidate.html)),
      })),
    ).toMatchObject({
      result: { ok: true, erroresNotificacion: [] },
      sameViews: true,
      sameFocus: true,
      batches: 1,
      complete: true,
    });
    for (const index of [1, 0]) {
      await fixture.evaluate((f, i) => f.apps[i].editor.view.focus(), index);
      await page.keyboard.press('Control+z');
      expect(
        await fixture.evaluate(
          (f, i) =>
            f.apps[i].editor.state.doc.eq(f.before[i].doc) &&
            f.apps[i].editor.state.selection.eq(f.before[i].selection),
          index,
        ),
      ).toBe(true);
      await page.keyboard.press('Control+Shift+z');
      expect(
        await fixture.evaluate(
          (f, i) => f.apps[i].editor.getHTML() === f.entries[i].candidate.html,
          index,
        ),
      ).toBe(true);
    }
  } finally {
    await fixture.evaluate((f) => {
      f.apps.forEach((app) => app.lifecycle.dispose());
      f.hosts.forEach((host) => host.remove());
    });
    await fixture.dispose();
  }
});

for (const phase of ['stage', 'commit'] as const) {
  test(`coordinated ${phase} failure keeps all editors, template CSS and history without partial callbacks`, async ({
    page,
  }) => {
    const resources: string[] = [];
    await page.route('https://blocked-batch.invalid/**', async (route) => {
      resources.push(route.request().url());
      await route.abort();
    });
    await page.goto('/');
    const result = await page.evaluate(async (phase) => {
      const api = await import('/src/lib.ts');
      const apps = [],
        hosts = [];
      const counts = {
        changes: 0,
        transactions: 0,
        before: 0,
        selections: 0,
        batches: 0,
        saves: 0,
      };
      try {
        for (let i = 0; i < 2; i++) {
          const host = document.createElement('div');
          document.body.append(host);
          hosts.push(host);
          const app = await api.mountEditorApp({
            app: host,
            embedded: true,
            autosave: { enabled: false, debounceMs: 1000 },
            storage: {
              loadDocument: () => Promise.resolve(null),
              saveDocument: () => {
                counts.saves++;
                return Promise.resolve();
              },
            },
            onChange: () => {
              counts.changes++;
            },
          });
          apps.push(app);
          app.setHtml(
            i === 0
              ? '<!DOCTYPE html><html><head><style>p{color:rgb(170, 20, 30)}</style></head><body><p>{{valor}}</p></body></html>'
              : '<p>Original</p>',
          );
          const historyCandidate = api.prepareHtmlContent({
            html: '<p>Rehacer</p>',
            policyId: api.pilotHtmlPolicyId,
          });
          if (!historyCandidate.ok || !app.applyPreparedHtml(historyCandidate).ok)
            throw new Error('Expected history fixture');
          app.editor.commands.undo();
        }
        apps[0].editor.view.focus();
        const snapshots = apps.map((app) => ({
          state: app.editor.state,
          json: JSON.stringify(app.editor.getJSON()),
          html: app.editor.getHTML(),
        }));
        const beforeDom = document.documentElement.outerHTML,
          focus = document.activeElement;
        const color = getComputedStyle(apps[0].editor.view.dom.querySelector('p')!).color;
        counts.changes = 0;
        apps.forEach((app) => {
          app.editor.on('transaction', () => {
            counts.transactions++;
          });
          app.editor.on('beforeTransaction', () => {
            counts.before++;
          });
          app.editor.on('selectionUpdate', () => {
            counts.selections++;
          });
        });
        const observer = new MutationObserver(() => {});
        observer.observe(document.documentElement, {
          subtree: true,
          attributes: true,
          childList: true,
          characterData: true,
        });
        const failingView = apps[1].editor.view;
        const update = failingView.updateState;
        let failOnce = true;
        if (phase === 'commit')
          failingView.updateState = function (state) {
            update.call(this, state);
            if (failOnce) {
              failOnce = false;
              throw new Error('Synthetic render failure');
            }
          };
        const entries = apps.map((app, i) => {
          const candidate = api.prepareHtmlContent({
            html: '<p>Nuevo</p>',
            policyId: api.pilotHtmlPolicyId,
          });
          if (!candidate.ok) throw new Error('Expected prepared content');
          return {
            editor: app.editor,
            candidate:
              phase === 'stage' && i === 1 ? { ...candidate, html: '<p>Alterado</p>' } : candidate,
          };
        });
        let result;
        try {
          result = api.applyPreparedHtmlBatch(entries, {
            onApplied: () => {
              counts.batches++;
            },
          });
        } finally {
          failingView.updateState = update;
        }
        const mutationCount = observer.takeRecords().length;
        observer.disconnect();
        const unchanged =
          apps.every(
            (app, i) =>
              app.editor.state === snapshots[i].state &&
              JSON.stringify(app.editor.getJSON()) === snapshots[i].json &&
              app.editor.getHTML() === snapshots[i].html,
          ) &&
          document.documentElement.outerHTML === beforeDom &&
          document.activeElement === focus &&
          getComputedStyle(apps[0].editor.view.dom.querySelector('p')!).color === color;
        const finalCounts = { ...counts };
        // A failed batch must keep the preexisting redo branches usable.
        let redoKept = true;
        for (const app of apps) {
          const doc = app.editor.state.doc;
          redoKept = app.editor.commands.redo() && redoKept;
          app.editor.commands.undo();
          redoKept = app.editor.state.doc.eq(doc) && redoKept;
        }
        return {
          result,
          unchanged,
          counts: finalCounts,
          redoKept,
          color,
          noStageMutations: phase !== 'stage' || mutationCount === 0,
        };
      } finally {
        apps.forEach((app) => app.lifecycle.dispose());
        hosts.forEach((host) => host.remove());
      }
    }, phase);
    expect(result).toEqual({
      result: {
        ok: false,
        codigo: phase === 'stage' ? 'CANDIDATO_INVALIDO' : 'APLICACION_RECHAZADA',
        indice: 1,
      },
      unchanged: true,
      counts: { changes: 0, transactions: 0, before: 0, selections: 0, batches: 0, saves: 0 },
      redoKept: true,
      color: 'rgb(170, 20, 30)',
      noStageMutations: true,
    });
    await page.waitForLoadState('networkidle');
    expect(resources).toEqual([]);
  });
}
