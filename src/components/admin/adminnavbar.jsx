"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminNavbar() {
  const [userName, setUserName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("Administrator");
  const [userInitial, setUserInitial] = useState("A");

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

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("adminProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("adminProfileUpdated", handleProfileUpdate);
    };
  }, []);

  return (
    <div className="h-full flex items-center justify-between px-6 bg-gradient-to-r from-white to-gray-50">
      <div className="flex items-center" />

      <div className="flex items-center gap-4">
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
