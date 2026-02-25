// "use client";

// import { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Mail } from "lucide-react";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// const EmailSubscribe = () => {
//   const [sectionData, setSectionData] = useState(null);
//   const [email, setEmail] = useState("");
//   const [status, setStatus] = useState(null); // "success", "error", or null
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     // Fetch section content from backend
//     fetch(`${API_BASE_URL}/api/home/email-subscribe-section/`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success && data.data) {
//           setSectionData(data.data);
//         }
//       })
//       .catch((err) => console.error("Error fetching email subscribe section:", err));
//   }, []);

//   const handleSubscribe = async () => {
//     if (!email || !email.includes("@")) {
//       setStatus("error");
//       return;
//     }

//     setLoading(true);
//     setStatus(null);

//     try {
//       const res = await fetch(`${API_BASE_URL}/api/home/subscribe/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         setStatus("success");
//         setEmail("");
//       } else {
//         setStatus("error");
//       }
//     } catch (err) {
//       console.error("Subscription failed:", err);
//       setStatus("error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Default values
//   const title = sectionData?.title || "Get Free Weekly Exam Updates";
//   const subtitle = sectionData?.subtitle || "Latest dumps, new questions & exam alerts delivered to your inbox";
//   const buttonText = sectionData?.button_text || "Subscribe";
//   const privacyText = sectionData?.privacy_text || "No spam. Unsubscribe anytime. Your privacy is protected.";

//   return (
//     <section className="py-12 md:py-20 bg-gradient-to-r from-[#0F3C71] to-[#1A73E8]">
//       <div className="container mx-auto px-4">
//         <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
//           <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto">
//             <Mail className="w-6 h-6 md:w-8 md:h-8 text-white" />
//           </div>

//           <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white px-2">
//             {title}
//           </h2>

//           <p className="text-base sm:text-lg md:text-xl text-white/90 px-2">
//             {subtitle}
//           </p>

//           <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto pt-4">
//             <Input
//               type="email"
//               placeholder="Enter your email address"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="flex-1 h-12 bg-white/95 border-white/30 text-[#0C1A35] placeholder:text-[#0C1A35]/70"
//             />
//             <Button
//               size="lg"
//               className="bg-white text-[#1A73E8] hover:bg-white/90 h-12 px-8 shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
//               onClick={handleSubscribe}
//               disabled={loading}
//             >
//               {loading ? "Subscribing..." : buttonText}
//             </Button>
//           </div>

//           {status === "success" && (
//             <p className="text-sm text-green-400 mt-2">
//               Successfully subscribed! 🎉
//             </p>
//           )}
//           {status === "error" && (
//             <p className="text-sm text-red-400 mt-2">
//               Subscription failed. Please try again.
//             </p>
//           )}

//           <p className="text-sm text-white/80">
//             {privacyText}
//           </p>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default EmailSubscribe;



"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function SubscribeForm({ buttonText }) {

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/home/subscribe/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Subscription failed:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto pt-4">

        <div className="relative flex-1">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-[#0C1A35]/60" />
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12 bg-white/95 border-white/30 text-[#0C1A35]"
          />
        </div>

        <Button
          size="lg"
          className="bg-white text-[#1A73E8] hover:bg-white/90 h-12 px-8 shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? "Subscribing..." : buttonText}
        </Button>

      </div>

      {status === "success" && (
        <p className="text-sm text-green-400 mt-2">
          Successfully subscribed! 🎉
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-red-400 mt-2">
          Subscription failed. Please try again.
        </p>
      )}
    </>
  );
}