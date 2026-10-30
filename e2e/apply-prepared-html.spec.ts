import { expect, test } from 'playwright/test';

test('applies on the current editor with keyboard undo/redo and rejects without side effects', async ({
  page,
}) => {
  const resources: string[] = [];
  await page.route('https://blocked-apply.invalid/**', async (route) => {
    resources.push(route.request().url());
    await route.abort();
  });
  await page.goto('/');
  const fixture = await page.evaluateHandle(async () => {
    const api = await import('/src/lib.ts');
    const host = document.createElement('div');
    host.id = 'apply-fixture';
    document.body.append(host);
    const counts = { changes: 0, saves: 0 };
    const app = await api.mountEditorApp({
      app: host,
      embedded: true,
      autosave: { enabled: false, debounceMs: 1000 },
      storage: {
        loadDocument: async () => null,
        saveDocument: async () => {
          counts.saves++;
        },
      },
      onChange: () => {
        counts.changes++;
      },
    });
    app.setHtml('<p>Original</p>');
    app.editor.commands.setTextSelection({ from: 2, to: 5 });
    app.editor.view.focus();
    const before = {
      doc: app.editor.state.doc,
      selection: app.editor.state.selection,
      dom: app.editor.view.dom,
    };
    const candidate = api.prepareHtmlContent({
      html: '<p>Nuevo<br><strong>contenido</strong> {{literal}}</p>',
      policyId: api.pilotHtmlPolicyId,
    });
    if (!candidate.ok) throw new Error('Expected prepared content');
    counts.changes = 0;
    const focus = document.activeElement;
    const applied = app.applyPreparedHtml(candidate);
    const valid =
      applied.ok &&
      applied.aplicado &&
      app.editor.view.dom === before.dom &&
      document.activeElement === focus &&
      counts.changes === 1 &&
      counts.saves === 0 &&
      app.editor.getHTML() === candidate.html;
    return { app, host, counts, before, candidate, valid };
  });
  try {
    expect(await fixture.evaluate((f) => f.valid)).toBe(true);
    await page.keyboard.press('Control+z');
    expect(
      await fixture.evaluate(
        (f) =>
          f.app.editor.state.doc.eq(f.before.doc) &&
          f.app.editor.state.selection.eq(f.before.selection),
      ),
    ).toBe(true);
    await page.keyboard.press('Control+Shift+z');
    expect(await fixture.evaluate((f) => f.app.editor.getHTML() === f.candidate.html)).toBe(true);
    const rejected = await fixture.evaluate((f) => {
      const editor = f.app.editor;
      const before = {
        state: editor.state,
        html: document.documentElement.outerHTML,
        focus: document.activeElement,
        changes: f.counts.changes,
        saves: f.counts.saves,
      };
      const observer = new MutationObserver(() => {});
      observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
      });
      let transactions = 0;
      const count = () => {
        transactions++;
      };
      editor.on('transaction', count);
      try {
        const result = f.app.applyPreparedHtml({
          ...f.candidate,
          html: '<img src="https://blocked-apply.invalid/image.png">',
        });
        return {
          result,
          unchanged:
            before.state === editor.state &&
            before.html === document.documentElement.outerHTML &&
            before.focus === document.activeElement &&
            before.changes === f.counts.changes &&
            before.saves === f.counts.saves &&
            transactions === 0 &&
            observer.takeRecords().length === 0,
        };
      } finally {
        observer.disconnect();
        editor.off('transaction', count);
      }
    });
    expect(rejected).toEqual({
      result: { ok: false, codigo: 'CANDIDATO_INVALIDO' },
      unchanged: true,
    });
    await page.keyboard.press('Control+z');
    expect(await fixture.evaluate((f) => f.app.editor.state.doc.eq(f.before.doc))).toBe(true);
    await page.waitForLoadState('networkidle');
    expect(resources).toEqual([]);
    expect(await fixture.evaluate((f) => f.counts.saves)).toBe(0);
  } finally {
    await fixture.evaluate((f) => {
      f.app.lifecycle.dispose();
      f.host.remove();
    });
    await fixture.dispose();
  }
});

test('undo restores a replaced template and its scoped CSS on the existing view', async ({
  page,
}) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { mountEditorApp, prepareHtmlContent, pilotHtmlPolicyId } = await import('/src/lib.ts');
    const host = document.createElement('div');
    document.body.append(host);
    const app = await mountEditorApp({
      app: host,
      embedded: true,
      autosave: { enabled: false, debounceMs: 1000 },
      storage: { loadDocument: () => Promise.resolve(null), saveDocument: () => Promise.resolve() },
    });
    try {
      const template =
        '<!DOCTYPE html><html><head><style>p{color:rgb(170, 20, 30)}</style></head><body><p>{{valor}}</p></body></html>';
      if (!app.setHtml(template).ok) throw new Error('Expected valid template');
      const view = app.editor.view.dom;
      const before = {
        json: JSON.stringify(app.editor.getJSON()),
        html: app.editor.getHTML(),
        color: getComputedStyle(view.querySelector('p')!).color,
      };
      const candidate = prepareHtmlContent({
        html: '<p>Reemplazo {{literal}}</p>',
        policyId: pilotHtmlPolicyId,
      });
      if (!candidate.ok) throw new Error('Expected valid candidate');
      const applied = app.applyPreparedHtml(candidate);
      const removedPreviousStyles =
        getComputedStyle(view.querySelector('p')!).color !== before.color &&
        !app.editor.getHTML().includes('<style>');
      app.editor.commands.undo();
      const restored =
        view === app.editor.view.dom &&
        app.editor.getHTML() === before.html &&
        JSON.stringify(app.editor.getJSON()) === before.json &&
        getComputedStyle(view.querySelector('p')!).color === before.color;
      app.editor.commands.redo();
      return {
        applied,
        removedPreviousStyles,
        restored,
        color: before.color,
        redone:
          app.editor.getHTML() === candidate.html &&
          getComputedStyle(view.querySelector('p')!).color !== before.color,
      };
    } finally {
      app.lifecycle.dispose();
      host.remove();
    }
  });
  expect(result).toEqual({
    applied: { ok: true, aplicado: true, html: '<p>Reemplazo {{literal}}</p>' },
    removedPreviousStyles: true,
    restored: true,
    color: 'rgb(170, 20, 30)',
    redone: true,
  });
});
