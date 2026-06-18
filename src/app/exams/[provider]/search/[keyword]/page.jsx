import ExamsPageContent from "@/components/exams/ExamsPageContent";
import { fetchExamsPageData } from "@/lib/fetchExamsPageData";

export async function generateMetadata({ params }) {
  const { provider, keyword } = await params;

  if (!provider || !keyword) return {};

  const decoded = decodeURIComponent(keyword);
  const decodedKeyword = decoded.replace(/-/g, " ");

  const providerName =
    provider.charAt(0).toUpperCase() + provider.slice(1).replace(/-/g, " ");

  const keywordTitle =
    decodedKeyword.charAt(0).toUpperCase() + decodedKeyword.slice(1);

  return {
    title: `${keywordTitle} - ${providerName} Certification Exams | AllExamQuestions`,
  };
}

export default async function ProviderKeywordExamsPage({ params }) {
  const { provider, keyword } = await params;

  const decodedKeyword = keyword
    ? decodeURIComponent(keyword).replace(/-/g, " ")
    : "";

  const data = await fetchExamsPageData();

  const providerName =
    data.providers.find(
      (p) => String(p.slug || "").toLowerCase() === String(provider).toLowerCase()
    )?.name ||
    provider.charAt(0).toUpperCase() + provider.slice(1).replace(/-/g, " ");

  const keywordTitle =
    decodedKeyword.charAt(0).toUpperCase() + decodedKeyword.slice(1);

  return (
    <ExamsPageContent
      initialProvider={provider ? [provider] : []}
      initialKeyword={decodedKeyword}
      initialProvidersData={data.providers}
      initialCategoriesData={data.categories}
      initialExamsData={data.exams}
      initialTrustBarData={data.trustBarItems}
      initialAboutData={data.aboutSection}
      initialPageHeading={`${keywordTitle} - ${providerName}`}
      usePathBasedRouting={true}
    />
  );
}
