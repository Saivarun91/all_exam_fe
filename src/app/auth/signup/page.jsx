"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Mail, Lock, User, Phone } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

// ----------------------- API URLs -----------------------
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const USER_REGISTER_URL = `${API_BASE_URL}/api/users/register/`;

function SignupPageContent() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupError, setSignupError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  // reCAPTCHA states
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);


  // Handle reCAPTCHA change
  const handleCaptchaChange = (token) => {
    if (token) {
      setCaptchaToken(token);
      // Clear any captcha-related errors immediately when user completes captcha
      if (signupError) {
        const errorLower = signupError.toLowerCase();
        if (errorLower.includes("captcha") || errorLower.includes("recaptcha") || errorLower.includes("verification")) {
          setSignupError("");
        }
      }
    } else {
      setCaptchaToken(null);
    }
  };

  // Handle reCAPTCHA expiration
  const handleCaptchaExpired = () => {
    setCaptchaToken(null);
    if (!isLoading) {
      setSignupError("reCAPTCHA expired. Please complete it again.");
    }
  };

  // Handle reCAPTCHA error
  const handleCaptchaError = () => {
    setCaptchaToken(null);
    if (!isLoading) {
      setSignupError("reCAPTCHA error occurred. Please refresh the page and try again.");
    }
  };


  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSignupError("");

    if (!acceptedTerms || !acceptedPrivacy) {
      setSignupError("Please accept the Terms of Service and Privacy Policy");
      setIsLoading(false);
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    // Validate reCAPTCHA
    if (!captchaToken) {
      setSignupError("Please complete the captcha verification");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(USER_REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: signupName,
          email: signupEmail,
          password: signupPassword,
          phone_number: signupPhone,
          recaptcha_token: captchaToken,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Registration successful! Please login now.");
        router.push("/auth/login");
        setSignupName("");
        setSignupEmail("");
        setSignupPassword("");
        setSignupConfirmPassword("");
        setSignupPhone("");
        setAcceptedTerms(false);
        setAcceptedPrivacy(false);
        setCaptchaToken(null);
        // Reset captcha
        if (captchaRef.current) {
          captchaRef.current.reset();
        }
      } else {
        const errorMessage = data.error || "Signup failed";
        setSignupError(errorMessage);
        
        // Only reset captcha if the error is captcha-related
        if (errorMessage.toLowerCase().includes("captcha") || errorMessage.toLowerCase().includes("recaptcha")) {
          if (captchaRef.current) {
            captchaRef.current.reset();
          }
          setCaptchaToken(null);
        }
        // Don't reset captcha for other errors (like email exists, password mismatch, etc.)
      }
    } catch (err) {
      console.error("Signup error:", err);
      setSignupError("Network error. Please check your connection and try again.");
      // Don't reset captcha on network errors - user might want to retry
      // Only reset if it's clearly a captcha issue
    } finally {
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
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                AllExam
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Questions
                </span>
              </h1>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Start Your Success Journey Today
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of students preparing for their dream certification exams with our comprehensive practice platform
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

          {/* Right side Signup form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign Up</h3>
                  <p className="text-gray-600 text-sm">Create your account to get started</p>
                </div>

                <form className="space-y-4" onSubmit={handleSignup}>
                  {signupError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-red-600 text-sm">{signupError}</p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="fullname" className="text-gray-700 font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name *
                    </Label>
                    <Input 
                      id="fullname"
                      type="text" 
                      value={signupName} 
                      onChange={(e) => setSignupName(e.target.value)} 
                      required 
                      placeholder="Enter your full name" 
                      className="mt-2 h-11"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address *
                    </Label>
                    <Input 
                      id="email"
                      type="email" 
                      value={signupEmail} 
                      onChange={(e) => setSignupEmail(e.target.value)} 
                      required 
                      placeholder="Enter your email" 
                      className="mt-2 h-11"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number *
                    </Label>
                    <Input 
                      id="phone"
                      type="tel" 
                      value={signupPhone} 
                      onChange={(e) => setSignupPhone(e.target.value)} 
                      required 
                      placeholder="Enter your phone number" 
                      className="mt-2 h-11"
                    />
                    <p className="text-xs text-gray-500 mt-1">Required for account verification</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="password" className="text-gray-700 font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password *
                    </Label>
                    <Input 
                      id="password"
                      type="password" 
                      value={signupPassword} 
                      onChange={(e) => setSignupPassword(e.target.value)} 
                      required 
                      minLength={6}
                      placeholder="Create a password (min. 6 characters)" 
                      className="mt-2 h-11"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Confirm Password *
                    </Label>
                    <Input 
                      id="confirmPassword"
                      type="password" 
                      value={signupConfirmPassword} 
                      onChange={(e) => setSignupConfirmPassword(e.target.value)} 
                      required 
                      minLength={6}
                      placeholder="Confirm your password" 
                      className="mt-2 h-11"
                    />
                  </div>
                  
                  {/* Terms and Privacy */}
                  <div className="space-y-3 pt-2 border-t border-gray-200">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id="terms" 
                        checked={acceptedTerms} 
                        onCheckedChange={setAcceptedTerms}
                        className="mt-1"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                        I agree to the{" "}
                        <Link
                          href="/terms-and-conditions"
                          className="text-blue-600 hover:underline font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (typeof window !== "undefined") {
                              sessionStorage.setItem("fromSignup", "true");
                            }
                          }}
                        >
                          Terms of Service
                        </Link>
                      </label>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id="privacy" 
                        checked={acceptedPrivacy} 
                        onCheckedChange={setAcceptedPrivacy}
                        className="mt-1"
                      />
                      <label htmlFor="privacy" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                        I agree to the{" "}
                        <Link
                          href="/privacy-policy"
                          className="text-blue-600 hover:underline font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (typeof window !== "undefined") {
                              sessionStorage.setItem("fromSignup", "true");
                            }
                          }}
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>
                  
                  {/* reCAPTCHA */}
                  <div className="pt-2 flex justify-center">
                    {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
                      <ReCAPTCHA
                        ref={captchaRef}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                        onChange={handleCaptchaChange}
                        onExpired={handleCaptchaExpired}
                        onError={handleCaptchaError}
                        theme="light"
                      />
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">reCAPTCHA is not configured. Please contact support.</p>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg" 
                    disabled={isLoading || !acceptedTerms || !acceptedPrivacy || !captchaToken}
                  >
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500 mt-4">
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Login here
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  );
}

