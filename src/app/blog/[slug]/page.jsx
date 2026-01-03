"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BlogJsonLd from "@/components/BlogJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { getOptimizedImageUrl } from "@/utils/imageUtils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/home/blog-posts/slug/${slug}/`);
        
        if (!res.ok) {
          throw new Error("Blog post not found");
        }
        
        const data = await res.json();
        if (data.success && data.data) {
          setBlog(data.data);
          
          // Set SEO meta tags
          const metaTitle = data.data.meta_title || data.data.title;
          document.title = `${metaTitle} | AllExamQuestions Blog`;
          
          const metaDescription = data.data.meta_description || data.data.excerpt;
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement("meta");
            metaDesc.name = "description";
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute("content", metaDescription);

          // Set canonical URL
          const currentPath = window.location.pathname;
          const canonicalUrl = `https://allexamquestions.com${currentPath}`;
          let canonicalLink = document.querySelector('link[rel="canonical"]');
          if (!canonicalLink) {
            canonicalLink = document.createElement("link");
            canonicalLink.setAttribute("rel", "canonical");
            document.head.appendChild(canonicalLink);
          }
          canonicalLink.setAttribute("href", canonicalUrl);
        } else {
          throw new Error("Blog post not found");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
            <p className="text-[#0C1A35]/70">Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-[#0C1A35] mb-4">Blog Post Not Found</h1>
            <p className="text-[#0C1A35]/70 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/blog">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare breadcrumb items for schema
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: blog?.title || "Blog Post", url: `/blog/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-white">
      {blog && <BlogJsonLd blog={blog} />}
      {blog && <BreadcrumbJsonLd items={breadcrumbItems} />}
      {/* Header with Back Button */}
      <div className="bg-white py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => {
              // Use browser history to go back to previous page
              if (window.history.length > 1) {
                router.back();
              } else {
                // If no history, navigate to home page
                router.push("/");
              }
            }}
            className="text-[#0C1A35] hover:text-[#1A73E8] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Blog Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Blog Header */}
        <header className="mb-8">
          {blog.category && (
            <div className="inline-block px-4 py-2 bg-[#1A73E8]/10 text-[#1A73E8] text-sm font-semibold rounded-full mb-4">
              {blog.category}
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#0C1A35] mb-6 leading-tight">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-[#0C1A35]/60 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {blog.created_at 
                  ? new Date(blog.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Date not available'}
              </span>
            </div>
            {blog.reading_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{blog.reading_time}</span>
              </div>
            )}
          </div>

          {blog.image_url && (
            <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={getOptimizedImageUrl(blog.image_url, 1200, 675)}
                alt={blog.title}
                width={1200}
                height={675}
                className="w-full h-full object-contain"
                style={{ objectFit: 'contain' }}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1200px"
                decoding="async"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400/1A73E8/ffffff?text=Blog+Post';
                }}
              />
            </div>
          )}
        </header>

        {/* Blog Content */}
        <div className="prose prose-lg max-w-none">
          {blog.content && blog.content.trim() ? (
            <div 
              className="tiptap-editor-content text-[#0C1A35]/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          ) : (
            <div className="text-[#0C1A35]/80 leading-relaxed whitespace-pre-wrap">
              {blog.excerpt || "No content available for this blog post."}
            </div>
          )}
        </div>

        {/* Back to Blog Button */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Button asChild variant="outline">
            <Link href="/blog">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to All Posts
            </Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
