import type { Extensions } from '@tiptap/core';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { StarterKit } from '@tiptap/starter-kit';

import { ResizableImage } from '../extensions/resizable-image.extension';
import { AgentSectionExtension } from '../extensions/agent-section.extension';
import { PreservedTableView } from '../extensions/preserved-table-view';
import { isSafeLinkHref } from '../utils/safe-url';
import {
  HtmlPreservation,
  HtmlContainer,
  HtmlInlineContainer,
  HtmlToken,
  HtmlBlockToken,
  HtmlSpan,
} from '../extensions/html-preservation.extension';

export interface CreateEditorExtensionsOptions {
  placeholder?: string;
  onInvalidHtml?: (message: string) => void;
}

export type EditorExtensionList = Extensions;

const allowedLinkProtocols = ['http', 'https', 'mailto'];

export function createEditorExtensions(
  options: CreateEditorExtensionsOptions = {},
): EditorExtensionList {
  return [
    HtmlPreservation.configure({ onInvalidHtml: options.onInvalidHtml }),
    HtmlContainer,
    HtmlInlineContainer,
    HtmlToken,
    HtmlBlockToken,
    HtmlSpan,
    StarterKit.configure({
      link: false,
      underline: false,
    }),
    AgentSectionExtension,
    Underline,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Link.configure({
      protocols: allowedLinkProtocols,
      defaultProtocol: 'https',
      openOnClick: false,
      linkOnPaste: true,
      autolink: true,
      HTMLAttributes: {
        rel: 'noopener noreferrer nofollow',
        target: '_blank',
      },
      isAllowedUri: (url) => isSafeLinkHref(url),
    }),
    ResizableImage.configure({
      allowBase64: true,
      resize: {
        enabled: true,
        minWidth: 80,
        minHeight: 40,
        alwaysPreserveAspectRatio: true,
      },
    }),
    Table.configure({
      View: PreservedTableView,
      resizable: true,
      handleWidth: 6,
      cellMinWidth: 80,
      lastColumnResizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Placeholder.configure({
      placeholder: options.placeholder ?? 'Escribe el contenido del documento...',
    }),
  ];
}
