"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function LeadPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default to true to prevent SSR issues
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    whatsapp_number: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Check authentication status on mount and auto-show popup for non-logged-in users
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Use a delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      try {
        const token = localStorage.getItem("token");
        const isAuth = !!token;
        setIsLoggedIn(isAuth);
        
        // Auto-show popup automatically for non-logged-in users
        if (!isAuth) {
          const hasSeenPopup = sessionStorage.getItem("leadPopupShown");
          
          // Only show popup if user hasn't seen it in this session
          if (!hasSeenPopup) {
            // Show popup automatically for non-logged-in users
            setIsOpen(true);
          }
        }
      } catch (error) {
        // If there's an error, assume user is not logged in and show popup
        setIsLoggedIn(false);
        const hasSeenPopup = sessionStorage.getItem("leadPopupShown");
        if (!hasSeenPopup) {
          setIsOpen(true);
        }
      }
    }, 1000); // 1 second delay to ensure page is loaded
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Listen for events and auth changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Listen for login events - don't close popup, just update state
    const handleLogin = () => {
      setIsLoggedIn(true);
      // Don't close popup if user logs in - they might want to submit a lead
    };

    // Listen for help button click to open popup
    const handleHelpClick = () => {
      // Open popup immediately when Help button is clicked (for both logged-in and non-logged-in users)
      setIsOpen(true);
    };

    // Listen for storage changes (logout)
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    // Add event listeners
    window.addEventListener("userLoggedIn", handleLogin);
    window.addEventListener("openLeadPopup", handleHelpClick);
    window.addEventListener("storage", handleStorageChange);

    // Cleanup function
    return () => {
      window.removeEventListener("userLoggedIn", handleLogin);
      window.removeEventListener("openLeadPopup", handleHelpClick);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.whatsapp_number.trim()) {
      newErrors.whatsapp_number = "WhatsApp number is required";
    } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.whatsapp_number.replace(/\s/g, ""))) {
      newErrors.whatsapp_number = "Please enter a valid WhatsApp number";
    }

    if (formData.phone_number && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.phone_number.replace(/\s/g, ""))) {
      newErrors.phone_number = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/api/leads/submit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone_number: formData.phone_number.trim() || "",
          whatsapp_number: formData.whatsapp_number.trim(),
          course: "General Inquiry",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Mark popup as shown in this session
        if (typeof window !== "undefined") {
          sessionStorage.setItem("leadPopupShown", "true");
        }
        
        // Close popup after 2 seconds
        setTimeout(() => {
          setIsOpen(false);
          // Reset form after closing
          setTimeout(() => {
            setFormData({
              name: "",
              email: "",
              phone_number: "",
              whatsapp_number: "",
            });
            setSuccess(false);
          }, 300);
        }, 2000);
      } else {
        setErrors({ submit: data.message || "Failed to submit. Please try again." });
      }
    } catch (error) {
      console.error("Error submitting lead:", error);
      setErrors({ submit: "Network error. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Mark popup as shown so auto-popup doesn't show again in this session
    // But Help button can still open it manually
    if (typeof window !== "undefined") {
      sessionStorage.setItem("leadPopupShown", "true");
    }
  };

  const handleDialogChange = (open) => {
    setIsOpen(open);
    if (!open) {
      // Mark as shown when closed (only for auto-popup, not manual)
      if (typeof window !== "undefined" && !isLoggedIn) {
        sessionStorage.setItem("leadPopupShown", "true");
      }
    }
  };

  // Always render component and show dialog when isOpen is true
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0C1A35]">
            Get in Touch with Us!
          </DialogTitle>
          <DialogDescription className="text-[#0C1A35]/70">
            Fill in your details and our team will contact you soon to help you get started.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#0C1A35] mb-2">
              Thank You!
            </h3>
            <p className="text-[#0C1A35]/70">
              We've received your information. Our team will contact you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-[#0C1A35] font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
                required
                minLength={2}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-[#0C1A35] font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone_number" className="text-[#0C1A35] font-medium">
                Phone Number
              </Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder="Enter your phone number (optional)"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                className={`mt-1 ${errors.phone_number ? "border-red-500" : ""}`}
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
              )}
            </div>

            <div>
              <Label htmlFor="whatsapp_number" className="text-[#0C1A35] font-medium">
                WhatsApp Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="whatsapp_number"
                type="tel"
                placeholder="Enter your WhatsApp number"
                value={formData.whatsapp_number}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp_number: e.target.value })
                }
                className={`mt-1 ${errors.whatsapp_number ? "border-red-500" : ""}`}
                required
              />
              {errors.whatsapp_number && (
                <p className="text-red-500 text-sm mt-1">{errors.whatsapp_number}</p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Maybe Later
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#1A73E8] text-white hover:bg-[#1557B0]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

