"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import AdminNavbar from "@/components/admin/adminnavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";

const toastOptions = {
  duration: 4000,
  style: {
    background: "#fff",
    color: "#333",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  success: {
    iconTheme: {
      primary: "#16a34a",
      secondary: "#fff",
    },
    style: {
      background: "#f0fdf4",
      color: "#16a34a",
    },
  },
  error: {
    iconTheme: {
      primary: "#dc2626",
      secondary: "#fff",
    },
    style: {
      background: "#fef2f2",
      color: "#dc2626",
    },
  },
};

export default function AdminLayoutClient({ children }) {
  const pathname = usePathname();

  if (pathname === "/admin/auth") {
    return (
      <>
        <Toaster position="top-right" toastOptions={toastOptions} />
        {children}
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={toastOptions} />
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="ml-64 flex flex-col min-h-screen">
          <header className="fixed top-0 left-64 right-0 h-16 bg-white shadow-sm border-b border-gray-200 z-40">
            <AdminNavbar />
          </header>
          <main className="flex-1 p-6 bg-gray-50 overflow-x-auto">{children}</main>
        </div>
      </div>
    </>
  );
}
