export interface HtmlValidationResult {
  valid: boolean
  error?: string
}

export type HtmlValidator = (html: string) => HtmlValidationResult
