import { z } from 'zod';

export const editorDocumentStatusSchema = z.enum(['draft', 'published', 'archived']);

export type EditorDocumentStatus = z.infer<typeof editorDocumentStatusSchema>;

export const editorDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  contentJson: z.unknown(),
  contentHtml: z.string(),
  status: editorDocumentStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type EditorDocument = z.infer<typeof editorDocumentSchema>;

export function parseEditorDocument(input: unknown): EditorDocument {
  return editorDocumentSchema.parse(input);
}
