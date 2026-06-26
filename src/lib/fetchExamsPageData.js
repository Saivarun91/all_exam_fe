import { filterPublicExamListings } from "@/lib/examListingFilters";
import {
  coursesFetchOptions,
  publicFetchOptions,
  providersListUrl,
} from "@/lib/serverRevalidate";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function fetchExamsPageData() {
  try {
    const [providersRes, categoriesRes, coursesRes, trustBarRes, aboutRes] =
      await Promise.all([
        fetch(providersListUrl(API_BASE_URL), publicFetchOptions()),
        fetch(`${API_BASE_URL}/api/categories/`, publicFetchOptions()),
        fetch(`${API_BASE_URL}/api/courses/`, coursesFetchOptions()),
        fetch(`${API_BASE_URL}/api/home/exams-trust-bar/`, publicFetchOptions()),
        fetch(`${API_BASE_URL}/api/home/exams-about/`, publicFetchOptions()),
      ]);

    const providersData = await providersRes.json();
    const categoriesData = await categoriesRes.json();
    const coursesData = await coursesRes.json();
    const trustBarData = await trustBarRes.json();
    const aboutData = await aboutRes.json();

    return {
      providers: Array.isArray(providersData)
        ? providersData.filter((p) => p.is_active)
        : [],
      categories: Array.isArray(categoriesData)
        ? categoriesData.filter((c) => c.is_active !== false)
        : [],
      exams: filterPublicExamListings(coursesData),
      trustBarItems: trustBarData?.success ? trustBarData.data : [],
      aboutSection: aboutData?.success ? aboutData.data : {},
    };
  } catch (error) {
    console.error("fetchExamsPageData error:", error);
    return {
      providers: [],
      categories: [],
      exams: [],
      trustBarItems: [],
      aboutSection: {},
    };
  }
}
