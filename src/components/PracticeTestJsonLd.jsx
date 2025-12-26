/**
 * Practice Test JSON-LD Structured Data Component
 * Renders Schema.org Course/EducationalOccupationalProgram JSON-LD script tag
 */

import { useEffect } from "react";

export default function PracticeTestJsonLd({ exam, practiceTests }) {
  useEffect(() => {
    if (!exam) return;

    // Build Course structured data
    const courseJsonLd = {
      "@context": "https://schema.org",
      "@type": "Course",
      name: exam.title || exam.name || "",
      description: exam.description || exam.meta_description || `Practice tests for ${exam.title || ""}`,
      provider: {
        "@type": "Organization",
        name: exam.provider || "AllExamQuestions",
        url: "https://allexamquestions.com",
      },
      courseCode: exam.code || exam.exam_code || "",
      educationalLevel: "Professional",
      ...(exam.duration && {
        timeRequired: exam.duration,
      }),
      ...(practiceTests && practiceTests.length > 0 && {
        numberOfCredits: {
          "@type": "StructuredValue",
          value: practiceTests.length,
        },
        coursePrerequisites: {
          "@type": "Course",
          name: "Basic understanding recommended",
        },
      }),
    };

    // Remove any existing practice test JSON-LD scripts
    const existingScripts = document.querySelectorAll("#practicetest-json-ld-schema");
    existingScripts.forEach((script) => script.remove());

    // Create and inject script tag into document head
    const script = document.createElement("script");
    script.id = "practicetest-json-ld-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(courseJsonLd);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById("practicetest-json-ld-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [exam, practiceTests]);

  return null;
}

