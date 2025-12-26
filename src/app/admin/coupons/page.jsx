"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, Edit, Copy, Percent, DollarSign, Send, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function CouponsPage() {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [sendingCoupon, setSendingCoupon] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sendToAll, setSendToAll] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_purchase: "0",
    max_discount: "",
    valid_days: "30",
    is_active: true,
  });

  useEffect(() => {
    fetchCoupons();
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/admin/all/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const openSendDialog = (coupon) => {
    setSelectedCoupon(coupon);
    setSelectedUserId("");
    setEmailSearch("");
    setSearchResults([]);
    setSendToAll(false);
    setShowSendDialog(true);
  };

  const searchUsersByEmail = async (email) => {
    if (!token || !email.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/admin/search/?email=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setSearchResults(data.users || []);
      }
    } catch (err) {
      console.error("Error searching users:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (emailSearch.trim()) {
      const timer = setTimeout(() => searchUsersByEmail(emailSearch), 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [emailSearch]);

  const handleSendCoupon = async () => {
    if (!token || !selectedCoupon) {
      alert("Please select a coupon");
      return;
    }

    if (sendToAll) {
      if (!confirm(`Are you sure you want to send coupon ${selectedCoupon.code} to ALL students?`)) return;

      setSendingCoupon(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/reviews/admin/coupons/send-to-all/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ coupon_code: selectedCoupon.code }),
        });
        const data = await res.json();
        if (data.success) {
          alert(`Coupon ${selectedCoupon.code} sent to ${data.success_count} users successfully!`);
          setShowSendDialog(false);
          setSelectedCoupon(null);
          setSelectedUserId("");
          setSendToAll(false);
          setEmailSearch("");
          setSearchResults([]);
        } else alert(data.message || "Failed to send coupon");
      } catch (err) {
        console.error("Error sending coupon to all:", err);
        alert("Failed to send coupon");
      } finally {
        setSendingCoupon(false);
      }
      return;
    }

    if (!selectedUserId) {
      alert("Please select a user or choose 'Send to All'");
      return;
    }

    setSendingCoupon(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/admin/coupons/assign/user/${selectedUserId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ coupon_code: selectedCoupon.code }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Coupon ${selectedCoupon.code} sent to user successfully!`);
        setShowSendDialog(false);
        setSelectedCoupon(null);
        setSelectedUserId("");
        setEmailSearch("");
        setSearchResults([]);
      } else alert(data.message || "Failed to send coupon");
    } catch (err) {
      console.error("Error sending coupon:", err);
      alert("Failed to send coupon");
    } finally {
      setSendingCoupon(false);
    }
  };

  const fetchCoupons = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/admin/coupons/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json();
      if (data.success) setCoupons(data.coupons || []);
      else throw new Error(data.message || "Failed to fetch coupons");
    } catch (err) {
      setError(err.message || "Failed to load coupons");
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!token) return;
    if (!formData.code.trim()) return alert("Please enter a coupon code");
    if (!formData.discount_value) return alert("Please enter discount value");

    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/admin/coupons/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          code: formData.code.toUpperCase().trim(),
          discount_type: formData.discount_type,
          discount_value: parseFloat(formData.discount_value),
          min_purchase: parseFloat(formData.min_purchase) || 0,
          max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
          valid_days: parseInt(formData.valid_days) || 30,
          is_active: formData.is_active,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCoupons();
        setShowCreateDialog(false);
        resetForm();
        alert("Coupon created successfully!");
      } else alert(data.message || "Failed to create coupon");
    } catch (err) {
      console.error("Error creating coupon:", err);
      alert("Failed to create coupon");
    }
  };

  const handleUpdateCoupon = async () => {
    if (!token || !editingCoupon) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/admin/coupons/${editingCoupon.id}/update/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          discount_value: parseFloat(formData.discount_value),
          discount_type: formData.discount_type,
          min_purchase: parseFloat(formData.min_purchase) || 0,
          max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
          valid_days: parseInt(formData.valid_days) || 30,
          is_active: formData.is_active,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCoupons();
        setEditingCoupon(null);
        resetForm();
        setShowCreateDialog(false);
        alert("Coupon updated successfully!");
      } else alert(data.message || "Failed to update coupon");
    } catch (err) {
      console.error("Error updating coupon:", err);
      alert("Failed to update coupon");
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!token || !confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/admin/coupons/${couponId}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchCoupons();
        alert("Coupon deleted successfully!");
      } else alert(data.message || "Failed to delete coupon");
    } catch (err) {
      console.error("Error deleting coupon:", err);
      alert("Failed to delete coupon");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      min_purchase: "0",
      max_discount: "",
      valid_days: "30",
      is_active: true,
    });
    setEditingCoupon(null);
  };

  const openEditDialog = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_purchase: coupon.min_purchase.toString(),
      max_discount: coupon.max_discount?.toString() || "",
      valid_days: "30",
      is_active: coupon.is_active,
    });
    setShowCreateDialog(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Coupon code copied to clipboard!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const isExpired = (validUntil) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-gray-500 text-lg">Loading coupons...</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Coupon Management</h1>
          <Button
            onClick={() => {
              resetForm();
              setShowCreateDialog(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{coupon.code}</h3>
                      <button
                        onClick={() => copyToClipboard(coupon.code)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {coupon.discount_type === "percentage" ? (
                        <Badge className="bg-green-100 text-green-700">
                          <Percent className="w-3 h-3 mr-1" />
                          {coupon.discount_value}% OFF
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700">
                          <DollarSign className="w-3 h-3 mr-1" />
                          ₹{coupon.discount_value} OFF
                        </Badge>
                      )}
                      {coupon.is_active ? (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                      )}
                      {isExpired(coupon.valid_until) && (
                        <Badge className="bg-red-100 text-red-700">Expired</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>Min Purchase: ₹{coupon.min_purchase || 0}</p>
                  {coupon.max_discount && (
                    <p>Max Discount: ₹{coupon.max_discount}</p>
                  )}
                  <p>Valid Until: {formatDate(coupon.valid_until)}</p>
                  <p>Used: {coupon.used_count || 0} times</p>
                  {coupon.is_common && (
                    <p className="text-blue-600 font-semibold">Common Coupon</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(coupon)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openSendDialog(coupon)}
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {coupons.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <p>No coupons found. Create your first coupon!</p>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
              <DialogDescription>
                {editingCoupon ? "Update coupon details" : "Create a new coupon code with discount settings"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label>Coupon Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SAVE20"
                  disabled={!!editingCoupon}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount Type *</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Discount Value *</Label>
                  <Input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder={formData.discount_type === "percentage" ? "10" : "100"}
                    min="0"
                    max={formData.discount_type === "percentage" ? "100" : undefined}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Purchase (₹)</Label>
                  <Input
                    type="number"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <Label>Max Discount (₹) - Optional</Label>
                  <Input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    placeholder="Leave empty for no limit"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label>Valid For (Days)</Label>
                <Input
                  type="number"
                  value={formData.valid_days}
                  onChange={(e) => setFormData({ ...formData, valid_days: e.target.value })}
                  placeholder="30"
                  min="1"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {editingCoupon ? "Update Coupon" : "Create Coupon"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Send Coupon Dialog */}
        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Coupon: {selectedCoupon?.code}</DialogTitle>
              <DialogDescription>
                Send this coupon to a specific user or all users
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={sendToAll}
                  onCheckedChange={setSendToAll}
                />
                <Label>Send to All Users</Label>
              </div>

              {!sendToAll && (
                <div>
                  <Label>Search User by Email</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      value={emailSearch}
                      onChange={(e) => setEmailSearch(e.target.value)}
                      placeholder="Search by email..."
                      className="pl-10"
                    />
                  </div>
                  {searching && <p className="text-sm text-gray-500 mt-2">Searching...</p>}
                  {searchResults.length > 0 && (
                    <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setEmailSearch(user.email);
                            setSearchResults([]);
                          }}
                          className={`w-full text-left p-2 hover:bg-gray-100 ${
                            selectedUserId === user.id ? "bg-blue-50" : ""
                          }`}
                        >
                          <p className="font-medium">{user.fullname || user.email}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSendCoupon}
                  disabled={sendingCoupon || (!sendToAll && !selectedUserId)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {sendingCoupon ? "Sending..." : "Send Coupon"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSendDialog(false);
                    setSelectedCoupon(null);
                    setSelectedUserId("");
                    setEmailSearch("");
                    setSearchResults([]);
                    setSendToAll(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
