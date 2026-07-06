export interface SerializedEditorContent {
  contentJson: unknown
  contentHtml: string
}

export interface SerializerService {
  serialize(): SerializedEditorContent
}
