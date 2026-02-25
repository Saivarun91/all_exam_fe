// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
// import Link from "next/link";
// import { getOptimizedImageUrl } from "@/utils/imageUtils";
// import BlogCollectionJsonLd from "@/components/BlogCollectionJsonLd";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// const BlogSection = () => {
//   const [articles, setArticles] = useState([]);
//   const [sectionSettings, setSectionSettings] = useState({
//     heading: "Latest Blog Posts",
//     subtitle: "Stay updated with certification tips and news",
//   });
//   const [loading, setLoading] = useState(true);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const carouselRef = useRef(null);

//   useEffect(() => {
//     // Fetch section settings
//     fetch(`${API_BASE_URL}/api/home/blog-posts-section/`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success && data.data) {
//           setSectionSettings(data.data);
//         }
//       })
//       .catch((err) => console.error("Error fetching section settings:", err));
    
//     const fetchBlogs = async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/api/home/blog-posts/`);
//         const data = await res.json();
        
//         if (data.success && data.data && Array.isArray(data.data)) {
//           // Backend already filters for featured and active, so use all returned posts
//           setArticles(data.data);
//         } else {
//           console.log("No blog posts found or invalid response:", data);
//           setArticles([]);
//         }
//       } catch (err) {
//         console.error("Error fetching blog posts:", err);
//         setArticles([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBlogs();
//   }, []);

//   // Items to show at once (responsive)
//   const [itemsPerView, setItemsPerView] = useState(3);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 768) {
//         setItemsPerView(1);
//       } else if (window.innerWidth < 1024) {
//         setItemsPerView(2);
//       } else {
//         setItemsPerView(3);
//       }
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const maxIndex = Math.max(0, articles.length - itemsPerView);

//   const handlePrev = () => {
//     setCurrentIndex((prev) => Math.max(0, prev - 1));
//   };

//   const handleNext = () => {
//     setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
//   };

//   if (loading) {
//     return (
//       <section className="py-12 md:py-20 bg-[#F5F8FC]">
//         <div className="container mx-auto px-4 text-center">
//           <p className="text-[#0C1A35]/70 text-sm md:text-base">Loading articles...</p>
//         </div>
//       </section>
//     );
//   }

//   if (!articles.length) {
//     return null; // Hide section if no articles
//   }

//   return (
//     <section className="py-12 md:py-20 bg-[#F5F8FC]">
//       {articles.length > 0 && <BlogCollectionJsonLd articles={articles} />}
//       <div className="container mx-auto px-4">
//         <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4 text-[#0C1A35] px-2">
//           {sectionSettings.heading || "Latest Blog Posts"}
//         </h2>
//         {sectionSettings.subtitle && (
//           <p className="text-center text-[#0C1A35]/70 mb-8 md:mb-12 text-sm sm:text-base md:text-lg px-2">
//             {sectionSettings.subtitle}
//           </p>
//         )}

//         {/* Carousel Container */}
//         <div className="relative">
//           {/* Navigation Buttons */}
//           {articles.length > itemsPerView && (
//             <>
//               <Button
//                 onClick={handlePrev}
//                 disabled={currentIndex === 0}
//                 className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full w-12 h-12 bg-white hover:bg-gray-100 text-[#1A73E8] shadow-lg disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200"
//                 size="icon"
//               >
//                 <ChevronLeft className="w-6 h-6" />
//               </Button>
//               <Button
//                 onClick={handleNext}
//                 disabled={currentIndex >= maxIndex}
//                 className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full w-12 h-12 bg-white hover:bg-gray-100 text-[#1A73E8] shadow-lg disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200"
//                 size="icon"
//               >
//                 <ChevronRight className="w-6 h-6" />
//               </Button>
//             </>
//           )}

//           {/* Carousel Track */}
//           <div className="overflow-hidden" ref={carouselRef}>
//             <div
//               className="flex transition-transform duration-500 ease-in-out gap-6"
//               style={{
//                 transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
//               }}
//             >
//               {articles.map((article, index) => {
//                 // Generate SEO-friendly blog URL
//                 const blogUrl = article.slug ? `/blog/${article.slug}` : '#';
                
//                 return (
//                   <div
//                     key={article.id || index}
//                     className="flex-shrink-0"
//                     style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 24 / itemsPerView}px)` }}
//                   >
//                     <Link 
//                       href={blogUrl}
//                       className="block group h-full"
//                     >
//                       <Card
//                         className="overflow-hidden hover:shadow-[0_8px_24px_rgba(26,115,232,0.15)] hover:-translate-y-1 transition-all duration-300 border-[#DDE7FF] cursor-pointer bg-white h-full flex flex-col"
//                       >
//                         {/* Blog Image */}
//                         {article.image_url ? (
//                           <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
//                             <img
//                               src={getOptimizedImageUrl(article.image_url, 400, 225)}
//                               alt={article.meta_title || article.title}
//                               title={article.meta_title || article.title}
//                               width={400}
//                               height={225}
//                               className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
//                               style={{ objectFit: 'contain' }}
//                               loading="lazy"
//                               sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
//                               decoding="async"
//                               onError={(e) => {
//                                 e.target.src = 'https://via.placeholder.com/400x300/1A73E8/ffffff?text=Blog+Post';
//                               }}
//                             />
//                             {article.category && (
//                               <div className="absolute top-3 left-3">
//                                 <span className="bg-[#1A73E8] text-white text-xs font-semibold px-3 py-1 rounded-full">
//                                   {article.category}
//                                 </span>
//                               </div>
//                             )}
//                           </div>
//                         ) : (
//                           <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#1A73E8]/10 to-purple-500/10 flex items-center justify-center">
//                             <span className="text-[#0C1A35]/30 text-sm">No image</span>
//                           </div>
//                         )}

//                         <CardContent className="p-6 space-y-3 flex-1 flex flex-col">
//                           {/* Blog Title */}
//                           <h3 className="text-xl font-bold text-[#0C1A35] group-hover:text-[#1A73E8] transition-colors line-clamp-2">
//                             {article.title}
//                           </h3>

//                           {/* Blog Excerpt */}
//                           <p className="text-[#0C1A35]/70 text-sm line-clamp-3 flex-1">
//                             {article.excerpt}
//                           </p>

//                           {/* Read More Button */}
//                           <div className="flex items-center text-[#1A73E8] font-semibold group-hover:translate-x-2 transition-transform pt-2">
//                             Read More
//                             <ArrowRight className="ml-2 w-4 h-4" />
//                           </div>
//                         </CardContent>
//                       </Card>
//                     </Link>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Dots Indicator */}
//           {articles.length > itemsPerView && (
//             <div className="flex justify-center gap-2 mt-8">
//               {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => setCurrentIndex(idx)}
//                   className={`w-2 h-2 rounded-full transition-all ${
//                     idx === currentIndex
//                       ? "bg-[#1A73E8] w-8"
//                       : "bg-gray-300 hover:bg-gray-400"
//                   }`}
//                   aria-label={`Go to slide ${idx + 1}`}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }

// export default BlogSection;




// import Link from "next/link";
// import { Card, CardContent } from "@/components/ui/card";
// import { ArrowRight } from "lucide-react";
// import { getOptimizedImageUrl } from "@/utils/imageUtils";
// import BlogCollectionJsonLd from "@/components/BlogCollectionJsonLd";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// // Fetch blog posts and section settings server-side
// async function fetchBlogData() {
//   try {
//     const [blogsRes, settingsRes] = await Promise.all([
//       fetch(`${API_BASE_URL}/api/home/blog-posts/`, { next: { revalidate: 60 } }),
//       fetch(`${API_BASE_URL}/api/home/blog-posts-section/`, { next: { revalidate: 60 } }),
//     ]);

//     const blogsData = await blogsRes.json();
//     const settingsData = await settingsRes.json();

//     const articles = blogsData.success && Array.isArray(blogsData.data) ? blogsData.data : [];
//     const sectionSettings = settingsData.success && settingsData.data ? settingsData.data : {
//       heading: "Latest Blog Posts",
//       subtitle: "Stay updated with certification tips and news",
//     };

//     return { articles, sectionSettings };
//   } catch (err) {
//     console.error("Error fetching blog section data:", err);
//     return { articles: [], sectionSettings: { heading: "Latest Blog Posts", subtitle: "Stay updated with certification tips and news" } };
//   }
// }

// export default async function BlogSection() {
//   const { articles, sectionSettings } = await fetchBlogData();

//   if (!articles.length) return null; // hide section if no articles

//   return (
//     <section className="py-12 md:py-20 bg-[#F5F8FC]">
//       {articles.length > 0 && <BlogCollectionJsonLd articles={articles} />}
//       <div className="container mx-auto px-4">
//         <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4 text-[#0C1A35] px-2">
//           {sectionSettings.heading || "Latest Blog Posts"}
//         </h2>
//         {sectionSettings.subtitle && (
//           <p className="text-center text-[#0C1A35]/70 mb-8 md:mb-12 text-sm sm:text-base md:text-lg px-2">
//             {sectionSettings.subtitle}
//           </p>
//         )}

//         {/* Blog List (all items visible server-side) */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {articles.map((article) => {
//             const blogUrl = article.slug ? `/blog/${article.slug}` : "#";
//             return (
//               <Link key={article.id} href={blogUrl} className="block group h-full">
//                 <Card className="overflow-hidden hover:shadow-[0_8px_24px_rgba(26,115,232,0.15)] hover:-translate-y-1 transition-all duration-300 border-[#DDE7FF] cursor-pointer bg-white h-full flex flex-col">
//                   {article.image_url ? (
//                     <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
//                       <img
//                         src={getOptimizedImageUrl(article.image_url, 400, 225)}
//                         alt={article.meta_title || article.title}
//                         title={article.meta_title || article.title}
//                         width={400}
//                         height={225}
//                         className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
//                         style={{ objectFit: 'contain' }}
//                         loading="lazy"
//                         sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
//                         decoding="async"
//                         onError={(e) => {
//                           e.target.src = 'https://via.placeholder.com/400x300/1A73E8/ffffff?text=Blog+Post';
//                         }}
//                       />
//                       {article.category && (
//                         <div className="absolute top-3 left-3">
//                           <span className="bg-[#1A73E8] text-white text-xs font-semibold px-3 py-1 rounded-full">
//                             {article.category}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#1A73E8]/10 to-purple-500/10 flex items-center justify-center">
//                       <span className="text-[#0C1A35]/30 text-sm">No image</span>
//                     </div>
//                   )}

//                   <CardContent className="p-6 space-y-3 flex-1 flex flex-col">
//                     <h3 className="text-xl font-bold text-[#0C1A35] group-hover:text-[#1A73E8] transition-colors line-clamp-2">
//                       {article.title}
//                     </h3>
//                     <p className="text-[#0C1A35]/70 text-sm line-clamp-3 flex-1">
//                       {article.excerpt}
//                     </p>
//                     <div className="flex items-center text-[#1A73E8] font-semibold group-hover:translate-x-2 transition-transform pt-2">
//                       Read More
//                       <ArrowRight className="ml-2 w-4 h-4" />
//                     </div>
//                   </CardContent>
//                 </Card>
//               </Link>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }


// import Link from "next/link";
// import { Card, CardContent } from "@/components/ui/card";
// import { ArrowRight } from "lucide-react";
// import { getOptimizedImageUrl } from "@/utils/imageUtils";
// import BlogCollectionJsonLd from "@/components/BlogCollectionJsonLd";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// // Fetch blog posts and section settings server-side
// async function fetchBlogData() {
//   try {
//     const [blogsRes, settingsRes] = await Promise.all([
//       fetch(`${API_BASE_URL}/api/home/blog-posts/`, { next: { revalidate: 60 } }),
//       fetch(`${API_BASE_URL}/api/home/blog-posts-section/`, { next: { revalidate: 60 } }),
//     ]);

//     const blogsData = await blogsRes.json();
//     const settingsData = await settingsRes.json();

//     const articles = blogsData?.success && Array.isArray(blogsData.data) ? blogsData.data : [];
//     const sectionSettings = settingsData?.success && settingsData.data ? settingsData.data : {
//       heading: "Latest Blog Posts",
//       subtitle: "Stay updated with certification tips and news",
//     };

//     return { articles, sectionSettings };
//   } catch (err) {
//     console.error("Error fetching blog section data:", err);
//     return { articles: [], sectionSettings: { heading: "Latest Blog Posts", subtitle: "Stay updated with certification tips and news" } };
//   }
// }

// export default async function BlogSection() {
//   const { articles, sectionSettings } = await fetchBlogData();

//   // If there are no articles, still return null (same as before)
//   if (!articles.length) return null;

//   return (
//     <section className="py-12 md:py-20 bg-[#F5F8FC]">
//       {articles.length > 0 && <BlogCollectionJsonLd articles={articles} />}
//       <div className="container mx-auto px-4">
//         <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 md:mb-4 text-[#0C1A35] px-2">
//           {sectionSettings.heading || "Latest Blog Posts"}
//         </h2>
//         {sectionSettings.subtitle && (
//           <p className="text-center text-[#0C1A35]/70 mb-8 md:mb-12 text-sm sm:text-base md:text-lg px-2">
//             {sectionSettings.subtitle}
//           </p>
//         )}

//         {/* Blog List */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {articles.map((article) => {
//             const blogUrl = article.slug ? `/blog/${article.slug}` : "#";
//             return (
//               <Link key={article.id} href={blogUrl} className="block group h-full">
//                 <Card className="overflow-hidden hover:shadow-[0_8px_24px_rgba(26,115,232,0.15)] hover:-translate-y-1 transition-all duration-300 border-[#DDE7FF] cursor-pointer bg-white h-full flex flex-col">
//                   {article.image_url ? (
//                     <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
//                       <img
//                         src={getOptimizedImageUrl(article.image_url, 400, 225)}
//                         alt={article.meta_title || article.title}
//                         title={article.meta_title || article.title}
//                         width={400}
//                         height={225}
//                         className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
//                         style={{ objectFit: 'contain' }}
//                         loading="lazy"
//                         sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
//                         decoding="async"
//                         onError={(e) => {
//                           e.target.src = 'https://via.placeholder.com/400x300/1A73E8/ffffff?text=Blog+Post';
//                         }}
//                       />
//                       {article.category && (
//                         <div className="absolute top-3 left-3">
//                           <span className="bg-[#1A73E8] text-white text-xs font-semibold px-3 py-1 rounded-full">
//                             {article.category}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#1A73E8]/10 to-purple-500/10 flex items-center justify-center">
//                       <span className="text-[#0C1A35]/30 text-sm">No image</span>
//                     </div>
//                   )}

//                   <CardContent className="p-6 space-y-3 flex-1 flex flex-col">
//                     <h3 className="text-xl font-bold text-[#0C1A35] group-hover:text-[#1A73E8] transition-colors line-clamp-2">
//                       {article.title}
//                     </h3>
//                     <p className="text-[#0C1A35]/70 text-sm line-clamp-3 flex-1">
//                       {article.excerpt}
//                     </p>
//                     <div className="flex items-center text-[#1A73E8] font-semibold group-hover:translate-x-2 transition-transform pt-2">
//                       Read More
//                       <ArrowRight className="ml-2 w-4 h-4" />
//                     </div>
//                   </CardContent>
//                 </Card>
//               </Link>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }



import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import BlogCollectionJsonLd from "@/components/BlogCollectionJsonLd";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function fetchBlogData() {
  try {
    const [blogsRes, settingsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/home/blog-posts/`, { next: { revalidate: 60 } }),
      fetch(`${API_BASE_URL}/api/home/blog-posts-section/`, {
        next: { revalidate: 60 },
      }),
    ]);

    const blogsData = await blogsRes.json();
    const settingsData = await settingsRes.json();

    return {
      articles:
        blogsData?.success && Array.isArray(blogsData.data)
          ? blogsData.data
          : [],
      sectionSettings:
        settingsData?.success && settingsData.data
          ? settingsData.data
          : {
              heading: "Latest Blog Posts",
              subtitle: "Stay updated with certification tips",
            },
    };
  } catch {
    return { articles: [], sectionSettings: {} };
  }
}

export default async function BlogSection() {
  const { articles, sectionSettings } = await fetchBlogData();

  if (!articles.length) return null;

  return (
    <section className="py-16 bg-[#F5F8FC]">
      {articles.length > 0 && <BlogCollectionJsonLd articles={articles} />}

      <div className="container mx-auto px-4">

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-[#0C1A35]">
          {sectionSettings.heading || "Latest Blog Posts"}
        </h2>

        {sectionSettings.subtitle && (
          <p className="text-center text-[#0C1A35]/70 mb-12">
            {sectionSettings.subtitle}
          </p>
        )}

        {/* CARDS ROW */}
        <div className="flex gap-8 overflow-x-auto pb-3">

          {articles.map((article) => {

            const blogUrl = article.slug ? `/blog/${article.slug}` : "#";

            const imgSrc = article.image_url
              ? getOptimizedImageUrl(article.image_url, 600, 340)
              : "https://via.placeholder.com/600x340";

            return (

              <Link
                key={article.id}
                href={blogUrl}
                className="min-w-[360px] max-w-[360px] flex-shrink-0"
              >

                <Card className="overflow-hidden bg-white border-[#DDE7FF] hover:shadow-xl hover:-translate-y-1 transition duration-300 h-full flex flex-col">

                  {/* IMAGE */}
                  <div className="relative w-full h-[220px] bg-gray-100">

                    <img
                      src={imgSrc}
                      alt={article.title}
                      className="w-full h-full object-cover transition duration-500 hover:scale-105"
                      loading="lazy"
                    />

                    {article.category && (
                      <span className="absolute top-3 left-3 bg-[#1A73E8] text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                    )}
                  </div>

                  {/* CONTENT */}
                  <CardContent className="p-6 flex flex-col flex-1">

                    <h3 className="text-xl font-bold text-[#0C1A35] mb-2 line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-[#0C1A35]/70 text-sm flex-1 line-clamp-3">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center text-[#1A73E8] font-semibold pt-4">
                      Read More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>

                  </CardContent>

                </Card>

              </Link>

            );
          })}

        </div>
      </div>
    </section>
  );
}