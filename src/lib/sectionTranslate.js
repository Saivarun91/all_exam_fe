/**
 * Collect logical page sections for sequential i18n translation.
 * Order: header → main children (or main) → footer.
 */
export function collectPageSections() {
  if (typeof document === "undefined") return [];

  const sections = [];

  const main = document.querySelector("main");
  if (main) {
    const directChildren = [...main.children].filter(
      (el) =>
        el.nodeType === Node.ELEMENT_NODE &&
        !el.hasAttribute("data-i18n-ignore")
    );

    if (directChildren.length > 1) {
      directChildren.forEach((el, index) => {
        sections.push({ root: el, key: `main-${index}` });
      });
    } else if (directChildren.length === 1) {
      const wrapper = directChildren[0];
      const innerBlocks = [...wrapper.children].filter(
        (el) =>
          el.nodeType === Node.ELEMENT_NODE &&
          !el.hasAttribute("data-i18n-ignore")
      );

      if (innerBlocks.length > 1) {
        innerBlocks.forEach((el, index) => {
          sections.push({ root: el, key: `main-block-${index}` });
        });
      } else {
        sections.push({ root: wrapper, key: "main" });
      }
    } else {
      const nestedSections = [
        ...main.querySelectorAll(":scope section, :scope article"),
      ];
      if (nestedSections.length > 0) {
        nestedSections.forEach((el, index) => {
          sections.push({ root: el, key: `section-${index}` });
        });
      } else {
        sections.push({ root: main, key: "main" });
      }
    }
  }

  const footer = document.querySelector("footer");
  if (footer) {
    sections.push({ root: footer, key: "footer" });
  }

  if (!sections.length) {
    sections.push({ root: document.body, key: "body" });
  }

  return sections;
}

export function isElementInViewport(element, margin = 80) {
  if (!element || typeof window === "undefined") return true;

  const rect = element.getBoundingClientRect();
  return (
    rect.top < window.innerHeight + margin &&
    rect.bottom > -margin
  );
}

/** Viewport-visible sections first, then below-the-fold — each group in document order. */
export function orderSectionsForTranslation(sections) {
  const visible = [];
  const hidden = [];

  sections.forEach((section) => {
    if (isElementInViewport(section.root)) {
      visible.push(section);
    } else {
      hidden.push(section);
    }
  });

  return [...visible, ...hidden];
}

export function markSectionTranslating(root, translating) {
  if (!root) return;

  if (translating) {
    root.setAttribute("data-i18n-section-translating", "");
    root.style.opacity = "0.55";
    root.style.pointerEvents = "none";
    root.style.transition = "opacity 0.2s ease";
  } else {
    root.removeAttribute("data-i18n-section-translating");
    root.style.opacity = "";
    root.style.pointerEvents = "";
    root.setAttribute("data-i18n-section-ready", "");
  }
}
