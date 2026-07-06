export type SourceViewLanguage = 'html' | 'json'

export interface SourceViewOptions {
  value: string
  language: SourceViewLanguage
  onChange?: (value: string) => void
}
