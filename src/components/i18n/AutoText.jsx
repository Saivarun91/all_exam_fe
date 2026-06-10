"use client";

import { REACT_I18N_ATTR } from "@/lib/domI18nUtils";
import {
  getEntityId,
  useLocalizedEntity,
} from "@/lib/entityI18n";
import { useAutoTranslatedText } from "@/lib/useAutoTranslatedText";

function resolveSource({ text, name, course, provider, category }) {
  return (
    text ||
    name ||
    course?.title ||
    course?.name ||
    provider?.name ||
    category?.title ||
    category?.name ||
    ""
  ).trim();
}

function useDynamicTranslatedText(options) {
  const source = resolveSource(options);
  const runtime = useAutoTranslatedText(source);

  const courseId = options.course ? getEntityId(options.course) : "";
  const providerId = options.provider ? getEntityId(options.provider) : "";
  const categoryId = options.category ? getEntityId(options.category) : "";

  const courseLabel = useLocalizedEntity(
    "course",
    courseId,
    "title",
    options.course?.title || options.course?.name || source
  );
  const providerLabel = useLocalizedEntity(
    "provider",
    providerId,
    "name",
    options.provider?.name || options.name || source
  );
  const categoryLabel = useLocalizedEntity(
    "category",
    categoryId,
    "title",
    options.category?.title || options.category?.name || source
  );

  if (courseId && courseLabel) return courseLabel;
  if (providerId && providerLabel) return providerLabel;
  if (categoryId && categoryLabel) return categoryLabel;
  return runtime;
}

/**
 * Renders dynamic CMS/API text translated for the active language.
 * Accepts `text`, `name`, `course`, `provider`, or `category` (same as legacy title components).
 */
export default function AutoText({
  text = "",
  name,
  course,
  provider,
  category,
  as: Component = "span",
  className = "",
  ...props
}) {
  const source = resolveSource({ text, name, course, provider, category });
  const translated = useDynamicTranslatedText({
    text,
    name,
    course,
    provider,
    category,
  });

  if (!source) return null;

  return (
    <Component
      className={className}
      {...{ [REACT_I18N_ATTR]: "" }}
      data-translate={source}
      data-translate-fallback={source}
      suppressHydrationWarning
      {...props}
    >
      {translated}
    </Component>
  );
}
