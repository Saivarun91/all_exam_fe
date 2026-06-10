"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isEnglishLanguage } from "@/lib/defaultTranslations";
import { isAbortError } from "@/lib/isAbortError";
import {
  getRuntimeCachedTranslation,
  translateRuntimeText,
} from "@/lib/runtimeTranslate";

export function getEntityId(entity) {
  if (!entity) return "";
  return String(entity.id || entity._id || "");
}

export function entityTranslationKey(entityType, entityId, field) {
  const id = entityId != null ? String(entityId) : "";
  if (!entityType || !id || !field) return "";
  return `cms.${entityType}.${id}.${field}`;
}

export function nestedEntityTranslationKey(
  entityType,
  entityId,
  nestedType,
  nestedId,
  field
) {
  const id = entityId != null ? String(entityId) : "";
  const nested = nestedId != null ? String(nestedId) : "";
  if (!entityType || !id || !nestedType || !nested || !field) return "";
  return `cms.${entityType}.${id}.${nestedType}.${nested}.${field}`;
}

function useRuntimeLocalizedValue(catalogValue, apiValue, language) {
  const source = (apiValue || "").trim();
  const [runtimeValue, setRuntimeValue] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  useLayoutEffect(() => {
    if (!source) {
      setRuntimeValue("");
      return;
    }
    if (isEnglishLanguage(language)) {
      setRuntimeValue("");
      return;
    }
    const current = (catalogValue || "").trim();
    if (current && current !== source) {
      setRuntimeValue("");
      return;
    }
    const cached = getRuntimeCachedTranslation(source, language);
    if (cached) {
      setRuntimeValue(cached);
    }
  }, [catalogValue, source, language]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleRefresh = () => {
      setRefreshToken((token) => token + 1);
    };

    window.addEventListener("translationsApplied", handleRefresh);
    window.addEventListener("languageChanged", handleRefresh);

    const pollTimers =
      !isEnglishLanguage(language) && source
        ? [0, 80, 200, 500, 1200].map((delay) =>
            window.setTimeout(handleRefresh, delay)
          )
        : [];

    return () => {
      window.removeEventListener("translationsApplied", handleRefresh);
      window.removeEventListener("languageChanged", handleRefresh);
      pollTimers.forEach((timerId) => clearTimeout(timerId));
    };
  }, [language, source]);

  useEffect(() => {
    if (isEnglishLanguage(language) || !source) {
      setRuntimeValue("");
      return undefined;
    }

    const current = (catalogValue || "").trim();
    if (current && current !== source) {
      setRuntimeValue("");
      return undefined;
    }

    let cancelled = false;

    translateRuntimeText(source, language)
      .then((translated) => {
        if (cancelled) return;
        const next = (translated || "").trim();
        setRuntimeValue(next && next !== source ? next : source);
      })
      .catch((error) => {
        if (!cancelled && !isAbortError(error)) {
          console.warn("Entity translation failed:", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [catalogValue, source, language, refreshToken]);

  if (isEnglishLanguage(language)) {
    if (catalogValue && catalogValue.trim()) return catalogValue;
    return source;
  }

  if (runtimeValue) return runtimeValue;

  const cached = getRuntimeCachedTranslation(source, language);
  if (cached) return cached;

  if (catalogValue && catalogValue.trim() !== source) return catalogValue;

  return source;
}

export function useLocalizedEntity(entityType, entityId, field, apiValue = "") {
  const { lt, language } = useLanguage();
  const key = entityTranslationKey(entityType, entityId, field);
  const catalogValue = key ? lt(key, apiValue) : "";
  return useRuntimeLocalizedValue(catalogValue, apiValue, language);
}

export function useLocalizedNestedEntity(
  entityType,
  entityId,
  nestedType,
  nestedId,
  field,
  apiValue = ""
) {
  const { lt, language } = useLanguage();
  const key = nestedEntityTranslationKey(
    entityType,
    entityId,
    nestedType,
    nestedId,
    field
  );
  const catalogValue = key ? lt(key, apiValue) : "";
  return useRuntimeLocalizedValue(catalogValue, apiValue, language);
}

export function useCourseTitle(course, fallback = "") {
  const courseId = getEntityId(course);
  return useLocalizedEntity(
    "course",
    courseId,
    "title",
    course?.title || course?.name || fallback
  );
}

export function useProviderName(provider, fallback = "") {
  const providerId = getEntityId(provider);
  return useLocalizedEntity(
    "provider",
    providerId,
    "name",
    provider?.name || fallback
  );
}

export function useCategoryTitle(category, fallback = "") {
  const categoryId = getEntityId(category);
  return useLocalizedEntity(
    "category",
    categoryId,
    "title",
    category?.title || category?.name || fallback
  );
}

export function useBlogTitle(blog, fallback = "") {
  const blogId = getEntityId(blog);
  return useLocalizedEntity(
    "blog",
    blogId,
    "title",
    blog?.title || fallback
  );
}
