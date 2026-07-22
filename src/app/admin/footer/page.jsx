"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Eye, Save } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  DEFAULT_FOOTER_SETTINGS,
  normalizeFooterSettings,
} from "@/lib/footerDefaults";
import { clearFooterSettingsCache } from "@/lib/fetchFooterSettings";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function AdminFooterPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState(DEFAULT_FOOTER_SETTINGS);

  useEffect(() => {
    fetchFooter();
  }, []);

  const fetchFooter = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/footer/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setFormData(normalizeFooterSettings(data.data || {}));
      } else {
        toast.error(data.error || "Failed to load footer settings");
      }
    } catch (error) {
      console.error("Error fetching footer settings:", error);
      toast.error("Failed to load footer settings");
    } finally {
      setFetching(false);
    }
  };

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = normalizeFooterSettings(formData);
      const res = await fetch(`${API_BASE_URL}/api/settings/footer/update/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        const saved = normalizeFooterSettings(data.data || payload);
        setFormData(saved);
        clearFooterSettingsCache();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("footerSettingsUpdated"));
        }
        setMessage("✅ Footer settings updated successfully!");
        toast.success("Footer settings saved");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const err = data.error || data.message || "Failed to save";
        setMessage(`❌ Error: ${err}`);
        toast.error(err);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      toast.error(err.message || "Failed to save footer settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-[#0C1A35]/70">Loading footer settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-[#0C1A35]">Footer Settings</h1>
          <p className="text-[#0C1A35]/60 mt-1">
            Edit footer labels, copyright, disclaimer, and display options. Logo,
            contact details, and social URLs are managed in Settings / Legal Pages.
          </p>
        </div>
        <Button
          onClick={() => window.open("/", "_blank")}
          variant="outline"
          className="gap-2 border-[#1A73E8] text-[#1A73E8] hover:bg-[#1A73E8]/10"
        >
          <Eye className="w-4 h-4" />
          Preview Site
        </Button>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.includes("✅")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-[#D3E3FF]">
          <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
            <CardTitle className="text-xl text-[#0C1A35]">Section Titles</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
            {[
              ["providers_title", "Providers Title"],
              ["resources_title", "Resources Title"],
              ["legal_title", "Legal Title"],
              ["contact_title", "Contact Title"],
            ].map(([key, label]) => (
              <div key={key}>
                <Label className="text-[#0C1A35] font-semibold">{label}</Label>
                <Input
                  value={formData[key] || ""}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#D3E3FF]">
          <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
            <CardTitle className="text-xl text-[#0C1A35]">Link Labels</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
            {[
              ["blogs_label", "Blogs"],
              ["faq_label", "FAQ"],
              ["privacy_policy_label", "Privacy Policy"],
              ["terms_label", "Terms & Conditions"],
              ["refund_policy_label", "Refund Policy"],
              ["disclaimer_link_label", "Disclaimer Link"],
              ["editor_policy_label", "Editor Policy"],
              ["contact_us_label", "Contact Us Link"],
            ].map(([key, label]) => (
              <div key={key}>
                <Label className="text-[#0C1A35] font-semibold">{label}</Label>
                <Input
                  value={formData[key] || ""}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#D3E3FF]">
          <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
            <CardTitle className="text-xl text-[#0C1A35]">
              Copyright & Brand
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label className="text-[#0C1A35] font-semibold">Copyright Text</Label>
              <Input
                value={formData.copyright || ""}
                onChange={(e) => updateField("copyright", e.target.value)}
                className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
              />
            </div>
            <div>
              <Label className="text-[#0C1A35] font-semibold">Brand Line</Label>
              <Input
                value={formData.brand_line || ""}
                onChange={(e) => updateField("brand_line", e.target.value)}
                className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
              />
            </div>
            <div>
              <Label className="text-[#0C1A35] font-semibold">SSL Secure Text</Label>
              <Input
                value={formData.ssl_secure || ""}
                onChange={(e) => updateField("ssl_secure", e.target.value)}
                className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D3E3FF]">
          <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
            <CardTitle className="text-xl text-[#0C1A35]">Footer Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label className="text-[#0C1A35] font-semibold">Disclaimer Label</Label>
              <Input
                value={formData.disclaimer_label || ""}
                onChange={(e) => updateField("disclaimer_label", e.target.value)}
                className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
              />
            </div>
            <div>
              <Label className="text-[#0C1A35] font-semibold">Disclaimer Text</Label>
              <Textarea
                value={formData.disclaimer_text || ""}
                onChange={(e) => updateField("disclaimer_text", e.target.value)}
                rows={6}
                className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D3E3FF]">
          <CardHeader className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1A73E8]/10">
            <CardTitle className="text-xl text-[#0C1A35]">Display Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div>
              <Label className="text-[#0C1A35] font-semibold">
                Providers Limit (1–20)
              </Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={formData.providers_limit ?? 5}
                onChange={(e) => updateField("providers_limit", e.target.value)}
                className="mt-2 border-[#D3E3FF] focus:border-[#1A73E8] max-w-xs"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum number of providers shown in the footer.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-[#D3E3FF] p-4">
              <div>
                <Label className="text-[#0C1A35] font-semibold">
                  Show Social Media Icons
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Social URLs themselves are configured in Admin → Settings.
                </p>
              </div>
              <Switch
                checked={formData.show_social_links !== false}
                onCheckedChange={(checked) =>
                  updateField("show_social_links", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-[#D3E3FF] p-4">
              <div>
                <Label className="text-[#0C1A35] font-semibold">
                  Show Footer Disclaimer
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Toggle the disclaimer paragraph in the footer bottom bar.
                </p>
              </div>
              <Switch
                checked={formData.show_disclaimer !== false}
                onCheckedChange={(checked) =>
                  updateField("show_disclaimer", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-6 text-lg bg-gradient-to-r from-[#1A73E8] to-[#1557B0] hover:from-[#1557B0] hover:to-[#1A73E8]"
        >
          <Save className="w-5 h-5 mr-2" />
          {loading ? "Saving..." : "Save Footer Settings"}
        </Button>
      </form>
    </div>
  );
}
