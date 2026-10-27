import { expect, test } from 'playwright/test';

const template =
  '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>{{title}}</title><style>body{font:12pt Arial;color:#222}h1{color:rgb(35,72,93)}table{width:100%;border-collapse:collapse}td,th{border:1px solid #aaa;padding:8px}@media print{tr{break-inside:avoid}}.note{background:#edf3f6}</style></head><body><h1 class="title">Acta de {{nombre}}</h1><div class="note"><p>Texto de la plantilla.</p></div><table class="data"><thead><tr><th>Nombre</th><th>Cargo</th></tr></thead><tbody id="rows">{{#each participantes}}<tr><td>{{nombre}}</td><td>{{cargo}}</td></tr>{{/each}}</tbody></table><div class="topic-content">{{{desarrollo}}}</div></body></html>';

test('preserves a full template using the existing editor, source view, toolbar, table menu and storage', async ({
  page,
}) => {
  await page.goto('/');
  const sourceButton = page.locator('[data-toolbar-action="source-html"]');
  await sourceButton.click();
  const source = page.locator('.cm-content');
  await source.click();
  await source.press('ControlOrMeta+a');
  await page.keyboard.insertText(template);
  await sourceButton.click();
  const editor = page.locator('.ProseMirror');
  await expect(editor.locator('h1')).toContainText('Acta de {{nombre}}');
  await expect(editor.locator('h1')).toHaveCSS('color', 'rgb(35, 72, 93)');
  await expect(page.locator('.editor-toolbar')).toHaveCount(1);
  await expect(page.locator('.template-editor')).toHaveCount(0);
  await editor.locator('h1').click();
  await editor.locator('h1').press('Home');
  await page.keyboard.insertText('Nueva ');
  const cells = editor.locator('table.data td');
  await cells.first().click();
  await cells.nth(1).click({ modifiers: ['Shift'] });
  await expect(editor.locator('td.selectedCell')).toHaveCount(2);
  await page.getByRole('button', { name: 'Combinar celdas', exact: true }).click();
  await expect(editor.locator('table.data td')).toHaveCount(1);
  await expect(editor.locator('table.data td')).toHaveAttribute('colspan', '2');
  await page.getByRole('button', { name: 'Separar celdas', exact: true }).click();
  await expect(editor.locator('table.data td')).toHaveCount(2);
  await page.getByRole('button', { name: 'Fila despues', exact: true }).click();
  await expect(editor.locator('table.data tr')).toHaveCount(3);
  await page.locator('[data-toolbar-action="save"]').click();
  await expect(page.locator('#editor-status')).toContainText('Guardado');
  const saved = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('smart-editor-lte:document:default-document')!)
        .contentHtml as string,
  );
  expect(saved).toContain('<!DOCTYPE html>');
  expect(saved).toContain('@media print{tr{break-inside:avoid}}');
  expect(saved).toContain('{{#each participantes}}<tr>');
  expect(saved).toContain('{{/each}}</tbody>');
  expect(saved).toContain('{{{desarrollo}}}');
  expect(saved).toContain('Nueva ');
  expect(saved).not.toContain('data-editor-');
  await page.reload();
  await expect(editor.locator('h1')).toContainText('Nueva ');
  await expect(editor.locator('h1')).toHaveCSS('color', 'rgb(35, 72, 93)');
  await expect(editor.locator('table.data tr')).toHaveCount(3);
  await page.screenshot({ path: '/tmp/smart-editor-current-template.png', fullPage: true });
  await page.locator('[data-toolbar-action="preview"]').click();
  const preview = page.frameLocator('iframe[title="Vista renderizada del documento"]');
  await expect(preview.locator('h1')).toHaveCSS('color', 'rgb(35, 72, 93)');
  await expect(page.locator('iframe')).toHaveAttribute('sandbox', '');
});
