"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

export default function LegalPagesPage() {
  return (
    <div className="p-6 flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Legal Pages Content Management</h1>
        <p className="text-gray-500">Manage privacy policy, terms & conditions, refund policy, and disclaimer content.</p>
      </motion.div>

      <Card className="border hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle>Legal Pages Content Management</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <PrivacyTermsManager />
        </CardContent>
      </Card>
    </div>
  );
}

// Privacy & Terms Management Component
function PrivacyTermsManager() {
  const [privacyContent, setPrivacyContent] = useState("");
  const [privacyMetaTitle, setPrivacyMetaTitle] = useState("");
  const [privacyMetaKeywords, setPrivacyMetaKeywords] = useState("");
  const [privacyMetaDescription, setPrivacyMetaDescription] = useState("");
  
  const [termsContent, setTermsContent] = useState("");
  const [termsMetaTitle, setTermsMetaTitle] = useState("");
  const [termsMetaKeywords, setTermsMetaKeywords] = useState("");
  const [termsMetaDescription, setTermsMetaDescription] = useState("");
  
  const [refundContent, setRefundContent] = useState("");
  const [refundMetaTitle, setRefundMetaTitle] = useState("");
  const [refundMetaKeywords, setRefundMetaKeywords] = useState("");
  const [refundMetaDescription, setRefundMetaDescription] = useState("");
  
  const [disclaimerContent, setDisclaimerContent] = useState("");
  const [disclaimerMetaTitle, setDisclaimerMetaTitle] = useState("");
  const [disclaimerMetaKeywords, setDisclaimerMetaKeywords] = useState("");
  const [disclaimerMetaDescription, setDisclaimerMetaDescription] = useState("");
  
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactWebsite, setContactWebsite] = useState("");
  const [contactMetaTitle, setContactMetaTitle] = useState("");
  const [contactMetaKeywords, setContactMetaKeywords] = useState("");
  const [contactMetaDescription, setContactMetaDescription] = useState("");
  
  const [loadingPrivacy, setLoadingPrivacy] = useState(false);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingRefund, setLoadingRefund] = useState(false);
  const [loadingDisclaimer, setLoadingDisclaimer] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);
  const [activeTab, setActiveTab] = useState("privacy");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
        const token = localStorage.getItem("token");

        const [privacyRes, termsRes, refundRes, disclaimerRes, contactRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/settings/privacy-policy/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/settings/terms-of-service/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/settings/refund-cancellation-policy/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/settings/disclaimer/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/settings/contact-us/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (privacyRes.ok) {
          const data = await privacyRes.json();
          setPrivacyContent(data.content || "");
          setPrivacyMetaTitle(data.meta_title || "");
          setPrivacyMetaKeywords(data.meta_keywords || "");
          setPrivacyMetaDescription(data.meta_description || "");
        }
        if (termsRes.ok) {
          const data = await termsRes.json();
          setTermsContent(data.content || "");
          setTermsMetaTitle(data.meta_title || "");
          setTermsMetaKeywords(data.meta_keywords || "");
          setTermsMetaDescription(data.meta_description || "");
        }
        if (refundRes.ok) {
          const data = await refundRes.json();
          setRefundContent(data.content || "");
          setRefundMetaTitle(data.meta_title || "");
          setRefundMetaKeywords(data.meta_keywords || "");
          setRefundMetaDescription(data.meta_description || "");
        }
        if (disclaimerRes.ok) {
          const data = await disclaimerRes.json();
          setDisclaimerContent(data.content || "");
          setDisclaimerMetaTitle(data.meta_title || "");
          setDisclaimerMetaKeywords(data.meta_keywords || "");
          setDisclaimerMetaDescription(data.meta_description || "");
        }
        if (contactRes.ok) {
          const data = await contactRes.json();
          setContactEmail(data.contact_email || "");
          setContactPhone(data.contact_phone || "");
          setContactAddress(data.contact_address || "");
          setContactWebsite(data.contact_website || "");
          setContactMetaTitle(data.meta_title || "");
          setContactMetaKeywords(data.meta_keywords || "");
          setContactMetaDescription(data.meta_description || "");
        }
      } catch (err) {
        console.error("Error fetching content:", err);
      }
    };

    fetchContent();
  }, []);

  const handleSavePrivacy = async () => {
    setLoadingPrivacy(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/settings/privacy-policy/update/`,
        { 
          content: privacyContent,
          meta_title: privacyMetaTitle,
          meta_keywords: privacyMetaKeywords,
          meta_description: privacyMetaDescription
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("✅ Privacy Policy updated successfully!");
      } else {
        toast.error(res.data.error || "Failed to update privacy policy");
      }
    } catch (err) {
      console.error("Error updating privacy policy:", err);
      toast.error("❌ Failed to update privacy policy");
    } finally {
      setLoadingPrivacy(false);
    }
  };

  const handleSaveTerms = async () => {
    setLoadingTerms(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/settings/terms-of-service/update/`,
        { 
          content: termsContent,
          meta_title: termsMetaTitle,
          meta_keywords: termsMetaKeywords,
          meta_description: termsMetaDescription
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("✅ Terms of Service updated successfully!");
      } else {
        toast.error(res.data.error || "Failed to update terms of service");
      }
    } catch (err) {
      console.error("Error updating terms:", err);
      toast.error("❌ Failed to update terms of service");
    } finally {
      setLoadingTerms(false);
    }
  };

  const handleSaveRefund = async () => {
    setLoadingRefund(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/settings/refund-cancellation-policy/update/`,
        { 
          content: refundContent,
          meta_title: refundMetaTitle,
          meta_keywords: refundMetaKeywords,
          meta_description: refundMetaDescription
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("✅ Refund & Cancellation Policy updated successfully!");
      } else {
        toast.error(res.data.error || "Failed to update refund & cancellation policy");
      }
    } catch (err) {
      console.error("Error updating refund policy:", err);
      toast.error("❌ Failed to update refund & cancellation policy");
    } finally {
      setLoadingRefund(false);
    }
  };

  const handleSaveDisclaimer = async () => {
    setLoadingDisclaimer(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/settings/disclaimer/update/`,
        { 
          content: disclaimerContent,
          meta_title: disclaimerMetaTitle,
          meta_keywords: disclaimerMetaKeywords,
          meta_description: disclaimerMetaDescription
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("✅ Disclaimer updated successfully!");
      } else {
        toast.error(res.data.error || "Failed to update disclaimer");
      }
    } catch (err) {
      console.error("Error updating disclaimer:", err);
      toast.error("❌ Failed to update disclaimer");
    } finally {
      setLoadingDisclaimer(false);
    }
  };

  const handleSaveContact = async () => {
    setLoadingContact(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/settings/contact-us/update/`,
        { 
          contact_email: contactEmail,
          contact_phone: contactPhone,
          contact_address: contactAddress,
          contact_website: contactWebsite,
          meta_title: contactMetaTitle,
          meta_keywords: contactMetaKeywords,
          meta_description: contactMetaDescription
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("✅ Contact Us details updated successfully!");
      } else {
        toast.error(res.data.error || "Failed to update contact us details");
      }
    } catch (err) {
      console.error("Error updating contact us:", err);
      toast.error("❌ Failed to update contact us details");
    } finally {
      setLoadingContact(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab("privacy")}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === "privacy"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setActiveTab("terms")}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === "terms"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Terms & Conditions
        </button>
        <button
          onClick={() => setActiveTab("refund")}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === "refund"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Refund & Cancellation
        </button>
        <button
          onClick={() => setActiveTab("disclaimer")}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === "disclaimer"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Disclaimer
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === "contact"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Contact Us
        </button>
      </div>

      {activeTab === "privacy" && (
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Privacy Policy Content
            </label>
            <textarea
              value={privacyContent}
              onChange={(e) => setPrivacyContent(e.target.value)}
              rows={15}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Enter privacy policy content..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This content will be displayed on the Privacy Policy page
            </p>
          </div>
          
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-gray-700">SEO Settings</h3>
            <div>
              <Label htmlFor="privacy-meta-title" className="block font-medium text-gray-700 mb-2">
                Meta Title
              </Label>
              <Input
                id="privacy-meta-title"
                value={privacyMetaTitle}
                onChange={(e) => setPrivacyMetaTitle(e.target.value)}
                placeholder="Enter meta title for SEO..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
            </div>
            <div>
              <Label htmlFor="privacy-meta-keywords" className="block font-medium text-gray-700 mb-2">
                Meta Keywords
              </Label>
              <Input
                id="privacy-meta-keywords"
                value={privacyMetaKeywords}
                onChange={(e) => setPrivacyMetaKeywords(e.target.value)}
                placeholder="Enter meta keywords (comma-separated)..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
            </div>
            <div>
              <Label htmlFor="privacy-meta-description" className="block font-medium text-gray-700 mb-2">
                Meta Description
              </Label>
              <Textarea
                id="privacy-meta-description"
                value={privacyMetaDescription}
                onChange={(e) => setPrivacyMetaDescription(e.target.value)}
                rows={3}
                placeholder="Enter meta description for SEO..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
            </div>
          </div>
          
          <Button
            onClick={handleSavePrivacy}
            disabled={loadingPrivacy}
            className="bg-blue-700 hover:bg-blue-800"
          >
            {loadingPrivacy ? "Saving..." : "Save Privacy Policy"}
          </Button>
        </div>
      )}

      {activeTab === "terms" && (
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Terms & Conditions Content
            </label>
            <textarea
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
              rows={15}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Enter terms & conditions content..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This content will be displayed on the Terms & Conditions page
            </p>
          </div>
          
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-gray-700">SEO Settings</h3>
            <div>
              <Label htmlFor="terms-meta-title" className="block font-medium text-gray-700 mb-2">
                Meta Title
              </Label>
              <Input
                id="terms-meta-title"
                value={termsMetaTitle}
                onChange={(e) => setTermsMetaTitle(e.target.value)}
                placeholder="Enter meta title for SEO..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
            </div>
            <div>
              <Label htmlFor="terms-meta-keywords" className="block font-medium text-gray-700 mb-2">
                Meta Keywords
              </Label>
              <Input
                id="terms-meta-keywords"
                value={termsMetaKeywords}
                onChange={(e) => setTermsMetaKeywords(e.target.value)}
                placeholder="Enter meta keywords (comma-separated)..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
            </div>
            <div>
              <Label htmlFor="terms-meta-description" className="block font-medium text-gray-700 mb-2">
                Meta Description
              </Label>
              <Textarea
                id="terms-meta-description"
                value={termsMetaDescription}
                onChange={(e) => setTermsMetaDescription(e.target.value)}
                rows={3}
                placeholder="Enter meta description for SEO..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
            </div>
          </div>
          
          <Button
            onClick={handleSaveTerms}
            disabled={loadingTerms}
            className="bg-blue-700 hover:bg-blue-800"
          >
            {loadingTerms ? "Saving..." : "Save Terms & Conditions"}
          </Button>
        </div>
      )}

      {activeTab === "refund" && (
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Refund & Cancellation Policy Content
            </label>
            <textarea
              value={refundContent}
              onChange={(e) => setRefundContent(e.target.value)}
              rows={15}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Enter refund & cancellation policy content..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This content will be displayed on the Refund & Cancellation Policy page
            </p>
          </div>
          
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-gray-700">SEO Settings</h3>
            <div>
              <Label htmlFor="refund-meta-title" className="block font-medium text-gray-700 mb-2">
                Meta Title
              </Label>
              <Input
                id="refund-meta-title"
                value={refundMetaTitle}
                onChange={(e) => setRefundMetaTitle(e.target.value)}
                placeholder="Enter meta title for SEO..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
            </div>
            <div>
              <Label htmlFor="refund-meta-keywords" className="block font-medium text-gray-700 mb-2">
                Meta Keywords
              </Label>
              <Input
                id="refund-meta-keywords"
                value={refundMetaKeywords}
                onChange={(e) => setRefundMetaKeywords(e.target.value)}
                placeholder="Enter meta keywords (comma-separated)..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
            </div>
            <div>
              <Label htmlFor="refund-meta-description" className="block font-medium text-gray-700 mb-2">
                Meta Description
              </Label>
              <Textarea
                id="refund-meta-description"
                value={refundMetaDescription}
                onChange={(e) => setRefundMetaDescription(e.target.value)}
                rows={3}
                placeholder="Enter meta description for SEO..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
            </div>
          </div>
          
          <Button
            onClick={handleSaveRefund}
            disabled={loadingRefund}
            className="bg-blue-700 hover:bg-blue-800"
          >
            {loadingRefund ? "Saving..." : "Save Refund & Cancellation Policy"}
          </Button>
        </div>
      )}

      {activeTab === "disclaimer" && (
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Disclaimer Content
            </label>
            <textarea
              value={disclaimerContent}
              onChange={(e) => setDisclaimerContent(e.target.value)}
              rows={15}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Enter disclaimer content..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This content will be displayed on the Disclaimer page
            </p>
          </div>
          
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-gray-700">SEO Settings</h3>
            <div>
              <Label htmlFor="disclaimer-meta-title" className="block font-medium text-gray-700 mb-2">
                Meta Title
              </Label>
              <Input
                id="disclaimer-meta-title"
                value={disclaimerMetaTitle}
                onChange={(e) => setDisclaimerMetaTitle(e.target.value)}
                placeholder="Enter meta title for SEO..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
            </div>
            <div>
              <Label htmlFor="disclaimer-meta-keywords" className="block font-medium text-gray-700 mb-2">
                Meta Keywords
              </Label>
              <Input
                id="disclaimer-meta-keywords"
                value={disclaimerMetaKeywords}
                onChange={(e) => setDisclaimerMetaKeywords(e.target.value)}
                placeholder="Enter meta keywords (comma-separated)..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
            </div>
            <div>
              <Label htmlFor="disclaimer-meta-description" className="block font-medium text-gray-700 mb-2">
                Meta Description
              </Label>
              <Textarea
                id="disclaimer-meta-description"
                value={disclaimerMetaDescription}
                onChange={(e) => setDisclaimerMetaDescription(e.target.value)}
                rows={3}
                placeholder="Enter meta description for SEO..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
            </div>
          </div>
          
          <Button
            onClick={handleSaveDisclaimer}
            disabled={loadingDisclaimer}
            className="bg-blue-700 hover:bg-blue-800"
          >
            {loadingDisclaimer ? "Saving..." : "Save Disclaimer"}
          </Button>
        </div>
      )}

      {activeTab === "contact" && (
        <div className="space-y-4">
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-gray-700">Contact Details</h3>
            <div>
              <Label htmlFor="contact-email" className="block font-medium text-gray-700 mb-2">
                Contact Email
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Enter contact email (e.g., support@example.com)"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="contact-phone" className="block font-medium text-gray-700 mb-2">
                Contact Phone
              </Label>
              <Input
                id="contact-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Enter contact phone (e.g., +1 234-567-8900)"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="contact-address" className="block font-medium text-gray-700 mb-2">
                Contact Address
              </Label>
              <Textarea
                id="contact-address"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                rows={4}
                placeholder="Enter full contact address"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="contact-website" className="block font-medium text-gray-700 mb-2">
                Contact Website
              </Label>
              <Input
                id="contact-website"
                type="url"
                value={contactWebsite}
                onChange={(e) => setContactWebsite(e.target.value)}
                placeholder="Enter website URL (e.g., https://example.com)"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-gray-700">SEO Settings</h3>
            <div>
              <Label htmlFor="contact-meta-title" className="block font-medium text-gray-700 mb-2">
                Meta Title
              </Label>
              <Input
                id="contact-meta-title"
                value={contactMetaTitle}
                onChange={(e) => setContactMetaTitle(e.target.value)}
                placeholder="Enter meta title for SEO..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
            </div>
            <div>
              <Label htmlFor="contact-meta-keywords" className="block font-medium text-gray-700 mb-2">
                Meta Keywords
              </Label>
              <Input
                id="contact-meta-keywords"
                value={contactMetaKeywords}
                onChange={(e) => setContactMetaKeywords(e.target.value)}
                placeholder="Enter meta keywords (comma-separated)..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
            </div>
            <div>
              <Label htmlFor="contact-meta-description" className="block font-medium text-gray-700 mb-2">
                Meta Description
              </Label>
              <Textarea
                id="contact-meta-description"
                value={contactMetaDescription}
                onChange={(e) => setContactMetaDescription(e.target.value)}
                rows={3}
                placeholder="Enter meta description for SEO..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
            </div>
          </div>
          
          <Button
            onClick={handleSaveContact}
            disabled={loadingContact}
            className="bg-blue-700 hover:bg-blue-800"
          >
            {loadingContact ? "Saving..." : "Save Contact Us"}
          </Button>
        </div>
      )}
    </div>
  );
}

