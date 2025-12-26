"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Edit, Trash2, Eye, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getOptimizedImageUrl } from "@/utils/imageUtils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const AVAILABLE_ICONS = ["Cloud", "Shield", "Award", "Database", "Code", "Building"];

export default function PopularProvidersAdmin() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    icon: "Cloud",
    slug: "",
    logo_url: "",
    order: 0,
    is_active: true
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Cloudinary configuration
  const CLOUD_NAME = "dhy0krkef";
  const UPLOAD_PRESET = "preptara";
  const [carouselSpeed, setCarouselSpeed] = useState(1500);
  const [logoSize, setLogoSize] = useState(80);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  
  const [sectionSettings, setSectionSettings] = useState({
    heading: "Popular Certification Providers",
    subtitle: "Trusted by professionals worldwide",
  });
  
  useEffect(() => {
    fetchProviders();
    fetchCarouselSettings();
    fetchSectionSettings();
  }, []);
  
  const fetchSectionSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/popular-providers-section/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSectionSettings(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching section settings:", error);
    }
  };
  
  const handleSectionSettingsUpdate = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/popular-providers-section/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(sectionSettings),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Section settings updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error: " + (data.error || "Failed to save"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProviders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/providers/admin/list/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setProviders(data.data);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: "",
      icon: "Cloud",
      slug: "",
      logo_url: "",
      order: 0,
      is_active: true
    });
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(false);
    setEditing(null);
  };
  
  const handleEdit = (provider) => {
    setEditing(provider);
    setFormData({
      name: provider.name || "",
      icon: provider.icon || "Cloud",
      slug: provider.slug || "",
      logo_url: provider.logo_url || "",
      order: provider.order || 0,
      is_active: provider.is_active !== false
    });
    setLogoFile(null);
    setLogoPreview(provider.logo_url || null);
    setRemoveLogo(false);
    setDialogOpen(true);
  };
  
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setRemoveLogo(false);
    
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
        setFormData((prev) => ({ ...prev, logo_url: data.secure_url }));
        setLogoPreview(data.secure_url);
        setMessage("✅ Logo uploaded successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Logo upload failed!");
        setLogoPreview(null);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      setMessage("❌ Logo upload failed!");
      setLogoPreview(null);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUploadingLogo(false);
    }
  };
  
  const handleRemoveLogo = () => {
    setRemoveLogo(true);
    setLogoFile(null);
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo_url: "" }));
    // Clear the file input
    const fileInput = document.getElementById('logo');
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    // Auto-generate slug if empty
    const slugToUse = formData.slug || formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    try {
      const url = editing
        ? `${API_BASE_URL}/api/providers/admin/${editing.id}/update/`
        : `${API_BASE_URL}/api/providers/admin/create/`;
      
      // Send as JSON with logo_url from Cloudinary
      const submitData = {
        name: formData.name,
        icon: formData.icon,
        slug: slugToUse,
        order: formData.order || 0,
        is_active: formData.is_active,
      };
      
      // Add logo_url if available (from Cloudinary)
      if (formData.logo_url && !removeLogo) {
        submitData.logo_url = formData.logo_url;
      } else if (removeLogo) {
        submitData.logo_url = '';
      }
      
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(submitData)
      });
      
      const data = await res.json();
      
      if (data.success || res.ok) {
        setMessage(`Provider ${editing ? 'updated' : 'created'} successfully! ✅`);
        setDialogOpen(false);
        resetForm();
        fetchProviders();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Error: " + (data.error || "Failed to save"));
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (providerId) => {
    if (!confirm("Are you sure you want to delete this provider?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/providers/admin/${providerId}/delete/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("Provider deleted successfully! ✅");
        fetchProviders();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Error deleting: " + error.message);
    }
  };

  const fetchCarouselSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/get/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (!res.ok) {
        console.warn("Failed to fetch carousel settings:", res.status);
        // Use defaults if fetch fails
        return;
      }
      
      const data = await res.json();
      if (data.success && data.data) {
        setCarouselSpeed(data.data.providers_carousel_speed || 1500);
        setLogoSize(data.data.providers_logo_size || 80);
      }
    } catch (error) {
      console.error("Error fetching carousel settings:", error);
      // Use defaults on error
    }
  };

  const handleSaveSettings = async () => {
    // Validate inputs
    if (carouselSpeed < 500 || carouselSpeed > 10000) {
      setSettingsMessage("Error: Carousel speed must be between 500ms and 10000ms");
      return;
    }
    if (logoSize < 40 || logoSize > 200) {
      setSettingsMessage("Error: Logo size must be between 40px and 200px");
      return;
    }

    setSettingsLoading(true);
    setSettingsMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/update/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          providers_carousel_speed: carouselSpeed,
          providers_logo_size: logoSize
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setSettingsMessage("Carousel settings saved successfully! ✅");
        setTimeout(() => setSettingsMessage(""), 3000);
      } else {
        setSettingsMessage("Error: " + (data.error || "Failed to save"));
      }
    } catch (err) {
      setSettingsMessage("Error: " + (err.message || "Failed to save settings"));
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0C1A35]">Popular Providers Management</h1>
          <p className="text-[#0C1A35]/60 mt-1">Manage certification providers shown on home page</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => window.open("/", "_blank")}
            variant="outline"
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}>
                <Plus className="w-4 h-4" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit Provider" : "Add New Provider"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Provider Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="AWS, Microsoft Azure, Cisco, etc."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="icon">Icon *</Label>
                    <Select value={formData.icon} onValueChange={(val) => setFormData({...formData, icon: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ICONS.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                            {icon}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">Icon displayed on home page (fallback if no logo)</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="logo">Provider Logo (Optional)</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="cursor-pointer flex-1"
                        disabled={removeLogo || uploadingLogo}
                      />
                      {logoPreview && !removeLogo && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveLogo}
                          disabled={uploadingLogo}
                        >
                          Remove Logo
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {uploadingLogo ? "Uploading to Cloudinary..." : "Upload logo image to Cloudinary. If provided, logo will be shown instead of icon."}
                    </p>
                    {logoPreview && !removeLogo && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Preview:</p>
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          width={96}
                          height={96}
                          className="w-24 h-24 object-contain border border-gray-200 rounded-lg p-2 bg-white"
                          loading="lazy"
                          sizes="96px"
                        />
                        {formData.logo_url && (
                          <p className="text-xs text-gray-500 mt-1">Cloudinary URL: {formData.logo_url.substring(0, 50)}...</p>
                        )}
                      </div>
                    )}
                    {removeLogo && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                        Logo will be removed when you save.
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      placeholder="aws, azure, cisco (auto-generated if empty)"
                    />
                    <p className="text-sm text-gray-500 mt-1">SEO-friendly URL (lowercase, hyphens only)</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                    <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Saving..." : (editing ? "Update Provider" : "Create Provider")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.includes("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message}
        </div>
      )}

      {/* Section Settings */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#1A73E8]" />
              <CardTitle>Section Settings</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Section Heading</Label>
              <Input
                value={sectionSettings.heading}
                onChange={(e) => setSectionSettings({...sectionSettings, heading: e.target.value})}
                placeholder="Popular Certification Providers"
              />
            </div>
            <div>
              <Label>Section Subtitle</Label>
              <Input
                value={sectionSettings.subtitle}
                onChange={(e) => setSectionSettings({...sectionSettings, subtitle: e.target.value})}
                placeholder="Trusted by professionals worldwide"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSectionSettingsUpdate} 
            disabled={loading}
            className="bg-[#1A73E8] hover:bg-[#1557B0]"
          >
            {loading ? "Saving..." : "Save Section Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Carousel Settings Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Carousel Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {settingsMessage && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${
              settingsMessage.includes("✅") 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {settingsMessage}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="carousel-speed">Carousel Speed (milliseconds)</Label>
              <Input
                id="carousel-speed"
                type="number"
                min="500"
                max="10000"
                step="100"
                value={carouselSpeed}
                onChange={(e) => setCarouselSpeed(parseInt(e.target.value) || 1500)}
                placeholder="1500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Time between auto-scroll (500ms - 10000ms). Lower = faster. Current: {carouselSpeed}ms
              </p>
            </div>
            
            <div>
              <Label htmlFor="logo-size">Logo Size (pixels)</Label>
              <Input
                id="logo-size"
                type="number"
                min="40"
                max="200"
                step="10"
                value={logoSize}
                onChange={(e) => setLogoSize(parseInt(e.target.value) || 80)}
                placeholder="80"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum logo size in pixels (40px - 200px). Current: {logoSize}px
              </p>
            </div>
          </div>
          
          <Button onClick={handleSaveSettings} disabled={settingsLoading} className="mt-4">
            {settingsLoading ? "Saving..." : "Save Carousel Settings"}
          </Button>
        </CardContent>
      </Card>
      
      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Providers ({providers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No providers found. Click "Add Provider" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>{provider.order}</TableCell>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>
                      {provider.logo_url ? (
                        <img 
                          src={getOptimizedImageUrl(provider.logo_url, 48, 48)} 
                          alt={provider.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-contain border border-gray-200 rounded p-1 bg-white"
                          style={{ maxWidth: '48px', maxHeight: '48px', width: '48px', height: '48px' }}
                          loading="lazy"
                          sizes="48px"
                          decoding="async"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'inline';
                          }}
                        />
                      ) : null}
                      <span style={{ display: provider.logo_url ? 'none' : 'inline' }} className="text-gray-400 text-xs">No logo</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{provider.icon}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{provider.slug}</TableCell>
                    <TableCell>
                      <Badge variant={provider.is_active ? "default" : "secondary"}>
                        {provider.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(provider)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(provider.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Preview Section */}
      {providers.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preview (How it appears on home page)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-center mb-3 text-[#0C1A35]">
                {sectionSettings.heading || "Popular Certification Providers"}
              </h2>
              <p className="text-center text-[#0C1A35]/70 text-lg mb-8 max-w-2xl mx-auto">
                {sectionSettings.subtitle || "Trusted by professionals worldwide"}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {providers.filter(p => p.is_active).slice(0, 10).map((provider) => (
                <div
                  key={provider.id}
                  className="p-6 flex flex-col items-center justify-center gap-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
                >
                  {provider.logo_url ? (
                    <img 
                      src={getOptimizedImageUrl(provider.logo_url, 64, 64)} 
                      alt={provider.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-contain"
                      style={{ maxWidth: '64px', maxHeight: '64px', width: '64px', height: '64px' }}
                      loading="lazy"
                      sizes="64px"
                      decoding="async"
                      onError={(e) => {
                        // Fallback to icon if logo fails to load
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center ${provider.logo_url ? 'hidden' : ''}`}>
                    <span className="text-2xl">
                      {provider.icon === "Cloud" && "☁️"}
                      {provider.icon === "Shield" && "🛡️"}
                      {provider.icon === "Award" && "🏆"}
                      {provider.icon === "Database" && "🗄️"}
                      {provider.icon === "Code" && "💻"}
                      {provider.icon === "Building" && "🏢"}
                    </span>
                  </div>
                  <span className="font-semibold text-center text-sm">
                    {provider.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

