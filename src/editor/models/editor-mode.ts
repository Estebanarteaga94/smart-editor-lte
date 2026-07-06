import { z } from 'zod';

export const editorModeSchema = z.enum([
  'wysiwyg',
  'source-html',
  'source-json',
  'preview',
  'fullscreen',
]);

export type EditorMode = z.infer<typeof editorModeSchema>;

export function parseEditorMode(input: unknown): EditorMode {
  return editorModeSchema.parse(input);
}
