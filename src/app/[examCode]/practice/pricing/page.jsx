import { notFound, redirect } from "next/navigation";

import PricingPageClient from "@/app/exams/[provider]/[examCode]/practice/pricing/PricingPageClient";
import { fetchExamByIdentifier, toExamSlug } from "@/lib/loadExamDetailPage";
import {
  getExamPracticePath,
  getExamPricingPath,
  getStoredExamSlug,
  pathsMatchPublicUrl,
} from "@/utils/practiceTestRouting";
import { ROBOTS_INDEX, ROBOTS_NOINDEX } from "@/lib/seoRobots";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const SITE_URL = "https://allexamquestions.com";

function decodePathSegment(value = "") {
  try {
    return decodeURIComponent(String(value ?? "").trim());
  } catch {
    return String(value ?? "").trim();
  }
}

function resolveProviderAndExamCode(exam) {
  const provider = toExamSlug(
    exam?.provider_slug || exam?.provider || exam?.category_slug || ""
  );
  const examCode = toExamSlug(
    exam?.code || getStoredExamSlug(exam) || ""
  );
  return { provider, examCode };
}

async function loadPricingData(provider, examCode, exam) {
  const lookupSlug =
    exam?.slug ||
    (provider && examCode ? `${provider}-${examCode}` : "") ||
    examCode;

  const courseRes = await fetch(
    `${API_BASE_URL}/api/courses/exams/${encodeURIComponent(lookupSlug)}/`,
    { cache: "no-store" }
  );
  if (!courseRes.ok) {
    throw new Error("Exam not found");
  }
  const courseData = await courseRes.json();

  if (provider && examCode) {
    const pricingRes = await fetch(
      `${API_BASE_URL}/api/courses/pricing/${encodeURIComponent(provider)}/${encodeURIComponent(examCode)}/`,
      { cache: "no-store" }
    );

    if (pricingRes.ok) {
      return pricingRes.json();
    }
  }

  return {
    success: true,
    course_id: courseData.id || "",
    course_title: courseData.title || courseData.code || "",
    course_code: courseData.code || "",
    provider: courseData.provider || provider,
    currency: courseData.currency || "INR",
    pricing_access_type: courseData.pricing_access_type || "paid",
    hero_title: courseData.hero_title || "Choose Your Access Plan",
    hero_subtitle:
      courseData.hero_subtitle ||
      "Unlock full access for this exam — all questions, explanations, analytics, and unlimited attempts.",
    pricing_plans: courseData.pricing_plans || [],
    pricing_features: courseData.pricing_features || [],
    pricing_testimonials: courseData.pricing_testimonials || [],
    pricing_faqs: courseData.pricing_faqs || [],
    pricing_comparison: courseData.pricing_comparison || [],
  };
}

export async function generateMetadata({ params }) {
  const { examCode } = await params;
  const rawExamCode = decodePathSegment(examCode);
  const exam = await fetchExamByIdentifier(rawExamCode);

  if (!exam) {
    return {
      title: "Pricing | AllExamQuestions",
      robots: ROBOTS_NOINDEX,
    };
  }

  const pricingPath = getExamPricingPath(exam) || `/${rawExamCode}/practice/pricing`;
  const pageTitle = `Pricing - ${exam.title} (${exam.code}) | AllExamQuestions`;

  return {
    title: pageTitle,
    description: `Choose the best access plan for ${exam.title || exam.code}. Unlimited practice tests, detailed explanations, and expert support.`,
    alternates: {
      canonical: `${SITE_URL}${pricingPath}`,
    },
    robots: ROBOTS_INDEX,
  };
}

export default async function SlugPricingPage({ params }) {
  const { examCode } = await params;
  const rawExamCode = decodePathSegment(examCode);
  const exam = await fetchExamByIdentifier(rawExamCode);

  if (!exam) {
    notFound();
  }

  const canonicalPricingPath = getExamPricingPath(exam);
  const currentPath = `/${rawExamCode}/practice/pricing`;
  if (
    canonicalPricingPath &&
    !pathsMatchPublicUrl(currentPath, canonicalPricingPath)
  ) {
    redirect(canonicalPricingPath);
  }

  const { provider, examCode: resolvedExamCode } = resolveProviderAndExamCode(exam);
  if (!resolvedExamCode) {
    notFound();
  }

  const practicePath =
    getExamPracticePath(exam) ||
    `/${exam?.slug || rawExamCode}/practice`;

  let pricingData = null;
  let error = "";

  try {
    pricingData = await loadPricingData(provider, resolvedExamCode, exam);
  } catch (err) {
    console.error(err);
    error = err?.message || "Failed to load pricing";
  }

  return (
    <PricingPageClient
      provider={provider}
      examCode={resolvedExamCode}
      pricingData={pricingData}
      error={error}
      practicePath={practicePath}
    />
  );
}
