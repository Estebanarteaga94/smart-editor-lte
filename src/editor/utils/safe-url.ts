export const allowedLinkProtocols = ['http:', 'https:', 'mailto:'] as const;
export const allowedImageProtocols = ['http:', 'https:'] as const;

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
  return isSafeUrl(value, allowedImageProtocols);
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
