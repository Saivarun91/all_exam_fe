"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import ReviewsJsonLd from "@/components/ReviewsJsonLd";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set page title
    document.title = "Testimonials - Success Stories | AllExamQuestions";
    
    const fetchTestimonials = async () => {
      try {
        // Request all testimonials (not just featured ones)
        const res = await fetch(`${API_BASE_URL}/api/home/testimonials/?all=true`);
        const data = await res.json();
        if (data.success && data.data) {
          setTestimonials(data.data);
        }
      } catch (err) {
        console.error("Error fetching testimonials:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <div className="py-20 bg-gradient-to-br from-[#F5F8FC] to-white">
      {testimonials.length > 0 && <ReviewsJsonLd testimonials={testimonials} itemName="AllExamQuestions" />}
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Quote className="w-12 h-12 text-[#1A73E8]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#0C1A35]">
              Testimonials
            </h1>
            <p className="text-lg text-[#0C1A35]/70 max-w-3xl mx-auto">
              Real experiences from professionals who passed using our platform
            </p>
            {testimonials.length > 0 && (
              <p className="text-sm text-[#0C1A35]/60 mt-2">
                {testimonials.length} {testimonials.length === 1 ? 'testimonial' : 'testimonials'} total
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <p className="text-[#0C1A35]/70">Loading testimonials...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && testimonials.length === 0 && (
            <div className="text-center py-20">
              <Quote className="w-16 h-16 text-[#0C1A35]/30 mx-auto mb-4" />
              <p className="text-[#0C1A35]/70 text-lg">No testimonials available yet.</p>
            </div>
          )}

          {/* Testimonials Grid */}
          {!loading && testimonials.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={testimonial.id || index}
                  className="border-2 border-gray-200 bg-white hover:shadow-[0_8px_24px_rgba(26,115,232,0.15)] transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Avatar and Name */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1A73E8] to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#0C1A35] text-lg">
                            {testimonial.name}
                          </h3>
                          {testimonial.verified && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" title="Verified" />
                          )}
                        </div>
                        <p className="text-sm text-[#0C1A35]/60 mt-1">
                          {testimonial.role || "Student"}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (testimonial.rating || 5)
                              ? "fill-[#1A73E8] text-[#1A73E8]"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-[#0C1A35]/60">
                        ({testimonial.rating || 5}/5)
                      </span>
                    </div>

                    {/* Testimonial Text */}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-[#0C1A35]/80 text-sm leading-relaxed">
                        "{testimonial.review || testimonial.text}"
                      </p>
                    </div>

                    {/* Source Badge */}
                    {testimonial.source && (
                      <div className="pt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-[#1A73E8]/10 text-[#1A73E8]">
                          {testimonial.source === 'testimonial' ? 'Featured' : 'Verified Review'}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
