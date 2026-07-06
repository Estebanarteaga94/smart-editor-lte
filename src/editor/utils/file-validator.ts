export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export type FileValidator = (file: File) => FileValidationResult;
