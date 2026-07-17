"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation/client";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, Save, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function AdminProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    role: "admin",
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const syncLocalStorage = (admin) => {
    if (!admin) return;
    localStorage.setItem("user_name", admin.name || "Admin");
    localStorage.setItem("user_email", admin.email || "");
    localStorage.setItem("name", admin.name || "Admin");
    localStorage.setItem("email", admin.email || "");
    window.dispatchEvent(new CustomEvent("adminProfileUpdated"));
    window.dispatchEvent(new Event("storage"));
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token || role !== "admin") {
        router.push("/admin/auth");
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/api/users/admin/profile/`, {
        headers: getAuthHeaders(),
      });

      if (res.data?.admin) {
        const admin = res.data.admin;
        setProfile({
          id: admin.id || "",
          name: admin.name || "",
          email: admin.email || "",
          role: admin.role || "admin",
        });
        setForm((prev) => ({
          ...prev,
          name: admin.name || "",
          email: admin.email || "",
        }));
        syncLocalStorage(admin);
      }
    } catch (err) {
      console.error("Failed to load admin profile:", err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        router.push("/admin/auth");
        return;
      }
      toast.error(err?.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const { currentPassword, newPassword, confirmPassword } = form;

    if (!name) {
      toast.error("Name is required");
      return;
    }

    if (!email) {
      toast.error("Email is required");
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        toast.error("Current password is required to change password");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
      }
    }

    setSaving(true);

    try {
      let updatedAdmin = { ...profile, name, email };

      if (name !== profile.name) {
        const nameRes = await axios.put(
          `${API_BASE_URL}/api/users/profile/`,
          { name },
          { headers: getAuthHeaders() }
        );
        if (nameRes.data?.profile) {
          updatedAdmin = {
            ...updatedAdmin,
            name: nameRes.data.profile.name || name,
            email: nameRes.data.profile.email || email,
            role: nameRes.data.profile.role || updatedAdmin.role,
            id: nameRes.data.profile.id || updatedAdmin.id,
          };
        }
      }

      const credentialsPayload = {};
      if (email !== profile.email) {
        credentialsPayload.email = email;
      }
      if (newPassword) {
        credentialsPayload.password = newPassword;
        credentialsPayload.current_password = currentPassword;
      }

      if (Object.keys(credentialsPayload).length > 0) {
        const credRes = await axios.put(
          `${API_BASE_URL}/api/users/admin/update-credentials/`,
          credentialsPayload,
          { headers: getAuthHeaders() }
        );
        if (credRes.data?.admin) {
          updatedAdmin = {
            ...updatedAdmin,
            name: credRes.data.admin.name || updatedAdmin.name,
            email: credRes.data.admin.email || email,
            role: credRes.data.admin.role || updatedAdmin.role,
            id: credRes.data.admin.id || updatedAdmin.id,
          };
        }
        if (newPassword) {
          localStorage.setItem("admin_password", newPassword);
        }
      }

      if (
        name === profile.name &&
        email === profile.email &&
        !newPassword
      ) {
        toast.error("No changes to save");
        setSaving(false);
        return;
      }

      setProfile(updatedAdmin);
      setForm((prev) => ({
        ...prev,
        name: updatedAdmin.name || "",
        email: updatedAdmin.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      syncLocalStorage(updatedAdmin);
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update admin profile:", err);
      toast.error(
        err?.response?.data?.error || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-16 flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="mt-16 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
          {(profile.name || "A").charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-sm text-gray-500">
            View and update your admin account details
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" />
            Profile Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Name / Username</Label>
              <Input
                id="admin-name"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Enter admin name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="Enter admin email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={profile.role || "admin"} readOnly className="bg-gray-100" />
            </div>

            <div className="border-t pt-5 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800">Change Password</h3>
                <p className="text-sm text-gray-500">
                  Leave blank to keep your current password
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={form.currentPassword}
                    onChange={handleChange("currentPassword")}
                    placeholder="Required only when changing password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Toggle current password visibility"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={form.newPassword}
                    onChange={handleChange("newPassword")}
                    placeholder="Enter new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Toggle new password visibility"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {form.newPassword ? (
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange("confirmPassword")}
                      placeholder="Confirm new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-700 hover:bg-blue-800"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
