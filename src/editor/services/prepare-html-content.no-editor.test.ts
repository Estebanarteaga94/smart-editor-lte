/** @vitest-environment jsdom */
import { expect, it, vi } from 'vitest';

vi.mock('@tiptap/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tiptap/core')>();
  return {
    ...actual,
    Editor: vi.fn(function () {
      throw new Error('Editor construction forbidden');
    }),
  };
});

import { Editor } from '@tiptap/core';
import { prepareHtmlContent, pilotHtmlPolicyId } from '../../lib';

it('prepares via the public export without constructing a visible or hidden Editor', () => {
  expect(
    prepareHtmlContent({ html: '<p>Texto<br>nuevo</p>', policyId: pilotHtmlPolicyId }),
  ).toMatchObject({ ok: true });
  expect(
    prepareHtmlContent({ html: '<p>{{literal}}</p>', policyId: pilotHtmlPolicyId }),
  ).toMatchObject({ ok: true });
  expect(
    prepareHtmlContent({
      html: '<ul class="wysiwyg-list converted-from-office"><li>{{literal}}</li></ul>',
      policyId: pilotHtmlPolicyId,
    }),
  ).toMatchObject({ ok: true });
  expect(Editor).not.toHaveBeenCalled();
  expect(document.querySelector('.ProseMirror, iframe, [contenteditable]')).toBeNull();
});
