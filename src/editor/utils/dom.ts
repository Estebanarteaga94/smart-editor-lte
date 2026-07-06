export function queryRequiredElement<TElement extends Element>(
  root: ParentNode,
  selector: string,
): TElement {
  const element = root.querySelector<TElement>(selector);

  if (!element) {
    throw new Error(`Required element not found: ${selector}`);
  }

  return element;
}
