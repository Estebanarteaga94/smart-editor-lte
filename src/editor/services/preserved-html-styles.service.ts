import type { Editor } from '@tiptap/core';
import { preservedDocumentSchema } from '../models/preserved-html';
import { assertSafePreservedHtml } from './preserved-html.service';

/** Project template styles onto the existing editor only; the original CSS is retained verbatim for export. */
export function attachPreservedHtmlStyles(editor: Editor, host: HTMLElement): void {
  const scope = `[data-editor-template-scope="${crypto.randomUUID()}"]`;
  const style = document.createElement('style');
  const oldContain = host.style.contain;
  let lastHead = '';
  let bodyClasses: string[] = [];
  const rulesFor = (rules: CSSRuleList): string =>
    Array.from(rules, (rule) => {
      if ('selectorText' in rule && 'style' in rule) {
        const cssRule = rule as CSSStyleRule;
        if (/url\s*\(|expression\s*\(|@import|behavior\s*:/i.test(cssRule.style.cssText)) return '';
        const selectors = cssRule.selectorText
          .split(',')
          .map((part) => {
            let selector = part
              .trim()
              .replace(/(^|[\s>+~,(])(?:html|body|:root)(?=$|[\s>+~.#:[\],)])/g, `$1${scope}`);
            if (!selector.includes(scope)) selector = `${scope} ${selector}`;
            while (selector.includes(`${scope} ${scope}`))
              selector = selector.replace(`${scope} ${scope}`, scope);
            return selector;
          })
          .join(',');
        return `${selectors}{${cssRule.style.cssText}}`;
      }
      if ('cssRules' in rule) {
        const group = rule as CSSGroupingRule;
        const children = rulesFor(group.cssRules);
        return children ? `${rule.cssText.slice(0, rule.cssText.indexOf('{'))}{${children}}` : '';
      }
      return '';
    }).join('\n');
  const refresh = () => {
    const raw: unknown = editor.state.doc.attrs.preservedDocument;
    const envelope = raw ? preservedDocumentSchema.parse(raw) : null;
    const bodyStyles: string[] = [];
    if (envelope)
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'htmlBlockToken' && /^<style\b/i.test(node.attrs.value as string))
          bodyStyles.push(node.attrs.value as string);
      });
    const head = envelope
      ? envelope.head + bodyStyles.join('') + JSON.stringify(envelope.bodyAttributes)
      : '';
    if (lastHead === head) return;
    lastHead = head;
    bodyClasses.forEach((name) => editor.view.dom.classList.remove(name));
    bodyClasses = [];
    style.textContent = '';
    if (!envelope) {
      editor.view.dom.removeAttribute('data-editor-template-scope');
      host.style.contain = oldContain;
      return;
    }
    const doc = new DOMParser().parseFromString(
      `<html><head>${envelope.head}${bodyStyles.join('')}</head><body></body></html>`,
      'text/html',
    );
    assertSafePreservedHtml(doc);
    editor.view.dom.setAttribute(
      'data-editor-template-scope',
      scope.slice(scope.indexOf('"') + 1, -2),
    );
    bodyClasses = (envelope.bodyAttributes.class ?? '')
      .split(/\s+/)
      .filter((name) => name && !editor.view.dom.classList.contains(name));
    bodyClasses.forEach((name) => editor.view.dom.classList.add(name));
    host.style.contain = 'layout paint';
    // Constructed stylesheets do not load @import. Resource-bearing rules are excluded from this projection.
    const sheet = new CSSStyleSheet();
    if (typeof sheet.replaceSync !== 'function') return;
    const css = Array.from(
      doc.head.querySelectorAll('style'),
      (node) => node.textContent ?? '',
    ).join('\n');
    sheet.replaceSync(css);
    style.textContent = rulesFor(sheet.cssRules);
    const bodyStyle = envelope.bodyAttributes.style;
    if (bodyStyle && !/url\s*\(|expression\s*\(|@import|behavior\s*:/i.test(bodyStyle))
      style.textContent += `${scope}{${bodyStyle}}`;
  };
  host.append(style);
  editor.on('transaction', refresh);
  refresh();
  editor.on('destroy', () => {
    editor.off('transaction', refresh);
    style.remove();
    host.style.contain = oldContain;
  });
}
