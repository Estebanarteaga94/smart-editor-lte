import type { Extensions } from '@tiptap/core';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
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

export interface CreateEditorExtensionsOptions {
  placeholder?: string;
}

export type EditorExtensionList = Extensions;

const allowedLinkProtocols = ['http', 'https', 'mailto', 'tel'];

export function createEditorExtensions(
  options: CreateEditorExtensionsOptions = {},
): EditorExtensionList {
  return [
    StarterKit.configure({
      link: false,
      underline: false,
    }),
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
      isAllowedUri: (url, context) => context.defaultValidate(url),
    }),
    Image.configure({
      allowBase64: false,
    }),
    Table.configure({
      resizable: true,
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
