"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TipTapContent from "@/components/editor/TipTapContent";

export default function BlogPostFaqs({ faqs }) {
  const safeFaqs = Array.isArray(faqs)
    ? faqs.filter(
        (faq) =>
          faq &&
          String(faq.question || "").trim() &&
          String(faq.answer || "").trim()
      )
    : [];

  if (safeFaqs.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-[#0C1A35] mb-6">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {safeFaqs.map((faq, idx) => (
          <AccordionItem key={idx} value={`blog-faq-${idx}`}>
            <AccordionTrigger className="text-[#0C1A35] font-medium text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-[#0C1A35]/80">
              <TipTapContent content={faq.answer} className="leading-relaxed" />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
