// Admin Sidebar Configuration
// Add this to your admin sidebar component

import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  FolderTree,
  Home,
  Ticket,
  Settings,
  Mail,
  Bell,
  Building2,
  DollarSign,
} from "lucide-react";

export const adminSidebarConfig = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Exam Management",
    icon: BookOpen,
    submenu: [
      { title: "Questions", href: "/admin/questions" },
      { title: "Practice Tests", href: "/admin/practice-tests" },
      { title: "Test Attempts", href: "/admin/test-attempts" },
    ],
  },
  {
    title: "Home Page Settings",  // ⭐ NEW SECTION
    icon: Home,
    submenu: [
      { 
        title: "Hero Section", 
        href: "/admin/home/hero",
        description: "Edit main banner, title, stats"
      },
      { 
        title: "Value Propositions", 
        href: "/admin/home/value-propositions",
        description: "Manage 'Why Choose Us' features"
      },
      { 
        title: "Blog Posts", 
        href: "/admin/home/blog-posts",
        description: "Manage blog articles"
      },
      { 
        title: "Recently Updated", 
        href: "/admin/home/recently-updated",
        description: "Manage recently updated exams"
      },
      { 
        title: "FAQs", 
        href: "/admin/home/faqs",
        description: "Manage frequently asked questions"
      },
      { 
        title: "Email Subscribe", 
        href: "/admin/home/email-subscribe",
        description: "Edit email subscription section"
      },
      { 
        title: "Email Subscribers", 
        href: "/admin/home/subscribers",
        description: "View and export subscribers"
      },
    ],
  },
  {
    title: "Courses Management",  // ⭐ NEW SECTION
    icon: GraduationCap,
    href: "/admin/courses",
    description: "Manage featured courses",
  },
  {
    title: "Categories",
    icon: FolderTree,
    href: "/admin/categories",
  },
  {
    title: "Providers",
    icon: Building2,
    href: "/admin/providers",
  },
  {
    title: "Pricing Plans",
    icon: DollarSign,
    href: "/admin/pricing-plans",
  },
  {
    title: "Coupons & Offers",
    icon: Ticket,
    href: "/admin/coupons",
  },
  {
    title: "Enrollments",
    icon: FileText,
    href: "/admin/enrollments",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/admin/notifications",
  },
  {
    title: "Settings",
    icon: Settings,
    submenu: [
      { title: "Privacy Policy", href: "/admin/settings/privacy" },
      { title: "Terms of Service", href: "/admin/settings/terms" },
      { title: "Email Templates", href: "/admin/settings/email-templates" },
    ],
  },
];

// Helper function to render sidebar
export const renderSidebarItem = (item, pathname) => {
  const isActive = pathname === item.href || 
    item.submenu?.some(sub => pathname === sub.href);
  
  return {
    ...item,
    isActive,
    submenuOpen: isActive && item.submenu,
  };
};

