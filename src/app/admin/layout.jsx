"use client";

import { usePathname } from "next/navigation";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import AdminNavbar from "@/components/admin/adminnavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";

const toastOptions = {
  duration: 4000,
  style: {
    background: '#fff',
    color: '#333',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  success: {
    iconTheme: {
      primary: '#16a34a',
      secondary: '#fff',
    },
    style: {
      background: '#f0fdf4',
      color: '#16a34a',
    },
  },
  error: {
    iconTheme: {
      primary: '#dc2626',
      secondary: '#fff',
    },
    style: {
      background: '#fef2f2',
      color: '#dc2626',
    },
  },
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // Hide layout on admin auth page
  if (pathname === "/admin/auth") {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <Toaster position="top-right" toastOptions={toastOptions} />
        {children}
      </>
    );
  }

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Toaster position="top-right" toastOptions={toastOptions} />
      <div className="min-h-screen bg-gray-50">
        {/* Fixed Sidebar */}
        <AdminSidebar />

        {/* Main Section */}
        <div className="ml-64 flex flex-col min-h-screen">
          {/* Navbar */}
          <header className="h-16 bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <AdminNavbar />
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-gray-50 overflow-x-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
