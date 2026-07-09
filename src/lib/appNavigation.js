/** Shared rules for opening navigations in a new browser tab. */

export const NEW_TAB_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
};

export function openInNewTab(url) {
  if (typeof url !== "string") return;
  const href = url.trim();
  if (!href) return;

  const resolved =
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("/")
      ? href
      : `/${href.replace(/^\/+/, "")}`;

  window.open(resolved, "_blank", "noopener,noreferrer");
}

function normalizePath(href = "") {
  const raw = String(href).trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      return new URL(raw).pathname || "";
    } catch {
      return raw;
    }
  }
  return raw.split("?")[0].split("#")[0] || "";
}

export function shouldKeepSameTabElement(element) {
  if (!element || typeof element.closest !== "function") return false;
  if (element.closest('[data-same-tab="true"]')) return true;
  if (element.closest("form")) return true;
  if (element.closest('[role="dialog"]')) return true;
  if (element.closest('[data-slot="dialog-content"]')) return true;
  return false;
}

export function shouldKeepSameTab({ href, options, element } = {}) {
  // Programmatic router.push() calls usually don't have a DOM event target.
  // Keep these in the current tab to avoid popup blockers.
  if (!element) return true;
  if (options?.scroll === false) return true;
  if (shouldKeepSameTabElement(element)) return true;

  const path = normalizePath(href);
  if (!path) return true;
  if (path.startsWith("/admin")) return true;

  return false;
}

export function isNavigableHref(href = "") {
  const value = String(href).trim();
  if (!value) return false;
  if (value.startsWith("#")) return false;
  if (value.startsWith("mailto:")) return false;
  if (value.startsWith("tel:")) return false;
  if (value.startsWith("javascript:")) return false;
  return true;
}
