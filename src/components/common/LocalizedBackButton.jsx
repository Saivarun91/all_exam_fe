"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { t } from "@/lib/uiStrings";

export default function LocalizedBackButton() {
  const router = useRouter();
  const handleBack = () => {
    const fromSignup =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem("fromSignup") === "true";

    if (fromSignup) {
      sessionStorage.removeItem("fromSignup");
      router.push("/auth/signup");
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className="mb-6 text-foreground hover:text-foreground hover:bg-gray-100"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {t("common.back")}
    </Button>
  );
}
