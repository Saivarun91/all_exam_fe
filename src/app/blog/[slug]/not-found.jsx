import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPostNotFound() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[#0C1A35] mb-4">Blog Post Not Found</h1>
          <p className="text-[#0C1A35]/70 mb-6">
            The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
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
