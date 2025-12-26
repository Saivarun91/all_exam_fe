"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Users, Download, Search, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState(null);
  const [editFormData, setEditFormData] = useState({
    email: "",
    is_active: true,
  });
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/email-subscribers/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSubscribers(data.subscribers || []);
      } else {
        setMessage("❌ Error: " + (data.error || "Failed to fetch subscribers"));
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      setMessage("❌ Error fetching subscribers: " + error.message);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const handleEdit = (subscriber) => {
    setEditingSubscriber(subscriber);
    setEditFormData({
      email: subscriber.email || "",
      is_active: subscriber.is_active !== false,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateSubscriber = async (e) => {
    e.preventDefault();
    if (!editFormData.email.trim()) {
      setMessage("❌ Please enter an email address");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/email-subscribers/${editingSubscriber.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Subscriber updated successfully!");
        setEditDialogOpen(false);
        setEditingSubscriber(null);
        fetchSubscribers();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error: " + (data.error || "Failed to update subscriber"));
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDelete = async (subscriberId, email) => {
    if (!confirm(`Are you sure you want to delete subscriber "${email}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    setDeletingId(subscriberId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/email-subscribers/${subscriberId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Subscriber deleted successfully!");
        fetchSubscribers();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error: " + (data.error || "Failed to delete subscriber"));
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSubscribers = subscribers.filter(s => s.is_active).length;
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0C1A35]">Email Subscribers</h1>
          <p className="text-[#0C1A35]/60 mt-1">Manage and view all email subscribers</p>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg mb-6 ${
            message.includes("✅")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Subscribers Card */}
      <Card className="border-[#D3E3FF]">
        <CardHeader className="bg-gradient-to-r from-green-500/5 to-green-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-600" />
              <CardTitle className="text-xl text-[#0C1A35]">Email Subscribers</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-700">
              {activeSubscribers} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Total Subscribers</p>
              <p className="text-2xl font-bold text-blue-600">{subscribers.length}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeSubscribers}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search subscribers by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Subscribers Table */}
          {loadingSubscribers ? (
            <div className="text-center py-8 text-gray-500">
              Loading subscribers...
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No subscribers found</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-gray-50 sticky top-0">
                    <TableRow>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Subscribed</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>
                          <Badge className={subscriber.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                            {subscriber.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {subscriber.subscribed_at 
                            ? new Date(subscriber.subscribed_at).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(subscriber)}
                              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(subscriber.id, subscriber.email)}
                              disabled={deletingId === subscriber.id}
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Export Button */}
          {subscribers.length > 0 && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => {
                const csv = [
                  ['Email', 'Status', 'Subscribed At'],
                  ...subscribers.map(s => [
                    s.email,
                    s.is_active ? 'Active' : 'Inactive',
                    s.subscribed_at ? new Date(s.subscribed_at).toLocaleString() : 'N/A'
                  ])
                ].map(row => row.join(',')).join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `email-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Edit Subscriber Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subscriber</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubscriber} className="space-y-4">
            <div>
              <Label htmlFor="edit-email">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="subscriber@example.com"
                required
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={editFormData.is_active.toString()}
                onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.value === 'true' })}
                className="w-full border border-gray-300 rounded-lg p-2 mt-2"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]">
                Update Subscriber
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setEditingSubscriber(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

