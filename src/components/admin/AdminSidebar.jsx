"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSiteName } from "@/hooks/useSiteName";
import { useLogoUrl } from "@/hooks/useLogoUrl";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import {
  Home,
  Layers,
  Users,
  FileText,
  Mail,
  Settings,
  BarChart3,
  Search,
  LogOut,
  GraduationCap,
  DollarSign,
  Ticket,
  UserCheck,
  BookOpen,
  Scale,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminSidebar() {
  const siteName = useSiteName();
  const logoUrl = useLogoUrl();
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: Home },
    { name: "Categories", path: "/admin/categories", icon: Layers },
    { name: "Home Page Management", path: "/admin/home", icon: Home },
    { name: "Exam Details Manager", path: "/admin/home/exam-details-manager", icon: BookOpen },
    { name: "Exams Page Manager", path: "/admin/home/exams-page-manager", icon: Search },
    { name: "Pricing Plans", path: "/admin/pricing-plans", icon: DollarSign },
    { name: "Coupons", path: "/admin/coupons", icon: Ticket },
    { name: "Enrollments", path: "/admin/enrollments", icon: Users },
    { name: "Email Templates", path: "/admin/email-templates", icon: Mail },
    { name: "Reviews", path: "/admin/reviews", icon: FileText },
    { name: "Legal Pages", path: "/admin/legal-pages", icon: Scale },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Search Logs", path: "/admin/search-logs", icon: Search },
    { name: "Subscribers", path: "/admin/subscribers", icon: UserCheck },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/admin/auth");
  };

  const isPathActive = (path) => {
    if (path === "/admin/home") {
      // For Home Page Management, check if pathname starts with /admin/home but exclude exam-details-manager and exams-page-manager
      return pathname?.startsWith("/admin/home") && 
             !pathname?.includes("/exam-details-manager") && 
             !pathname?.includes("/exams-page-manager");
    }
    return pathname === path || (path !== "/admin" && pathname?.startsWith(path));
  };


  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#0C1A35] to-[#0E2444] border-r border-[#1A73E8]/20 shadow-lg z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-[#1A73E8]/20 px-4 bg-[#0C1A35]">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img 
                // src={getOptimizedImageUrl(logoUrl, 140, 40)} 
                src={logoUrl}
                alt={siteName || "Logo"} 
                width={140}
                height={40}
                className="h-10 w-auto max-w-[140px] object-contain"
                style={{  height: 'auto' }}
                loading="lazy"
                sizes="140px"
                decoding="async"
              />
            ) : (
            <GraduationCap className="w-8 h-8 text-[#1A73E8]" />
            )}
            {/* {siteName && siteName.trim() && (
            <span className="text-xl font-bold text-white">{siteName}</span>
            )} */}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isPathActive(item.path);
              
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-[#1A73E8] text-white font-semibold shadow-md"
                        : "text-[#E7ECF6] hover:bg-[#1A73E8]/20 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}


          </ul>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-[#1A73E8]/20 p-4 bg-[#0C1A35]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-[#E7ECF6] hover:bg-red-600/20 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

