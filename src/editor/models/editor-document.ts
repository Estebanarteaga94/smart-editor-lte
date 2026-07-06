export type EditorDocumentStatus = 'draft' | 'published' | 'archived'

export interface EditorDocument {
  id: string
  title: string
  contentJson: unknown
  contentHtml: string
  status: EditorDocumentStatus
  createdAt: string
  updatedAt: string
}
