"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminNavbar() {
  const [userName, setUserName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("Administrator");
  const [userInitial, setUserInitial] = useState("A");

  const fetchAdminProfile = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
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
        
        // Update localStorage
        localStorage.setItem("user_name", adminName);
        localStorage.setItem("user_email", adminEmail);
      }
    } catch (err) {
      console.error("Error fetching admin profile:", err);
      // Fallback to localStorage if API fails
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
    }
  };

  useEffect(() => {
    // Initial fetch from API
    fetchAdminProfile();

    // Get user data from localStorage as fallback
    const name = localStorage.getItem("user_name") || localStorage.getItem("name");
    const email = localStorage.getItem("user_email") || localStorage.getItem("email");
    const role = localStorage.getItem("role");

    if (name && !userName) {
      setUserName(name);
      setUserInitial(name.charAt(0).toUpperCase());
    }

    if (email && !userEmail) {
      setUserEmail(email);
    } else if (role && !userEmail) {
      setUserEmail(role);
    }

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === "user_name" || e.key === "name" || e.key === "user_email" || e.key === "email" || e.key === "role") {
        const updatedName = localStorage.getItem("user_name") || localStorage.getItem("name");
        const updatedEmail = localStorage.getItem("user_email") || localStorage.getItem("email");
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

    // Listen for custom event to refresh profile
    const handleProfileUpdate = () => {
      fetchAdminProfile();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("adminProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("adminProfileUpdated", handleProfileUpdate);
    };
  }, []);

  return (
    <div className="h-full flex items-center justify-between px-6 bg-gradient-to-r from-white to-gray-50">
      {/* Left side - Empty for clean look */}
      <div className="flex items-center">
        {/* Empty - Logo is in sidebar now */}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {userInitial}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-800">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

