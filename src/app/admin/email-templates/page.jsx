"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/lib/navigation/client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiPlus, FiX, FiTrash2, FiEdit, FiMail, FiUpload, FiFile } from "react-icons/fi";

const EMPTY_TEMPLATE = {
  name: "",
  subject: "",
  body: "",
  description: "",
  extra_fields: "",
  is_active: true,
};

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [templateData, setTemplateData] = useState({ ...EMPTY_TEMPLATE });
  const [templateFile, setTemplateFile] = useState(null);
  const [hasTemplateFile, setHasTemplateFile] = useState(false);
  const [templateFilename, setTemplateFilename] = useState("");
  const [removeTemplateFile, setRemoveTemplateFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const BASE_URL = `${API_BASE_URL}/api/email-templates`;

  const resetModalState = () => {
    setShowModal(false);
    setEditMode(false);
    setTemplateData({ ...EMPTY_TEMPLATE });
    setTemplateFile(null);
    setHasTemplateFile(false);
    setTemplateFilename("");
    setRemoveTemplateFile(false);
    setEditId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatTemplate = (t) => ({
    id: t.id || t._id || "",
    name: t.name || "",
    subject: t.subject || "",
    body: t.body || "",
    description: t.description || "",
    extra_fields: t.extra_fields || "",
    is_active: t.is_active !== undefined ? t.is_active : true,
    has_template_file: Boolean(t.has_template_file),
    template_filename: t.template_filename || "",
    template_file_type: t.template_file_type || "",
    created_at: t.created_at,
    updated_at: t.updated_at,
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to fetch templates: ${res.status}`);

        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map(formatTemplate);
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

  const MAX_FILE_SIZE_MB = 20;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }

    setTemplateFile(file);
    setRemoveTemplateFile(false);
    setTemplateFilename(file.name);
    setHasTemplateFile(true);
  };

  const handleRemoveUploadedFile = () => {
    setTemplateFile(null);
    setHasTemplateFile(false);
    setTemplateFilename("");
    setRemoveTemplateFile(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveTemplate = async () => {
    const hasFile = Boolean(templateFile) || (hasTemplateFile && !removeTemplateFile);
    const hasBody = Boolean(templateData.body?.trim());

    if (!templateData.name.trim() || !templateData.subject.trim()) {
      alert("Please fill in Template Name and Email Subject.");
      return;
    }

    if (!hasFile && !hasBody) {
      alert("Please provide Email Body text or upload a template file.");
      return;
    }

    const url = editMode ? `${BASE_URL}/${editId}/update/` : `${BASE_URL}/create/`;
    const method = editMode ? "PUT" : "POST";

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", templateData.name.trim());
      formData.append("subject", templateData.subject.trim());
      formData.append("body", templateData.body || "");
      formData.append("description", templateData.description || "");
      formData.append("extra_fields", templateData.extra_fields || "");
      formData.append("is_active", templateData.is_active ? "true" : "false");

      if (templateFile) {
        formData.append("template_file", templateFile);
      }
      if (editMode && removeTemplateFile) {
        formData.append("remove_template_file", "true");
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        const detail = errData.error || errData.body?.[0] || `Failed to save template: ${res.status}`;
        throw new Error(detail);
      }

      const newTemplate = formatTemplate(await res.json());

      if (editMode) {
        setTemplates((prev) => prev.map((t) => (t.id === editId ? newTemplate : t)));
        setFilteredTemplates((prev) => prev.map((t) => (t.id === editId ? newTemplate : t)));
        alert("✅ Template updated successfully!");
      } else {
        setTemplates((prev) => [...prev, newTemplate]);
        setFilteredTemplates((prev) => [...prev, newTemplate]);
        alert("✅ Template added successfully!");
      }

      resetModalState();
    } catch (err) {
      alert(`❌ ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/${id}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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

  const handleEditTemplate = (template) => {
    setTemplateData({
      name: template.name,
      subject: template.subject,
      body:
        template.has_template_file && template.template_file_type === "text"
          ? ""
          : template.body,
      description: template.description || "",
      extra_fields: template.extra_fields || "",
      is_active: template.is_active,
    });
    setHasTemplateFile(template.has_template_file);
    setTemplateFilename(template.template_filename || "");
    setTemplateFile(null);
    setRemoveTemplateFile(false);
    setEditId(template.id);
    setEditMode(true);
    setShowModal(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one template to delete.");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} template(s)?`)) return;

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        Loading email templates...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-lg">
        {error}
      </div>
    );
  }

  const usingUploadedTemplate = Boolean(templateFile) || (hasTemplateFile && !removeTemplateFile);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-100 px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Manage Email Templates
        </motion.h2>

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
                resetModalState();
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

        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-5">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2 text-lg">
              <FiMail className="w-5 h-5" /> Template Guide
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-blue-800 mb-2">📌 Required Template Names (must match exactly):</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 ml-2">
                  <li><strong>&quot;Enrollment Confirmation&quot;</strong> - Sent when student enrolls in a course</li>
                  <li><strong>&quot;Password Reset OTP&quot;</strong> - Sent when student requests password reset OTP</li>
                  <li><strong>&quot;Password Reset Confirmation&quot;</strong> - Sent when student successfully resets password</li>
                  <li><strong>&quot;Payment Invoice&quot;</strong> - Sent after successful payment (upload HTML for full invoice layout)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-blue-800 mb-2">📤 Upload Template File (Invoice):</p>
                <p className="text-blue-700">
                  When a file is uploaded, <strong>only that file is sent</strong> — the Email Body field is not shown again in the email.
                </p>
                <ul className="list-disc list-inside text-blue-700 mt-2 ml-2 space-y-1">
                  <li><strong>HTML file (recommended for invoice)</strong> — design your invoice in HTML with {"{{customer_name}}"}, {"{{exam_name}}"}, {"{{invoice_number}}"}, {"{{amount_paid}}"}, {"{{gst_amount}}"}, etc. All values fill in dynamically.</li>
                  <li><strong>Image (PNG/JPG)</strong> — shows only the image; text inside the image cannot change automatically. Use HTML for dynamic invoice details.</li>
                  <li><strong>PDF</strong> — attached to the email only (static file).</li>
                </ul>
                <p className="text-blue-700 mt-2">
                  Hide optional details when empty: <code className="bg-blue-100 px-1 rounded">{"{{#if customer_gstin}}"}</code> GSTIN: {"{{customer_gstin}}"} <code className="bg-blue-100 px-1 rounded">{"{{/if}}"}</code>
                </p>
              </div>
              <div>
                <p className="font-semibold text-blue-800 mb-2">🔧 Available Variables (use {"{{"}variable_name{"}}"} format):</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-blue-700">
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="font-medium text-blue-800 mb-1">For &quot;Enrollment Confirmation&quot;:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li><code className="bg-blue-100 px-1 rounded">{"{{name}}"}</code> - Student name</li>
                      <li><code className="bg-blue-100 px-1 rounded">{"{{email}}"}</code> - Student email</li>
                      <li><code className="bg-blue-100 px-1 rounded">{"{{category_name}}"}</code> - Course name</li>
                      <li><code className="bg-blue-100 px-1 rounded">{"{{enrolled_date}}"}</code> - Enrollment date</li>
                      <li><code className="bg-blue-100 px-1 rounded">{"{{expiry_date}}"}</code> - Expiry date</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="font-medium text-blue-800 mb-1">For &quot;Payment Invoice&quot;:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                      <li><code className="bg-blue-100 px-1 rounded">{"{{customer_name}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{exam_name}}"}</code></li>
                      <li><code className="bg-blue-100 px-1 rounded">{"{{invoice_number}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{invoice_date}}"}</code></li>
                      <li><code className="bg-blue-100 px-1 rounded">{"{{exam_price}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{gst_amount}}"}</code></li>
                      <li><code className="bg-blue-100 px-1 rounded">{"{{customer_gstin}}"}</code> (optional)</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="font-medium text-blue-800 mb-1">Extra Custom Fields:</p>
                    <p className="text-xs">Add static values as JSON in Extra Fields, e.g. <code className="bg-blue-100 px-1 rounded">{`{"support_phone":"1234567890"}`}</code> then use <code className="bg-blue-100 px-1 rounded">{"{{support_phone}}"}</code> in your template.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          template.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {template.is_active ? "Active" : "Inactive"}
                      </span>
                      {template.has_template_file && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 flex items-center gap-1">
                          <FiFile className="w-3 h-3" />
                          {template.template_filename || "Uploaded file"}
                          {template.template_file_type && template.template_file_type !== "text" && (
                            <span className="opacity-75">({template.template_file_type})</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditTemplate(template)}>
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
              <button onClick={resetModalState} className="text-gray-500 hover:text-gray-700">
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
                  onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                  placeholder="e.g., Payment Invoice, Enrollment Confirmation"
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
                  onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
                  placeholder="Email subject line (supports {{variables}})"
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
                  onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                  placeholder="Brief description of when this template is used"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Template File (Optional)
                </label>
                <div className="border border-dashed border-indigo-300 rounded-lg p-4 bg-indigo-50/50">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:cursor-pointer hover:file:bg-indigo-700"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <FiUpload className="w-3 h-3" />
                    HTML, images, PDF, Word, or any document (max {MAX_FILE_SIZE_MB}MB). Executable files (.exe, .bat) are blocked.
                  </p>
                  {usingUploadedTemplate && (
                    <div className="mt-3 flex items-center justify-between bg-white border border-indigo-200 rounded-lg px-3 py-2">
                      <span className="text-sm text-indigo-800 flex items-center gap-2">
                        <FiFile className="w-4 h-4" />
                        {templateFilename || "Template file selected"}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveUploadedFile}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Extra Custom Fields (Optional)
                </label>
                <textarea
                  value={templateData.extra_fields}
                  onChange={(e) => setTemplateData({ ...templateData, extra_fields: e.target.value })}
                  placeholder='{"support_phone":"1234567890","company_name":"AllExam"}'
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JSON object or key=value pairs (comma-separated). Use matching {"{{variable}}"} in your template.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Body {!usingUploadedTemplate && <span className="text-red-500">*</span>}
                  {usingUploadedTemplate && <span className="text-gray-400 font-normal">(optional when file uploaded)</span>}
                </label>
                <textarea
                  value={templateData.body}
                  onChange={(e) => setTemplateData({ ...templateData, body: e.target.value })}
                  placeholder={
                    usingUploadedTemplate
                      ? "Optional fallback text if uploaded file is removed later"
                      : "Email body content (HTML or plain text). Use {{variable}} for dynamic values."
                  }
                  rows={10}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
                {usingUploadedTemplate && (
                  <p className="text-xs text-indigo-600 mt-1">
                    Only the uploaded file is used when sending — Email Body is not duplicated in the email.
                    For dynamic invoice fields, upload an <strong>HTML file</strong> with {"{{variables}}"} (not a static image).
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={templateData.is_active}
                  onChange={(e) => setTemplateData({ ...templateData, is_active: e.target.checked })}
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
                disabled={saving}
              >
                {saving ? "Saving..." : editMode ? "Update Template" : "Create Template"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={resetModalState}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
