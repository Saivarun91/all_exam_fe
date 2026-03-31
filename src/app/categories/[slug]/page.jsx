import CategoryDetail from "@/components/category/CategoryDetail";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const SITE_URL = "https://allexamquestions.com";

async function fetchCategoryData(slug) {
  if (!slug) {
    return { category: null, courses: [], error: true };
  }

  try {
    const [categoryRes, coursesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/categories/${slug}/`, {
        next: { revalidate: 60 },
      }),
      fetch(`${API_BASE_URL}/api/courses/category/${slug}/`, {
        next: { revalidate: 60 },
      }),
    ]);

    if (!categoryRes.ok) {
      return { category: null, courses: [], error: true };
    }

    const category = await categoryRes.json();

    let courses = [];
    if (coursesRes.ok) {
      const coursesData = await coursesRes.json();
      courses = Array.isArray(coursesData)
        ? coursesData.filter((course) => course.is_active !== false)
        : [];
    }

    return { category, courses, error: false };
  } catch (err) {
    console.error("Error fetching category page data:", err);
    return { category: null, courses: [], error: true };
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const canonicalUrl = `${SITE_URL}/categories/${slug || ""}`.replace(/\/$/, "");

  if (!slug) {
    return {
      title: "Category Not Found | AllExamQuestions",
      description: "The requested category does not exist.",
      alternates: {
        canonical: `${SITE_URL}/categories`,
      },
      openGraph: {
        title: "Category Not Found | AllExamQuestions",
        description: "The requested category does not exist.",
        url: `${SITE_URL}/categories`,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Category Not Found | AllExamQuestions",
        description: "The requested category does not exist.",
      },
    };
  }

  const { category } = await fetchCategoryData(slug);

  if (!category) {
    return {
      title: "Category Not Found | AllExamQuestions",
      description: "The requested category does not exist.",
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: "Category Not Found | AllExamQuestions",
        description: "The requested category does not exist.",
        url: canonicalUrl,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Category Not Found | AllExamQuestions",
        description: "The requested category does not exist.",
      },
    };
  }

  const categoryTitle = category?.title || category?.name || "Category";
  const title =
    category?.meta_title?.trim() ||
    `${categoryTitle} - Certification Exams | AllExamQuestions`;
  const description =
    category?.meta_description?.trim() ||
    category?.description?.trim() ||
    `Practice ${categoryTitle} certification exams with updated questions and realistic mock tests.`;
  const keywords =
    category?.meta_keywords?.trim() ||
    `${categoryTitle}, certification exams, practice tests, mock tests`;
  const ogImage = category?.meta_image || `${SITE_URL}/logo.png`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const { category, courses, error } = await fetchCategoryData(slug);
  return (
    <CategoryDetail
      slug={slug}
      category={category}
      courses={courses}
      loading={false}
      error={error}
    />
  );
}