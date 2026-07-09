"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/lib/navigation/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Edit, Trash2, Search, ArrowLeft } from "lucide-react";
import { checkAuth, getAuthHeaders, getAuthHeadersForUpload } from "@/utils/authCheck";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import {
  convertImageFileToWebp,
} from "@/utils/convertImageToWebp";
import TipTapEditor from "@/components/editor/TipTapEditor";
import AdminTablePagination, { ADMIN_TABLE_PAGE_SIZE } from "@/components/admin/AdminTablePagination";
import {
  buildAdminListUrl,
  DEFAULT_ADMIN_PAGINATION,
  normalizeAdminPagination,
  useDebouncedValue,
} from "@/lib/adminPagination";
import {
  clampToWordLimit,
  countWords,
  DESCRIPTION_WORD_LIMIT,
} from "@/lib/textLimits";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const EMPTY_FAQ = { question: "", answer: "" };

function clampProviderDescription(value) {
  return clampToWordLimit(value, DESCRIPTION_WORD_LIMIT);
}

function resolveProviderLogoUrl(logoUrl) {
  if (!logoUrl) return "";
  if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
    return logoUrl;
  }
  const base = API_BASE_URL.replace(/\/$/, "");
  return logoUrl.startsWith("/") ? `${base}${logoUrl}` : `${base}/${logoUrl}`;
}

function normalizeContentForEditor(str) {
  if (!str || !String(str).trim()) return "";
  const s = String(str).trim();
  if (s.startsWith("<")) return s;
  return s
    .split(/\n/)
    .map(
      (line) =>
        "<p>" +
        line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;") +
        "</p>"
    )
    .join("");
}

export default function AdminProvidersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [listPage, setListPage] = useState(1);
  const [listPagination, setListPagination] = useState(DEFAULT_ADMIN_PAGINATION);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoMessage, setSeoMessage] = useState("");
  const [pageSeo, setPageSeo] = useState({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });
  
  const [formData, setFormData] = useState({
    name: "",
    icon: "Building2",
    slug: "",
    logo_url: "",
    page_title: "",
    description: "",
    content: "",
    faqs: [],
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    is_active: true,
    show_in_popular_providers: false,
  });
  const [logoFile, setLogoFile] = useState(null);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/admin/auth");
      return;
    }
    fetchProvidersPageSeo();
  }, []);

  useEffect(() => {
    if (!checkAuth()) return;
    fetchProviders();
  }, [listPage, debouncedSearchQuery]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        buildAdminListUrl(`${API_BASE_URL}/api/providers/admin/list/`, {
          page: listPage,
          page_size: ADMIN_TABLE_PAGE_SIZE,
          search: debouncedSearchQuery.trim(),
        }),
        {
          headers: getAuthHeaders(),
          cache: "no-store",
        }
      );
      const data = await res.json();
      setProviders(Array.isArray(data?.data) ? data.data : []);
      setListPagination(normalizeAdminPagination(data?.pagination));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching providers:", error);
      setMessage("❌ Error loading providers");
      setLoading(false);
    }
  };

  const fetchProvidersPageSeo = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/providers-page-seo/`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) return;
      const data = await res.json();
      setPageSeo({
        meta_title: data?.data?.meta_title || "",
        meta_description: data?.data?.meta_description || "",
        meta_keywords: data?.data?.meta_keywords || "",
      });
    } catch (error) {
      console.error("Error fetching providers page SEO:", error);
    }
  };

  const handleSaveProvidersPageSeo = async () => {
    setSeoLoading(true);
    setSeoMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/providers-page-seo/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(pageSeo),
      });

      if (!res.ok) throw new Error("Failed to save providers page SEO");

      setSeoMessage("✅ Providers page SEO saved successfully!");
      setTimeout(() => setSeoMessage(""), 3000);
    } catch (error) {
      console.error("Error saving providers page SEO:", error);
      setSeoMessage("❌ Error saving providers page SEO");
    } finally {
      setSeoLoading(false);
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
        ? `${API_BASE_URL}/api/providers/admin/${editing}/update/`
        : `${API_BASE_URL}/api/providers/admin/create/`;

      const normalizedFaqs = (formData.faqs || [])
        .map((faq) => ({
          question: (faq?.question || "").trim(),
          answer: (faq?.answer || "").trim(),
        }))
        .filter((faq) => faq.question && faq.answer);

      const basePayload = {
        name: formData.name || "",
        icon: formData.icon || "Building2",
        slug: formData.slug || "",
        page_title: formData.page_title || "",
        description: clampProviderDescription(formData.description || ""),
        content: formData.content || "",
        faqs: normalizedFaqs,
        meta_title: formData.meta_title || "",
        meta_description: formData.meta_description || "",
        meta_keywords: formData.meta_keywords || "",
        is_active: !!formData.is_active,
        show_in_popular_providers: !!formData.show_in_popular_providers,
        logo_url: formData.logo_url || "",
      };

      let headers = {};
      let body;
      if (logoFile) {
        const webpLogo = await convertImageFileToWebp(logoFile);
        const multipartPayload = new FormData();
        Object.entries(basePayload).forEach(([key, value]) => {
          if (key === "faqs") {
            multipartPayload.append("faqs", JSON.stringify(value));
          } else if (key === "is_active" || key === "show_in_popular_providers") {
            multipartPayload.append(key, String(value));
          } else {
            multipartPayload.append(key, value ?? "");
          }
        });
        multipartPayload.append("logo", webpLogo);
        headers = { ...getAuthHeadersForUpload() };
        body = multipartPayload;
      } else {
        headers = { ...getAuthHeaders() };
        body = JSON.stringify(basePayload);
      }

      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers,
        body,
      });
      const result = await res.json().catch(() => null);
      if (!res.ok) {
        const nameError = result?.errors?.name;
        const slugError = result?.errors?.slug;
        throw new Error(
          result?.error ||
            result?.message ||
            (Array.isArray(nameError) ? nameError[0] : nameError) ||
            (Array.isArray(slugError) ? slugError[0] : slugError) ||
            "Failed to save provider"
        );
      }

      const savedProvider = result?.data || null;
      if (savedProvider?.id) {
        setProviders((prev) => {
          if (editing) {
            return prev.map((p) => (p.id === savedProvider.id ? savedProvider : p));
          }
          return [savedProvider, ...prev];
        });
      }

      setMessage(`✅ Provider ${editing ? "updated" : "created"} successfully!`);
      setTimeout(() => setMessage(""), 3000);
      
      setShowModal(false);
      setEditing(null);
      setFormData({
        name: "",
        icon: "Building2",
        slug: "",
        logo_url: "",
        page_title: "",
        description: "",
        content: "",
        faqs: [],
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        is_active: true,
        show_in_popular_providers: false,
      });
      setLogoFile(null);
      
      fetchProviders();
    } catch (error) {
      console.error("Error saving provider:", error);
      setMessage(
        `❌ ${error instanceof Error ? error.message : "Error saving provider"}`
      );
    }
  };

  const handleEdit = (provider) => {
    setEditing(provider.id);
    setFormData({
      name: provider.name || "",
      icon: provider.icon || "Building2",
      slug: provider.slug || "",
      logo_url: provider.logo_url || "",
      page_title: provider.page_title || "",
      description: clampProviderDescription(provider.description || ""),
      content: normalizeContentForEditor(provider.content || ""),
      faqs: Array.isArray(provider.faqs) ? provider.faqs : [],
      meta_title: provider.meta_title || "",
      meta_description: provider.meta_description || "",
      meta_keywords: provider.meta_keywords || "",
      is_active: provider.is_active !== false,
      show_in_popular_providers: provider.show_in_popular_providers !== false,
    });
    setLogoFile(null);
    setShowModal(true);
  };

  const handleRemoveLogo = async () => {
    setLogoFile(null);
    setFormData((prev) => ({ ...prev, logo_url: "" }));

    if (!editing) {
      setMessage("✅ Logo removed.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/providers/admin/${editing}/update/`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            logo_url: "",
            remove_logo: "true",
          }),
        }
      );
      const result = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(result?.error || result?.message || "Failed to remove logo");
      }

      const savedProvider = result?.data || null;
      if (savedProvider?.id) {
        setProviders((prev) =>
          prev.map((p) => (p.id === savedProvider.id ? savedProvider : p))
        );
      } else {
        fetchProviders();
      }

      setMessage("✅ Logo removed successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error removing logo:", error);
      setMessage(
        `❌ ${error instanceof Error ? error.message : "Error removing logo"}`
      );
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this provider?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/providers/admin/${id}/delete/`, {
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

  const filteredProviders = providers;

  useEffect(() => {
    setListPage(1);
  }, [searchQuery]);

  const paginatedProviders = {
    items: filteredProviders,
    page: listPagination.page,
    totalPages: listPagination.total_pages,
    totalItems: listPagination.count,
  };

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
                    icon: "Building2",
                    slug: "",
                    logo_url: "",
                    page_title: "",
                    description: "",
                    content: "",
                    faqs: [],
                    meta_title: "",
                    meta_description: "",
                    meta_keywords: "",
                    is_active: true,
                    show_in_popular_providers: false,
                  });
                  setLogoFile(null);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="!w-[96vw] !max-w-[1400px] max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit" : "Add"} Provider</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Provider Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setFormData({
                          ...formData,
                          name
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo_file">Logo Image</Label>
                    <Input
                      id="logo_file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                    {formData.logo_url && !logoFile ? (
                      <div className="mt-3 flex items-center gap-3">
                        <img
                          src={getOptimizedImageUrl(resolveProviderLogoUrl(formData.logo_url), 120, 120)}
                          alt={`${formData.name || "Provider"} logo`}
                          className="h-16 w-16 rounded border border-gray-200 object-contain bg-white p-1"
                        />
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-gray-500">
                            Current logo. Upload a new file to replace it.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveLogo}
                            className="w-fit border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : null}
                    {logoFile ? (
                      <div className="mt-3 flex items-center gap-3">
                        <img
                          src={URL.createObjectURL(logoFile)}
                          alt="New logo preview"
                          className="h-16 w-16 rounded border border-gray-200 object-contain bg-white p-1"
                        />
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-green-600">
                            New logo selected: {logoFile.name}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setLogoFile(null)}
                            className="w-fit border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div>
                  <Label htmlFor="page_title">Page Title</Label>
                  <Input
                    id="page_title"
                    value={formData.page_title}
                    onChange={(e) => setFormData({ ...formData, page_title: e.target.value })}
                    placeholder="Provider detail page title..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: clampProviderDescription(e.target.value),
                      })
                    }
                    placeholder="Short description shown below the page title on the public provider page..."
                    rows={3}
                  />
                  <p className="text-xs text-[#0C1A35]/50 mt-1">
                    Displayed as hero text under the provider page heading. ({countWords(formData.description)}/{DESCRIPTION_WORD_LIMIT} words)
                  </p>
                </div>
                <div>
                  <Label>Content</Label>
                  <TipTapEditor
                    value={formData.content}
                    onChange={(html) => setFormData({ ...formData, content: html })}
                    placeholder="Provider page content..."
                    className="w-full"
                  />
                </div>
                <div className="space-y-3 border rounded-lg p-4 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <Label>FAQ Section</Label>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          faqs: [...(formData.faqs || []), { ...EMPTY_FAQ }],
                        })
                      }
                    >
                      <PlusCircle className="h-4 w-4 mr-1" /> Add FAQ
                    </Button>
                  </div>
                  {(formData.faqs || []).map((faq, index) => (
                    <div key={`faq-${index}`} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                      <div>
                        <Label>Question {index + 1}</Label>
                        <Input
                          value={faq.question || ""}
                          onChange={(e) => {
                            const updatedFaqs = [...(formData.faqs || [])];
                            updatedFaqs[index] = { ...updatedFaqs[index], question: e.target.value };
                            setFormData({ ...formData, faqs: updatedFaqs });
                          }}
                          placeholder="Enter FAQ question"
                        />
                      </div>
                      <div>
                        <Label>Answer {index + 1}</Label>
                        <Textarea
                          value={faq.answer || ""}
                          onChange={(e) => {
                            const updatedFaqs = [...(formData.faqs || [])];
                            updatedFaqs[index] = { ...updatedFaqs[index], answer: e.target.value };
                            setFormData({ ...formData, faqs: updatedFaqs });
                          }}
                          rows={3}
                          placeholder="Enter FAQ answer"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              faqs: (formData.faqs || []).filter((_, i) => i !== index),
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="Provider page meta title..."
                  />
                </div>
                <div>
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) =>
                      setFormData({ ...formData, meta_description: e.target.value })
                    }
                    placeholder="Provider page meta description..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="meta_keywords">Meta Keywords</Label>
                  <Input
                    id="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show_in_popular_providers"
                    checked={formData.show_in_popular_providers}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        show_in_popular_providers: checked === true,
                      })
                    }
                  />
                  <Label htmlFor="show_in_popular_providers" className="font-normal">
                    Show in Popular Providers section (home page)
                  </Label>
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
          <CardHeader>
            <CardTitle>Providers Page SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {seoMessage && (
              <div
                className={`p-3 rounded ${
                  seoMessage.includes("✅")
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {seoMessage}
              </div>
            )}
            <div>
              <Label htmlFor="providers_page_meta_title">Meta Title</Label>
              <Input
                id="providers_page_meta_title"
                value={pageSeo.meta_title}
                onChange={(e) =>
                  setPageSeo({ ...pageSeo, meta_title: e.target.value })
                }
                placeholder="All Providers | AllExamQuestions"
              />
            </div>
            <div>
              <Label htmlFor="providers_page_meta_description">
                Meta Description
              </Label>
              <Textarea
                id="providers_page_meta_description"
                value={pageSeo.meta_description}
                onChange={(e) =>
                  setPageSeo({ ...pageSeo, meta_description: e.target.value })
                }
                placeholder="Browse all certification providers and available exams."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="providers_page_meta_keywords">Meta Keywords</Label>
              <Input
                id="providers_page_meta_keywords"
                value={pageSeo.meta_keywords}
                onChange={(e) =>
                  setPageSeo({ ...pageSeo, meta_keywords: e.target.value })
                }
                placeholder="providers, certification exams, AWS, Azure, Cisco"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSaveProvidersPageSeo}
                disabled={seoLoading}
                className="bg-[#1A73E8] hover:bg-[#1557B0]"
              >
                {seoLoading ? "Saving..." : "Save Providers Page SEO"}
              </Button>
            </div>
          </CardContent>
        </Card>

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
                      <th className="text-left p-3 font-semibold text-gray-700">Meta Title</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Popular</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Status</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProviders.items.map((provider) => (
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
                        <td className="p-3 text-gray-600 text-sm max-w-sm truncate">
                          {provider.meta_title || "-"}
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            className={
                              provider.show_in_popular_providers !== false
                                ? "bg-blue-100 text-blue-700 border-0"
                                : "bg-gray-100 text-gray-700 border-0"
                            }
                          >
                            {provider.show_in_popular_providers !== false ? "Yes" : "No"}
                          </Badge>
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
            <AdminTablePagination
              currentPage={paginatedProviders.page}
              totalPages={paginatedProviders.totalPages}
              totalItems={paginatedProviders.totalItems}
              onPageChange={setListPage}
              itemLabel="providers"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

