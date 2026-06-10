"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useHydrated } from "@/lib/useHydrated";
import TipTapContent from "@/components/editor/TipTapContent";

const DEFAULT_FAQ_HEADING = "Frequently Asked Questions";
const DEFAULT_FAQ_SUBTITLE =
  "Clear answers to the most common questions our learners ask.";

function FaqStaticList({ faqs }) {
  return (
    <div className="space-y-4 w-full">
      {faqs.map((faq, index) => (
        <div
          key={faq.id || index}
          className="border border-[#D3E3FF] rounded-lg px-4 sm:px-6 bg-white w-full"
        >
          <h3
            className="text-left font-semibold text-[#0C1A35] py-4"
            data-i18n={`cms.faq.${faq.id}.question`}
            data-i18n-fallback={faq.question}
            suppressHydrationWarning
          >
            {faq.question}
          </h3>
          <p
            className="text-[#0C1A35]/80 pb-4"
            data-i18n={`cms.faq.${faq.id}.answer`}
            data-i18n-fallback={faq.answer}
            suppressHydrationWarning
          >
            {faq.answer}
          </p>
        </div>
      ))}
    </div>
  );
}

function FaqAccordion({ faqs }) {
  return (
    <Accordion type="single" collapsible className="space-y-4 w-full">
      {faqs.map((faq, index) => (
        <AccordionItem
          key={faq.id || index}
          value={faq.id ? `faq-${faq.id}` : `item-${index}`}
          className="border border-[#D3E3FF] rounded-lg px-4 sm:px-6 bg-white hover:border-[#1A73E8] w-full"
        >
          <AccordionTrigger
            className="text-left font-semibold text-[#0C1A35] py-4 hover:no-underline hover:text-[#1A73E8]"
            data-i18n={`cms.faq.${faq.id}.question`}
            data-i18n-fallback={faq.question}
            suppressHydrationWarning
          >
            {faq.question}
          </AccordionTrigger>

          <AccordionContent className="text-[#0C1A35]/80 pb-4">
            <span
              data-i18n={`cms.faq.${faq.id}.answer`}
              data-i18n-fallback={faq.answer}
              suppressHydrationWarning
            >
              {faq.answer}
            </span>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default function HomeFAQClient({ faqs, section, sectionContent }) {
  const hydrated = useHydrated();
  const faqHeading = section?.heading?.trim() || DEFAULT_FAQ_HEADING;
  const faqSubtitle = section?.subtitle?.trim() || DEFAULT_FAQ_SUBTITLE;

  return (
    <section id="faq-section" className="pt-12 md:pt-16 pb-24 bg-white">
      <div className="container mx-auto px-4 w-full">
        <div className="w-full mx-auto">
          {sectionContent?.heading && (
            <h2
              className="text-2xl md:text-4xl font-bold mb-3 text-[#0C1A35] text-center"
              data-i18n="cms.faq.section.heading"
              data-i18n-fallback={sectionContent.heading}
              suppressHydrationWarning
            >
              {sectionContent.heading}
            </h2>
          )}

          {sectionContent?.content && (
            <div className="mb-6 w-full">
              <div className="rounded-xl border border-[#EAF2FF] bg-[#FAFCFF] px-4 sm:px-5 py-4 shadow-sm w-full">
                <TipTapContent
                  content={sectionContent.content}
                  className="leading-relaxed text-[#0C1A35]/80 w-full"
                  data-i18n-html="cms.faq.section.content"
                  data-i18n-fallback={sectionContent.content}
                  suppressHydrationWarning
                />
              </div>
            </div>
          )}

          <div className="mb-8 text-center w-full">
            <h2
              className="text-2xl md:text-4xl font-bold mb-3 text-[#0C1A35]"
              data-i18n="cms.faq.heading"
              data-i18n-fallback={faqHeading}
              suppressHydrationWarning
            >
              {faqHeading}
            </h2>

            {faqSubtitle && (
              <p
                className="text-[#0C1A35]/80 md:text-lg"
                data-i18n="cms.faq.subtitle"
                data-i18n-fallback={faqSubtitle}
                suppressHydrationWarning
              >
                {faqSubtitle}
              </p>
            )}
          </div>

          {faqs?.length > 0 ? (
            <div id="faq-list" className="w-full">
              {hydrated ? (
                <FaqAccordion faqs={faqs} />
              ) : (
                <FaqStaticList faqs={faqs} />
              )}
            </div>
          ) : (
            <div className="text-center py-8 w-full">
              <p className="text-red-500 font-semibold">
                ⚠ No FAQs returned from API
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
