import ExamsPageContent from "@/components/exams/ExamsPageContent";
import { fetchExamsPageData } from "@/lib/fetchExamsPageData";

function firstSearchParamValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function KeywordExamsPage({ params, searchParams }) {
  const { keyword } = await params;
  const resolvedSearchParams = await searchParams;

  const decodedKeyword = decodeURIComponent(keyword).replace(/-/g, " ");
  const keywordTitle =
    decodedKeyword.charAt(0).toUpperCase() + decodedKeyword.slice(1);

  const data = await fetchExamsPageData({
    page: firstSearchParamValue(resolvedSearchParams?.page) || 1,
    q: decodedKeyword,
  });

  return (
    <ExamsPageContent
      initialProvider={[]}
      initialKeyword={decodedKeyword}
      initialProvidersData={data.providers}
      initialCategoriesData={data.categories}
      initialExamsData={data.exams}
      initialExamsPagination={data.examsPagination}
      initialTrustBarData={data.trustBarItems}
      initialAboutData={data.aboutSection}
      initialPageHeading={`Search: ${keywordTitle}`}
      usePathBasedRouting={true}
      backendPagination={true}
    />
  );
}
