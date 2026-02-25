"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className="mb-6 text-foreground hover:text-foreground hover:bg-gray-100"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  );
}