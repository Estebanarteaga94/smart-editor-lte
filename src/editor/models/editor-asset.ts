import { z } from 'zod';

export const editorAssetSchema = z.object({
  id: z.string().min(1),
  documentId: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative(),
  url: z.string().min(1),
  altText: z.string().optional(),
  createdAt: z.string(),
});

export type EditorAsset = z.infer<typeof editorAssetSchema>;

export function parseEditorAsset(input: unknown): EditorAsset {
  return editorAssetSchema.parse(input);
}
