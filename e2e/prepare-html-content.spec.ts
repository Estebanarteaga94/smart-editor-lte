import { expect, test } from 'playwright/test';

test('public preparation leaves an existing editor and browser state untouched', async ({
  page,
}) => {
  const resourceRequests: string[] = [];
  await page.route('https://blocked-prepare.invalid/**', async (route) => {
    resourceRequests.push(route.request().url());
    await route.abort();
  });
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { mountEditorApp, prepareHtmlContent, pilotHtmlPolicyId } = await import('/src/lib.ts');
    const host = document.createElement('div');
    host.id = 'purity-fixture';
    document.body.append(host);
    let changed = 0;
    let persisted = 0;
    const mounted = await mountEditorApp({
      app: host,
      documentId: 'purity-fixture',
      embedded: true,
      autosave: { enabled: false, debounceMs: 1000 },
      storage: {
        loadDocument: () => Promise.resolve(null),
        saveDocument: () => {
          persisted++;
          return Promise.resolve();
        },
      },
      onChange: () => {
        changed++;
      },
    });
    mounted.setHtml('<p>Contenido original</p>');
    mounted.editor.commands.insertContentAt(1, 'Edición ');
    mounted.editor.commands.setTextSelection({ from: 1, to: 7 });
    mounted.editor.view.focus();
    const before = {
      state: mounted.editor.state,
      html: mounted.editor.getHTML(),
      json: JSON.stringify(mounted.editor.getJSON()),
      dom: document.documentElement.outerHTML,
      callbacks: changed,
      persisted,
      active: document.activeElement,
    };
    let transactions = 0;
    mounted.editor.on('transaction', () => {
      transactions++;
    });
    const observer = new MutationObserver(() => {});
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      childList: true,
      characterData: true,
    });
    const calls = { network: 0, storage: 0, timers: 0 };
    const original = {
      fetch: window.fetch,
      xhr: XMLHttpRequest.prototype.open,
      set: Storage.prototype.setItem,
      get: Storage.prototype.getItem,
      remove: Storage.prototype.removeItem,
      clear: Storage.prototype.clear,
      timeout: window.setTimeout,
      frame: window.requestAnimationFrame,
    };
    window.fetch = () => {
      calls.network++;
      throw new Error('No network during preparation');
    };
    XMLHttpRequest.prototype.open = () => {
      calls.network++;
      throw new Error('No network during preparation');
    };
    Storage.prototype.setItem = () => {
      calls.storage++;
      throw new Error('No storage during preparation');
    };
    Storage.prototype.getItem = () => {
      calls.storage++;
      throw new Error('No storage during preparation');
    };
    Storage.prototype.removeItem = () => {
      calls.storage++;
      throw new Error('No storage during preparation');
    };
    Storage.prototype.clear = () => {
      calls.storage++;
      throw new Error('No storage during preparation');
    };
    window.setTimeout = (() => {
      calls.timers++;
      throw new Error('No timers during preparation');
    }) as typeof window.setTimeout;
    window.requestAnimationFrame = () => {
      calls.timers++;
      throw new Error('No frames during preparation');
    };
    try {
      const html = '<p>Uno<br><strong>Dos</strong> {{literal}}</p>';
      const success = prepareHtmlContent({ html, policyId: pilotHtmlPolicyId });
      const supported = [
        '<img src="https://blocked-prepare.invalid/image.png">',
        '<style>@import "https://blocked-prepare.invalid/style.css"</style>',
      ];
      const accepted = supported.map((html) => prepareHtmlContent({ html }));
      const rejected = [
        '<iframe src="https://blocked-prepare.invalid/frame"></iframe>',
        '<script src="https://blocked-prepare.invalid/script.js"></script>',
      ].map((html) => prepareHtmlContent({ html, policyId: pilotHtmlPolicyId }));
      return {
        success,
        supported,
        accepted,
        rejected,
        sameState: mounted.editor.state === before.state,
        sameHtml: mounted.editor.getHTML() === before.html,
        sameJson: JSON.stringify(mounted.editor.getJSON()) === before.json,
        sameDom: document.documentElement.outerHTML === before.dom,
        sameFocus: document.activeElement === before.active,
        sameCallbacks: changed === before.callbacks,
        samePersisted: persisted === before.persisted,
        transactions,
        mutations: observer.takeRecords().length,
        calls,
      };
    } finally {
      observer.disconnect();
      window.fetch = original.fetch;
      XMLHttpRequest.prototype.open = original.xhr;
      Storage.prototype.setItem = original.set;
      Storage.prototype.getItem = original.get;
      Storage.prototype.removeItem = original.remove;
      Storage.prototype.clear = original.clear;
      window.setTimeout = original.timeout;
      window.requestAnimationFrame = original.frame;
      mounted.lifecycle.dispose();
      host.remove();
    }
  });
  expect(result.success).toMatchObject({
    ok: true,
    html: '<p>Uno<br><strong>Dos</strong> {{literal}}</p>',
  });
  result.accepted.forEach((accepted, index) =>
    expect(accepted).toMatchObject({ ok: true, html: result.supported[index] }),
  );
  for (const rejected of result.rejected)
    expect(rejected).toMatchObject({ ok: false, codigo: 'HTML_NO_PERMITIDO' });
  expect(result).toMatchObject({
    sameState: true,
    sameHtml: true,
    sameJson: true,
    sameDom: true,
    sameFocus: true,
    sameCallbacks: true,
    samePersisted: true,
    transactions: 0,
    mutations: 0,
    calls: { network: 0, storage: 0, timers: 0 },
  });
  await page.waitForLoadState('networkidle');
  expect(resourceRequests).toEqual([]);
});
