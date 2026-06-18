"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Receipt,
  Download,
  CreditCard,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadInvoice } from "@/lib/downloadInvoice";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function formatDate(value) {
  if (!value) return "N/A";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [profile, setProfile] = useState({
    fullname: "",
    email: "",
    phone_number: "",
    location: "",
    profile_picture: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    document.title = "My Profile | AllExamQuestions";
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "billing") {
      fetchBillingHistory();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth?redirect=/profile");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/users/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          const profileData = data.profile;
          setProfile({
            fullname: profileData.fullname || "",
            email: profileData.email || "",
            phone_number: profileData.phone_number || "",
            location: profileData.location || "",
            profile_picture: profileData.profile_picture || "",
          });
          if (profileData.profile_picture) {
            setPreviewImage(profileData.profile_picture);
          }
        }
      } else if (res.status === 401) {
        router.push("/auth?redirect=/profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBillingHistory = async () => {
    try {
      setBillingLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth?redirect=/profile");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/enrollments/billing-history/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setBillingHistory(Array.isArray(data.data) ? data.data : []);
      } else if (res.status === 401) {
        router.push("/auth?redirect=/profile");
      }
    } catch (error) {
      console.error("Error fetching billing history:", error);
    } finally {
      setBillingLoading(false);
    }
  };

  const handleDownloadInvoice = async (paymentId) => {
    try {
      setDownloadingId(paymentId);
      await downloadInvoice(paymentId);
    } catch (error) {
      alert(error.message || "Failed to download invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (profileImage) {
        const reader = new FileReader();
        reader.onloadend = () => saveProfile(reader.result, token);
        reader.readAsDataURL(profileImage);
      } else {
        saveProfile(profile.profile_picture, token);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
      setSaving(false);
    }
  };

  const saveProfile = async (profilePicture, token) => {
    try {
      const updateData = {
        fullname: profile.fullname,
        phone_number: profile.phone_number,
        location: profile.location,
        profile_picture: profilePicture,
      };

      const res = await fetch(`${API_BASE_URL}/api/users/profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("name", profile.fullname);
          if (profilePicture && !profilePicture.startsWith("data:")) {
            localStorage.setItem("profile_picture", profilePicture);
          } else {
            localStorage.removeItem("profile_picture");
          }
          alert("Profile updated successfully!");
          router.push("/dashboard");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      alert(`Failed to save profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    if (profile.fullname) {
      return profile.fullname
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return profile.email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and billing history</p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-[#1A73E8] text-[#1A73E8]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("billing")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "billing"
                ? "border-[#1A73E8] text-[#1A73E8]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Billing History
            </span>
          </button>
        </div>

        {activeTab === "profile" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4 pb-6 border-b">
                <div className="relative">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#1A73E8]"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1A73E8] to-[#4A90E2] flex items-center justify-center text-white text-4xl font-bold border-4 border-[#1A73E8]">
                      {getInitials()}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-[#1A73E8] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#1557B0] transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-600 text-center">
                  Click the camera icon to upload a profile picture
                </p>
              </div>

              <div className="mb-6 pb-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Label className="text-xs text-gray-500 mb-1 block">Full Name</Label>
                    <p className="text-sm font-medium text-gray-900">{profile.fullname || "Not provided"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Label className="text-xs text-gray-500 mb-1 block">Email Address</Label>
                    <p className="text-sm font-medium text-gray-900">{profile.email || "Not provided"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Label className="text-xs text-gray-500 mb-1 block">Phone Number</Label>
                    <p className="text-sm font-medium text-gray-900">{profile.phone_number || "Not provided"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Label className="text-xs text-gray-500 mb-1 block">Location</Label>
                    <p className="text-sm font-medium text-gray-900">{profile.location || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Your Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullname" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input
                      id="fullname"
                      value={profile.fullname}
                      onChange={(e) => setProfile({ ...profile, fullname: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input id="email" value={profile.email} disabled className="bg-gray-100" />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={profile.phone_number}
                      onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="Enter your location"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#1A73E8] hover:bg-[#1557B0] text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "billing" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#1A73E8]" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {billingLoading ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1A73E8] mx-auto mb-3" />
                  <p className="text-gray-600">Loading billing history...</p>
                </div>
              ) : billingHistory.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No completed payments found yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {billingHistory.map((item) => (
                      <div
                        key={item.payment_id}
                        className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{item.exam_name}</h3>
                              <p className="text-sm text-gray-600">Plan: {item.plan_name || "N/A"}</p>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-500">Invoice No:</span>{" "}
                                <span className="font-medium">{item.invoice_number}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-gray-500">Paid:</span>{" "}
                                <span className="font-medium">{formatDate(item.paid_at)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Amount:</span>{" "}
                                <span className="font-semibold text-[#1A73E8]">{item.amount_display}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Transaction ID:</span>{" "}
                                <span className="font-mono text-xs break-all">{item.transaction_id || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDownloadInvoice(item.payment_id)}
                            disabled={downloadingId === item.payment_id}
                            className="bg-[#1A73E8] hover:bg-[#1557B0] text-white shrink-0"
                          >
                            {downloadingId === item.payment_id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Download Invoice
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
