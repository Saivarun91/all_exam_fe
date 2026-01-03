"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast"; // toast notifications
import { Eye, EyeOff } from "lucide-react";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultUserRole, setDefaultUserRole] = useState("user");
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [socialFacebookUrl, setSocialFacebookUrl] = useState("");
  const [socialTwitterUrl, setSocialTwitterUrl] = useState("");
  const [socialLinkedinUrl, setSocialLinkedinUrl] = useState("");
  const [socialYoutubeUrl, setSocialYoutubeUrl] = useState("");
  const [socialInstagramUrl, setSocialInstagramUrl] = useState("");
  const [fontFamily, setFontFamily] = useState("Poppins");
  const [fontSize, setFontSize] = useState("16");
  const [fontFamilyMode, setFontFamilyMode] = useState("dropdown"); // "dropdown" or "custom"
  const [customFontFamily, setCustomFontFamily] = useState("");

  console.log("logoUrl", logoUrl);
  // Admin credentials change states
  const [currentAdminEmail, setCurrentAdminEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingCredentials, setIsUpdatingCredentials] = useState(false);
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Fetch settings and admin profile on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
        const res = await axios.get(`${API_BASE_URL}/api/settings/get/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("res", res);

        if (res.data.success) {
          const d = res.data.data;
          console.log("Settings data:", d);
          console.log("Logo URL from API:", d.logo_url);
          setSiteName(d.site_name || "");
          setAdminEmail(d.admin_email || "");
          const logoUrlValue = d.logo_url || "";
          setLogoUrl(logoUrlValue);
          setLogoPreview(logoUrlValue);
          console.log("Logo preview set to:", logoUrlValue);
          setEmailNotifications(d.email_notifications || false);
          setMaintenanceMode(d.maintenance_mode || false);
          setDefaultUserRole(d.default_user_role || "user");
          setSessionTimeout(Number(d.session_timeout) || 30);
          setSocialFacebookUrl(d.social_facebook_url || "");
          setSocialTwitterUrl(d.social_twitter_url || "");
          setSocialLinkedinUrl(d.social_linkedin_url || "");
          setSocialYoutubeUrl(d.social_youtube_url || "");
          setSocialInstagramUrl(d.social_instagram_url || "");
          const savedFontFamily = d.font_family || "Poppins";
          setFontSize(d.font_size || "16");
          
          // Check if saved font is in the dropdown list
          const commonFonts = ["Poppins", "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New", "Calibri", "Tahoma", "Trebuchet MS", "Comic Sans MS", "Impact", "Lucida Console", "Palatino", "Garamond", "Book Antiqua", "Arial Black", "Century Gothic", "Franklin Gothic Medium", "Lucida Sans Unicode", "MS Sans Serif", "MS Serif"];
          if (commonFonts.includes(savedFontFamily)) {
            setFontFamily(savedFontFamily);
            setFontFamilyMode("dropdown");
            setCustomFontFamily("");
          } else {
            setFontFamily("Custom");
            setFontFamilyMode("custom");
            setCustomFontFamily(savedFontFamily);
          }
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
        toast.error("❌ Failed to fetch settings");
      }
    };

    const fetchAdminProfile = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
        const res = await axios.get(`${API_BASE_URL}/api/users/admin/profile/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.data.admin) {
          setCurrentAdminEmail(res.data.admin.email || "");
          // Update localStorage with current email
          localStorage.setItem("user_email", res.data.admin.email || "");
          localStorage.setItem("user_name", res.data.admin.name || "Admin");
        }
      } catch (err) {
        console.error("Error fetching admin profile:", err);
        // Fallback to localStorage if API fails
        const storedEmail = localStorage.getItem("user_email");
        if (storedEmail) {
          setCurrentAdminEmail(storedEmail);
        }
      }
    };

    fetchSettings();
    fetchAdminProfile();
  }, []);

  // Cloudinary constants
  const CLOUD_NAME = "dhy0krkef";
  const UPLOAD_PRESET = "preptara";

  // Handle logo upload
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("❌ Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("❌ Image size should be less than 5MB");
      return;
    }

    setUploadingLogo(true);

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    const imageData = new FormData();
    imageData.append("file", file);
    imageData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: imageData,
      });

      const data = await res.json();
      if (data.secure_url) {
        setLogoUrl(data.secure_url);
        setLogoPreview(data.secure_url);
        toast.success("✅ Logo uploaded successfully!");
      } else {
        toast.error("❌ Logo upload failed!");
        setLogoPreview(logoUrl);
      }
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      toast.error("❌ Logo upload failed!");
      setLogoPreview(logoUrl);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle logo removal
  const handleRemoveLogo = () => {
    setLogoUrl("");
    setLogoPreview("");
    // Clear the file input
    const fileInput = document.getElementById('logo-upload');
    if (fileInput) {
      fileInput.value = '';
    }
    toast.success("✅ Logo removed");
  };

  // ✅ Common reusable function to update settings
  const updateSettings = async (updatedFields, successMessage) => {
    try {
      const payload = {
        site_name: siteName,
        admin_email: adminEmail,
        logo_url: logoUrl,
        email_notifications: emailNotifications,
        maintenance_mode: maintenanceMode,
        default_user_role: defaultUserRole,
        session_timeout: sessionTimeout,
        social_facebook_url: socialFacebookUrl,
        social_twitter_url: socialTwitterUrl,
        social_linkedin_url: socialLinkedinUrl,
        social_youtube_url: socialYoutubeUrl,
        social_instagram_url: socialInstagramUrl,
        font_family: fontFamilyMode === "custom" ? customFontFamily : fontFamily,
        font_size: fontSize,
        ...updatedFields,
      };

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
      const res = await axios.post(`${API_BASE_URL}/api/settings/update/`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.success) {
        toast.success(successMessage, {
          style: {
            background: '#f0fdf4',
            color: '#16a34a',
            fontWeight: '500',
          },
        });
        
        // Trigger events to refresh components
        if (typeof window !== 'undefined') {
          // If site name was updated, trigger site name update event
          if (updatedFields.site_name !== undefined) {
            window.dispatchEvent(new CustomEvent('siteNameUpdated'));
            localStorage.removeItem('siteNameCache');
          }
          
          // If logo was updated, trigger logo update event
          if (updatedFields.logo_url !== undefined) {
            window.dispatchEvent(new CustomEvent('logoUpdated'));
          }
          
          // If social media URLs were updated, trigger social media update event
          if (updatedFields.social_facebook_url !== undefined || 
              updatedFields.social_twitter_url !== undefined ||
              updatedFields.social_linkedin_url !== undefined ||
              updatedFields.social_youtube_url !== undefined ||
              updatedFields.social_instagram_url !== undefined) {
            window.dispatchEvent(new CustomEvent('socialMediaUrlsUpdated'));
          }
          
          // If font settings were updated, trigger font update event
          if (updatedFields.font_family !== undefined || updatedFields.font_size !== undefined) {
            window.dispatchEvent(new CustomEvent('fontSettingsUpdated'));
          }
        }
      } else {
        toast.error(res.data.message || "⚠️ Failed to update settings");
      }
    } catch (err) {
      console.error("Error updating settings:", err);
      toast.error("❌ Something went wrong while saving");
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Admin Settings</h1>
        <p className="text-gray-500">Manage platform-wide admin configurations.</p>
      </motion.div>

      {/* General Settings */}
      <Card className="border hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="w-40 font-medium text-gray-700">Site Name:</label>
            <Input
              className="flex-1"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Enter site name"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="w-40 font-medium text-gray-700">Admin Email:</label>
            <Input
              className="flex-1"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="Enter admin email"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <label className="w-40 font-medium text-gray-700 pt-2">Logo:</label>
            <div className="flex-1 flex flex-col gap-3">
              {logoPreview && (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    width={200}
                    height={80}
                    className="h-20 w-auto max-w-[200px] object-contain border border-gray-300 rounded-lg p-2 bg-gray-50"
                    loading="lazy"
                    sizes="(max-width: 768px) 150px, 200px"
                  />
                </div>
              )}
              <div className="flex gap-2 items-center">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={uploadingLogo}
                  className="flex-1"
                />
                {logoPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveLogo}
                    disabled={uploadingLogo}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
              {uploadingLogo && (
                <p className="text-sm text-gray-500">Uploading logo...</p>
              )}
              <p className="text-xs text-gray-500">Upload a logo image (max 5MB, recommended: PNG or JPG)</p>
            </div>
          </div>

          <Button
            className="w-fit mt-2"
            onClick={() =>
              updateSettings(
                { site_name: siteName, admin_email: adminEmail, logo_url: logoUrl },
                "✅ General settings saved successfully!"
              )
            }
          >
            Save General Settings
          </Button>
        </CardContent>
      </Card>

      {/* Social Media Settings */}
      <Card className="border hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle>Social Media URLs</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="w-40 font-medium text-gray-700">Facebook URL:</label>
            <Input
              className="flex-1"
              type="url"
              value={socialFacebookUrl}
              onChange={(e) => setSocialFacebookUrl(e.target.value)}
              placeholder="https://www.facebook.com/yourpage"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="w-40 font-medium text-gray-700">Twitter URL:</label>
            <Input
              className="flex-1"
              type="url"
              value={socialTwitterUrl}
              onChange={(e) => setSocialTwitterUrl(e.target.value)}
              placeholder="https://www.twitter.com/yourhandle"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="w-40 font-medium text-gray-700">LinkedIn URL:</label>
            <Input
              className="flex-1"
              type="url"
              value={socialLinkedinUrl}
              onChange={(e) => setSocialLinkedinUrl(e.target.value)}
              placeholder="https://www.linkedin.com/company/yourcompany"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="w-40 font-medium text-gray-700">YouTube URL:</label>
            <Input
              className="flex-1"
              type="url"
              value={socialYoutubeUrl}
              onChange={(e) => setSocialYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/@yourchannel"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="w-40 font-medium text-gray-700">Instagram URL:</label>
            <Input
              className="flex-1"
              type="url"
              value={socialInstagramUrl}
              onChange={(e) => setSocialInstagramUrl(e.target.value)}
              placeholder="https://www.instagram.com/yourhandle"
            />
          </div>

          <Button
            className="w-fit mt-2"
            onClick={() =>
              updateSettings(
                {
                  social_facebook_url: socialFacebookUrl,
                  social_twitter_url: socialTwitterUrl,
                  social_linkedin_url: socialLinkedinUrl,
                  social_youtube_url: socialYoutubeUrl,
                  social_instagram_url: socialInstagramUrl,
                },
                "✅ Social media URLs saved successfully!"
              )
            }
          >
            Save Social Media URLs
          </Button>
        </CardContent>
      </Card>

      {/* Font Settings */}
      <Card className="border hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle>Font Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="w-40 font-medium text-gray-700">Font Family:</label>
            <div className="flex-1 flex flex-col gap-2">
              <select
                className="border border-gray-300 rounded-lg p-2"
                value={fontFamilyMode === "custom" ? "Custom" : fontFamily}
                onChange={(e) => {
                  if (e.target.value === "Custom") {
                    setFontFamilyMode("custom");
                    setFontFamily("Custom");
                  } else {
                    setFontFamilyMode("dropdown");
                    setFontFamily(e.target.value);
                    setCustomFontFamily("");
                  }
                }}
              >
                <option value="Poppins">Poppins</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
                <option value="Calibri">Calibri</option>
                <option value="Tahoma">Tahoma</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Impact">Impact</option>
                <option value="Lucida Console">Lucida Console</option>
                <option value="Palatino">Palatino</option>
                <option value="Garamond">Garamond</option>
                <option value="Book Antiqua">Book Antiqua</option>
                <option value="Arial Black">Arial Black</option>
                <option value="Century Gothic">Century Gothic</option>
                <option value="Franklin Gothic Medium">Franklin Gothic Medium</option>
                <option value="Lucida Sans Unicode">Lucida Sans Unicode</option>
                <option value="MS Sans Serif">MS Sans Serif</option>
                <option value="MS Serif">MS Serif</option>
                <option value="Custom">Custom (Enter manually)</option>
              </select>
              {fontFamilyMode === "custom" && (
                <Input
                  type="text"
                  className="border border-gray-300 rounded-lg p-2"
                  value={customFontFamily}
                  onChange={(e) => setCustomFontFamily(e.target.value)}
                  placeholder="Enter custom font name (e.g., Roboto, Open Sans)"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="w-40 font-medium text-gray-700">Font Size (px):</label>
            <Input
              type="number"
              className="flex-1"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              placeholder="Enter font size in pixels"
              min="10"
              max="24"
            />
          </div>

          <p className="text-xs text-gray-500">
            These settings will apply to the entire website. Select a font from the dropdown or choose "Custom" to enter a font name manually. Default: Poppins, 16px
          </p>

          <Button
            className="w-fit mt-2"
            onClick={() => {
              const finalFontFamily = fontFamilyMode === "custom" ? customFontFamily : fontFamily;
              if (fontFamilyMode === "custom" && !customFontFamily.trim()) {
                toast.error("❌ Please enter a custom font name");
                return;
              }
              updateSettings(
                {
                  font_family: finalFontFamily,
                  font_size: fontSize,
                },
                "✅ Font settings saved successfully!"
              );
            }}
          >
            Save Font Settings
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Email Notifications</span>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Maintenance Mode</span>
            <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
          </div>

          <Button
            className="w-fit mt-2"
            onClick={() =>
              updateSettings(
                {
                  email_notifications: emailNotifications,
                  maintenance_mode: maintenanceMode,
                },
                "📢 Notification settings saved successfully!"
              )
            }
          >
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Admin Credentials */}
      <Card className="border hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle>Change Admin Credentials</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Current Email Address
                <span className="text-gray-400 text-sm font-normal ml-1">(Display only)</span>
              </label>
              <Input
                type="email"
                value={currentAdminEmail}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
                placeholder="Current email address"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Current Password
                {newPassword && <span className="text-red-500 ml-1">*</span>}
                {!newPassword && <span className="text-gray-400 text-sm font-normal ml-1">(Required only if changing password)</span>}
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password (required for password change)"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                New Password
                <span className="text-gray-400 text-sm font-normal ml-1">(Optional - leave empty to keep current)</span>
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (leave empty to keep current)"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {newPassword && (
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Confirm New Password
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <Button
              className="w-fit mt-2 bg-blue-700 hover:bg-blue-800"
              disabled={isUpdatingCredentials}
              onClick={async () => {
                if (newPassword && newPassword !== confirmPassword) {
                  toast.error("❌ New passwords do not match");
                  return;
                }

                if (newPassword && !currentPassword) {
                  toast.error("❌ Current password is required to change password");
                  return;
                }

                setIsUpdatingCredentials(true);
                try {
                  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
                  const payload = {};

                  // Only update password if provided
                  if (newPassword) {
                    payload.password = newPassword;
                    payload.current_password = currentPassword;
                  }

                  if (Object.keys(payload).length === 0) {
                    toast.error("❌ Please enter a new password to update");
                    setIsUpdatingCredentials(false);
                    return;
                  }

                  const res = await axios.put(
                    `${API_BASE_URL}/api/users/admin/update-credentials/`,
                    payload,
                    {
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                    }
                  );

                  if (res.data.message) {
                    toast.success("✅ Credentials updated successfully!");
                    // Fetch updated admin profile
                    const profileRes = await axios.get(
                      `${API_BASE_URL}/api/users/admin/profile/`,
                      {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                      }
                    );
                    if (profileRes.data.admin) {
                      setCurrentAdminEmail(profileRes.data.admin.email || "");
                      localStorage.setItem("user_email", profileRes.data.admin.email || "");
                      localStorage.setItem("user_name", profileRes.data.admin.name || "Admin");
                      // Update stored password if new password was set
                      if (newPassword) {
                        localStorage.setItem("admin_password", newPassword);
                      }
                      // Trigger custom event for navbar update
                      window.dispatchEvent(new CustomEvent("adminProfileUpdated"));
                      // Also trigger storage event for cross-tab updates
                      window.dispatchEvent(new Event("storage"));
                    }
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  } else {
                    toast.error(res.data.error || "❌ Failed to update credentials");
                  }
                } catch (err) {
                  console.error("Error updating credentials:", err);
                  const errorMsg = err.response?.data?.error || "❌ Failed to update credentials";
                  toast.error(errorMsg);
                } finally {
                  setIsUpdatingCredentials(false);
                }
              }}
            >
              {isUpdatingCredentials ? "Updating..." : "Update Credentials"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="border hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="w-40 font-medium text-gray-700">Default User Role:</label>
            <select
              className="flex-1 border border-gray-300 rounded-lg p-2"
              value={defaultUserRole}
              onChange={(e) => setDefaultUserRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="w-40 font-medium text-gray-700">Session Timeout (mins):</label>
            <Input
              type="number"
              className="flex-1"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(Number(e.target.value))}
              placeholder="Enter minutes"
            />
          </div>

          <Button
            className="w-fit mt-2"
            onClick={() =>
              updateSettings(
                {
                  default_user_role: defaultUserRole,
                  session_timeout: sessionTimeout,
                },
                "⚙️ Advanced settings saved successfully!"
              )
            }
          >
            Save Advanced Settings
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
