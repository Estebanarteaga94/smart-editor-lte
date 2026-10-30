import './style.css';

export {
  mountEditorApp,
  type MountedEditorApp,
  type MountEditorAppOptions,
} from './editor/editor-app';
export {
  HtmlBase64ExportError,
  type HtmlBase64ExportConfig,
  type HtmlBase64ExportErrorCode,
  type HtmlBase64ExportOptions,
} from './editor/services/html-base64-export.service';
export type {
  SetHtmlFailureCode,
  SetHtmlOptions,
  SetHtmlResult,
} from './editor/services/html-import.service';
export type { AgentSection } from './editor/extensions/agent-section.extension';
export type { CanonicalEditorContent } from './editor/models/editor-content';
export {
  prepareHtmlContent,
  editorHtmlPolicyId,
  type PrepareHtmlInput,
  type PrepareHtmlResult,
  type PrepareHtmlFailureCode,
  pilotHtmlPolicyId,
  type PreparePilotHtmlInput,
  type PreparePilotHtmlResult,
  type PreparePilotHtmlFailureCode,
} from './editor/services/prepare-html-content.service';
export { preservedHtmlPreview } from './editor/services/preserved-html.service';

export {
  applyPreparedHtml,
  type PreparedHtmlContent,
  type ApplyPreparedHtmlResult,
  type ApplyPreparedHtmlFailureCode,
} from './editor/services/apply-prepared-html.service';
export {
  applyPreparedHtmlBatch,
  type PreparedHtmlBatchEntry,
  type PreparedHtmlBatchItemResult,
  type PreparedHtmlBatchNotification,
  type ApplyPreparedHtmlBatchResult,
  type ApplyPreparedHtmlBatchOptions,
} from './editor/services/apply-prepared-html-batch.service';
