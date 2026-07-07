export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export type FileValidator = (file: File) => FileValidationResult;

export interface ImageFileValidationOptions {
  maxSizeBytes: number;
  allowedMimeTypes: readonly string[];
}

export const defaultImageMaxSizeBytes = 5 * 1024 * 1024;

export const defaultAllowedImageMimeTypes = ['image/png', 'image/jpeg', 'image/webp'] as const;

export const defaultImageFileValidationOptions: ImageFileValidationOptions = {
  maxSizeBytes: defaultImageMaxSizeBytes,
  allowedMimeTypes: defaultAllowedImageMimeTypes,
};

export function validateImageFile(
  file: File,
  options: ImageFileValidationOptions = defaultImageFileValidationOptions,
): FileValidationResult {
  if (!options.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Formato de imagen no permitido: ${file.type || 'desconocido'}.`,
    };
  }

  if (file.size > options.maxSizeBytes) {
    return {
      valid: false,
      error: `La imagen supera el limite de ${formatFileSize(options.maxSizeBytes)}.`,
    };
  }

  return { valid: true };
}

function formatFileSize(sizeBytes: number): string {
  const megabytes = sizeBytes / (1024 * 1024);

  if (Number.isInteger(megabytes)) {
    return `${megabytes} MB`;
  }

  return `${megabytes.toFixed(1)} MB`;
}
