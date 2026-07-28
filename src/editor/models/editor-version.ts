import { z } from 'zod';

import { canonicalEditorContentSchema } from './editor-content';

export const editorVersionSchema = z.object({
  id: z.string().min(1),
  documentId: z.string().min(1),
  versionNumber: z.number().int().positive(),
  title: z.string(),
  contentJson: canonicalEditorContentSchema,
  contentHtml: z.string(),
  createdAt: z.string(),
});

export const createEditorVersionPayloadSchema = editorVersionSchema.pick({
  title: true,
  contentJson: true,
  contentHtml: true,
});

export type EditorVersion = z.infer<typeof editorVersionSchema>;
export type CreateEditorVersionPayload = z.infer<typeof createEditorVersionPayloadSchema>;

export function parseEditorVersion(input: unknown): EditorVersion {
  return editorVersionSchema.parse(input);
}

export function parseEditorVersions(input: unknown): EditorVersion[] {
  return z.array(editorVersionSchema).parse(input);
}

export function parseCreateEditorVersionPayload(input: unknown): CreateEditorVersionPayload {
  return createEditorVersionPayloadSchema.parse(input);
}
