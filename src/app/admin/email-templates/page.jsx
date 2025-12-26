"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiPlus, FiX, FiTrash2, FiEdit, FiMail } from "react-icons/fi";

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [templateData, setTemplateData] = useState({
    name: "",
    subject: "",
    body: "",
    description: "",
    is_active: true,
  });
  const [editId, setEditId] = useState(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const BASE_URL = `${API_BASE_URL}/api/email-templates`;

  // ------------------------
  // FETCH TEMPLATES
  // ------------------------
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch templates: ${res.status}`);

        const data = await res.json();

        if (Array.isArray(data)) {
          const formatted = data.map((t) => ({
            id: t.id || t._id || "",
            name: t.name || "",
            subject: t.subject || "",
            body: t.body || "",
            description: t.description || "",
            is_active: t.is_active !== undefined ? t.is_active : true,
            created_at: t.created_at,
            updated_at: t.updated_at,
          }));

          setTemplates(formatted);
          setFilteredTemplates(formatted);
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // ------------------------
  // SEARCH FUNCTIONALITY
  // ------------------------
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTemplates(templates);
    } else {
      const filtered = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredTemplates(filtered);
    }
  }, [searchTerm, templates]);

  // ------------------------
  // ADD / UPDATE TEMPLATE
  // ------------------------
  const handleSaveTemplate = async () => {
    if (!templateData.name.trim() || !templateData.subject.trim() || !templateData.body.trim()) {
      alert("Please fill in all required fields (Name, Subject, Body)");
      return;
    }

    const url = editMode
      ? `${BASE_URL}/${editId}/update/`
      : `${BASE_URL}/create/`;
    const method = editMode ? "PUT" : "POST";

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(templateData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to save template: ${res.status}`);
      }

      const newTemplate = await res.json();

      if (editMode) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === editId ? newTemplate : t))
        );
        setFilteredTemplates((prev) =>
          prev.map((t) => (t.id === editId ? newTemplate : t))
        );
        alert("✅ Template updated successfully!");
      } else {
        setTemplates((prev) => [...prev, newTemplate]);
        setFilteredTemplates((prev) => [...prev, newTemplate]);
        alert("✅ Template added successfully!");
      }

      setShowModal(false);
      setEditMode(false);
      setTemplateData({ name: "", subject: "", body: "", description: "", is_active: true });
      setEditId(null);
    } catch (err) {
      alert(`❌ ${err.message || "Unknown error"}`);
    }
  };

  // ------------------------
  // DELETE SINGLE TEMPLATE
  // ------------------------
  const handleDeleteTemplate = async (id) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/${id}/delete/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to delete: ${res.status}`);
      }

      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setFilteredTemplates((prev) => prev.filter((t) => t.id !== id));
      alert("✅ Template deleted successfully!");
    } catch (err) {
      alert(`❌ ${err.message || "Unknown error"}`);
    }
  };

  // ------------------------
  // EDIT TEMPLATE
  // ------------------------
  const handleEditTemplate = (template) => {
    setTemplateData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      description: template.description || "",
      is_active: template.is_active,
    });
    setEditId(template.id);
    setEditMode(true);
    setShowModal(true);
  };

  // ------------------------
  // HANDLE SELECT TEMPLATE (for bulk delete)
  // ------------------------
  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // ------------------------
  // BULK DELETE TEMPLATES
  // ------------------------
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one template to delete.");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} template(s)?`))
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/bulk-delete/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete templates");
      }

      setTemplates((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
      setFilteredTemplates((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
      setSelectedIds([]);
      alert("✅ Selected templates deleted successfully!");
    } catch (err) {
      alert(`❌ ${err.message || "Unknown error"}`);
    }
  };

  // ------------------------
  // CONDITIONAL UI STATES
  // ------------------------
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        Loading email templates...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-lg">
        {error}
      </div>
    );

  // ------------------------
  // PAGE UI
  // ------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-100 px-6 py-16">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.h2
          className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Manage Email Templates
        </motion.h2>

        {/* Search + Add/Delete */}
        <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
          <Input
            type="text"
            placeholder="🔍 Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 rounded-xl border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300 transition-all shadow-sm px-4 py-2 text-gray-700"
          />

          <div className="flex gap-3">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
              onClick={() => {
                setEditMode(false);
                setTemplateData({ name: "", subject: "", body: "", description: "", is_active: true });
                setShowModal(true);
              }}
            >
              <FiPlus /> Add Template
            </Button>

            {selectedIds.length > 0 && (
              <Button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
                onClick={handleBulkDelete}
              >
                <FiTrash2 /> Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>

        {/* Template Guide */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-5">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2 text-lg">
              <FiMail className="w-5 h-5" /> Template Guide
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-blue-800 mb-2">📌 Required Template Names (must match exactly):</p>
                 <ul className="list-disc list-inside space-y-1 text-blue-700 ml-2">
                   <li><strong>"Enrollment Confirmation"</strong> - Sent when student enrolls in a course</li>
                   <li><strong>"Password Reset OTP"</strong> - Sent when student requests password reset OTP</li>
                   <li><strong>"Password Reset Confirmation"</strong> - Sent when student successfully resets password</li>
                 </ul>
              </div>
              <div>
                <p className="font-semibold text-blue-800 mb-2">🔧 Available Variables (use {'{{'}variable_name{'}}'} format):</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-blue-700">
                   <div className="bg-white p-3 rounded border border-blue-200">
                     <p className="font-medium text-blue-800 mb-1">For "Enrollment Confirmation":</p>
                     <ul className="list-disc list-inside ml-2 space-y-1">
                       <li><code className="bg-blue-100 px-1 rounded">{"{{name}}"}</code> - Student name</li>
                       <li><code className="bg-blue-100 px-1 rounded">{"{{email}}"}</code> - Student email</li>
                       <li><code className="bg-blue-100 px-1 rounded">{"{{category_name}}"}</code> - Course category name</li>
                       <li><code className="bg-blue-100 px-1 rounded">{"{{enrolled_date}}"}</code> - Enrollment date</li>
                       <li><code className="bg-blue-100 px-1 rounded">{"{{expiry_date}}"}</code> - Expiry date</li>
                     </ul>
                   </div>
                   <div className="bg-white p-3 rounded border border-blue-200">
                     <p className="font-medium text-blue-800 mb-1">For "Password Reset OTP":</p>
                     <ul className="list-disc list-inside ml-2 space-y-1">
                       <li><code className="bg-blue-100 px-1 rounded">{"{{name}}"}</code> - Student name</li>
                       <li><code className="bg-blue-100 px-1 rounded">{"{{email}}"}</code> - Student email</li>
                       <li><code className="bg-blue-100 px-1 rounded">{"{{otp}}"}</code> - 6-digit OTP code</li>
                     </ul>
                   </div>
                   <div className="bg-white p-3 rounded border border-blue-200">
                     <p className="font-medium text-blue-800 mb-1">For "Password Reset Confirmation":</p>
                     <ul className="list-disc list-inside ml-2 space-y-1">
                       <li><code className="bg-blue-100 px-1 rounded">{"{{name}}"}</code> - Student name</li>
                       <li><code className="bg-blue-100 px-1 rounded">{"{{email}}"}</code> - Student email</li>
                       <li><code className="bg-blue-100 px-1 rounded">{"{{reset_time}}"}</code> - Password reset time</li>
                     </ul>
                   </div>
                 </div>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="font-semibold text-blue-800 mb-1">💡 Example Template:</p>
                <div className="text-blue-700 text-xs font-mono bg-blue-50 p-2 rounded">
                  <p><strong>Subject:</strong> Welcome {"{{name}}"}!</p>
                  <p className="mt-1"><strong>Body:</strong> Dear {"{{name}}"}, your enrollment in {"{{category_name}}"} is confirmed. Your access expires on {"{{expiry_date}}"}.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white shadow-lg rounded-xl hover:shadow-xl transition-all border border-indigo-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FiMail className="text-indigo-600 text-xl" />
                      <h3 className="text-lg font-bold text-gray-800">{template.name}</h3>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(template.id)}
                      onChange={() => handleSelect(template.id)}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Subject:</span> {template.subject}
                    </p>
                    {template.description && (
                      <p className="text-xs text-gray-500">{template.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          template.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {template.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <FiEdit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <FiTrash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FiMail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No email templates found</p>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Template */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editMode ? "Edit Template" : "Add New Template"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setTemplateData({ name: "", subject: "", body: "", description: "", is_active: true });
                  setEditId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={templateData.name}
                  onChange={(e) =>
                    setTemplateData({ ...templateData, name: e.target.value })
                  }
                  placeholder="e.g., Welcome Email, Password Reset"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={templateData.subject}
                  onChange={(e) =>
                    setTemplateData({ ...templateData, subject: e.target.value })
                  }
                  placeholder="Email subject line"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <Input
                  type="text"
                  value={templateData.description}
                  onChange={(e) =>
                    setTemplateData({ ...templateData, description: e.target.value })
                  }
                  placeholder="Brief description of when this template is used"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={templateData.body}
                  onChange={(e) =>
                    setTemplateData({ ...templateData, body: e.target.value })
                  }
                  placeholder="Email body content (HTML or plain text)"
                  rows={12}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use HTML tags for formatting. Variables like {"{{name}}"}, {"{{email}}"} can be used for dynamic content.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={templateData.is_active}
                  onChange={(e) =>
                    setTemplateData({ ...templateData, is_active: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                  Active (Template is enabled)
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleSaveTemplate}
              >
                {editMode ? "Update Template" : "Create Template"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setTemplateData({ name: "", subject: "", body: "", description: "", is_active: true });
                  setEditId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
