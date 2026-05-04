// import "./globals.css";
// import dynamic from "next/dynamic";
// import Script from "next/script";
// import { Poppins } from "next/font/google";
// import { AuthProvider } from "@/contexts/AuthContext";
// import { TestProvider } from "@/contexts/TestContext";
// import BodyWrapper from "@/components/layout/BodyWrapper";
// import HeaderSpacer from "@/components/layout/HeaderSpacer";
// import FontSettingsProvider from "@/components/layout/FontSettingsProvider";
// import { Toaster } from "react-hot-toast";

// /* ================= FONT CONFIGURATION ================= */
// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700", "800", "900"],
//   display: "swap",
//   preload: true,
//   variable: "--font-poppins",
// });

// /* ================= METADATA (SERVER-SIDE SEO) ================= */

// export const metadata = {
//   // title: "AllExamQuestions - Certification Practice Tests",
//   // description:
//   //   "Accurate, updated, exam-style questions trusted by thousands of professionals preparing for their next big certification. Practice with real exam questions and pass your certification exam.",
//   // keywords:
//   //   "certification exams, practice tests, exam questions, IT certification, AWS, Azure, Google Cloud, Cisco, CompTIA, exam preparation",
//   alternates: {
//     canonical: "https://allexamquestions.com/",
//   },
//   icons: {
//     icon: [
//       { url: "/favicon.ico" },
//       { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
//       { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
//     ],
//     apple: "/apple-touch-icon.png",
//   },
//   openGraph: {
//     // title:
//     //   "AllExamQuestions - Certification Practice Tests",
//     // description:
//     //   "Accurate, updated, exam-style questions trusted by thousands of professionals preparing for their next big certification.",
//     type: "website",
//     url: "https://allexamquestions.com/",
//   },
//   twitter: {
//     card: "summary_large_image",
//     // title:
//     //   "AllExamQuestions - Certification Practice Tests",
//     // description:
//     //   "Accurate, updated, exam-style questions trusted by thousands of professionals preparing for their next big certification.",
//   },
// };

// /* ================= DYNAMIC COMPONENTS ================= */

// const Header = dynamic(() => import("@/components/layout/Header"), {
//   ssr: true,
//   loading: () => <div className="h-20" />,
// });

// const Footer = dynamic(() => import("@/components/layout/Footer"), {
//   ssr: true,
//   loading: () => <div className="h-64" />,
// });

// /* ================= ROOT LAYOUT ================= */

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en" className={poppins.variable}>
//       <body className={`${poppins.className} flex flex-col min-h-screen bg-gray-50 text-gray-900`}>

//         {/* ================= GOOGLE ANALYTICS ================= */}
//         <Script
//           src="https://www.googletagmanager.com/gtag/js?id=G-4KCPVHB725"
//           strategy="lazyOnload"
//         />
//         <Script id="google-analytics" strategy="lazyOnload">
//           {`
//             window.dataLayer = window.dataLayer || [];
//             function gtag(){dataLayer.push(arguments);}
//             gtag('js', new Date());
//             gtag('config', 'G-4KCPVHB725', {
//               anonymize_ip: true,
//             });
//           `}
//         </Script>

//         <AuthProvider>
//           <TestProvider>
//             <FontSettingsProvider>
//               {/* Toast Notifications */}
//               <Toaster 
//                 position="top-right"
//                 toastOptions={{
//                   duration: 3000,
//                   style: {
//                     background: '#fff',
//                     color: '#333',
//                     padding: '16px',
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
//                   },
//                   success: {
//                     iconTheme: {
//                       primary: '#16a34a',
//                       secondary: '#fff',
//                     },
//                     style: {
//                       background: '#f0fdf4',
//                       color: '#16a34a',
//                     },
//                   },
//                   error: {
//                     iconTheme: {
//                       primary: '#dc2626',
//                       secondary: '#fff',
//                     },
//                     style: {
//                       background: '#fef2f2',
//                       color: '#dc2626',
//                     },
//                   },
//                 }}
//               />
//               {/* Header/Footer visibility handled internally */}
//               <Header />
//               <BodyWrapper>
//                 <HeaderSpacer />
//                 <main className="flex-1">{children}</main>
//                 <Footer />
//               </BodyWrapper>
//             </FontSettingsProvider>
//           </TestProvider>
//         </AuthProvider>

//       </body>
//     </html>
//   );
// }





// import "./globals.css";
// import dynamic from "next/dynamic";
// import Script from "next/script";
// import { Poppins } from "next/font/google";
// import { AuthProvider } from "@/contexts/AuthContext";
// import { TestProvider } from "@/contexts/TestContext";
// import BodyWrapper from "@/components/layout/BodyWrapper";
// import HeaderSpacer from "@/components/layout/HeaderSpacer";
// import FontSettingsProvider from "@/components/layout/FontSettingsProvider";
// import { Toaster } from "react-hot-toast";

// /* ================= METADATA BASE (IMPORTANT) ================= */
// export const metadata = {
//   metadataBase: new URL("https://allexamquestions.com"),
// };


// /* ================= FONT CONFIGURATION ================= */
// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700", "800", "900"],
//   display: "swap",
//   preload: true,
//   variable: "--font-poppins",
// });

// /* ================= DYNAMIC COMPONENTS ================= */
// const Header = dynamic(() => import("@/components/layout/Header"), {
//   ssr: true,
//   loading: () => <div className="h-20" />,
// });

// const Footer = dynamic(() => import("@/components/layout/Footer"), {
//   ssr: true,
//   loading: () => <div className="h-64" />,
// });

// /* ================= ROOT LAYOUT ================= */
// export default function RootLayout({ children }) {
//   return (
//     <html lang="en" className={poppins.variable}>
//       <body
//         className={`${poppins.className} flex flex-col min-h-screen bg-gray-50 text-gray-900`}
//       >
//         {/* ================= GOOGLE ANALYTICS ================= */}
//         <Script
//           src="https://www.googletagmanager.com/gtag/js?id=G-4KCPVHB725"
//           strategy="lazyOnload"
//         />
//         <Script id="google-analytics" strategy="lazyOnload">
//           {`
//             window.dataLayer = window.dataLayer || [];
//             function gtag(){dataLayer.push(arguments);}
//             gtag('js', new Date());
//             gtag('config', 'G-4KCPVHB725', { anonymize_ip: true });
//           `}
//         </Script>

//         <AuthProvider>
//           <TestProvider>
//             <FontSettingsProvider>
//               <Toaster position="top-right" />

//               <Header />

//               <BodyWrapper>
//                 <HeaderSpacer />
//                 <main className="flex-1">{children}</main>
//                 <Footer />
//               </BodyWrapper>
//             </FontSettingsProvider>
//           </TestProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }



import "./globals.css";
import { Poppins } from "next/font/google";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Providers from "../components/providers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

async function fetchPublicBrandSettings() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings/public/`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { logoUrl: "", siteName: "" };

    const data = await res.json();
    if (!data.success) return { logoUrl: "", siteName: "" };

    const siteRaw = data.site_name;
    const siteName =
      siteRaw != null && String(siteRaw).trim() ? String(siteRaw).trim() : "";

    return {
      logoUrl: data.logo_url || "",
      siteName,
    };
  } catch {
    return { logoUrl: "", siteName: "" };
  }
}

const poppins = Poppins({
  subsets: ["latin"],
  // Fewer weights than full 300–900 cuts download + main-thread work (Speed Index / TBT).
  // Keep 800 for admin `font-extrabold`; public UI mostly uses 400–700.
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
  variable: "--font-poppins",
});

export const metadata = {
  title: "AllExamQuestions - Certification Practice Tests",
  description:
    "Accurate, updated, exam-style questions trusted by thousands of professionals.",
  alternates: {
    canonical: "https://allexamquestions.com/",
  },
  icons: {
    icon: [
      { url: "/favicon-new.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({ children }) {
  const { logoUrl: initialLogoUrl, siteName: initialSiteName } =
    await fetchPublicBrandSettings();

  return (
    <html lang="en" className={poppins.variable}>
      <body 
        className={`${poppins.className} flex flex-col min-h-screen bg-gray-50 text-gray-900` }
      >
        <Providers>
        <Header
          initialLogoUrl={initialLogoUrl}
          initialSiteName={initialSiteName}
        />
        <div className="h-16 md:h-20" />
        <main className="flex-1">{children}</main>
        <Footer />
        </Providers>
      </body>
    </html>
  );
}