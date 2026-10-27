import { z } from 'zod';

const attributes = z.record(z.string(), z.string()).superRefine((values, ctx) => {
  for (const [name, value] of Object.entries(values)) {
    if (
      !/^[a-z_:][a-z0-9_.:-]*$/i.test(name) ||
      /^on/i.test(name) ||
      name === 'srcdoc' ||
      name.startsWith('data-editor-')
    )
      ctx.addIssue({ code: 'custom', message: 'Unsafe preserved attribute', path: [name] });
    if (['href', 'src', 'action', 'xlink:href'].includes(name)) {
      const compact = Array.from(value)
        .filter((char) => char.charCodeAt(0) > 32)
        .join('');
      if (
        /^(?:javascript|vbscript|file):|^data:(?!image\/(?:png|jpeg|webp);base64,)/i.test(compact)
      )
        ctx.addIssue({ code: 'custom', message: 'Unsafe preserved URL', path: [name] });
    }
  }
});
const part = z.union([
  z.object({ html: z.string() }).strict(),
  z.object({ region: z.string() }).strict(),
]);
export const preservedLayoutSchema = z.array(
  z.union([
    z.object({ html: z.string() }).strict(),
    z
      .object({ section: z.enum(['thead', 'tbody', 'tfoot']), attributes, parts: z.array(part) })
      .strict(),
  ]),
);
export const preservedHtmlSchema = z
  .object({
    attributes,
    tag: z
      .string()
      .regex(/^[a-z][a-z0-9-]*$/)
      .optional(),
    region: z.string().optional(),
    layout: preservedLayoutSchema.optional(),
  })
  .strict();
export const preservedDocumentSchema = z
  .object({
    source: z.string(),
    baseline: z.string(),
    head: z.string(),
    doctype: z.string(),
    fullDocument: z.boolean(),
    htmlAttributes: attributes,
    bodyAttributes: attributes,
    prefix: z.string().regex(/^html[a-f0-9]+x$/),
    tokens: z.array(z.string()),
  })
  .strict();
export type PreservedHtml = z.infer<typeof preservedHtmlSchema>;
export type PreservedDocument = z.infer<typeof preservedDocumentSchema>;
