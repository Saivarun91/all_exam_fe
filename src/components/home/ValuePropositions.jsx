// "use client";

// import { useState, useEffect } from "react";
// import { Gift, Clock, Brain, CheckCircle, Users, FileText } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// // Icon mapping
// const iconMap = {
//   Gift,
//   Clock,
//   Brain,
//   CheckCircle,
//   Users,
//   FileText,
// };

// export default function ValuePropositions() {
//   const [features, setFeatures] = useState([]);
//   const [section, setSection] = useState({
//     heading: "Why Choose AllExamQuestions?",
//     subtitle: "Everything you need to ace your certification exam in one place",
//     heading_font_family: "font-bold",
//     heading_font_size: "text-4xl",
//     heading_color: "text-[#0C1A35]",
//     subtitle_font_size: "text-lg",
//     subtitle_color: "text-[#0C1A35]/70"
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch section settings
//     fetch(`${API_BASE_URL}/api/home/value-propositions-section/`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success && data.data) {
//           setSection(data.data);
//         }
//       })
//       .catch((err) => console.error("Error fetching section settings:", err));
    
//     // Fetch value propositions
//     fetch(`${API_BASE_URL}/api/home/value-propositions/`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success && data.data) {
//           // Only show active value propositions
//           const activeFeatures = data.data.filter(f => f.is_active);
//           setFeatures(activeFeatures);
//         }
//       })
//       .catch((err) => console.error("Error fetching value propositions:", err))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) {
//     return (
//       <section className="py-20 bg-[#0F1F3C]/10">
//         <div className="container mx-auto px-4 text-center">
//           <p className="text-[#0C1A35]/70">Loading...</p>
//         </div>
//       </section>
//     );
//   }

//   if (!features.length) {
//     return null; // Hide section if no active value propositions
//   }

//   return (
//     <section className="py-20 bg-[#0F1F3C]/10">
//       <div className="container mx-auto px-4">
//         <h2 className={`${section.heading_font_size} ${section.heading_font_family} ${section.heading_color} text-center mb-4`}>
//           {section.heading}
//         </h2>

//         <p className={`text-center ${section.subtitle_color} ${section.subtitle_font_size} mb-12 max-w-2xl mx-auto`}>
//           {section.subtitle}
//         </p>

//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {features.map((feature, index) => {
//             const Icon = iconMap[feature.icon] || Gift;
//             return (
//               <Card
//                 key={feature.id || index}
//                 className="border-[#D3E3FF] bg-white hover:shadow-[0_8px_24px_rgba(26,115,232,0.15)] transition-shadow"
//               >
//                 <CardContent className="p-6 text-center space-y-4">
//                   <div className="w-16 h-16 rounded-full bg-[#1A73E8]/10 flex items-center justify-center mx-auto">
//                     <Icon className="w-8 h-8 text-[#1A73E8]" />
//                   </div>

//                   <h3 className="text-xl font-bold text-[#0C1A35]">
//                     {feature.title}
//                   </h3>

//                   <p className="text-[#0C1A35]/70">
//                     {feature.description}
//                   </p>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }

