"use client";

import { useEffect, useState } from "react";
import { ADMIN_TABLE_PAGE_SIZE } from "@/components/admin/AdminTablePagination";

export const DEFAULT_ADMIN_PAGINATION = {
  count: 0,
  page: 1,
  page_size: ADMIN_TABLE_PAGE_SIZE,
  total_pages: 1,
  has_next: false,
  has_previous: false,
};

export function normalizeAdminPagination(pagination) {
  if (!pagination) return DEFAULT_ADMIN_PAGINATION;
  return {
    count: Number(pagination.count) || 0,
    page: Number(pagination.page) || 1,
    page_size: Number(pagination.page_size) || ADMIN_TABLE_PAGE_SIZE,
    total_pages: Number(pagination.total_pages) || 1,
    has_next: Boolean(pagination.has_next),
    has_previous: Boolean(pagination.has_previous),
  };
}

export function buildAdminListUrl(baseUrl, params = {}) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => globalThis.clearTimeout(timeoutId);
  }, [value, delay]);

  return debounced;
}
