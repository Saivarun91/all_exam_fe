"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { addLocaleToPathname } from "@/lib/localeRouting";
import { REACT_I18N_ATTR } from "@/lib/domI18nUtils";

export default function LocalizedBackButton() {
  const router = useRouter();
  const { language, t } = useLanguage();

  const handleBack = () => {
    const fromSignup =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem("fromSignup") === "true";

    if (fromSignup) {
      sessionStorage.removeItem("fromSignup");
      router.push(addLocaleToPathname("/auth/signup", language));
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(addLocaleToPathname("/", language));
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className="mb-6 text-foreground hover:text-foreground hover:bg-gray-100"
      {...{ [REACT_I18N_ATTR]: "" }}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {t("common.back")}
    </Button>
  );
}
