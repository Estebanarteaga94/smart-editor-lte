export interface ImageDialogResult {
  file: File;
  altText: string;
}

export type ImageDialogSubmitHandler = (result: ImageDialogResult) => void;
