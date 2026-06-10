/** React-managed nodes: never mutate via I18nDomSync / domAutoTranslate. */
export const REACT_MANAGED_ATTR = "data-i18n-react-managed";

export function isReactManagedNode(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
  return Boolean(
    element.hasAttribute(REACT_MANAGED_ATTR) ||
    element.closest(`[${REACT_MANAGED_ATTR}]`)
  );
}

/**
 * Update text in place without replacing child nodes (avoids React removeChild errors).
 */
export function updateElementTextSafe(element, text) {
  if (!element || isReactManagedNode(element)) return false;

  const next = text ?? "";

  for (const child of element.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      return false;
    }
  }

  let textNode = null;

  for (const child of element.childNodes) {
    if (child.nodeType !== Node.TEXT_NODE) continue;
    if (textNode) return false;
    textNode = child;
  }

  if (textNode) {
    if (textNode.textContent !== next) {
      textNode.textContent = next;
    }
    return true;
  }

  if (element.childNodes.length === 0 && next) {
    element.appendChild(document.createTextNode(next));
    return true;
  }

  return false;
}
