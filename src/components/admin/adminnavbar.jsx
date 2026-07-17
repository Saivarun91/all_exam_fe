"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "@/lib/navigation/client";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminNavbar() {
  const router = useRouter();
  const { logout } = useAuth();
  const dropdownRef = useRef(null);
  const [userName, setUserName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("Administrator");
  const [userInitial, setUserInitial] = useState("A");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchAdminProfile = async () => {
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");

      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/api/users/admin/profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.admin) {
        const adminName = res.data.admin.name || "Admin";
        const adminEmail = res.data.admin.email || "";

        setUserName(adminName);
        setUserEmail(adminEmail);
        setUserInitial(adminName.charAt(0).toUpperCase());

        localStorage.setItem("user_name", adminName);
        localStorage.setItem("user_email", adminEmail);
      }
    } catch (err) {
      const name =
        localStorage.getItem("user_name") || localStorage.getItem("name");
      const email =
        localStorage.getItem("user_email") || localStorage.getItem("email");
      const role = localStorage.getItem("role");

      if (name) {
        setUserName(name);
        setUserInitial(name.charAt(0).toUpperCase());
      }

      if (email) {
        setUserEmail(email);
      } else if (role) {
        setUserEmail(role);
      }

      if (err?.response?.status !== 401 && err?.response?.status !== 403) {
        console.warn("Admin profile fetch failed, using stored values");
      }
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    router.push("/admin/auth");
  };

  useEffect(() => {
    const name = localStorage.getItem("user_name") || localStorage.getItem("name");
    const email = localStorage.getItem("user_email") || localStorage.getItem("email");
    const role = localStorage.getItem("role");

    if (name) {
      setUserName(name);
      setUserInitial(name.charAt(0).toUpperCase());
    }

    if (email) {
      setUserEmail(email);
    } else if (role) {
      setUserEmail(role);
    }

    fetchAdminProfile();

    const handleStorageChange = (e) => {
      if (
        e.key === "user_name" ||
        e.key === "name" ||
        e.key === "user_email" ||
        e.key === "email" ||
        e.key === "role"
      ) {
        const updatedName =
          localStorage.getItem("user_name") || localStorage.getItem("name");
        const updatedEmail =
          localStorage.getItem("user_email") || localStorage.getItem("email");
        const updatedRole = localStorage.getItem("role");

        if (updatedName) {
          setUserName(updatedName);
          setUserInitial(updatedName.charAt(0).toUpperCase());
        }

        if (updatedEmail) {
          setUserEmail(updatedEmail);
        } else if (updatedRole) {
          setUserEmail(updatedRole);
        }
      }
    };

    const handleProfileUpdate = () => {
      fetchAdminProfile();
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("adminProfileUpdated", handleProfileUpdate);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("adminProfileUpdated", handleProfileUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="h-full flex items-center justify-between px-6 bg-gradient-to-r from-white to-gray-50">
      <div className="flex items-center" />

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {userInitial}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800">{userName}</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-lg border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                <p className="text-sm font-semibold text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
              <Link
                href="/admin/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>View Profile</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
