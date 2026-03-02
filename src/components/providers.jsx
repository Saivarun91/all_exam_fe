"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { TestProvider } from "@/contexts/TestContext";
import FontSettingsProvider from "@/components/layout/FontSettingsProvider";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <TestProvider>
        <FontSettingsProvider>
          <Toaster position="top-right" />
          {children}
        </FontSettingsProvider>
      </TestProvider>
    </AuthProvider>
  );
}