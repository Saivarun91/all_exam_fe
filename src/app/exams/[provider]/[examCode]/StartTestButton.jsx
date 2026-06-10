// "use client";

// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";

// export default function StartTestButton({ provider, examCode, test }) {
//   const router = useRouter();

//   const handleClick = () => {
//     const token = localStorage.getItem("token");

//     let identifier = test.slug || test.id;

//     if (!token) {
//       router.push(
//         `/auth/login?redirect=/exams/${provider}/${examCode}/practice/${identifier}`
//       );
//     } else {
//       router.push(
//         `/exams/${provider}/${examCode}/practice/${identifier}`
//       );
//     }
//   };

//   return (
//     <Button
//       onClick={handleClick}
//       className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0]"
//     >
//       Start Test
//     </Button>
//   );
// }




"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function StartTestButton({
  url,
  label = "Start Practicing →",
  className = "w-full bg-[#1A73E8] text-white hover:bg-[#1557B0] h-12 text-lg",
}) {
  const router = useRouter();

  useEffect(() => {
    if (typeof url === "string" && url) {
      router.prefetch(url);
    }
  }, [router, url]);

  return (
    <Button
      className={className}
      onMouseEnter={() => {
        if (typeof url === "string" && url) router.prefetch(url);
      }}
      onFocus={() => {
        if (typeof url === "string" && url) router.prefetch(url);
      }}
      onClick={() => router.push(url)}
    >
      {label}
    </Button>
  );
}