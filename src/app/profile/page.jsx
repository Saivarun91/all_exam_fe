"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Save, User, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    fullname: "",
    email: "",
    phone_number: "",
    location: "",
    profile_picture: ""
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    // Set page title
    document.title = "My Profile | AllExamQuestions";
    
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth?redirect=/profile");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/users/profile/`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
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
            profile_picture: profileData.profile_picture || ""
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      // Convert image to base64 if selected
      let profilePictureBase64 = profile.profile_picture;
      if (profileImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          profilePictureBase64 = reader.result;
          saveProfile(profilePictureBase64, token);
        };
        reader.readAsDataURL(profileImage);
      } else {
        saveProfile(profilePictureBase64, token);
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
        profile_picture: profilePicture
      };

      const res = await fetch(`${API_BASE_URL}/api/users/profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Update localStorage
          localStorage.setItem("name", profile.fullname);
          if (profilePicture) {
            localStorage.setItem("profile_picture", profilePicture);
          }
          
          alert("Profile updated successfully!");
          router.push("/dashboard");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
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
      return profile.fullname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return profile.email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center gap-4 pb-6 border-b">
              <div className="relative">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#1A73E8]"
                    loading="lazy"
                    sizes="128px"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1A73E8] to-[#4A90E2] flex items-center justify-center text-white text-4xl font-bold border-4 border-[#1A73E8]">
                    {getInitials()}
                  </div>
                )}
                <button
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

            {/* Registration Details Section */}
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

            {/* Editable Form Fields */}
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
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-100"
                  />
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

            {/* Action Buttons */}
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
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

