"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useLogoUrl } from "@/hooks/useLogoUrl";

// ----------------------- API URLs -----------------------
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const USER_LOGIN_URL = `${API_BASE_URL}/api/users/login/`;
const FORGOT_PASSWORD_URL = `${API_BASE_URL}/api/users/forgot-password/`;
const VERIFY_OTP_URL = `${API_BASE_URL}/api/users/verify-otp/`;
const RESET_PASSWORD_URL = `${API_BASE_URL}/api/users/reset-password/`;
const GOOGLE_OAUTH_URL = `${API_BASE_URL}/api/users/google-oauth/`;

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const logoUrl = useLogoUrl();

  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState("email"); // email, otp, reset
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  // Google Sign-In
  const [showGoogleDialog, setShowGoogleDialog] = useState(false);

  // Load Google Identity Services script (non-blocking)
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.loading = 'lazy';
      // Add to body instead of head to avoid blocking
      document.body.appendChild(script);
    }
  }, []);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      console.log("Attempting login to:", USER_LOGIN_URL);
      console.log("Email:", loginEmail);
      
      const res = await fetch(USER_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const data = await res.json();
        console.log("Error response:", data);
        setLoginError(data.error || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      console.log("Response data:", data);

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("name", data.user?.fullname || "");
        localStorage.setItem("email", data.user?.email || "");
        localStorage.setItem("role", data.user?.role || "student");

        // Dispatch login event to update header without refresh
        window.dispatchEvent(new CustomEvent("userLoggedIn"));

        // Check for redirect parameter
        const redirectUrl = searchParams.get('redirect');
        
        if (redirectUrl) {
          // Redirect to the requested URL
          router.push(decodeURIComponent(redirectUrl));
        } else if (data.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setLoginError(data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setLoginError("Network Error: Cannot connect to server. Please ensure the backend is running on port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password - Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setForgotError("");
    setForgotMessage("");
  
    try {
      const res = await fetch(FORGOT_PASSWORD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setForgotMessage(
          data.message || "✅ OTP sent to your email. Please check your inbox."
        );
        setForgotStep("otp");
      } else {
        setForgotError(
          data.error || data.message || "Failed to send OTP"
        );
      }
    } catch (err) {
      console.error(err);
      setForgotError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  // Handle Forgot Password - Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setForgotError("");
    setForgotMessage("");

    try {
      const res = await fetch(VERIFY_OTP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: otp }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setForgotMessage("✅ OTP verified! Please set your new password.");
        setForgotStep("reset");
      } else {
        setForgotError(data.error || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      setForgotError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password - Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setForgotError("");
    setForgotMessage("");

    if (newPassword !== confirmNewPassword) {
      setForgotError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(RESET_PASSWORD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: forgotEmail, 
          otp: otp, 
          new_password: newPassword 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Check for success message or success field
        if (data.success || data.message || res.status === 200) {
          setForgotMessage("✅ Password reset successful! Please login with your new password.");
          setTimeout(() => {
            setShowForgotPassword(false);
            setForgotStep("email");
            setForgotEmail("");
            setOtp("");
            setNewPassword("");
            setConfirmNewPassword("");
            setForgotMessage("");
            setForgotError("");
          }, 2000);
        } else {
          setForgotError(data.error || "Failed to reset password");
        }
      } else {
        setForgotError(data.error || data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      setForgotError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleButtonClick = async () => {
    try {
      setIsLoading(true);
      setLoginError("");
      setShowGoogleDialog(true);
      
      // Get Google Client ID from environment or use a placeholder
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
      
      // Wait for Google library to load (with more retries)
      let retries = 0;
      const maxRetries = 20;
      while (!window.google && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 200));
        retries++;
      }
      if (!window.google) {
        setLoginError("Google Sign-In library is loading. Please wait a moment and try again.");
        setShowGoogleDialog(false);
        setIsLoading(false);
        return;
      }

      // If no client ID is configured, show helpful message
      if (!googleClientId || googleClientId.trim() === "" || googleClientId.includes("your-google-client-id-here")) {
        setLoginError(
          "Google Sign-In is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env.local file. " +
          "Get your Client ID from: https://console.cloud.google.com/apis/credentials"
        );
        setShowGoogleDialog(false);
        setIsLoading(false);
        console.warn("Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file");
        console.warn("Setup instructions: 1) Go to https://console.cloud.google.com/ 2) Create OAuth 2.0 Client ID 3) Add to .env.local");
        return;
      }

      // Use Google Identity Services (GSI) OAuth2 for sign-in
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'email profile',
        callback: async (tokenResponse) => {
          try {
            if (tokenResponse.error) {
              console.error("Google OAuth error:", tokenResponse.error);
              setLoginError("Google sign-in was cancelled or failed. Please try again.");
              setShowGoogleDialog(false);
              setIsLoading(false);
              return;
            }

            if (!tokenResponse.access_token) {
              setLoginError("Failed to get access token from Google.");
              setShowGoogleDialog(false);
              setIsLoading(false);
              return;
            }

            // Fetch user info from Google
            const userInfoRes = await fetch(
              `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`
            );
            
            if (!userInfoRes.ok) {
              const errorText = await userInfoRes.text();
              console.error("Google API error:", errorText);
              throw new Error("Failed to fetch user info from Google");
            }

            const userInfo = await userInfoRes.json();

            if (!userInfo.email || !userInfo.id) {
              throw new Error("Invalid user information from Google");
            }

            const googleData = {
              google_id: userInfo.id,
              email: userInfo.email,
              name: userInfo.name || userInfo.email.split('@')[0],
              profile_picture: userInfo.picture || "",
            };

            // Send to backend
            const res = await fetch(GOOGLE_OAUTH_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(googleData),
            });

            const data = await res.json();

            if (res.ok && data.token) {
              localStorage.setItem("token", data.token);
              localStorage.setItem("name", data.user?.fullname || "");
              localStorage.setItem("email", data.user?.email || "");
              localStorage.setItem("role", data.user?.role || "student");
              
              // Dispatch login event to update header without refresh
              window.dispatchEvent(new CustomEvent("userLoggedIn"));
              
              setShowGoogleDialog(false);
              
              // Check for redirect parameter first
              const redirectUrl = searchParams.get('redirect');
              
              if (redirectUrl) {
                // Redirect to the requested URL
                router.push(decodeURIComponent(redirectUrl));
              } else {
                // Check if user needs to enroll after login
                if (typeof window !== 'undefined') {
                  const enrollAfterLogin = sessionStorage.getItem('enrollAfterLogin');
                  const enrollCourseId = sessionStorage.getItem('enrollCourseId');
                  const enrollCategoryId = sessionStorage.getItem('enrollCategoryId');
                  const enrollDuration = sessionStorage.getItem('enrollDuration');
                  const enrollTestId = sessionStorage.getItem('enrollTestId');
                  
                  if (enrollAfterLogin === 'true') {
                    // Clear the flags
                    sessionStorage.removeItem('enrollAfterLogin');
                    sessionStorage.removeItem('enrollCourseId');
                    sessionStorage.removeItem('enrollCategoryId');
                    sessionStorage.removeItem('enrollDuration');
                    sessionStorage.removeItem('enrollTestId');
                    sessionStorage.removeItem('returnUrl');
                    
                    // Redirect to enrollment page
                    if (enrollCourseId) {
                      router.push(`/enroll?courseId=${enrollCourseId}&duration=${enrollDuration || '1-month'}`);
                    } else if (enrollCategoryId) {
                      router.push(`/enroll?categoryId=${enrollCategoryId}&duration=${enrollDuration || '1-month'}`);
                    }
                    return;
                  }
                }
                
                // Default redirect
                if (data.user?.role === "admin") {
                  router.push("/admin");
                } else {
                  router.push("/dashboard");
                }
              }
            } else {
              setLoginError(data.error || "Google sign-in failed. Please try again.");
              setShowGoogleDialog(false);
            }
          } catch (err) {
            console.error("Google sign-in error:", err);
            setLoginError(err.message || "Failed to complete Google sign-in. Please try again.");
            setShowGoogleDialog(false);
          } finally {
            setIsLoading(false);
          }
        },
      });

      // Request access token (this will open Google sign-in popup)
      tokenClient.requestAccessToken();
      
    } catch (err) {
      console.error("Google button click error:", err);
      setLoginError("An error occurred. Please try again.");
      setShowGoogleDialog(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="flex flex-col justify-center text-center lg:text-left space-y-6"
          >
            <div className="inline-flex items-center gap-3 justify-center lg:justify-start">
              {logoUrl ? (
                <img 
                  src={logoUrl}
                  alt="AllExamQuestions Logo" 
                  className="h-14 md:h-16 lg:h-20 w-auto object-contain max-w-[200px] md:max-w-[240px] lg:max-w-[280px]"
                  loading="lazy"
                />
              ) : (
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              )}
              {!logoUrl && (
                <h1 className="text-3xl font-bold text-gray-800">
                  AllExam
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Questions
                  </span>
                </h1>
              )}
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Welcome Back!
            </h2>
            <p className="text-lg text-gray-600">
              Sign in to continue your exam preparation journey
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <span className="text-gray-700">1000+ Practice Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">✓</span>
                </div>
                <span className="text-gray-700">Updated Daily</span>
              </div>
            </div>
          </motion.div>

          {/* Right side Login form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Login</h3>
                  <p className="text-gray-600 text-sm">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {loginError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-red-600 text-sm">{loginError}</p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="login-email" className="text-gray-700 font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input 
                      id="login-email"
                      type="email" 
                      value={loginEmail} 
                      onChange={(e) => setLoginEmail(e.target.value)} 
                      required 
                      placeholder="Enter your email" 
                      className="mt-2 h-11"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="login-password" className="text-gray-700 font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative mt-2">
                      <Input 
                        id="login-password"
                        type={showPassword ? "text" : "password"} 
                        value={loginPassword} 
                        onChange={(e) => setLoginPassword(e.target.value)} 
                        required 
                        placeholder="Enter your password" 
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>

                  {/* Google Sign-In Button */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-gray-300 hover:bg-gray-50"
                    onClick={handleGoogleButtonClick}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500 mt-4">
                    Don't have an account?{" "}
                    <Link
                      href={(() => {
                        const redirectUrl = searchParams.get('redirect');
                        return redirectUrl 
                          ? `/auth/signup?redirect=${encodeURIComponent(redirectUrl)}`
                          : '/auth/signup';
                      })()}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Sign up here
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Reset Password</DialogTitle>
            <DialogDescription>
              {forgotStep === "email" && "Enter your email to receive a password reset code"}
              {forgotStep === "otp" && "Enter the OTP sent to your email"}
              {forgotStep === "reset" && "Create your new password"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {forgotMessage && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-green-600 text-sm">{forgotMessage}</p>
              </div>
            )}
            
            {forgotError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{forgotError}</p>
              </div>
            )}

            {/* Step 1: Email */}
            {forgotStep === "email" && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <Label htmlFor="forgot-email">Email Address</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="mt-2"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {forgotStep === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Check your email for the OTP</p>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotStep("email")}
                  className="w-full"
                >
                  Back
                </Button>
              </form>
            )}

            {/* Step 3: Reset Password */}
            {forgotStep === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter new password (min. 6 characters)"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Confirm new password"
                    className="mt-2"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

