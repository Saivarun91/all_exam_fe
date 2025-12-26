"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Layers, 
  Users, 
  FileText, 
  Mail, 
  Settings, 
  BarChart3,
  Search,
  BookOpen,
  Home,
  DollarSign,
  Ticket,
  Scale,
  UserCheck
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  // ------------------ Auth Check ------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "admin") {
      setIsAuthenticated(true);
    } else {
      router.push("/admin/auth");
    }
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Dashboard cards matching sidebar order (excluding Dashboard itself)
  const dashboardCards = [
    { name: "Categories", path: "/admin/categories", icon: Layers, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    { name: "Home Page Management", path: "/admin/home", icon: Home, color: "from-indigo-500 to-indigo-600", bgColor: "bg-indigo-50", borderColor: "border-indigo-200" },
    { name: "Exam Details Manager", path: "/admin/home/exam-details-manager", icon: BookOpen, color: "from-violet-500 to-violet-600", bgColor: "bg-violet-50", borderColor: "border-violet-200" },
    { name: "Exams Page Manager", path: "/admin/home/exams-page-manager", icon: Search, color: "from-cyan-500 to-cyan-600", bgColor: "bg-cyan-50", borderColor: "border-cyan-200" },
    { name: "Pricing Plans", path: "/admin/pricing-plans", icon: DollarSign, color: "from-emerald-500 to-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
    { name: "Coupons", path: "/admin/coupons", icon: Ticket, color: "from-orange-500 to-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
    { name: "Enrollments", path: "/admin/enrollments", icon: Users, color: "from-green-500 to-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
    { name: "Email Templates", path: "/admin/email-templates", icon: Mail, color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
    { name: "Reviews", path: "/admin/reviews", icon: FileText, color: "from-pink-500 to-pink-600", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
    { name: "Legal Pages", path: "/admin/legal-pages", icon: Scale, color: "from-amber-500 to-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3, color: "from-slate-500 to-slate-600", bgColor: "bg-slate-50", borderColor: "border-slate-200" },
    { name: "Search Logs", path: "/admin/search-logs", icon: Search, color: "from-teal-500 to-teal-600", bgColor: "bg-teal-50", borderColor: "border-teal-200" },
    { name: "Subscribers", path: "/admin/subscribers", icon: UserCheck, color: "from-rose-500 to-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200" },
    { name: "Settings", path: "/admin/settings", icon: Settings, color: "from-gray-500 to-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg mb-6">
            <Home className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your platform, content, and users from one central location
          </p>
        </motion.div>

        {/* Dashboard Cards - Matching Sidebar Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link href={card.path}>
                  <div className={`${card.bgColor} border-2 ${card.borderColor} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group h-full`}>
                    <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${card.color} rounded-xl mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {card.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Manage {card.name.toLowerCase()}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
