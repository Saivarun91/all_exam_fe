// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Mail, Phone, MapPin, Globe, ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export default function ContactUs() {
//   const router = useRouter();
//   const [contactDetails, setContactDetails] = useState({
//     email: "",
//     phone: "",
//     address: "",
//     website: ""
//   });
//   const [metaTitle, setMetaTitle] = useState("");
//   const [metaKeywords, setMetaKeywords] = useState("");
//   const [metaDescription, setMetaDescription] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   const handleBack = () => {
//     if (typeof window !== "undefined") {
//       // Check if there's history to go back to
//       if (window.history.length > 1) {
//         router.back();
//       } else {
//         // Fallback to home page if no history
//         router.push("/");
//       }
//     }
//   };

//   useEffect(() => {
//     const fetchContactDetails = async () => {
//       try {
//         const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
//         const res = await fetch(`${API_BASE_URL}/api/settings/contact-us/`);
        
//         if (!res.ok) {
//           throw new Error("Failed to fetch contact details");
//         }
        
//         const result = await res.json();
        
//         if (result.success) {
//           setContactDetails({
//             email: result.contact_email || "",
//             phone: result.contact_phone || "",
//             address: result.contact_address || "",
//             website: result.contact_website || ""
//           });
//           setMetaTitle(result.meta_title || "");
//           setMetaKeywords(result.meta_keywords || "");
//           setMetaDescription(result.meta_description || "");
//         } else {
//           throw new Error(result.error || "Failed to load contact details");
//         }
        
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching contact details:", err);
//         setError(true);
//         setLoading(false);
//       }
//     };

//     fetchContactDetails();
//   }, []);

//   // Set SEO meta tags and canonical URL
//   useEffect(() => {
//     if (typeof window !== "undefined" && !loading) {
//       // Set page title (use admin-provided or default)
//       const title = metaTitle || "Contact Us - AllExamQuestions | Get in Touch | Support & Help";
//       document.title = title;
      
//       // Set meta description (use admin-provided or default)
//       const description = metaDescription || "Contact AllExamQuestions for support, inquiries, or assistance. Find our email, phone number, address, and website. Get help with exam preparation, practice tests, and course enrollment.";
//       let metaDesc = document.querySelector('meta[name="description"]');
//       if (!metaDesc) {
//         metaDesc = document.createElement("meta");
//         metaDesc.setAttribute("name", "description");
//         document.head.appendChild(metaDesc);
//       }
//       metaDesc.setAttribute("content", description);
      
//       // Set meta keywords (use admin-provided or default)
//       const keywords = metaKeywords || "contact AllExamQuestions, support, customer service, help, inquiry, exam preparation support, practice test help, contact information";
//       let metaKw = document.querySelector('meta[name="keywords"]');
//       if (!metaKw) {
//         metaKw = document.createElement("meta");
//         metaKw.setAttribute("name", "keywords");
//         document.head.appendChild(metaKw);
//       }
//       metaKw.setAttribute("content", keywords);
      
//       // Set canonical URL
//       const canonicalUrl = "https://allexamquestions.com/contact-us";
//       let canonicalLink = document.querySelector('link[rel="canonical"]');
//       if (!canonicalLink) {
//         canonicalLink = document.createElement("link");
//         canonicalLink.setAttribute("rel", "canonical");
//         document.head.appendChild(canonicalLink);
//       }
//       canonicalLink.setAttribute("href", canonicalUrl);
//     }
//   }, [metaTitle, metaKeywords, metaDescription, loading]);

//   if (loading) {
//     return (
//       <div className="py-16 bg-background">
//         <div className="container mx-auto px-4 max-w-5xl">
//           <div className="flex items-center justify-center min-h-[400px]">
//             <p className="text-gray-500">Loading contact information...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="py-16 bg-background">
//         <div className="container mx-auto px-4 max-w-5xl">
//           <div className="flex items-center justify-center min-h-[400px]">
//             <p className="text-red-500">Failed to load contact information. Please try again later.</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const hasContactInfo = contactDetails.email || contactDetails.phone || contactDetails.address || contactDetails.website;

//   return (
//     <div className="py-16 bg-background">
//       <div className="container mx-auto px-4 max-w-5xl">
//         <Button
//           variant="ghost"
//           onClick={handleBack}
//           className="mb-6 text-foreground hover:text-foreground hover:bg-gray-100"
//         >
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back
//         </Button>
//         <div className="text-center mb-12">
//           <h1 className="text-5xl font-bold mb-4 text-foreground">
//             Contact Us
//           </h1>
//           <p className="text-muted-foreground text-lg">
//             Get in touch with us
//           </p>
//         </div>

//         <div className="prose prose-lg max-w-none">
//           <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
//             {hasContactInfo ? (
//               <div className="space-y-6">
//                 {contactDetails.email && (
//                   <div className="flex items-start gap-4">
//                     <Mail className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
//                     <div>
//                       <h3 className="font-semibold text-foreground mb-1">Email</h3>
//                       <a 
//                         href={`mailto:${contactDetails.email.trim()}`}
//                         className="text-blue-600 hover:text-blue-800 transition-colors break-all"
//                       >
//                         {contactDetails.email.trim()}
//                       </a>
//                     </div>
//                   </div>
//                 )}
//                 {contactDetails.phone && (
//                   <div className="flex items-start gap-4">
//                     <Phone className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
//                     <div>
//                       <h3 className="font-semibold text-foreground mb-1">Phone</h3>
//                       <a 
//                         href={`tel:${contactDetails.phone.trim().replace(/\s+/g, '')}`}
//                         className="text-blue-600 hover:text-blue-800 transition-colors"
//                       >
//                         {contactDetails.phone.trim()}
//                       </a>
//                     </div>
//                   </div>
//                 )}
//                 {contactDetails.address && (
//                   <div className="flex items-start gap-4">
//                     <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
//                     <div>
//                       <h3 className="font-semibold text-foreground mb-1">Address</h3>
//                       <p className="text-foreground whitespace-pre-line">
//                         {contactDetails.address.trim()}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//                 {contactDetails.website && (
//                   <div className="flex items-start gap-4">
//                     <Globe className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
//                     <div>
//                       <h3 className="font-semibold text-foreground mb-1">Website</h3>
//                       <a 
//                         href={contactDetails.website.trim().startsWith('http') ? contactDetails.website.trim() : `https://${contactDetails.website.trim()}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-600 hover:text-blue-800 transition-colors break-all"
//                       >
//                         {contactDetails.website.trim().replace(/^https?:\/\//, '')}
//                       </a>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <p className="text-muted-foreground">Contact information will be updated by admin.</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }








import { Mail, Phone, MapPin, Globe } from "lucide-react";
import BackButton from "./BackButton"; // small client component for interactive back button

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// SEO metadata
export const metadata = {
  title: "Contact Us - AllExamQuestions | Get in Touch | Support & Help",
  description:
    "Contact AllExamQuestions for support, inquiries, or assistance. Find our email, phone number, address, and website. Get help with exam preparation, practice tests, and course enrollment.",
  keywords:
    "contact AllExamQuestions, support, customer service, help, inquiry, exam preparation support, practice test help, contact information",
  alternates: {
    canonical: "https://allexamquestions.com/contact-us",
  },
};

async function fetchContactData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings/contact-us/`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch contact details");
    const result = await res.json();

    if (result.success) {
      return {
        contactDetails: {
          email: result.contact_email || "",
          phone: result.contact_phone || "",
          address: result.contact_address || "",
          website: result.contact_website || "",
        },
        error: false,
      };
    } else {
      throw new Error(result.error || "Failed to load contact details");
    }
  } catch (err) {
    console.error(err);
    return {
      contactDetails: { email: "", phone: "", address: "", website: "" },
      error: true,
    };
  }
}

export default async function ContactUsPage() {
  const { contactDetails, error } = await fetchContactData();
  const hasContactInfo =
    contactDetails.email || contactDetails.phone || contactDetails.address || contactDetails.website;

  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back button (client component) */}
        <BackButton />

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Contact Us</h1>
          <p className="text-muted-foreground text-lg">Get in touch with us</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            {error ? (
              <p className="text-red-500">Failed to load contact information. Please try again later.</p>
            ) : hasContactInfo ? (
              <div className="space-y-6">
                {contactDetails.email && (
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email</h3>
                      <a
                        href={`mailto:${contactDetails.email.trim()}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors break-all"
                      >
                        {contactDetails.email.trim()}
                      </a>
                    </div>
                  </div>
                )}
                {contactDetails.phone && (
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                      <a
                        href={`tel:${contactDetails.phone.trim().replace(/\s+/g, "")}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {contactDetails.phone.trim()}
                      </a>
                    </div>
                  </div>
                )}
                {contactDetails.address && (
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Address</h3>
                      <p className="text-foreground whitespace-pre-line">{contactDetails.address.trim()}</p>
                    </div>
                  </div>
                )}
                {contactDetails.website && (
                  <div className="flex items-start gap-4">
                    <Globe className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Website</h3>
                      <a
                        href={
                          contactDetails.website.trim().startsWith("http")
                            ? contactDetails.website.trim()
                            : `https://${contactDetails.website.trim()}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors break-all"
                      >
                        {contactDetails.website.trim().replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Contact information will be updated by admin.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}