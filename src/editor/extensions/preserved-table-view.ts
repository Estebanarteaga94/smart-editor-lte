import { TableView } from '@tiptap/extension-table';
import type { Node as ModelNode } from '@tiptap/pm/model';
import { preservedHtmlSchema } from '../models/preserved-html';

/** Keep Tiptap's resizing, selection and geometry; only synchronize imported HTML attributes. */
export class PreservedTableView extends TableView {
  private importedAttributes: string[] = [];
  constructor(...args: ConstructorParameters<typeof TableView>) {
    super(...args);
    this.syncImportedAttributes();
  }
  override update(node: ModelNode): boolean {
    const applied = super.update(node);
    if (applied) this.syncImportedAttributes();
    return applied;
  }
  private syncImportedAttributes(): void {
    const info = this.node.attrs.preservedHtml;
    if (!info && !this.importedAttributes.length) return;
    const width = this.table.style.width;
    const minWidth = this.table.style.minWidth;
    this.importedAttributes.forEach((name) => this.table.removeAttribute(name));
    const attributes = info ? preservedHtmlSchema.parse(info).attributes : {};
    this.importedAttributes = Object.keys(attributes);
    for (const [name, value] of Object.entries(attributes)) this.table.setAttribute(name, value);
    if (!this.table.style.width) this.table.style.width = width;
    if (!this.table.style.minWidth) this.table.style.minWidth = minWidth;
  }
}
