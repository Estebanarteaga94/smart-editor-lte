/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createEditorLifecycle } from '../core/editor-lifecycle';
import { createTextColorPicker, defaultTextColor, normalizeTextColor } from './text-color-picker';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('createTextColorPicker', () => {
  it('renders office-like palette sections and native color input access', () => {
    const lifecycle = createEditorLifecycle();
    const picker = createTextColorPicker({
      lifecycle,
      onChange: vi.fn(),
      onClear: vi.fn(),
    });

    document.body.append(picker.element);

    const automaticButton = picker.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="text-color-automatic"]',
    );
    const themeGrid = picker.element.querySelector<HTMLElement>(
      '[data-toolbar-action="text-color-theme-grid"]',
    );
    const standardGrid = picker.element.querySelector<HTMLElement>(
      '[data-toolbar-action="text-color-standard-grid"]',
    );
    const customPanel = picker.element.querySelector<HTMLElement>(
      '[data-toolbar-action="text-color-custom"]',
    );
    const moreColorsButton = picker.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="text-color-more"]',
    );
    const swatches = [
      ...picker.element.querySelectorAll<HTMLButtonElement>(
        '[data-toolbar-action="text-color-swatch"]',
      ),
    ];
    const colorInput = picker.element.querySelector<HTMLInputElement>(
      '[data-toolbar-action="text-color-input"]',
    );

    expect(picker.triggerButton.getAttribute('aria-expanded')).toBe('false');
    expect(picker.panel.hidden).toBe(true);

    picker.triggerButton.click();

    expect(picker.triggerButton.getAttribute('aria-expanded')).toBe('true');
    expect(picker.panel.hidden).toBe(false);
    expect(automaticButton?.textContent).toContain('Automatico');
    expect(themeGrid).not.toBeNull();
    expect(themeGrid?.getAttribute('aria-label')).toBe('Colores de tema');
    expect(standardGrid).not.toBeNull();
    expect(standardGrid?.getAttribute('aria-label')).toBe('Colores estandar');
    expect(swatches).toHaveLength(57);
    expect(swatches.every((swatch) => swatch.type === 'button')).toBe(true);
    expect(swatches.every((swatch) => swatch.hasAttribute('aria-label'))).toBe(true);
    expect(colorInput).not.toBeNull();
    expect(colorInput?.type).toBe('color');
    expect(colorInput?.value).toBe(defaultTextColor);
    expect(customPanel?.hidden).toBe(true);
    expect(moreColorsButton?.textContent).toContain('Mas colores...');

    moreColorsButton?.click();

    expect(customPanel?.hidden).toBe(false);
    expect(moreColorsButton?.getAttribute('aria-expanded')).toBe('true');

    lifecycle.dispose();
  });

  it('emits color changes from predefined grid, automatic and color input', () => {
    const lifecycle = createEditorLifecycle();
    const onChange = vi.fn();
    const onClear = vi.fn();
    const picker = createTextColorPicker({
      lifecycle,
      onChange,
      onClear,
    });
    const redSwatch = picker.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="text-color-swatch"][data-text-color="#ff0000"]',
    );
    const moreColorsButton = picker.element.querySelector<HTMLButtonElement>(
      '[data-toolbar-action="text-color-more"]',
    );

    picker.triggerButton.click();

    redSwatch?.click();

    expect(onChange).toHaveBeenCalledWith('#ff0000');
    expect(picker.panel.hidden).toBe(true);
    expect(redSwatch?.dataset.active).toBe('true');
    expect(redSwatch?.getAttribute('aria-pressed')).toBe('true');
    expect(picker.colorInput.value).toBe('#ff0000');

    picker.triggerButton.click();
    picker.automaticButton.click();

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(picker.panel.hidden).toBe(true);

    picker.triggerButton.click();
    moreColorsButton?.click();
    picker.colorInput.value = '#047857';
    picker.colorInput.dispatchEvent(new Event('input'));

    expect(onChange).toHaveBeenLastCalledWith('#047857');
    expect(picker.colorInput.value).toBe('#047857');

    lifecycle.dispose();
  });

  it('clears selected color and disables controls through public state methods', () => {
    const lifecycle = createEditorLifecycle();
    const onClear = vi.fn();
    const picker = createTextColorPicker({
      lifecycle,
      value: '#1d4ed8',
      onChange: vi.fn(),
      onClear,
    });

    expect(picker.automaticButton.disabled).toBe(false);

    picker.triggerButton.click();
    picker.automaticButton.click();

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(picker.panel.hidden).toBe(true);
    expect(picker.colorInput.value).toBe(defaultTextColor);

    picker.setValue('#7c3aed');
    picker.setDisabled(true);

    expect(picker.triggerButton.disabled).toBe(true);
    expect(picker.colorInput.disabled).toBe(true);
    expect(picker.automaticButton.disabled).toBe(true);
    expect(picker.moreColorsButton.disabled).toBe(true);
    expect(picker.swatches.every((swatch) => swatch.disabled)).toBe(true);

    lifecycle.dispose();
  });
});

describe('normalizeTextColor', () => {
  it('normalizes valid hex colors and rejects unsupported values', () => {
    expect(normalizeTextColor('#B91C1C')).toBe('#b91c1c');
    expect(normalizeTextColor('rgb(185, 28, 28)')).toBeNull();
    expect(normalizeTextColor('javascript:alert(1)')).toBeNull();
  });
});
