"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { TestProvider } from "@/contexts/TestContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import I18nDomSync from "@/components/i18n/I18nDomSync";
import LanguageLoadingOverlay from "@/components/i18n/LanguageLoadingOverlay";
import LocaleUrlSync from "@/components/i18n/LocaleUrlSync";
import FontSettingsProvider from "@/components/layout/FontSettingsProvider";
import GoogleAnalyticsDeferred from "@/components/analytics/GoogleAnalyticsDeferred";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <TestProvider>
        <LanguageProvider>
          <FontSettingsProvider>
            <I18nDomSync />
            <LanguageLoadingOverlay />
            <LocaleUrlSync />
            <GoogleAnalyticsDeferred />
            <Toaster position="top-right" />
            {children}
          </FontSettingsProvider>
        </LanguageProvider>
      </TestProvider>
    </AuthProvider>
  );
}