// "use client";

// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";

// export default function FAQ() {
//   const faqSections = [
//     {
//       title: "A. About the Platform",
//       faqs: [
//         {
//           question: "What is AllExamQuestions?",
//           answer: "AllExamQuestions is a certification exam preparation platform offering accurate, exam-style practice questions across multiple providers."
//         },
//         // ... rest of FAQs
//       ]
//     },
//     // ... rest of sections
//   ];

//   return (
//     <div className="min-h-screen">
//       <Header />
//       <main className="py-16 bg-background">
//         <div className="container mx-auto px-4 max-w-5xl">
//           <div className="text-center mb-12">
//             <h1 className="text-5xl font-bold mb-4 text-foreground">Frequently Asked Questions</h1>
//             <p className="text-muted-foreground text-lg">Everything you need to know about AllExamQuestions</p>
//           </div>

//           <div className="space-y-12">
//             {faqSections.map((section, sectionIndex) => (
//               <div key={sectionIndex}>
//                 <h2 className="text-2xl font-bold mb-6 text-foreground">{section.title}</h2>
//                 <Accordion type="single" collapsible className="w-full space-y-4">
//                   {section.faqs.map((faq, faqIndex) => (
//                     <AccordionItem 
//                       key={faqIndex} 
//                       value={`section-${sectionIndex}-item-${faqIndex}`}
//                       className="border border-border rounded-lg px-6 bg-card"
//                     >
//                       <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
//                         {faq.question}
//                       </AccordionTrigger>
//                       <AccordionContent className="text-muted-foreground">
//                         {faq.answer}
//                       </AccordionContent>
//                     </AccordionItem>
//                   ))}
//                 </Accordion>
//               </div>
//             ))}
//           </div>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FAQJsonLd from "@/components/FAQJsonLd";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const [faqSections, setFaqSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${API_BASE_URL}/api/home/faqs/`);
        if (!res.ok) throw new Error("Failed to fetch FAQs");
        const result = await res.json();
        
        // Group FAQs by category
        const faqsByCategory = {};
        if (result.success && result.data) {
          result.data.forEach(faq => {
            const category = faq.category || "General";
            if (!faqsByCategory[category]) {
              faqsByCategory[category] = [];
            }
            faqsByCategory[category].push({
              question: faq.question,
              answer: faq.answer
            });
          });
        }
        
        // Convert to array format expected by component
        const sections = Object.keys(faqsByCategory).map(category => ({
          title: category,
          faqs: faqsByCategory[category]
        }));
        
        setFaqSections(sections);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  // Set canonical URL for FAQ page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const canonicalUrl = "https://allexamquestions.com/FAQ";
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", canonicalUrl);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading FAQs...
      </div>
    );
  }

  if (error || faqSections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Failed to load FAQs.
      </div>
    );
  }

  // Flatten all FAQs from all sections for JSON-LD
  const allFAQs = faqSections.flatMap((section) => section.faqs || []);

  return (
    <div className="min-h-screen">
      {allFAQs.length > 0 && <FAQJsonLd faqs={allFAQs} />}
      <Header />
      <main className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-foreground">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about our platform
            </p>
          </div>

          <div className="space-y-12">
            {faqSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  {section.title}
                </h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {section.faqs.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`section-${sectionIndex}-item-${faqIndex}`}
                      className="border border-border rounded-lg px-6 bg-card"
                    >
                      <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
