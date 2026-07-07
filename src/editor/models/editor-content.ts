import { z } from 'zod';

import { isSafeImageSource, isSafeLinkHref } from '../utils/safe-url';

export const canonicalContentSchemaVersion = 1;

export const allowedCanonicalNodeTypes = [
  'doc',
  'paragraph',
  'text',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'taskList',
  'taskItem',
  'table',
  'tableRow',
  'tableCell',
  'tableHeader',
  'image',
  'blockquote',
  'codeBlock',
  'horizontalRule',
] as const;

export const allowedCanonicalMarkTypes = [
  'bold',
  'italic',
  'underline',
  'strike',
  'link',
  'textStyle',
  'highlight',
] as const;

export type CanonicalNodeType = (typeof allowedCanonicalNodeTypes)[number];
export type CanonicalMarkType = (typeof allowedCanonicalMarkTypes)[number];

export const canonicalJsonSpecification = {
  version: canonicalContentSchemaVersion,
  nodes: allowedCanonicalNodeTypes,
  marks: allowedCanonicalMarkTypes,
  attributes: {
    link: ['href', 'target', 'rel', 'class', 'title'],
    image: ['src', 'alt', 'title', 'width', 'height', 'align'],
    heading: ['level', 'textAlign'],
    paragraph: ['textAlign'],
    tableCell: ['colspan', 'rowspan', 'colwidth', 'align'],
    tableHeader: ['colspan', 'rowspan', 'colwidth', 'align'],
    taskItem: ['checked'],
    textStyle: ['color'],
    highlight: ['color'],
  },
} as const;

const textAlignSchema = z.enum(['left', 'center', 'right', 'justify']).nullable().optional();
const alignSchema = z.enum(['left', 'center', 'right']).nullable().optional();
const dimensionSchema = z
  .union([z.number().positive(), z.string().min(1)])
  .nullable()
  .optional();
const colorSchema = z
  .string()
  .regex(/^(#[0-9a-f]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|[a-z]+)$/i)
  .nullable()
  .optional();

const emptyAttrsSchema = z.object({}).strict();
const paragraphAttrsSchema = z.object({ textAlign: textAlignSchema }).strict();
const headingAttrsSchema = z
  .object({
    level: z.number().int().min(1).max(6),
    textAlign: textAlignSchema,
  })
  .strict();
const orderedListAttrsSchema = z
  .object({
    start: z.number().int().positive().optional(),
    order: z.number().int().positive().optional(),
    type: z.string().nullable().optional(),
  })
  .strict();
const taskItemAttrsSchema = z.object({ checked: z.boolean() }).strict();
const tableCellAttrsSchema = z
  .object({
    colspan: z.number().int().positive().optional(),
    rowspan: z.number().int().positive().optional(),
    colwidth: z.array(z.number().int().positive().nullable()).nullable().optional(),
    align: alignSchema,
  })
  .strict();
const imageAttrsSchema = z
  .object({
    src: z
      .string()
      .min(1)
      .refine(isSafeImageSource, 'Image source must use http, https or a relative URL'),
    alt: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    width: dimensionSchema,
    height: dimensionSchema,
    align: alignSchema,
  })
  .strict();
const codeBlockAttrsSchema = z.object({ language: z.string().nullable().optional() }).strict();
const linkAttrsSchema = z
  .object({
    href: z
      .string()
      .min(1)
      .refine(isSafeLinkHref, 'Link href must use http, https, mailto or a relative URL'),
    target: z.enum(['_blank', '_self', '_parent', '_top']).nullable().optional(),
    rel: z.string().nullable().optional(),
    class: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
  })
  .strict();
const textStyleAttrsSchema = z.object({ color: colorSchema }).strict();
const highlightAttrsSchema = z.object({ color: colorSchema }).strict();

const canonicalMarkSchema = z
  .object({
    type: z.enum(allowedCanonicalMarkTypes),
    attrs: z.record(z.string(), z.unknown()).optional(),
  })
  .strict()
  .superRefine((mark, ctx) => {
    switch (mark.type) {
      case 'link':
        validateAttrs(mark.attrs, linkAttrsSchema, ctx);
        break;
      case 'textStyle':
        validateAttrs(mark.attrs, textStyleAttrsSchema, ctx);
        break;
      case 'highlight':
        validateAttrs(mark.attrs, highlightAttrsSchema, ctx);
        break;
      case 'bold':
      case 'italic':
      case 'underline':
      case 'strike':
        validateAttrs(mark.attrs, emptyAttrsSchema, ctx);
        break;
    }
  });

export const canonicalNodeSchema: z.ZodType<CanonicalJsonNode> = z.lazy(() =>
  z
    .object({
      type: z.enum(allowedCanonicalNodeTypes),
      attrs: z.record(z.string(), z.unknown()).optional(),
      content: z.array(canonicalNodeSchema).optional(),
      text: z.string().optional(),
      marks: z.array(canonicalMarkSchema).optional(),
    })
    .strict()
    .superRefine(validateCanonicalNode),
);

export interface CanonicalJsonMark {
  type: CanonicalMarkType;
  attrs?: Record<string, unknown>;
}

export interface CanonicalJsonNode {
  type: CanonicalNodeType;
  attrs?: Record<string, unknown>;
  content?: CanonicalJsonNode[];
  text?: string;
  marks?: CanonicalJsonMark[];
}

export type CanonicalEditorContent = CanonicalJsonNode & { type: 'doc' };

export const canonicalEditorContentSchema = canonicalNodeSchema.superRefine((node, ctx) => {
  if (node.type !== 'doc') {
    ctx.addIssue({
      code: 'custom',
      message: 'Canonical editor content root must be a doc node',
      path: ['type'],
    });
  }
}) as z.ZodType<CanonicalEditorContent>;

export interface SourceJsonValidationSuccess {
  ok: true;
  content: CanonicalEditorContent;
}

export interface SourceJsonValidationFailure {
  ok: false;
  message: string;
}

export type SourceJsonValidationResult = SourceJsonValidationSuccess | SourceJsonValidationFailure;

export function parseCanonicalEditorContent(input: unknown): CanonicalEditorContent {
  return canonicalEditorContentSchema.parse(input);
}

export function safeParseCanonicalEditorContent(input: unknown) {
  return canonicalEditorContentSchema.safeParse(input);
}

export function validateSourceJsonContent(source: string): SourceJsonValidationResult {
  try {
    const parsedContent: unknown = JSON.parse(source);
    const validation = safeParseCanonicalEditorContent(parsedContent);

    if (!validation.success) {
      return {
        ok: false,
        message: formatZodError(validation.error),
      };
    }

    return {
      ok: true,
      content: validation.data,
    };
  } catch {
    return {
      ok: false,
      message: 'JSON invalido. Corrige la sintaxis antes de aplicar cambios.',
    };
  }
}

function validateCanonicalNode(node: CanonicalJsonNode, ctx: z.RefinementCtx): void {
  if (node.type !== 'text' && node.marks !== undefined) {
    ctx.addIssue({
      code: 'custom',
      message: 'Only text nodes can contain marks',
      path: ['marks'],
    });
  }

  switch (node.type) {
    case 'doc':
    case 'bulletList':
    case 'listItem':
    case 'taskList':
    case 'table':
    case 'tableRow':
    case 'blockquote':
      validateAttrs(node.attrs, emptyAttrsSchema, ctx);
      rejectText(node, ctx);
      break;
    case 'paragraph':
      validateAttrs(node.attrs, paragraphAttrsSchema, ctx);
      rejectText(node, ctx);
      break;
    case 'heading':
      validateAttrs(node.attrs, headingAttrsSchema, ctx);
      rejectText(node, ctx);
      break;
    case 'orderedList':
      validateAttrs(node.attrs, orderedListAttrsSchema, ctx);
      rejectText(node, ctx);
      break;
    case 'taskItem':
      validateAttrs(node.attrs, taskItemAttrsSchema, ctx);
      rejectText(node, ctx);
      break;
    case 'tableCell':
    case 'tableHeader':
      validateAttrs(node.attrs, tableCellAttrsSchema, ctx);
      rejectText(node, ctx);
      break;
    case 'image':
      validateAttrs(node.attrs, imageAttrsSchema, ctx);
      rejectText(node, ctx);
      rejectContent(node, ctx);
      break;
    case 'codeBlock':
      validateAttrs(node.attrs, codeBlockAttrsSchema, ctx);
      rejectText(node, ctx);
      break;
    case 'horizontalRule':
      validateAttrs(node.attrs, emptyAttrsSchema, ctx);
      rejectText(node, ctx);
      rejectContent(node, ctx);
      break;
    case 'text':
      validateAttrs(node.attrs, emptyAttrsSchema, ctx);
      rejectContent(node, ctx);
      if (node.text === undefined) {
        ctx.addIssue({
          code: 'custom',
          message: 'Text nodes must contain text',
          path: ['text'],
        });
      }
      break;
  }
}

function validateAttrs(
  attrs: Record<string, unknown> | undefined,
  schema: z.ZodType,
  ctx: z.RefinementCtx,
): void {
  const validation = schema.safeParse(attrs ?? {});

  if (!validation.success) {
    for (const issue of validation.error.issues) {
      ctx.addIssue({
        code: 'custom',
        message: issue.message,
        path: ['attrs', ...issue.path],
      });
    }
  }
}

function rejectText(node: CanonicalJsonNode, ctx: z.RefinementCtx): void {
  if (node.text !== undefined) {
    ctx.addIssue({
      code: 'custom',
      message: `${node.type} nodes cannot contain text directly`,
      path: ['text'],
    });
  }
}

function rejectContent(node: CanonicalJsonNode, ctx: z.RefinementCtx): void {
  if (node.content !== undefined) {
    ctx.addIssue({
      code: 'custom',
      message: `${node.type} nodes cannot contain child nodes`,
      path: ['content'],
    });
  }
}

function formatZodError(error: z.ZodError): string {
  const [firstIssue] = error.issues;

  if (!firstIssue) {
    return 'JSON fuera del schema permitido.';
  }

  const path = firstIssue.path.length > 0 ? firstIssue.path.join('.') : 'documento';
  return `JSON fuera del schema permitido en ${path}: ${firstIssue.message}`;
}
