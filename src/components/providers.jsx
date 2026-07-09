"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { TestProvider } from "@/contexts/TestContext";
import FontSettingsProvider from "@/components/layout/FontSettingsProvider";
import GoogleAnalyticsDeferred from "@/components/analytics/GoogleAnalyticsDeferred";
import NavigationProgress from "@/components/layout/NavigationProgress";
import NewTabNavigation from "@/components/layout/NewTabNavigation";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <TestProvider>
        <FontSettingsProvider>
          <NewTabNavigation />
          <NavigationProgress />
          <GoogleAnalyticsDeferred />
          <Toaster position="top-right" />
          {children}
        </FontSettingsProvider>
      </TestProvider>
    </AuthProvider>
  );
}
