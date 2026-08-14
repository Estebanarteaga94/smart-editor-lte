import { expect, test } from 'playwright/test';

const onePixelPng =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

test('imports backend HTML and exports a rendered Base64 copy without mutating its route', async ({
  page,
}) => {
  await page.route('**/api/assets/pixel.png', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from(onePixelPng, 'base64'),
    });
  });
  await page.goto('/');

  const result = await page.evaluate(async () => {
    document.body.innerHTML = '<div id="e2e-editor"></div>';
    const { mountEditorApp } = await import('/src/editor/editor-app.ts');
    const app = document.querySelector<HTMLElement>('#e2e-editor');

    if (!app) {
      throw new Error('E2E editor root was not created');
    }

    const editor = await mountEditorApp({
      app,
      documentId: `e2e-${Date.now()}`,
      htmlBase64Export: {
        baseUrl: window.location.origin,
      },
    });
    const imported = editor.setHtml(
      '<p>Texto editado</p><img src="/api/assets/pixel.png" alt="Pixel">',
    );
    editor.editor.commands.insertContentAt(14, ' y ampliado');
    const htmlBeforeExport = editor.editor.getHTML();
    const exported = await editor.getHtmlWithBase64Images();
    const htmlAfterExport = editor.editor.getHTML();
    const roundtrip = editor.setHtml(exported);

    return {
      imported,
      roundtrip,
      exported,
      htmlBeforeExport,
      htmlAfterExport,
    };
  });

  expect(result.imported).toMatchObject({ ok: true, code: 'applied' });
  expect(result.exported).toContain('data:image/png;base64,');
  expect(result.exported).toContain('Texto editado y ampliado');
  expect(result.exported).not.toContain('/api/assets/pixel.png');
  expect(result.htmlBeforeExport).toBe(result.htmlAfterExport);
  expect(result.htmlAfterExport).toContain('/api/assets/pixel.png');
  expect(result.roundtrip).toMatchObject({ ok: true, code: 'applied' });

  const embeddedImage = page.locator('.ProseMirror img[src^="data:image/png;base64,"]');
  await expect(embeddedImage).toBeVisible();
  await expect.poll(() => embeddedImage.evaluate((image) => image.naturalWidth)).toBe(1);
});
