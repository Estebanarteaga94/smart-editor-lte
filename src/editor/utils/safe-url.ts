export const allowedLinkProtocols = ['http:', 'https:', 'mailto:'] as const;
export const allowedImageProtocols = ['http:', 'https:', 'blob:'] as const;
const embeddedImagePattern = /^data:(image\/(?:png|jpeg|webp));base64,([a-z0-9+/]+={0,2})$/i;

export function normalizeLinkHref(value: string): string | null {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0 || hasControlCharacters(trimmedValue)) {
    return null;
  }

  if (trimmedValue.startsWith('#')) {
    return trimmedValue.length > 1 ? trimmedValue : null;
  }

  if (trimmedValue.startsWith('//')) {
    return null;
  }

  if (isRelativeUrl(trimmedValue)) {
    return trimmedValue;
  }

  const normalizedValue = hasExplicitScheme(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  return isSafeLinkHref(normalizedValue) ? normalizedValue : null;
}

export function isSafeLinkHref(value: string): boolean {
  return isSafeUrl(value, allowedLinkProtocols);
}

export function isSafeImageSource(value: string): boolean {
  return isSafeUrl(value, allowedImageProtocols) || isBareRelativePath(value);
}

export function isSafeCanonicalImageSource(value: string): boolean {
  return isSafeImageSource(value) || isValidEmbeddedImageSource(value);
}

export function isSafeImportedImageSource(value: string): boolean {
  const trimmedValue = value.trim();

  if (/^blob:/i.test(trimmedValue)) {
    return false;
  }

  return (
    isSafeUrl(trimmedValue, ['http:', 'https:']) ||
    isBareRelativePath(trimmedValue) ||
    isValidEmbeddedImageSource(trimmedValue)
  );
}

export function isValidEmbeddedImageSource(value: string): boolean {
  const match = value.trim().match(embeddedImagePattern);

  if (!match) {
    return false;
  }

  const payload = match[2] ?? '';

  if (payload.length === 0 || payload.length % 4 !== 0) {
    return false;
  }

  try {
    globalThis.atob(payload);
    return true;
  } catch {
    return false;
  }
}

export function isSafeUrl(value: string, protocols: readonly string[]): boolean {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0 || hasControlCharacters(trimmedValue)) {
    return false;
  }

  if (trimmedValue.startsWith('#')) {
    return trimmedValue.length > 1;
  }

  if (isRelativeUrl(trimmedValue)) {
    return true;
  }

  try {
    const parsedUrl = new URL(trimmedValue);

    if (!protocols.includes(parsedUrl.protocol)) {
      return false;
    }

    if (parsedUrl.protocol === 'mailto:') {
      return parsedUrl.pathname.length > 0;
    }

    return true;
  } catch {
    return false;
  }
}

function hasExplicitScheme(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function hasControlCharacters(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (code <= 31 || code === 127) {
      return true;
    }
  }

  return false;
}

function isRelativeUrl(value: string): boolean {
  return (
    (value.startsWith('/') && !value.startsWith('//')) ||
    value.startsWith('./') ||
    value.startsWith('../')
  );
}

function isBareRelativePath(value: string): boolean {
  const trimmedValue = value.trim();

  return (
    trimmedValue.length > 0 &&
    !hasControlCharacters(trimmedValue) &&
    !trimmedValue.includes('\\') &&
    !trimmedValue.startsWith('//') &&
    !hasExplicitScheme(trimmedValue) &&
    !trimmedValue.startsWith('#')
  );
}
