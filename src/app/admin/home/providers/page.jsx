"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Search, ArrowLeft } from "lucide-react";
import { checkAuth, getAuthHeaders } from "@/utils/authCheck";
import { getOptimizedImageUrl } from "@/utils/imageUtils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function AdminProvidersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo_url: "",
    website_url: "",
    is_active: true
  });

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/admin/auth");
      return;
    }
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/providers/`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setProviders(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching providers:", error);
      setMessage("❌ Error loading providers");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      setMessage("❌ Name and slug are required");
      return;
    }

    try {
      const url = editing 
        ? `${API_BASE_URL}/api/providers/${editing}/update/`
        : `${API_BASE_URL}/api/providers/create/`;
      
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save provider");

      setMessage(`✅ Provider ${editing ? "updated" : "created"} successfully!`);
      setTimeout(() => setMessage(""), 3000);
      
      setShowModal(false);
      setEditing(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        logo_url: "",
        website_url: "",
        is_active: true
      });
      
      fetchProviders();
    } catch (error) {
      console.error("Error saving provider:", error);
      setMessage("❌ Error saving provider");
    }
  };

  const handleEdit = (provider) => {
    setEditing(provider.id);
    setFormData({
      name: provider.name || "",
      slug: provider.slug || "",
      description: provider.description || "",
      logo_url: provider.logo_url || "",
      website_url: provider.website_url || "",
      is_active: provider.is_active !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this provider?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/providers/${id}/delete/`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      if (!res.ok) throw new Error("Failed to delete provider");

      setMessage("✅ Provider deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
      fetchProviders();
    } catch (error) {
      console.error("Error deleting provider:", error);
      setMessage("❌ Error deleting provider");
    }
  };

  const filteredProviders = providers.filter(provider =>
    provider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-[#0C1A35]/70">Loading providers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/home")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#0C1A35]">Manage Providers</h1>
              <p className="text-[#0C1A35]/70 mt-1">Add and manage certification providers</p>
            </div>
          </div>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button 
                className="bg-[#1A73E8] hover:bg-[#1557B0]"
                onClick={() => {
                  setEditing(null);
                  setFormData({
                    name: "",
                    slug: "",
                    description: "",
                    logo_url: "",
                    website_url: "",
                    is_active: true
                  });
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit" : "Add"} Provider</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Provider Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setFormData({ 
                          ...formData, 
                          name,
                          slug: !editing ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : formData.slug
                        });
                      }}
                      placeholder="Microsoft, AWS, Google, etc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="microsoft, aws, google"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provider description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input
                      id="logo_url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_active" className="font-normal">Active</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]">
                    {editing ? "Update" : "Add"} Provider
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowModal(false);
                      setEditing(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message}
          </div>
        )}

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search providers by name or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Providers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Providers ({filteredProviders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProviders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No providers found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-700">Name</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Slug</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Description</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Status</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProviders.map((provider) => (
                      <tr key={provider.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {provider.logo_url && (
                              <img 
                                src={getOptimizedImageUrl(provider.logo_url, 32, 32)} 
                                alt={provider.name}
                                width={32}
                                height={32}
                                className="w-8 h-8 object-contain rounded"
                                style={{ maxWidth: '32px', maxHeight: '32px', width: '32px', height: '32px' }}
                                loading="lazy"
                                sizes="32px"
                                decoding="async"
                              />
                            )}
                            <span className="font-medium text-gray-900">{provider.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-700">{provider.slug}</td>
                        <td className="p-3 text-gray-600 text-sm max-w-md truncate">
                          {provider.description || "-"}
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={provider.is_active !== false ? "bg-green-100 text-green-700 border-0" : "bg-gray-100 text-gray-700 border-0"}>
                            {provider.is_active !== false ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(provider)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(provider.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

