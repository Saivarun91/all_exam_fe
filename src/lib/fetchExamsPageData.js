import { filterPublicExamListings } from "@/lib/examListingFilters";
import {
  categoriesListUrl,
  coursesListUrl,
  publicFetchOptions,
  providersListUrl,
} from "@/lib/serverRevalidate";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const DEFAULT_EXAMS_PAGE_SIZE = 12;

function normalizePaginatedCourses(data) {
  if (Array.isArray(data)) {
    return {
      exams: filterPublicExamListings(data),
      pagination: {
        count: data.length,
        page: 1,
        page_size: DEFAULT_EXAMS_PAGE_SIZE,
        total_pages: Math.max(1, Math.ceil(data.length / DEFAULT_EXAMS_PAGE_SIZE)),
      },
    };
  }

  const results = Array.isArray(data?.results) ? data.results : [];
  return {
    exams: filterPublicExamListings(results),
    pagination: {
      count: Number(data?.count) || results.length,
      page: Number(data?.page) || 1,
      page_size: Number(data?.page_size) || DEFAULT_EXAMS_PAGE_SIZE,
      total_pages: Number(data?.total_pages) || 1,
    },
  };
}

export async function fetchExamsPageData(courseParams = {}) {
  try {
    const coursesUrl = coursesListUrl(API_BASE_URL, {
      page: 1,
      page_size: DEFAULT_EXAMS_PAGE_SIZE,
      ...courseParams,
    });
    if (process.env.NODE_ENV !== "production") {
      console.log("[fetchExamsPageData] courses API hit:", coursesUrl);
    }
    const [providersRes, categoriesRes, coursesRes, trustBarRes, aboutRes] =
      await Promise.all([
        fetch(providersListUrl(API_BASE_URL), publicFetchOptions()),
        fetch(categoriesListUrl(API_BASE_URL), publicFetchOptions()),
        fetch(coursesUrl, publicFetchOptions()),
        fetch(`${API_BASE_URL}/api/home/exams-trust-bar/`, publicFetchOptions()),
        fetch(`${API_BASE_URL}/api/home/exams-about/`, publicFetchOptions()),
      ]);

    const providersData = await providersRes.json();
    const categoriesData = await categoriesRes.json();
    const coursesData = await coursesRes.json();
    const trustBarData = await trustBarRes.json();
    const aboutData = await aboutRes.json();
    const courses = normalizePaginatedCourses(coursesData);
    if (process.env.NODE_ENV !== "production") {
      console.log("[fetchExamsPageData] courses API data:", {
        pagination: courses.pagination,
        itemCount: courses.exams.length,
        sample: courses.exams.slice(0, 3).map((exam) => ({
          id: exam.id,
          title: exam.title || exam.name,
          code: exam.code,
          provider: exam.provider,
        })),
      });
    }

    return {
      providers: Array.isArray(providersData)
        ? providersData.filter((p) => p.is_active)
        : [],
      categories: Array.isArray(categoriesData)
        ? categoriesData.filter((c) => c.is_active !== false)
        : [],
      exams: courses.exams,
      examsPagination: courses.pagination,
      trustBarItems: trustBarData?.success ? trustBarData.data : [],
      aboutSection: aboutData?.success ? aboutData.data : {},
    };
  } catch (error) {
    console.error("fetchExamsPageData error:", error);
    return {
      providers: [],
      categories: [],
      exams: [],
      examsPagination: {
        count: 0,
        page: 1,
        page_size: DEFAULT_EXAMS_PAGE_SIZE,
        total_pages: 1,
      },
      trustBarItems: [],
      aboutSection: {},
    };
  }
}
