import { z } from 'zod';

import { editorModeSchema, type EditorMode } from './editor-mode';

export const editorAutosaveConfigSchema = z.object({
  enabled: z.boolean(),
  debounceMs: z.number().int().min(800).max(1500),
});

export const editorImageLimitsSchema = z.object({
  maxSizeBytes: z.number().int().positive(),
  allowedMimeTypes: z.array(z.string().min(1)).nonempty(),
});

export const editorConfigSchema = z.object({
  documentId: z.string().min(1),
  autosave: editorAutosaveConfigSchema,
  imageLimits: editorImageLimitsSchema,
  placeholder: z.string(),
  initialMode: editorModeSchema,
});

export type EditorAutosaveConfig = z.infer<typeof editorAutosaveConfigSchema>;
export type EditorImageLimits = z.infer<typeof editorImageLimitsSchema>;
export type EditorConfig = z.infer<typeof editorConfigSchema>;

export const defaultEditorConfig: EditorConfig = {
  documentId: 'default-document',
  autosave: {
    enabled: true,
    debounceMs: 1000,
  },
  imageLimits: {
    maxSizeBytes: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  },
  placeholder: 'Escribe el contenido del documento...',
  initialMode: 'wysiwyg' satisfies EditorMode,
};

export function parseEditorConfig(input: unknown): EditorConfig {
  return editorConfigSchema.parse(input);
}
