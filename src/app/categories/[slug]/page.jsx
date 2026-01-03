"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Award, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getExamUrl } from "@/lib/utils";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug;

  const [category, setCategory] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        // Fetch category details
        const categoryRes = await fetch(`${API_BASE_URL}/api/categories/${slug}/`);
        
        if (!categoryRes.ok) throw new Error("Category not found");
        
        const categoryData = await categoryRes.json();
        setCategory(categoryData);

        // Fetch courses for this category using the dedicated endpoint
        const coursesRes = await fetch(`${API_BASE_URL}/api/courses/category/${slug}/`);
        
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          const filteredCourses = Array.isArray(coursesData) 
            ? coursesData.filter(course => course.is_active !== false)
            : [];
          setCourses(filteredCourses);
        } else {
          console.error('Failed to fetch courses:', coursesRes.status);
          setCourses([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
          <p className="text-[#0C1A35]/70">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-[#0C1A35] mb-4">Category Not Found</h1>
          <p className="text-[#0C1A35]/70 mb-6">
            The category you're looking for doesn't exist.
          </p>
          <Button asChild className="bg-[#1A73E8] text-white hover:bg-[#1557B0]">
            <Link href="/exams">Browse All Exams</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Prepare breadcrumb items for schema
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Exams", url: "/exams" },
    { name: category?.title || "Category", url: `/categories/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-white">
      {category && <BreadcrumbJsonLd items={breadcrumbItems} />}
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="text-[#0C1A35]/60 hover:text-[#1A73E8]">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/exams" className="text-[#0C1A35]/60 hover:text-[#1A73E8]">Exams</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="text-[#0C1A35] font-medium">{category.title}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0C1A35] mb-4">{category.title}</h1>
          {category.description && (
            <p className="text-lg text-[#0C1A35]/70 max-w-3xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200">
          <div>
            <div className="text-3xl font-bold text-[#1A73E8]">{courses.length}</div>
            <div className="text-sm text-[#0C1A35]/60">Exams Available</div>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="hover:shadow-lg hover:-translate-y-1 transition-all border-[#DDE7FF] cursor-pointer"
                onClick={() => {
                  window.location.href = getExamUrl(course);
                }}
              >
                <CardContent className="p-6 space-y-4">
                  {/* Icon + Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-lg bg-[#1A73E8]/10 flex items-center justify-center">
                      <Award className="w-6 h-6 text-[#1A73E8]" />
                    </div>
                    {course.badge && (
                      <Badge className="bg-[#1A73E8]/10 text-[#1A73E8] text-xs">
                        {course.badge}
                      </Badge>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="space-y-1">
                    <p className="text-sm text-[#0C1A35]/60 font-medium">
                      {course.provider}
                    </p>
                    <h3 className="text-xl font-bold text-[#0C1A35] leading-tight">
                      {course.title}
                    </h3>
                    <p className="text-sm text-[#0C1A35]/60">{course.code}</p>
                  </div>

                  {/* Stats */}
                  <div className="pt-2">
                    <p className="text-sm text-[#0C1A35]/60">
                      {course.practice_exams || 0} Practice Exams · {(() => {
                        // Calculate total questions from practice tests list if available
                        if (course.practice_tests_list && Array.isArray(course.practice_tests_list) && course.practice_tests_list.length > 0) {
                          const totalQuestions = course.practice_tests_list.reduce((sum, test) => {
                            const testQuestions = parseInt(test.questions) || 0;
                            return sum + testQuestions;
                          }, 0);
                          return totalQuestions > 0 ? totalQuestions : (course.questions || 0);
                        }
                        return course.questions || 0;
                      })()} Questions
                    </p>
                  </div>

                  {/* Button */}
                  <Button
                    className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0]"
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href={getExamUrl(course)}>
                      Start Practicing
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#0C1A35] mb-2">No Exams Found</h3>
            <p className="text-[#0C1A35]/60 mb-6">
              No exams are currently available in this category.
            </p>
            <Button asChild className="bg-[#1A73E8] text-white hover:bg-[#1557B0]">
              <Link href="/exams">Browse All Exams</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

