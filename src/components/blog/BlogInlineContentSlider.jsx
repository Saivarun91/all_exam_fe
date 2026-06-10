"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  ChevronRight,
  Cloud,
  Shield,
  Database,
  Code,
  Building,
  Sparkles,
  Layers,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FEATURED_COURSES_API_PATH,
  filterAdminFeaturedCourses,
} from "@/lib/featuredCourses";
import { createSlug, getExamUrl } from "@/lib/utils";
import { getCategoryImageSrc, getCategoryPagePath } from "@/lib/categoryImage";
import { getOptimizedImageUrl } from "@/utils/imageUtils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const CARD_CLASS =
  "flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px]";

const PROVIDER_CARD_CLASS =
  "flex-shrink-0 w-[300px] sm:w-[320px] md:w-[340px]";

const EXAM_CARD_CLASS =
  "flex-shrink-0 w-[290px] sm:w-[310px] md:w-[330px]";

const PROVIDER_ICON_MAP = {
  Cloud,
  Shield,
  Database,
  Code,
  Building,
};

const SLIDER_META = {
  providers: {
    title: "Popular Certification Providers",
    subtitle: "Explore practice tests from leading certification bodies",
    icon: Layers,
    accent: "from-indigo-600 via-violet-600 to-[#2563eb]",
  },
  categories: {
    title: "Top Certification Categories",
    subtitle: "Browse exams organized by certification category",
    icon: GraduationCap,
    accent: "from-sky-400 via-blue-500 to-indigo-600",
    background:
      "bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 border-blue-200",
  },
  popular_exams: {
    title: "Popular Exams",
    subtitle: "Featured certification exams learners are preparing for",
    icon: Sparkles,
    accent: "from-[#2563eb] via-[#1A73E8] to-indigo-600",
  },
};

const EXAM_ACCENTS = [
  {
    card: "from-sky-50 via-white to-blue-50/90 border-sky-200/60 hover:border-sky-300/70",
    bar: "bg-gradient-to-b from-sky-500 to-[#1A73E8]",
    icon: "bg-sky-100 text-sky-700",
    badge: "bg-sky-100 text-sky-800",
    cta: "text-sky-700 group-hover:text-sky-900",
    btn: "bg-[#1A73E8] hover:bg-[#1557B0]",
  },
  {
    card: "from-violet-50 via-white to-indigo-50/90 border-violet-200/60 hover:border-violet-300/70",
    bar: "bg-gradient-to-b from-violet-500 to-indigo-600",
    icon: "bg-violet-100 text-violet-700",
    badge: "bg-violet-100 text-violet-800",
    cta: "text-violet-700 group-hover:text-violet-900",
    btn: "bg-violet-600 hover:bg-violet-700",
  },
  {
    card: "from-emerald-50 via-white to-teal-50/90 border-emerald-200/60 hover:border-emerald-300/70",
    bar: "bg-gradient-to-b from-emerald-500 to-teal-600",
    icon: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800",
    cta: "text-emerald-700 group-hover:text-emerald-900",
    btn: "bg-emerald-600 hover:bg-emerald-700",
  },
];

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    return ["true", "1", "yes", "y", "on"].includes(value.trim().toLowerCase());
  }
  return false;
}

function CategorySlideImage({ imageSrc, categoryLabel }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageSrc) && !imageFailed;

  if (showImage) {
    return (
      <div className="aspect-[17/11] border-b border-slate-200/70 overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={categoryLabel}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className="aspect-[17/11] bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 border-b border-slate-200/70 flex items-center justify-center">
      <GraduationCap className="w-10 h-10 text-white" />
    </div>
  );
}

function renderExamSlide(exam, index, keyPrefix) {
  const accent = EXAM_ACCENTS[index % EXAM_ACCENTS.length];
  const practiceCount =
    exam.practice_tests_list?.length || exam.practice_exams || 0;
  const questionCount =
    exam.practice_tests_list?.reduce(
      (sum, item) => sum + (parseInt(item.questions, 10) || 0),
      0
    ) ||
    exam.questions ||
    0;

  return (
    <div key={`${keyPrefix}-${exam.id || index}`} className={EXAM_CARD_CLASS}>
      <Link href={getExamUrl(exam)} className="block h-full group">
        <Card
          className={`relative h-full min-h-[280px] border bg-gradient-to-br shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl overflow-hidden ${accent.card}`}
        >
          <span
            className={`absolute left-0 top-0 h-full w-1 ${accent.bar}`}
            aria-hidden
          />
          <CardContent className="p-5 pl-6 flex flex-col h-full min-h-[280px]">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${accent.icon}`}
              >
                <Award className="w-6 h-6" />
              </div>
              {exam.badge ? (
                <Badge
                  className={`border-0 text-[10px] font-semibold shrink-0 ${accent.badge}`}
                >
                  {exam.badge}
                </Badge>
              ) : null}
            </div>

            <div className="flex-1 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {exam.provider}
              </p>
              <h3 className="text-[17px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#1A73E8] transition-colors">
                {exam.title}
              </h3>
              {exam.code ? (
                <Badge
                  variant="outline"
                  className={`text-[11px] font-semibold border-0 ${accent.badge}`}
                >
                  {exam.code}
                </Badge>
              ) : null}
            </div>

            {(practiceCount > 0 || questionCount > 0) && (
              <p className="text-xs text-slate-500 mt-3 font-medium">
                {practiceCount > 0 ? `${practiceCount} practice tests` : null}
                {practiceCount > 0 && questionCount > 0 ? " · " : null}
                {questionCount > 0 ? `${questionCount} questions` : null}
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-slate-200/60">
              <span
                className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${accent.btn}`}
              >
                Start Practicing
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

function renderProviderSlide(provider, index, keyPrefix) {
  const Icon = PROVIDER_ICON_MAP[provider.icon] || Cloud;
  const href = `/providers/${provider.slug || createSlug(provider.name)}`;

  return (
    <div key={`${keyPrefix}-${provider.id || index}`} className={PROVIDER_CARD_CLASS}>
      <Link href={href} className="block h-full group">
        <Card className="h-full min-h-[260px] border border-indigo-100/80 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:border-indigo-300/60 overflow-hidden">
          <div className="h-28 sm:h-32 bg-gradient-to-br from-indigo-50 via-sky-50 to-white border-b border-indigo-100/80 flex items-center justify-center px-6">
            <div className="w-[120px] h-[88px] sm:w-[140px] sm:h-[100px] flex items-center justify-center">
              {provider.logo_url ? (
                <img
                  src={getOptimizedImageUrl(provider.logo_url, 140, 100)}
                  alt={provider.name}
                  className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center shadow-sm">
                  <Icon className="w-10 h-10 text-indigo-600" />
                </div>
              )}
            </div>
          </div>
          <CardContent className="p-5 flex flex-col items-center text-center gap-2">
            <p className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-[#1A73E8] transition-colors leading-snug">
              {provider.name}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600/80 group-hover:text-indigo-700 transition-colors mt-1">
              View provider
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

function renderCategorySlide(category, index, keyPrefix) {
  const href = getCategoryPagePath(category);
  const imageSrc = getCategoryImageSrc(category);
  const categoryLabel = category.title || category.name || "Category";

  return (
    <div key={`${keyPrefix}-${category.id || index}`} className={CARD_CLASS}>
      <Link href={href} className="block h-full group">
      <Card className="h-full border border-blue-100/70 bg-gradient-to-br from-white via-sky-50/40 to-indigo-50/50 shadow-sm overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:border-blue-300/60">
          <CategorySlideImage imageSrc={imageSrc} categoryLabel={categoryLabel} />
          <CardContent className="p-4">
            <p className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-[#2563eb] transition-colors">
              {categoryLabel}
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

const SLIDER_EXAM_LIMIT = 10;

export default function BlogInlineContentSlider({ sliderType, sliderRef = "" }) {
  const type = String(sliderType || "").trim().toLowerCase();
  const refSlug = String(sliderRef || "").trim();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [itemMode, setItemMode] = useState("default");
  const [headerOverride, setHeaderOverride] = useState(null);

  useEffect(() => {
    if (!type || type === "none") {
      setItems([]);
      setItemMode("default");
      setHeaderOverride(null);
      setLoading(false);
      return;
    }

    let alive = true;

    async function load() {
      setLoading(true);
      setHeaderOverride(null);
      try {
        if (type === "popular_exams") {
          const res = await fetch(`${API_BASE_URL}${FEATURED_COURSES_API_PATH}`, {
            cache: "no-store",
          });
          if (!res.ok) return;
          const data = await res.json();
          if (!alive) return;
          setItemMode("exams");
          setItems(filterAdminFeaturedCourses(data));
          return;
        }

        if (type === "providers" && refSlug) {
          const [examsRes, providerRes] = await Promise.all([
            fetch(
              `${API_BASE_URL}/api/courses/provider/${encodeURIComponent(refSlug)}/?limit=${SLIDER_EXAM_LIMIT}`,
              { cache: "no-store" }
            ),
            fetch(`${API_BASE_URL}/api/providers/${encodeURIComponent(refSlug)}/`, {
              cache: "no-store",
            }),
          ]);
          if (!examsRes.ok) return;
          const exams = await examsRes.json();
          if (!alive) return;
          const examList = Array.isArray(exams) ? exams : [];
          setItemMode("exams");
          setItems(examList);

          if (providerRes.ok) {
            const provider = await providerRes.json();
            const providerName = provider?.name || refSlug;
            setHeaderOverride({
              title: `Latest ${providerName} Exams`,
              subtitle: `Recently added ${providerName} certification exams`,
            });
          }
          return;
        }

        if (type === "categories" && refSlug) {
          const [examsRes, categoryRes] = await Promise.all([
            fetch(
              `${API_BASE_URL}/api/courses/category/${encodeURIComponent(refSlug)}/?limit=${SLIDER_EXAM_LIMIT}`,
              { cache: "no-store" }
            ),
            fetch(`${API_BASE_URL}/api/categories/${encodeURIComponent(refSlug)}/`, {
              cache: "no-store",
            }),
          ]);
          if (!examsRes.ok) return;
          const exams = await examsRes.json();
          if (!alive) return;
          const examList = Array.isArray(exams) ? exams : [];
          setItemMode("exams");
          setItems(examList);

          if (categoryRes.ok) {
            const category = await categoryRes.json();
            const categoryName =
              category?.title || category?.name || refSlug;
            setHeaderOverride({
              title: `Latest ${categoryName} Exams`,
              subtitle: `Recently added exams in ${categoryName}`,
            });
          }
          return;
        }

        if (type === "providers") {
          const res = await fetch(`${API_BASE_URL}/api/providers/`, {
            cache: "no-store",
          });
          if (!res.ok) return;
          const data = await res.json();
          if (!alive) return;
          setItemMode("providers");
          setItems(
            Array.isArray(data) ? data.filter((p) => p.is_active !== false) : []
          );
          return;
        }

        if (type === "categories") {
          const res = await fetch(`${API_BASE_URL}/api/categories/`, {
            cache: "no-store",
          });
          if (!res.ok) return;
          const data = await res.json();
          if (!alive) return;
          const list = Array.isArray(data) ? data : [];
          const top = list.filter((c) => parseBoolean(c?.is_top_certification));
          setItemMode("categories");
          setItems(top.length > 0 ? top : list.filter((c) => c.is_active !== false));
        }
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [type, refSlug]);

  const baseMeta = SLIDER_META[type] || {
    title: "Explore",
    subtitle: "",
    icon: Sparkles,
    accent: "from-[#2563eb] via-[#1A73E8] to-indigo-600",
  };
  const meta = headerOverride
    ? { ...baseMeta, ...headerOverride }
    : baseMeta;
  const HeaderIcon = baseMeta.icon;

  const marqueeDuration = useMemo(() => {
    const count = Math.max(items.length, 1);
    return `${Math.max(28, count * 6)}s`;
  }, [items.length]);

  const renderSlides = (list, keyPrefix) => {
    if (itemMode === "exams" || type === "popular_exams") {
      return list.map((item, index) => renderExamSlide(item, index, keyPrefix));
    }
    if (itemMode === "providers" || type === "providers") {
      return list.map((item, index) =>
        renderProviderSlide(item, index, keyPrefix)
      );
    }
    if (itemMode === "categories" || type === "categories") {
      return list.map((item, index) =>
        renderCategorySlide(item, index, keyPrefix)
      );
    }
    return null;
  };

  if (!type || type === "none") return null;
  if (!loading && items.length === 0) return null;

  const shouldAnimate = items.length > 1;

  return (
    <section
      className="my-12 relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 shadow-lg"
      aria-label={meta.title}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${meta.accent}`}
        aria-hidden
      />

      <div className="px-4 sm:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${meta.accent} shadow-md`}
            >
              <HeaderIcon className="w-5 h-5 text-white" aria-hidden />
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            {meta.title}
          </h2>
          {meta.subtitle ? (
            <p className="text-sm md:text-base text-slate-600 mt-2 max-w-xl mx-auto">
              {meta.subtitle}
            </p>
          ) : null}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-9 w-9 border-2 border-sky-200 border-t-[#1A73E8]" />
          </div>
        ) : (
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 z-10 bg-gradient-to-r from-slate-50 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 z-10 bg-gradient-to-l from-sky-50/80 to-transparent"
              aria-hidden
            />

            <div className="overflow-hidden rounded-xl">
              <div
                className={`flex gap-6 ${
                  shouldAnimate ? "animate-blog-inline-marquee" : ""
                } ${isPaused ? "is-paused" : ""}`}
                style={{
                  "--blog-marquee-duration": marqueeDuration,
                }}
              >
                {renderSlides(items, "a")}
                {shouldAnimate ? renderSlides(items, "b") : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
