"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function StartTestButton({ provider, examCode, test }) {
  const router = useRouter();

  const handleClick = () => {
    const token = localStorage.getItem("token");

    let identifier = test.slug || test.id;

    if (!token) {
      router.push(
        `/auth/login?redirect=/exams/${provider}/${examCode}/practice/${identifier}`
      );
    } else {
      router.push(
        `/exams/${provider}/${examCode}/practice/${identifier}`
      );
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0]"
    >
      Start Test
    </Button>
  );
}   