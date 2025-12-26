"use client";

import { useState, useEffect } from "react";
import FAQJsonLd from "@/components/FAQJsonLd";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function HomeFAQ() {
  const [faqs, setFaqs] = useState([]);
  const [sectionSettings, setSectionSettings] = useState({
    heading: "Frequently Asked Questions",
    subtitle: "Clear answers to the most common questions our learners ask.",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch section settings
    fetch(`${API_BASE_URL}/api/home/faqs-section/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSectionSettings(data.data);
        }
      })
      .catch((err) => console.error("Error fetching section settings:", err));
    
    const fetchFAQs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/home/faqs/`);
        if (!res.ok) {
          throw new Error("Failed to fetch FAQs");
        }
        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          // Backend already filters by is_active, so we use all returned FAQs
          setFaqs(data.data);
        } else {
          setFaqs([]);
        }
      } catch (err) {
        console.error("Error fetching FAQs:", err);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#0C1A35]/70 text-sm md:text-base">Loading FAQs...</p>
        </div>
      </section>
    );
  }

  // Don't hide section if no FAQs - show empty state or loading
  // if (!faqs.length) {
  //   return null;
  // }

  // Convert API format to simple format for JSON-LD
  const simpleFAQs = faqs.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));

  return (
    <section className="py-12 md:py-16 bg-white">
      {simpleFAQs.length > 0 && <FAQJsonLd faqs={simpleFAQs} />}
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-[#0C1A35] px-2">
            {sectionSettings.heading || "Frequently Asked Questions"}
          </h2>
          {sectionSettings.subtitle && (
            <p className="text-[#0C1A35]/70 text-sm sm:text-base md:text-lg px-2">
              {sectionSettings.subtitle}
            </p>
          )}
        </div>

        {faqs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.id || index}
                value={`item-${index}`}
                className="border border-[#D3E3FF] rounded-lg px-6 bg-white hover:border-[#1A73E8] transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-[#0C1A35] hover:no-underline hover:text-[#1A73E8] transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#0C1A35]/70 pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8">
            <p className="text-[#0C1A35]/70">No FAQs available at the moment. Please check back later.</p>
          </div>
        )}
      </div>
    </section>
  );
}
