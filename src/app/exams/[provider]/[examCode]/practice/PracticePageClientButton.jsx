// "use client";

// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";

// export default function PracticePageClientButton({ url }) {
//   const router = useRouter();

//   const checkLogin = () => typeof window !== "undefined" && !!localStorage.getItem("token");

//   const handleClick = () => {
//     if (!checkLogin()) {
//       router.push(`/auth/login?redirect=${encodeURIComponent(url)}`);
//     } else {
//       router.push(url);
//     }
//   };

//   return (
//     <Button
//       className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white"
//       onClick={handleClick}
//     >
//       Start Test
//     </Button>
//   );
// }