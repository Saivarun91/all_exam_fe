import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function createSlug(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters except hyphens
    .replace(/\-\-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Remove leading hyphens
    .replace(/-+$/, ""); // Remove trailing hyphens
}

export function getExamUrl(exam) {
  // Generate URL in format: /exams/[provider-slug]/[code-slug]
  if (!exam) return "#";
  
  // Use provider_slug from API if available (proper slug), otherwise create slug from provider name
  let providerSlug = "";
  if (exam.provider_slug) {
    providerSlug = exam.provider_slug.toLowerCase();
  } else if (exam.provider) {
    // Create slug from provider name - take only first word for multi-word providers
    const providerParts = exam.provider.toString().trim().split(/\s+/);
    providerSlug = createSlug(providerParts[0]); // Use first word only (e.g., "SAP SE" -> "sap")
  }
  
  // For code slug, replace underscores with hyphens and use createSlug for proper formatting
  let codeSlug = "";
  if (exam.code) {
    // First replace underscores with hyphens, then apply createSlug for consistent formatting
    const codeWithHyphens = exam.code.toString().replace(/_/g, '-');
    codeSlug = createSlug(codeWithHyphens);
  }
  
  if (providerSlug && codeSlug) {
    return `/exams/${providerSlug}/${codeSlug}`;
  }
  
  // Fallback to slug if provider/code not available
  if (exam.slug) {
    return `/exam-details/${exam.slug}`;
  }
  
  return "#";
}