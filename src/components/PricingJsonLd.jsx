/**
 * Pricing JSON-LD Structured Data Component
 * Renders Schema.org Offer/AggregateOffer JSON-LD script tag
 */

import { useEffect } from "react";

export default function PricingJsonLd({ pricingData, courseTitle, courseCode }) {
  useEffect(() => {
    if (!pricingData || !pricingData.pricing_plans || pricingData.pricing_plans.length === 0) {
      return;
    }

    // Filter active pricing plans
    const activePlans = pricingData.pricing_plans.filter(
      (plan) => !plan.status || plan.status !== "inactive"
    );

    if (activePlans.length === 0) return;

    // Build AggregateOffer structured data
    const offers = activePlans.map((plan) => {
      // Extract numeric price
      let priceNum = 0;
      if (typeof plan.price === "string") {
        priceNum = parseFloat(plan.price.replace(/[₹,]/g, "")) || 0;
      } else if (typeof plan.price === "number") {
        priceNum = plan.price;
      }

      // Calculate duration in days
      const days = plan.duration_days || parseInt(plan.duration_months) * 30 || 30;

      return {
        "@type": "Offer",
        name: plan.name || "",
        price: priceNum,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: typeof window !== "undefined" ? `https://allexamquestions.com${window.location.pathname}` : "",
        validFor: {
          "@type": "Duration",
          durationValue: days,
          durationUnit: "DAY",
        },
      };
    });

    const pricingJsonLd = {
      "@context": "https://schema.org",
      "@type": "Course",
      name: courseTitle || "Exam Preparation Course",
      description: `${courseTitle} (${courseCode}) - Practice Exam Preparation`,
      provider:{
        "@type":"Organization",
        "name":"AllExamQuestions",
        "url":"https://allexamquestions.com"
      },
      "hasCourseInstance":{
        "@type":"CourseInstance",
        "CourseMode":"Online",
        "offers": {
          "@type": "AggregateOffer",
          priceCurrency: "INR",
          lowPrice: Math.min(...offers.map((o) => o.price)),
          highPrice: Math.max(...offers.map((o) => o.price)),
          offerCount: offers.length,
          offers: offers,
        },
      }

    }
    
    // Remove any existing pricing JSON-LD scripts
    const existingScripts = document.querySelectorAll("#pricing-json-ld-schema");
    existingScripts.forEach((script) => script.remove());

    // Create and inject script tag into document head
    const script = document.createElement("script");
    script.id = "pricing-json-ld-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(pricingJsonLd);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById("pricing-json-ld-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [pricingData, courseTitle, courseCode]);

  return null;
}

