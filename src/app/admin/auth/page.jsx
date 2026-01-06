"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useLogoUrl } from "@/hooks/useLogoUrl";

// ----------------------- API URLs -----------------------
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const LOGIN_URL = `${API_BASE_URL}/api/users/admin/login/`;

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();
  const logoUrl = useLogoUrl();

  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // ----------------------- Handle Login -----------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(LOGIN_URL, {
        email: loginEmail,
        password: loginPassword,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("admin_id", res.data.admin?.id || "");
        localStorage.setItem("user_name", res.data.admin?.name || "Admin");
        localStorage.setItem("user_email", res.data.admin?.email || loginEmail);
        localStorage.setItem("role", res.data.admin?.role || "admin");
        localStorage.setItem("admin_password", loginPassword);

        login(res.data.token);

        setTimeout(() => {
          router.replace("/admin");
        }, 500);
      } else {
        setLoginError(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";

      setLoginError(errorMessage);
      console.error("Login Error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="container mx-auto max-w-4xl grid lg:grid-cols-2 gap-8">
        
        {/* Left Side Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center lg:text-left flex flex-col justify-center"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            {logoUrl ? (
              <img 
                src={logoUrl}
                alt="AllExamQuestions Logo" 
                className="h-14 md:h-16 lg:h-20 w-auto object-contain max-w-[200px] md:max-w-[240px] lg:max-w-[280px]"
                loading="lazy"
              />
            ) : (
              <>
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">
                  AllExam
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Questions
                  </span>
                </h1>
              </>
            )}
          </div>

          <h2 className="text-4xl font-bold mb-4 text-gray-800">
            Welcome Back!
          </h2>
          <p className="text-xl text-gray-500 mb-8">
            Access your admin dashboard to manage categories, courses, tests, and more.
          </p>

          <div className="space-y-2 text-gray-600">
            <p className="flex items-center gap-2">
              <span className="text-blue-600">✓</span> Manage Categories & Courses
            </p>
            <p className="flex items-center gap-2">
              <span className="text-blue-600">✓</span> View Analytics & Reports
            </p>
            <p className="flex items-center gap-2">
              <span className="text-blue-600">✓</span> Control User Access
            </p>
          </div>
        </motion.div>

        {/* Right Side Login Form */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="shadow-2xl border-0">
            <CardContent className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h3>
                <p className="text-gray-500">Enter your credentials to access the admin panel</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {loginError}
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="text-gray-700 font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@allexamquestions.com"
                    className="mt-2"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-700 font-semibold">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-2"
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white py-6 text-lg font-semibold shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
