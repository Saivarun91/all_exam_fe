"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Folder, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories/`);

        if (!res.ok) throw new Error("Failed to fetch categories");

        const data = await res.json();

        const activeCategories = Array.isArray(data)
          ? data.filter((cat) => cat.is_active !== false)
          : [];

        setCategories(activeCategories);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">

        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#0C1A35] mb-3">
            All Categories
          </h1>
          <p className="text-[#0C1A35]/70 max-w-2xl">
            Browse certification categories including cloud, security,
            networking, and more.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {categories.map((category) => (
            <Card
              key={category.id}
              className="hover:shadow-lg hover:-translate-y-1 transition-all border-[#DDE7FF]"
            >
              <CardContent className="p-6 space-y-4">

                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center">
                  <Folder className="w-6 h-6 text-[#1A73E8]" />
                </div>

                {/* Category Info */}
                <div>
                  <h3 className="text-xl font-bold text-[#0C1A35]">
                    {category.title}
                  </h3>

                  {category.description && (
                    <p className="text-sm text-[#0C1A35]/60 mt-1">
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Button */}
                <Button
                  asChild
                  className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0]"
                >
                  <Link href={`/categories/${category.slug}`}>
                    View Exams
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>

              </CardContent>
            </Card>
          ))}

        </div>
      </div>
    </div>
  );
}