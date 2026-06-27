import Link from "next/link";
import ProviderExamsList from "@/components/provider/ProviderExamsList";
import TipTapContent from "@/components/editor/TipTapContent";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ProviderDetail({
  slug,
  provider,
  exams,
  examsPagination,
  embedded = false,
  showBreadcrumb = true,
}) {
  const wrapperClass = embedded ? "w-full" : "min-h-screen bg-white";
  const innerClass = embedded ? "w-full" : "container mx-auto px-4 py-10";

  if (!slug) {
    return (
      <div className={wrapperClass}>
        <div className={innerClass}>
          <p className="text-red-600">Provider slug is missing.</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className={wrapperClass}>
        <div className={`${innerClass} text-center`}>
          <p className="text-red-600 text-lg font-semibold">
            Provider not found.
          </p>
          <Link
            href="/providers"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            ← Back to All Providers
          </Link>
        </div>
      </div>
    );
  }

  const safeExams = Array.isArray(exams) ? exams : [];
  const pageTitle = provider?.page_title?.trim() || provider?.name;
  const providerContent = provider?.content || "";
  const safeFaqs = Array.isArray(provider?.faqs)
    ? provider.faqs.filter(
        (faq) =>
          faq &&
          String(faq.question || "").trim() &&
          String(faq.answer || "").trim()
      )
    : [];

  const contentSectionClass = embedded
    ? "mt-10 pt-8 border-t border-slate-200 w-full"
    : "mt-10 pt-8 border-t border-gray-200";

  return (
    <div className={wrapperClass}>
      <div className={innerClass}>
        {showBreadcrumb && (
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-[#0C1A35]/60 hover:text-[#1A73E8]">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/providers" className="text-[#0C1A35]/60 hover:text-[#1A73E8]">
                    Providers
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage className="text-[#0C1A35] font-medium">
                {provider.name}
              </BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {!embedded && (
          <>
            <Link
              href="/providers"
              className="text-blue-600 hover:underline mb-6 inline-block"
            >
              ← Back to All Providers
            </Link>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
              <div>
                <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
                {provider.description?.trim() ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {provider.description.trim()}
                  </p>
                ) : null}
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-6">
              Exams by {provider.name}
            </h2>
          </>
        )}

        <ProviderExamsList
          exams={safeExams}
          pagination={examsPagination}
          providerName={provider.name}
          scrollTargetId={embedded ? "exams" : "provider-exams-grid"}
        />

        {providerContent && providerContent.trim() && (
          <section className={contentSectionClass}>
            <div className="rounded-xl border border-[#EAF2FF] bg-[#FAFCFF] px-4 sm:px-5 py-4 shadow-sm w-full">
              <TipTapContent
                content={providerContent}
                className="
                  text-[17px]
                  leading-relaxed
                  text-[#0C1A35]
                  w-full
                  whitespace-normal
                  break-words
                  overflow-wrap-anywhere
                "
              />
            </div>
          </section>
        )}

        {safeFaqs.length > 0 ? (
          <section
            className={
              embedded
                ? "mt-10 pt-8 border-t border-slate-200 w-full"
                : "mt-10 pt-8 border-t border-gray-200"
            }
          >
            <h2 className="text-2xl font-semibold mb-4">FAQs</h2>
            <Accordion type="single" collapsible className="w-full">
              {safeFaqs.map((faq, index) => (
                <AccordionItem key={`provider-faq-${index}`} value={`provider-faq-${index}`}>
                  <AccordionTrigger className="text-base text-[#0C1A35] no-underline hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-[#0C1A35]/70 whitespace-pre-line break-words">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ) : null}
      </div>
    </div>
  );
}
