"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiPlus, FiX, FiTrash2, FiEdit } from "react-icons/fi";
import { Cloud, Shield, Briefcase, Database, Code, TrendingUp, Eye } from "lucide-react";
import TipTapEditor from "@/components/editor/TipTapEditor";
import { resolveCategoryImageUrl } from "@/lib/categoryImage";
import { convertImageFileToWebp } from "@/utils/convertImageToWebp";
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

const ICON_OPTIONS = [
  "Cloud",
  "Shield",
  "Briefcase",
  "Database",
  "Code",
  "TrendingUp",
];

const ICON_MAP = {
  Cloud,
  Shield,
  Briefcase,
  Database,
  Code,
  TrendingUp,
};

const EMPTY_FAQ = { question: "", answer: "" };
const LOCAL_DJANGO_API = "http://127.0.0.1:8000";

/** Image upload route exists on local Django; production API may not have it yet. */
function resolveCategoryImageApiBase() {
  const configured = (
    process.env.NEXT_PUBLIC_API_BASE_URL || LOCAL_DJANGO_API
  ).replace(/\/$/, "");

  if (typeof window === "undefined") {
    return configured;
  }

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return LOCAL_DJANGO_API;
  }

  return configured;
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

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "1", "yes", "y", "on"].includes(normalized);
  }
  return false;
}

const CATEGORY_TEXT_LIMIT = 150;

function clampCategoryText(value, limit = CATEGORY_TEXT_LIMIT) {
  return String(value || "").slice(0, limit);
}

function clampCategoryDescription(value) {
  return clampToWordLimit(value, DESCRIPTION_WORD_LIMIT);
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [listPage, setListPage] = useState(1);
  const [listPagination, setListPagination] = useState(DEFAULT_ADMIN_PAGINATION);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState([]);
  const [categoryData, setCategoryData] = useState({
    title: "",
    slug: "",
    main_category: "",
    description: "",
    content: "",
    faqs: [],
    icon: ICON_OPTIONS[0],
    image_url: "",
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
    is_top_certification: false,
    page_title: "",
    hero_title: "",
    hero_subtitle: "",
  });
  const [modalTab, setModalTab] = useState("details");
  const [editSlug, setEditSlug] = useState(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const BASE_URL = `${API_BASE_URL}/api/categories`;
  const HOME_BASE_URL = `${API_BASE_URL}/api/home`;
  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const handleSaveHeroSection = async () => {
    try {
      const res = await fetch(`${HOME_BASE_URL}/admin/categories-page-seo/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hero_title: categoriesPageSeo.hero_title,
          hero_subtitle: categoriesPageSeo.hero_subtitle,
        }),
      });
  
      if (!res.ok) throw new Error("Failed to save hero section");
  
      const data = await res.json();
  
      setCategoriesPageSeo((prev) => ({
        ...prev,
        ...data,
      }));
  
      setPageMessage("✅ Hero section saved successfully!");
      setTimeout(() => setPageMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setPageMessage("❌ Error saving hero section");
    }
  };

  // SEO for the /categories page (not per-category SEO)
  const [categoriesPageSeo, setCategoriesPageSeo] = useState({
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
    hero_title: "",
    hero_subtitle: "",
  });
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoMessage, setSeoMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    type: null, // "single" | "bulk"
    slug: "",
  });

  // Fetch categories with server-side search, pagination, and course counts.
  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          buildAdminListUrl(`${BASE_URL}/`, {
            page: listPage,
            page_size: ADMIN_TABLE_PAGE_SIZE,
            search: debouncedSearchTerm.trim(),
          }),
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
        const data = await res.json();
        const rows = Array.isArray(data?.data) ? data.data : [];
        const categoriesWithCounts = rows.map((c) => {
          const slug = c.slug || (c.id || c._id ? String(c.id || c._id) : "");
          return {
            title: c.title || c.name || "",
            slug: slug,
            main_category: c.main_category || "",
            description: c.description || "",
            content: normalizeContentForEditor(c.content || ""),
            faqs: Array.isArray(c.faqs) ? c.faqs : [],
            icon: c.icon || ICON_OPTIONS[0],
            image_url: c.image_url || "",
            meta_title: c.meta_title || "",
            meta_keywords: c.meta_keywords || "",
            meta_description: c.meta_description || "",
            is_top_certification: parseBoolean(c.is_top_certification),
            page_title: c.page_title || "",
            hero_title: c.hero_title || "",
            hero_subtitle: c.hero_subtitle || "",
            courseCount: Number(c.course_count) || 0,
          };
        });
        
        if (mounted) {
          setCategories(categoriesWithCounts);
          setFilteredCategories(categoriesWithCounts);
          setListPagination(normalizeAdminPagination(data.pagination));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch categories");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCategories();
    return () => { mounted = false; };
  }, [BASE_URL, listPage, debouncedSearchTerm]);

  // Fetch /categories page SEO
  useEffect(() => {
    let mounted = true;
    const fetchCategoriesPageSeo = async () => {
      try {
        const res = await fetch(`${HOME_BASE_URL}/admin/categories-page-seo/`);
        if (!mounted) return;
        if (!res.ok) return;
        const data = await res.json();

        if (data?.success && data?.data) {
          setCategoriesPageSeo({
            meta_title: data.data.meta_title || "",
            meta_keywords: data.data.meta_keywords || "",
            meta_description: data.data.meta_description || "",
            hero_title: data.data.hero_title || "",
            hero_subtitle: data.data.hero_subtitle || "",
          });
        }
      } catch (err) {
        console.error("Error fetching categories page SEO:", err);
      }
    };

    fetchCategoriesPageSeo();
    return () => {
      mounted = false;
    };
  }, [HOME_BASE_URL]);

  const handleSaveCategoriesPageSeo = async () => {
    setSeoLoading(true);
    setSeoMessage("");
    try {
      const res = await fetch(`${HOME_BASE_URL}/admin/categories-page-seo/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoriesPageSeo),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Failed to save SEO: ${res.status}`);
      }

      const data = await res.json();
      if (data?.success) {
        setSeoMessage("✅ Categories page SEO saved successfully!");
        setTimeout(() => setSeoMessage(""), 3000);
      } else {
        setSeoMessage(`❌ Error saving SEO: ${data?.error || "Unknown error"}`);
      }
    } catch (err) {
      setSeoMessage(`❌ ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSeoLoading(false);
    }
  };

  useEffect(() => {
    setListPage(1);
  }, [searchTerm]);

  const paginatedCategories = {
    items: filteredCategories,
    page: listPagination.page,
    totalPages: listPagination.total_pages,
    totalItems: listPagination.count,
  };

  const buildCategoryRequestBody = () => ({
    title: categoryData.title,
    slug: categoryData.slug,
    main_category: categoryData.main_category,
    description: clampCategoryDescription(categoryData.description),
    content: categoryData.content,
    faqs: (categoryData.faqs || [])
      .map((faq) => ({
        question: (faq?.question || "").trim(),
        answer: (faq?.answer || "").trim(),
      }))
      .filter((faq) => faq.question && faq.answer),
    icon: categoryData.icon,
    image_url: categoryData.image_url,
    meta_title: categoryData.meta_title,
    meta_keywords: categoryData.meta_keywords,
    meta_description: categoryData.meta_description,
    is_top_certification: parseBoolean(categoryData.is_top_certification),
    page_title: categoryData.page_title,
    hero_title: categoryData.hero_title,
    hero_subtitle: categoryData.hero_subtitle,
  });

  // Save (create or update)
  const handleSaveCategory = async () => {
    if (!categoryData.title.trim()) {
      setSaveMessage("❌ Please enter a category name.");
      return;
    }
    setSaveMessage("");

    const url = editMode
      ? `${BASE_URL}/${encodeURIComponent(editSlug)}/update/`
      : `${BASE_URL}/create/`;
    const method = editMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildCategoryRequestBody()),
      });

      if (!res.ok) {
        let errMessage = `Failed to save category (${res.status})`;
        try {
          const errData = await res.json();
          const titleError = errData?.errors?.title;
          errMessage =
            errData?.error ||
            errData?.message ||
            (Array.isArray(titleError) ? titleError[0] : titleError) ||
            (typeof errData?.errors === "string" ? errData.errors : null) ||
            errMessage;
        } catch {
          const errText = await res.text();
          if (errText) errMessage = errText;
        }
        throw new Error(
          String(errMessage).includes("already exists")
            ? "This category already exists."
            : errMessage
        );
      }

      const saved = await res.json();
      const savedSlug = saved.slug || saved.id || "";
      let updatedCourseCount = 0;
      if (editMode) {
        const existing = categories.find((c) => c.slug === editSlug);
        updatedCourseCount = existing?.courseCount || 0;
      }

      // Recalculate course count for the saved category slug
      if (savedSlug) {
        try {
          const coursesRes = await fetch(`${API_BASE_URL}/api/courses/category/${savedSlug}/`);
          if (coursesRes.ok) {
            const courses = await coursesRes.json();
            updatedCourseCount = Array.isArray(courses) ? courses.length : 0;
          }
        } catch (err) {
          console.error(`Error fetching courses for ${savedSlug}:`, err);
        }
      }

      // backend returns saved object with slug
      const normalized = {
        title: saved.title || categoryData.title,
        main_category: saved.main_category || categoryData.main_category,
        description: saved.description || categoryData.description,
        content: saved.content || categoryData.content,
        faqs: Array.isArray(saved.faqs) ? saved.faqs : categoryData.faqs,
        icon: saved.icon || categoryData.icon,
        image_url: saved.image_url || categoryData.image_url,
        slug: savedSlug,
        meta_title: saved.meta_title || categoryData.meta_title,
        meta_keywords: saved.meta_keywords || categoryData.meta_keywords,
        meta_description: saved.meta_description || categoryData.meta_description,
        is_top_certification: parseBoolean(saved.is_top_certification),
        page_title: saved.page_title || categoryData.page_title,
        hero_title: saved.hero_title || categoryData.hero_title,
        hero_subtitle: saved.hero_subtitle || categoryData.hero_subtitle,
        courseCount: updatedCourseCount,
      };

      if (editMode) {
        setCategories((prev) => prev.map((p) => (p.slug === editSlug ? normalized : p)));
        setFilteredCategories((prev) => prev.map((p) => (p.slug === editSlug ? normalized : p)));
        setSaveMessage("✅ Category updated successfully!");
        setPageMessage("✅ Category updated successfully!");
      } else {
        setCategories((prev) => [...prev, normalized]);
        setFilteredCategories((prev) => [...prev, normalized]);
        setSaveMessage("✅ Category added successfully!");
        setPageMessage("✅ Category added successfully!");
      }

      setTimeout(() => setPageMessage(""), 3000);

      setTimeout(() => {
        setShowModal(false);
        setEditMode(false);
        setEditSlug(null);
        setModalTab("details");
        setCategoryData({
          title: "",
          slug: "",
          main_category: "",
          description: "",
          content: "",
          faqs: [],
          icon: ICON_OPTIONS[0],
          image_url: "",
          meta_title: "",
          meta_keywords: "",
          meta_description: "",
          is_top_certification: false,
          page_title: "",
          hero_title: "",
          hero_subtitle: "",
        });
        setSaveMessage("");
      }, 900);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setSaveMessage(`❌ ${message}`);
    }
  };

  const persistCategoryBeforeImageUpload = async () => {
    if (!categoryData.title.trim()) {
      throw new Error("Please enter a category title before uploading an image.");
    }

    const imageApiBase = `${resolveCategoryImageApiBase()}/api/categories`;
    const url =
      editMode && editSlug
        ? `${imageApiBase}/${encodeURIComponent(editSlug)}/update/`
        : `${imageApiBase}/create/`;
    const method = editMode && editSlug ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildCategoryRequestBody()),
    });

    if (!res.ok) {
      let errMessage = `Failed to save category (${res.status})`;
      try {
        const errData = await res.json();
        const titleError = errData?.errors?.title;
        errMessage =
          errData?.error ||
          errData?.message ||
          (Array.isArray(titleError) ? titleError[0] : titleError) ||
          (typeof errData?.errors === "string" ? errData.errors : null) ||
          errMessage;
      } catch {
        const errText = await res.text();
        if (errText) errMessage = errText;
      }
      throw new Error(
        String(errMessage).includes("already exists")
          ? "This category already exists."
          : errMessage
      );
    }

    const saved = await res.json();
    const savedSlug = String(saved.slug || "").trim();
    if (!savedSlug) {
      throw new Error("Category was saved but no slug was returned.");
    }

    const previousSlug = editSlug || savedSlug;
    const normalized = {
      title: saved.title || categoryData.title,
      main_category: saved.main_category || categoryData.main_category,
      description: saved.description || categoryData.description,
      content: saved.content || categoryData.content,
      faqs: Array.isArray(saved.faqs) ? saved.faqs : categoryData.faqs,
      icon: saved.icon || categoryData.icon,
      image_url: saved.image_url || categoryData.image_url,
      slug: savedSlug,
      meta_title: saved.meta_title || categoryData.meta_title,
      meta_keywords: saved.meta_keywords || categoryData.meta_keywords,
      meta_description: saved.meta_description || categoryData.meta_description,
      is_top_certification: parseBoolean(saved.is_top_certification),
      page_title: saved.page_title || categoryData.page_title,
      hero_title: saved.hero_title || categoryData.hero_title,
      hero_subtitle: saved.hero_subtitle || categoryData.hero_subtitle,
    };

    setCategoryData((prev) => ({ ...prev, ...normalized }));
    setEditMode(true);
    setEditSlug(savedSlug);

    const mergeList = (prev) => {
      const existing = prev.find((c) => c.slug === previousSlug);
      const courseCount = existing?.courseCount || 0;
      const entry = { ...normalized, courseCount };
      if (existing) {
        return prev.map((c) => (c.slug === previousSlug ? entry : c));
      }
      return [...prev, entry];
    };

    setCategories(mergeList);
    setFilteredCategories(mergeList);

    return savedSlug;
  };

  const resolveCategoryUploadSlug = async () => {
    if (editMode && editSlug) {
      return String(editSlug).trim();
    }

    const draftSlug = String(categoryData.slug || "").trim();
    if (draftSlug) {
      try {
        const imageApiBase = `${resolveCategoryImageApiBase()}/api/categories`;
        const res = await fetch(
          `${imageApiBase}/${encodeURIComponent(draftSlug)}/`
        );
        if (res.ok) return draftSlug;
      } catch {
        // fall through and save before upload
      }
    }

    return persistCategoryBeforeImageUpload();
  };

  const handleUploadCategoryImage = async (file) => {
    if (!file) return;

    setImageUploading(true);
    setSaveMessage("");
    try {
      const webpFile = await convertImageFileToWebp(file);
      const slug = await resolveCategoryUploadSlug();
      const form = new FormData();
      form.append("image", webpFile);

      const imageApiBase = `${resolveCategoryImageApiBase()}/api/categories`;
      const res = await fetch(
        `${imageApiBase}/${encodeURIComponent(slug)}/upload-image/`,
        {
          method: "POST",
          body: form,
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = data?.error || `Upload failed (${res.status})`;
        if (res.status === 404 && detail.toLowerCase().includes("not found")) {
          throw new Error(
            "Category not found on the image API. Run the local Django server (python manage.py runserver) and ensure this category exists in your local database."
          );
        }
        throw new Error(detail);
      }

      const uploadedImageUrl = data?.image_url || "";
      setCategoryData((prev) => ({
        ...prev,
        slug,
        image_url: uploadedImageUrl || prev.image_url,
      }));

      setCategories((prev) =>
        prev.map((c) =>
          c.slug === slug
            ? { ...c, image_url: uploadedImageUrl || c.image_url }
            : c
        )
      );
      setFilteredCategories((prev) =>
        prev.map((c) =>
          c.slug === slug
            ? { ...c, image_url: uploadedImageUrl || c.image_url }
            : c
        )
      );

      setSaveMessage("✅ Image uploaded successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setSaveMessage(
        `❌ ${err instanceof Error ? err.message : "Image upload failed"}`
      );
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveCategoryImage = async () => {
    setSaveMessage("");
    const slug = editSlug || String(categoryData.slug || "").trim();

    if (!slug) {
      setCategoryData((prev) => ({ ...prev, image_url: "" }));
      setSaveMessage("✅ Image removed.");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    setImageUploading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/${encodeURIComponent(slug)}/update/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...buildCategoryRequestBody(),
            image_url: "",
            remove_image: true,
          }),
        }
      );

      if (!res.ok) {
        let errMessage = `Failed to remove image (${res.status})`;
        try {
          const errData = await res.json();
          errMessage = errData?.error || errData?.message || errMessage;
        } catch {
          const errText = await res.text();
          if (errText) errMessage = errText;
        }
        throw new Error(errMessage);
      }

      const saved = await res.json();
      const savedSlug = saved.slug || slug;
      const clearedImageUrl = "";

      setCategoryData((prev) => ({ ...prev, image_url: clearedImageUrl }));
      setCategories((prev) =>
        prev.map((c) =>
          c.slug === savedSlug ? { ...c, image_url: clearedImageUrl } : c
        )
      );
      setFilteredCategories((prev) =>
        prev.map((c) =>
          c.slug === savedSlug ? { ...c, image_url: clearedImageUrl } : c
        )
      );

      setSaveMessage("✅ Image removed successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setSaveMessage(
        `❌ ${err instanceof Error ? err.message : "Failed to remove image"}`
      );
    } finally {
      setImageUploading(false);
    }
  };

  // Delete single category by slug
  const handleDeleteCategory = async (slug) => {
    try {
      const res = await fetch(`${BASE_URL}/${encodeURIComponent(slug)}/delete/`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to delete: ${res.status} - ${errText}`);
      }
      setCategories((prev) => prev.filter((c) => c.slug !== slug));
      setFilteredCategories((prev) => prev.filter((c) => c.slug !== slug));
      setPageMessage("✅ Category deleted successfully!");
      setTimeout(() => setPageMessage(""), 3000);
    } catch (err) {
      setPageMessage(`❌ ${err instanceof Error ? err.message : "Unknown error"}`);
      setTimeout(() => setPageMessage(""), 3000);
    }
  };

  // Edit
  const handleEditCategory = (cat) => {
    setCategoryData({
      title: cat.title || "",
      slug: cat.slug || "",
      main_category: cat.main_category || "",
      description: clampCategoryDescription(cat.description || ""),
      content: normalizeContentForEditor(cat.content || ""),
      faqs: Array.isArray(cat.faqs) ? cat.faqs : [],
      icon: cat.icon || ICON_OPTIONS[0],
      image_url: cat.image_url || "",
      meta_title: cat.meta_title || "",
      meta_keywords: cat.meta_keywords || "",
      meta_description: cat.meta_description || "",
      is_top_certification: parseBoolean(cat.is_top_certification),
      page_title: cat.page_title || cat.hero_title || "",
      hero_title: cat.hero_title || "",
      hero_subtitle: cat.hero_subtitle || "",
    });
    setEditSlug(cat.slug);
    setEditMode(true);
    setModalTab("details");
    setShowModal(true);
  };

  // Select for bulk
  const handleSelect = (slug) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  // Bulk delete (calls delete per slug)
  const handleBulkDelete = async () => {
    if (selectedSlugs.length === 0) {
      setPageMessage("❌ Please select at least one category to delete.");
      setTimeout(() => setPageMessage(""), 3000);
      return;
    }

    try {
      for (const slug of selectedSlugs) {
        await fetch(`${BASE_URL}/${encodeURIComponent(slug)}/delete/`, { method: "DELETE" });
      }
      setCategories((prev) => prev.filter((c) => !selectedSlugs.includes(c.slug)));
      setFilteredCategories((prev) => prev.filter((c) => !selectedSlugs.includes(c.slug)));
      setSelectedSlugs([]);
      setPageMessage("✅ Selected categories deleted successfully!");
      setTimeout(() => setPageMessage(""), 3000);
    } catch (err) {
      setPageMessage(`❌ ${err instanceof Error ? err.message : "Unknown error"}`);
      setTimeout(() => setPageMessage(""), 3000);
    }
  };

  const openDeleteConfirmation = (type, slug = "") => {
    setDeleteConfirm({ open: true, type, slug });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirm({ open: false, type: null, slug: "" });
  };

  const confirmDeleteAction = async () => {
    if (deleteConfirm.type === "single" && deleteConfirm.slug) {
      await handleDeleteCategory(deleteConfirm.slug);
    } else if (deleteConfirm.type === "bulk") {
      await handleBulkDelete();
    }
    closeDeleteConfirmation();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-lg text-gray-600">
        Loading categories...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-64 text-red-600 text-lg">
        {String(error)}
      </div>
    );

  return (
    <div className="w-full max-w-none space-y-6">
        <motion.h2
          className="text-2xl font-semibold text-gray-900 tracking-tight"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Manage Categories
        </motion.h2>
        {pageMessage ? (
          <div
            className={`rounded-md border px-4 py-3 text-sm ${
              pageMessage.startsWith("✅")
                ? "border-gray-200 bg-gray-50 text-gray-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {pageMessage}
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
          <div className="flex flex-wrap gap-2">
            {/* <Button
              variant="default"
              className="flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800"
              onClick={() => {
                setEditMode(false);
                setPageMessage("");
                setModalTab("details");
                setCategoryData({
                  title: "",
                  slug: "",
                  main_category: "",
                  description: "",
                  content: "",
                  faqs: [],
                  icon: ICON_OPTIONS[0],
                  image_url: "",
                  meta_title: "",
                  meta_keywords: "",
                  meta_description: "",
                  is_top_certification: false,
                  hero_title: "",
                  hero_subtitle: "",
                });
                setEditSlug(null);
                setShowModal(true);
              }}
            >
              <FiPlus /> Add Category
            </Button> */}

            {selectedSlugs.length > 0 && (
              <Button
                variant="outline"
                className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                onClick={() => openDeleteConfirmation("bulk")}
              >
                <FiTrash2 /> Delete Selected ({selectedSlugs.length})
              </Button>
            )}
          </div>
        </div>

        {/* SEO Settings for /categories page */}
        <div>
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    SEO settings 
                  </h3>
                  {/* <p className="text-sm text-gray-600 mt-1">
                    SEO meta tags and hero content for the main categories listing page.
                  </p> */}
                </div>

              </div>

              {seoMessage ? (
                <p
                  className={`text-sm mb-4 ${
                    seoMessage.startsWith("✅")
                      ? "text-gray-700"
                      : seoMessage.startsWith("❌")
                        ? "text-red-600"
                        : "text-gray-700"
                  }`}
                >
                  {seoMessage}
                </p>
              ) : null}

              

              <div className="pt-2">
                <h4 className="text-base font-semibold text-gray-900 mb-4">
                  SEO Meta Tags
                </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <Input
                    value={categoriesPageSeo.meta_title}
                    onChange={(e) =>
                      setCategoriesPageSeo({
                        ...categoriesPageSeo,
                        meta_title: e.target.value,
                      })
                    }
                    placeholder="e.g., All Categories - Certification Exams | AllExamQuestions"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 50-60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <Input
                    value={categoriesPageSeo.meta_keywords}
                    onChange={(e) =>
                      setCategoriesPageSeo({
                        ...categoriesPageSeo,
                        meta_keywords: e.target.value,
                      })
                    }
                    placeholder="cloud, security, networking, certifications..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Comma-separated keywords
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={categoriesPageSeo.meta_description}
                    onChange={(e) =>
                      setCategoriesPageSeo({
                        ...categoriesPageSeo,
                        meta_description: e.target.value,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 bg-white p-3 text-base transition focus-visible:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                    rows={3}
                    placeholder="Concise description shown in Google results (150-160 characters recommended)"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end border-t border-gray-200 pt-6">
                <Button
                  onClick={handleSaveCategoriesPageSeo}
                  disabled={seoLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8"
                >
                  {seoLoading ? "Saving..." : "Save SEO"}
                </Button>
              </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4 border-b border-gray-200 pb-6">
          <h4 className="text-base font-semibold text-gray-900">
            Hero Section
          </h4>
          {/* <p className="text-sm text-gray-600">
            Content shown in the hero banner on the public /categories page. Stats cards remain automatic from your categories and exams.
          </p> */}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hero Title
            </label>
            <Input
              value={categoriesPageSeo.hero_title}
              onChange={(e) =>
                setCategoriesPageSeo({
                  ...categoriesPageSeo,
                  hero_title: e.target.value,
                })
              }
              placeholder="e.g., Explore Exam Categories"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hero Subtitle
            </label>
            <textarea
              value={categoriesPageSeo.hero_subtitle}
              onChange={(e) =>
                setCategoriesPageSeo({
                  ...categoriesPageSeo,
                  hero_subtitle: clampCategoryText(e.target.value),
                })
              }
              maxLength={CATEGORY_TEXT_LIMIT}
              className="w-full rounded-md border border-gray-300 bg-white p-3 text-base transition focus-visible:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              rows={4}
              placeholder="Short description shown below the hero title on the categories page"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(categoriesPageSeo.hero_subtitle || "").length}/{CATEGORY_TEXT_LIMIT} characters
            </p>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveHeroSection}
              className="px-6 py-2 rounded-md bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Search bar under Hero Section */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-sm rounded-md border border-gray-200 bg-white shadow-none"
          />
           <Button
              variant="default"
              className="flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800"
              onClick={() => {
                setEditMode(false);
                setPageMessage("");
                setModalTab("details");
                setCategoryData({
                  title: "",
                  slug: "",
                  main_category: "",
                  description: "",
                  content: "",
                  faqs: [],
                  icon: ICON_OPTIONS[0],
                  image_url: "",
                  meta_title: "",
                  meta_keywords: "",
                  meta_description: "",
                  is_top_certification: false,
                  page_title: "",
                  hero_title: "",
                  hero_subtitle: "",
                });
                setEditSlug(null);
                setShowModal(true);
              }}
            >
              <FiPlus /> Add Category
            </Button>
        </div>


        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="w-10 px-4 py-3 align-middle">
                    <input
                      type="checkbox"
                      checked={filteredCategories.length > 0 && selectedSlugs.length === filteredCategories.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSlugs(filteredCategories.map(cat => cat.slug));
                        } else {
                          setSelectedSlugs([]);
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label="Select all categories"
                    />
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-600">Icon</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-600">Name</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-600">Exams</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-600">Top certification</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                      No categories found. {searchTerm ? "Try a different search term." : "Add a category to get started."}
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.items.map((cat, idx) => {
                    const IconComp = ICON_MAP[cat.icon] || Cloud;
                    const thumbSrc = resolveCategoryImageUrl(cat.image_url);
                    return (
                      <motion.tr
                        key={cat.slug || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="transition-colors hover:bg-gray-50/80"
                      >
                        <td className="px-4 py-3 align-middle">
                          <input
                            type="checkbox"
                            checked={selectedSlugs.includes(cat.slug)}
                            onChange={() => handleSelect(cat.slug)}
                            className="h-4 w-4 rounded border-gray-300"
                            aria-label={`Select ${cat.title}`}
                          />
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                            {thumbSrc ? (
                              <img
                                src={thumbSrc}
                                alt={cat.title || "Category"}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <IconComp className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle font-medium text-gray-900">{cat.title}</td>
                        <td className="px-4 py-3 align-middle tabular-nums text-gray-700">
                          {cat.courseCount > 0
                            ? `${cat.courseCount} exam${cat.courseCount !== 1 ? "s" : ""}`
                            : "0"}
                        </td>
                        <td className="px-4 py-3 align-middle text-gray-700">
                          {cat.is_top_certification ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:justify-center">
                            <Button
                              onClick={() => handleEditCategory(cat)}
                              variant="outline"
                              size="sm"
                              className="h-9 min-w-9 border-gray-300 px-0 text-gray-800 hover:bg-gray-50"
                              aria-label={`Edit ${cat.title}`}
                            >
                              <FiEdit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              onClick={() => openDeleteConfirmation("single", cat.slug)}
                              variant="outline"
                              size="sm"
                              className="h-9 min-w-9 border-gray-200 px-0 text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                              aria-label={`Delete ${cat.title}`}
                            >
                              <FiTrash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <AdminTablePagination
            currentPage={paginatedCategories.page}
            totalPages={paginatedCategories.totalPages}
            totalItems={paginatedCategories.totalItems}
            onPageChange={setListPage}
            itemLabel="categories"
          />
        </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl relative">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <button 
                className="absolute top-4 right-4 text-white/80 hover:text-white transition" 
                onClick={() => setShowModal(false)}
              >
                <FiX size={24} />
              </button>
              <h3 className="text-3xl font-bold">{editMode ? "Edit Category" : "Add New Category"}</h3>
              <p className="text-white/80 mt-1">Fill in the details below to {editMode ? "update" : "create"} a category</p>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {saveMessage ? (
                <div
                  className={`rounded-lg border px-4 py-3 text-sm ${
                    saveMessage.startsWith("✅")
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {saveMessage}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
                {[
                  { id: "details", label: "Details" },
                  { id: "seo", label: "SEO Meta Tags" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setModalTab(tab.id)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      modalTab === tab.id
                        ? "bg-indigo-600 text-white shadow"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {modalTab === "details" && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 pb-2 border-b-2 border-indigo-100">
                  📝 Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <Input 
                      value={categoryData.title} 
                      onChange={(e) => setCategoryData({ ...categoryData, title: e.target.value })} 
                      placeholder="e.g., Cloud, Security, Networking"
                      className="text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">Shown on category cards and listings</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Page Title
                    </label>
                    <Input
                      value={categoryData.page_title}
                      onChange={(e) =>
                        setCategoryData({ ...categoryData, page_title: e.target.value })
                      }
                      placeholder="e.g., Cloud Certification Practice Tests & Exam Prep"
                      className="text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Shown in the hero section on the category detail page
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category Slug *
                    </label>
                    <Input 
                      value={categoryData.slug} 
                      onChange={(e) => setCategoryData({ ...categoryData, slug: e.target.value })} 
                      placeholder="e.g., cloud-certifications, it-security"
                      className="text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">This will be displayed as the main category slug</p>
                  </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Category Image
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={imageUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadCategoryImage(file);
                      // allow re-upload of same file later
                      e.target.value = "";
                    }}
                    className="text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    New categories are saved automatically when you upload an image. Editing uses the saved category slug.
                    {imageUploading ? " Uploading..." : ""}
                  </p>

                  {resolveCategoryImageUrl(categoryData.image_url) ? (
                    <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-gray-700">
                          Preview
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={imageUploading}
                          onClick={handleRemoveCategoryImage}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <FiTrash2 className="mr-1 h-3.5 w-3.5" />
                          Remove
                        </Button>
                      </div>
                      <img
                        src={resolveCategoryImageUrl(categoryData.image_url)}
                        alt="Category"
                        className="w-full max-w-md h-40 object-cover rounded-lg border border-white shadow-sm"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : null}
                </div>
               

            
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Main Category Heading
                    </label>
                    <Input
                      value={categoryData.main_category}
                      onChange={(e) =>
                        setCategoryData({ ...categoryData, main_category: e.target.value })
                      }
                      placeholder="e.g., IT, Banking, Healthcare"
                      className="text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Categories page will group cards using this heading.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50/40 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={Boolean(categoryData.is_top_certification)}
                        onChange={(e) =>
                          setCategoryData({
                            ...categoryData,
                            is_top_certification: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300 accent-indigo-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Show in Top Certification Categories
                        </p>
                        <p className="text-xs text-gray-600">
                          If checked, this category appears in the Top Certification Categories
                          section above IT categories.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea 
                      value={categoryData.description} 
                      onChange={(e) =>
                        setCategoryData({
                          ...categoryData,
                          description: clampCategoryDescription(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      rows={4}
                      placeholder="Describe what this category includes..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Brief description of the category ({countWords(categoryData.description)}/{DESCRIPTION_WORD_LIMIT} words)
                    </p>
              </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Content
                    </label>
                    <TipTapEditor
                      value={categoryData.content}
                      onChange={(html) => setCategoryData({ ...categoryData, content: html })}
                      placeholder="Detailed content shown on the category page under exam cards..."
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional. If left empty, no extra content will be shown on the category page.
                    </p>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        FAQ Section
                      </label>
                      <Button
                        type="button"
                        onClick={() =>
                          setCategoryData({
                            ...categoryData,
                            faqs: [...(categoryData.faqs || []), { ...EMPTY_FAQ }],
                          })
                        }
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-sm"
                      >
                        <FiPlus className="w-4 h-4 mr-1" /> Add FAQ
                      </Button>
                    </div>
                    {(categoryData.faqs || []).length === 0 ? (
                      <p className="text-xs text-gray-500">
                        Optional. Add FAQs to show them on the category page.
                      </p>
                    ) : null}
                    {(categoryData.faqs || []).map((faq, index) => (
                      <div key={`faq-${index}`} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Question {index + 1}
                          </label>
                          <Input
                            value={faq.question || ""}
                            onChange={(e) => {
                              const updatedFaqs = [...(categoryData.faqs || [])];
                              updatedFaqs[index] = { ...updatedFaqs[index], question: e.target.value };
                              setCategoryData({ ...categoryData, faqs: updatedFaqs });
                            }}
                            placeholder="Enter FAQ question"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Answer {index + 1}
                          </label>
                          <textarea
                            value={faq.answer || ""}
                            onChange={(e) => {
                              const updatedFaqs = [...(categoryData.faqs || [])];
                              updatedFaqs[index] = { ...updatedFaqs[index], answer: e.target.value };
                              setCategoryData({ ...categoryData, faqs: updatedFaqs });
                            }}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            rows={3}
                            placeholder="Enter FAQ answer"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            onClick={() => {
                              const updatedFaqs = (categoryData.faqs || []).filter((_, i) => i !== index);
                              setCategoryData({ ...categoryData, faqs: updatedFaqs });
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-sm"
                          >
                            <FiTrash2 className="w-4 h-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

              <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Icon
                    </label>
                    <select 
                      value={categoryData.icon} 
                      onChange={(e) => setCategoryData({ ...categoryData, icon: e.target.value })} 
                      className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                    >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                    <p className="text-xs text-gray-500 mt-1">Visual icon for the category</p>
                  </div>
                </div>
              </div>
              )}

              {modalTab === "seo" && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 pb-2 border-b-2 border-indigo-100">
                  🔍 SEO Meta Tags
                </h4>
                <p className="text-sm text-gray-600">Optimize for search engines and social media</p>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <Input 
                      value={categoryData.meta_title} 
                      onChange={(e) => setCategoryData({ ...categoryData, meta_title: e.target.value })} 
                      placeholder="Category Name - Best Practice Tests | AllExamQuestions"
                      className="text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta Keywords
                    </label>
                    <Input 
                      value={categoryData.meta_keywords} 
                      onChange={(e) => setCategoryData({ ...categoryData, meta_keywords: e.target.value })} 
                      placeholder="cloud, certification, aws, azure, practice tests"
                      className="text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea 
                      value={categoryData.meta_description} 
                      onChange={(e) => setCategoryData({ ...categoryData, meta_description: e.target.value })} 
                      className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      rows={3}
                      placeholder="Concise description for search results (150-160 characters)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {categoryData.meta_description.length}/160 characters recommended
                    </p>
                  </div>
                </div>
              </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                <Button 
                  onClick={handleSaveCategory} 
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 text-base shadow-lg hover:shadow-xl transition"
                >
                  {editMode ? "✓ Update Category" : "+ Add Category"}
                </Button>
                <Button 
                  onClick={() => { setShowModal(false); setEditMode(false); setModalTab("details"); }} 
                  className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 text-base transition"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="border-b border-gray-200 px-5 py-4">
              <h4 className="text-lg font-bold text-[#0C1A35]">Confirm Delete</h4>
              <p className="mt-1 text-sm text-gray-600">
                {deleteConfirm.type === "bulk"
                  ? `Are you sure you want to delete ${selectedSlugs.length} selected categories?`
                  : "Are you sure you want to delete this category?"}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4">
              <Button
                onClick={closeDeleteConfirmation}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteAction}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
