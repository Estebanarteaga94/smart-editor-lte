import { z } from 'zod';

export const editorModeSchema = z.enum(['wysiwyg', 'source-html', 'source-json', 'preview']);

export type EditorMode = z.infer<typeof editorModeSchema>;

export const editorViewStateSchema = z.object({
  mode: editorModeSchema,
  fullscreen: z.boolean(),
});

export type EditorViewState = z.infer<typeof editorViewStateSchema>;

export const defaultEditorViewState: EditorViewState = {
  mode: 'wysiwyg',
  fullscreen: false,
};

export function parseEditorMode(input: unknown): EditorMode {
  return editorModeSchema.parse(input);
}

export function parseEditorViewState(input: unknown): EditorViewState {
  return editorViewStateSchema.parse(input);
}
