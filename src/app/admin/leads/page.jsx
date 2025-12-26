"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  Phone,
  Mail,
  Trash2,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  Gift,
  MoreVertical,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LeadsPage() {
  const { token } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [notes, setNotes] = useState("");
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupons, setCoupons] = useState([]);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetchLeads();
    fetchCoupons();
  }, [statusFilter, token]);

  const fetchCoupons = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/admin/coupons/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCoupons(data.coupons || []);
        }
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
    }
  };

  const assignCouponToLead = async (leadId) => {
    if (!token || !couponCode.trim()) {
      alert("Please enter a coupon code");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/reviews/admin/coupons/assign/lead/${leadId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            coupon_code: couponCode.toUpperCase().trim(),
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert(`Coupon ${couponCode.toUpperCase()} assigned successfully!`);
        setShowCouponDialog(false);
        setCouponCode("");
        fetchLeads();
      } else {
        alert(data.message || "Failed to assign coupon");
      }
    } catch (err) {
      console.error("Error assigning coupon:", err);
      alert("Failed to assign coupon");
    }
  };

  const fetchLeads = async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const url =
        statusFilter === "all"
          ? `${API_BASE_URL}/api/leads/`
          : `${API_BASE_URL}/api/leads/?status=${statusFilter}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch leads");

      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
      } else {
        throw new Error(data.message || "Failed to fetch leads");
      }
    } catch (err) {
      setError(err.message || "Failed to load leads");
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId, newStatus, leadNotes) => {
    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/leads/${leadId}/update/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            notes: leadNotes || notes,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        fetchLeads();
        setShowNotesDialog(false);
        setNotes("");
      } else {
        alert(data.message || "Failed to update lead");
      }
    } catch (err) {
      console.error("Error updating lead:", err);
      alert("Failed to update lead");
    }
  };

  const deleteLead = async (leadId) => {
    if (!token || !confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/leads/${leadId}/delete/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        fetchLeads();
      } else {
        alert(data.message || "Failed to delete lead");
      }
    } catch (err) {
      console.error("Error deleting lead:", err);
      alert("Failed to delete lead");
    }
  };

  const openNotesDialog = (lead) => {
    setSelectedLead(lead);
    setNotes(lead.notes || "");
    setShowNotesDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "contacted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "converted":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== "all" && lead.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        lead.name?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone_number?.toLowerCase().includes(query) ||
        lead.whatsapp_number?.toLowerCase().includes(query) ||
        lead.course?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    converted: leads.filter((l) => l.status === "converted").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
        Loading leads...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-gray-900">
          Lead Management
        </h2>

        {/* --- STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Leads</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
              <div className="text-sm text-gray-600 mt-1">New</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-yellow-600">
                {stats.contacted}
              </div>
              <div className="text-sm text-gray-600 mt-1">Contacted</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600">
                {stats.converted}
              </div>
              <div className="text-sm text-gray-600 mt-1">Converted</div>
            </CardContent>
          </Card>
        </div>

        {/* FILTERS AND SEARCH */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search leads by name, email, phone..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* --- LEADS TABLE --- */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {filteredLeads.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No leads found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                      <TableHead className="font-semibold text-gray-700">Phone/WhatsApp</TableHead>
                      <TableHead className="font-semibold text-gray-700">Course</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Enrollment</TableHead>
                      <TableHead className="font-semibold text-gray-700">Date</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">
                          {lead.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <a
                              href={`mailto:${lead.email}`}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            {lead.phone_number && (
                              <a
                                href={`tel:${lead.phone_number.replace(/[^0-9+]/g, "")}`}
                                className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
                              >
                                <Phone className="h-3 w-3" />
                                {lead.phone_number}
                              </a>
                            )}
                            <a
                              href={`https://wa.me/${lead.whatsapp_number.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-green-600 hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              {lead.whatsapp_number}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {lead.course || "General Inquiry"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${getStatusColor(lead.status)} font-semibold border`}
                          >
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lead.is_enrolled ? (
                            <Badge className="bg-green-100 text-green-800 font-semibold flex items-center gap-1 w-fit">
                              <CheckCircle2 className="h-3 w-3" />
                              Enrolled
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600 font-semibold flex items-center gap-1 w-fit">
                              <XCircle className="h-3 w-3" />
                              Not Enrolled
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(lead.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => updateLeadStatus(lead.id, "contacted")}
                              >
                                Mark Contacted
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateLeadStatus(lead.id, "converted")}
                              >
                                Mark Converted
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateLeadStatus(lead.id, "closed")}
                              >
                                Close
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openNotesDialog(lead)}>
                                <FileText className="h-4 w-4 mr-2" />
                                Notes
                              </DropdownMenuItem>
                              {!lead.is_enrolled && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setShowCouponDialog(true);
                                  }}
                                >
                                  <Gift className="h-4 w-4 mr-2" />
                                  Assign Coupon
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => deleteLead(lead.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* NOTES DIALOG */}
        <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Add/Edit Notes - {selectedLead?.name}
              </DialogTitle>
              <DialogDescription>
                Add notes about your interaction with this lead
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Textarea
                placeholder="Enter notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
                  Cancel
                </Button>

                <Button
                  onClick={() => {
                    if (selectedLead) {
                      updateLeadStatus(
                        selectedLead.id,
                        selectedLead.status,
                        notes
                      );
                    }
                  }}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* COUPON ASSIGN DIALOG */}
        <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Assign Coupon to {selectedLead?.name}
              </DialogTitle>
              <DialogDescription>
                Assign a coupon code to this lead. They can use it when enrolling.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Coupon Code *</Label>
                <Input
                  value={couponCode}
                  onChange={(e) =>
                    setCouponCode(e.target.value.toUpperCase())
                  }
                  placeholder="Enter coupon code"
                  list="coupon-list"
                />

                <datalist id="coupon-list">
                  {coupons.map((coupon) => (
                    <option key={coupon.code} value={coupon.code}>
                      {coupon.code} - {coupon.discount_value}
                      {coupon.discount_type === "percentage" ? "%" : "₹"}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCouponDialog(false);
                    setCouponCode("");
                  }}
                >
                  Cancel
                </Button>

                <Button
                  onClick={() => {
                    if (selectedLead) {
                      assignCouponToLead(selectedLead.id);
                    }
                  }}
                >
                  Assign Coupon
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
