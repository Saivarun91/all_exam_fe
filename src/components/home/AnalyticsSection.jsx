"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

// Import images from src/assets directory
import avatarJohn from "@/assets/avatar-john.jpg";
import avatarSarah from "@/assets/avatar-sarah.jpg";
import avatarRaj from "@/assets/avatar-raj.jpg";
import avatarAlex from "@/assets/avatar-alex.jpg";

const AnalyticsSection = () => {
  const testimonials = [
    {
      avatar: avatarJohn,
      initial: "JD",
      name: "John D.",
      certification: "AWS Solutions Architect",
      quote:
        "AllExamQuestions helped me pass on my first attempt. The questions were extremely close to the real exam.",
      rating: 5,
    },
    {
      avatar: avatarSarah,
      initial: "SM",
      name: "Sarah M.",
      certification: "Azure Administrator",
      quote:
        "The practice questions were spot-on. I felt completely prepared walking into my certification exam.",
      rating: 5,
    },
    {
      avatar: avatarRaj,
      initial: "RK",
      name: "Raj K.",
      certification: "CompTIA Security+",
      quote:
        "Best exam prep platform I've used. The quality and accuracy of questions is unmatched.",
      rating: 5,
    },
    {
      avatar: avatarAlex,
      initial: "AL",
      name: "Alex L.",
      certification: "CISSP Certified",
      quote:
        "Thanks to this platform, I cleared my CISSP on the first try. Highly recommended for serious learners.",
      rating: 5,
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-[#0C1A35] to-[#0E2444]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-[#F5F8FF]">
            Success Stories From Real Learners
          </h2>
          <p className="text-[#E7ECF6]/80 text-lg">
            Real experiences from professionals who passed using AllExamQuestions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-white border-[#DDE7FF] shadow-[0_4px_16px_rgba(26,115,232,0.15)] hover:shadow-[0_8px_24px_rgba(26,115,232,0.25)] hover:-translate-y-1 transition-all"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={testimonial.avatar.src}
                      alt={testimonial.name}
                    />
                    <AvatarFallback className="bg-[#1A73E8] text-white font-semibold text-lg">
                      {testimonial.initial}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-bold text-[#0C1A35]">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-[#0C1A35]/60">
                      {testimonial.certification}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-0.5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-[#1A73E8] text-[#1A73E8]"
                    />
                  ))}
                </div>

                <p className="text-sm text-[#0C1A35]/80 leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;


// "use client";

// import { useEffect, useState } from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Card, CardContent } from "@/components/ui/card";
// import { Star } from "lucide-react";

// const AnalyticsSection = () => {
//   const [testimonials, setTestimonials] = useState([]);

//   useEffect(() => {
//     async function fetchTestimonials() {
//       try {
//         // Replace this URL with your real API endpoint
//         const response = await fetch("/api/testimonials");
//         const data = await response.json();
//         setTestimonials(data);
//       } catch (error) {
//         console.error("Failed to fetch testimonials:", error);
//         // Optional fallback data
//         setTestimonials([]);
//       }
//     }

//     fetchTestimonials();
//   }, []);

//   if (testimonials.length === 0) {
//     return (
//       <section className="py-16 bg-gradient-to-br from-[#0C1A35] to-[#0E2444]">
//         <div className="container mx-auto px-4 text-center text-[#F5F8FF]">
//           Loading testimonials...
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="py-16 bg-gradient-to-br from-[#0C1A35] to-[#0E2444]">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="text-4xl font-bold mb-4 text-[#F5F8FF]">
//             Success Stories From Real Learners
//           </h2>
//           <p className="text-[#E7ECF6]/80 text-lg">
//             Real experiences from professionals who passed using AllExamQuestions
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
//           {testimonials.map((testimonial, index) => (
//             <Card
//               key={index}
//               className="bg-white border-[#DDE7FF] shadow-[0_4px_16px_rgba(26,115,232,0.15)] hover:shadow-[0_8px_24px_rgba(26,115,232,0.25)] hover:-translate-y-1 transition-all"
//             >
//               <CardContent className="p-6 space-y-4">
//                 <div className="flex items-center gap-3">
//                   <Avatar className="w-12 h-12">
//                     {testimonial.avatar ? (
//                       <AvatarImage
//                         src={testimonial.avatar}
//                         alt={testimonial.name}
//                       />
//                     ) : (
//                       <AvatarFallback className="bg-[#1A73E8] text-white font-semibold text-lg">
//                         {testimonial.initial || testimonial.name.charAt(0)}
//                       </AvatarFallback>
//                     )}
//                   </Avatar>

//                   <div>
//                     <div className="font-bold text-[#0C1A35]">{testimonial.name}</div>
//                     <div className="text-xs text-[#0C1A35]/60">{testimonial.certification}</div>
//                   </div>
//                 </div>

//                 {/* Rating */}
//                 <div className="flex gap-0.5">
//                   {[...Array(testimonial.rating || 5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className="w-4 h-4 fill-[#1A73E8] text-[#1A73E8]"
//                     />
//                   ))}
//                 </div>

//                 <p className="text-sm text-[#0C1A35]/80 leading-relaxed">
//                   "{testimonial.quote}"
//                 </p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AnalyticsSection;
