"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Plus,
  Save,
  Trash2,
  SearchIcon,
  X,
  Edit,
} from "lucide-react";

import { checkAuth, getAuthHeaders } from "@/utils/authCheck";

import TipTapEditor from "@/components/editor/TipTapEditor";

import { hasOfficialDetailsData } from "@/components/exam/OfficialExamDetailsView";
import { isOfficialDetailsOnlyCourse } from "@/lib/examListingFilters";
import {
  getPublicPageUrlFromSlug,
  resolveCourseCodeForSave,
} from "@/utils/practiceTestRouting";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const trimPageUrlSlug = (value = "") =>
  String(value ?? "")
    .trim()
    .replace(/^\/+|\/+$/g, "");

const getPublicPageUrlPreview = ({ pageUrlSlug, selectedCourse }) =>
  getPublicPageUrlFromSlug(
    pageUrlSlug || selectedCourse?.official_details_url_slug || ""
  );
const mergeCourseData = (listRow = {}, detailRow = {}) => {
  const merged = { ...listRow };
  for (const [key, value] of Object.entries(detailRow || {})) {
    if (value === null || value === undefined) continue;
    if (
      typeof value === "string" &&
      value.trim() === "" &&
      typeof merged[key] === "string" &&
      merged[key].trim() !== ""
    ) {
      continue;
    }
    if (
      Array.isArray(value) &&
      value.length === 0 &&
      Array.isArray(merged[key]) &&
      merged[key].length > 0
    ) {
      continue;
    }
    merged[key] = value;
  }
  return merged;
};

const buildOfficialDetailsPayload = ({
  officialDetailsContent,
  officialDetailsMetaTitle,
  officialDetailsPageTitle,
  officialDetailsMetaKeywords,
  officialDetailsMetaDescription,
  officialDetailsUrlSlug,
  officialDetailsStatExamCode,
  officialDetailsStatDuration,
  officialDetailsStatTotalQuestions,
  officialDetailsStatCost,
  officialDetailsStatCertificationBody,
  officialDetailsStatValidity,
  officialDetailsFaqs,
}) => ({
  official_details_content: officialDetailsContent || "",
  official_details_meta_title: officialDetailsMetaTitle || "",
  official_details_page_title: officialDetailsPageTitle || "",
  official_details_meta_keywords: officialDetailsMetaKeywords || "",
  official_details_meta_description: officialDetailsMetaDescription || "",
  official_details_url_slug:
    trimPageUrlSlug(officialDetailsUrlSlug) || "official-details",
  official_details_stat_exam_code: officialDetailsStatExamCode?.trim() || "",
  official_details_stat_duration: officialDetailsStatDuration?.trim() || "",
  official_details_stat_total_questions:
    officialDetailsStatTotalQuestions?.trim() || "",
  official_details_stat_cost: officialDetailsStatCost?.trim() || "",
  official_details_stat_certification_body:
    officialDetailsStatCertificationBody?.trim() || "",
  official_details_stat_validity: officialDetailsStatValidity?.trim() || "",
  official_details_faqs: officialDetailsFaqs
    .filter((f) => f.question.trim() !== "")
    .map((f) => ({
      question: f.question.trim(),
      answer: f.answer || "",
    })),
});

/** Clears all official-details fields on the server (no default url slug). */
const EMPTY_OFFICIAL_DETAILS_PAYLOAD = {
  official_details_content: "",
  official_details_meta_title: "",
  official_details_page_title: "",
  official_details_meta_keywords: "",
  official_details_meta_description: "",
  official_details_url_slug: "",
  official_details_stat_exam_code: "",
  official_details_stat_duration: "",
  official_details_stat_total_questions: "",
  official_details_stat_cost: "",
  official_details_stat_certification_body: "",
  official_details_stat_validity: "",
  official_details_faqs: [],
};

const newFaqItem = () => ({
  id: `faq-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`,
  question: "",
  answer: "",
});

const mapFaqsFromCourse = (faqs) => {
  if (!faqs || faqs.length === 0) return [];

  return faqs.map((f, i) => ({
    id:
      f.id ||
      `faq-loaded-${i}-${f.question?.slice(0, 8) || "item"}`,
    question: f.question || "",
    answer: f.answer || "",
  }));
};

export default function OfficialDetailsManager() {
  const router = useRouter();

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showOfficialModal, setShowOfficialModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [editHydrating, setEditHydrating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [coursePendingDelete, setCoursePendingDelete] = useState(null);
  const [deletingOfficial, setDeletingOfficial] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [listSearchQuery, setListSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] =
    useState(false);
  const [provider, setProvider] = useState("");
  const [providers, setProviders] = useState([]);

  const [officialDetailsContent, setOfficialDetailsContent] =
    useState("");

  const [officialDetailsMetaTitle, setOfficialDetailsMetaTitle] =
    useState("");

  const [officialDetailsPageTitle, setOfficialDetailsPageTitle] =
    useState("");

  const [
    officialDetailsMetaKeywords,
    setOfficialDetailsMetaKeywords,
  ] = useState("");

  const [
    officialDetailsMetaDescription,
    setOfficialDetailsMetaDescription,
  ] = useState("");

  const [officialDetailsUrlSlug, setOfficialDetailsUrlSlug] =
    useState("");

  const [
    officialDetailsStatExamCode,
    setOfficialDetailsStatExamCode,
  ] = useState("");

  const [
    officialDetailsStatDuration,
    setOfficialDetailsStatDuration,
  ] = useState("");

  const [
    officialDetailsStatTotalQuestions,
    setOfficialDetailsStatTotalQuestions,
  ] = useState("");

  const [
    officialDetailsStatCost,
    setOfficialDetailsStatCost,
  ] = useState("");

  const [
    officialDetailsStatCertificationBody,
    setOfficialDetailsStatCertificationBody,
  ] = useState("");

  const [
    officialDetailsStatValidity,
    setOfficialDetailsStatValidity,
  ] = useState("");

  const [officialDetailsFaqs, setOfficialDetailsFaqs] =
    useState([]);

  const [pageUrlSlug, setPageUrlSlug] = useState("");
  const [examName, setExamName] = useState("");
  const [examCode, setExamCode] = useState("");

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return [];

    return courses.filter((course) => {
      const examNameLabel = String(
        course.exam_name || course.title || ""
      ).toLowerCase();
      const code = String(course.code || "").toLowerCase();
      const provider = String(course.provider || "").toLowerCase();
      const slug = String(course.slug || "").toLowerCase();

      return (
        examNameLabel.includes(q) ||
        code.includes(q) ||
        provider.includes(q) ||
        slug.includes(q)
      );
    });
  }, [courses, searchQuery]);

  const filteredCourses = useMemo(() => {
    const q = listSearchQuery.trim().toLowerCase();
    if (!q) return courses;

    return courses.filter((course) => {
      const examNameLabel = String(
        course.exam_name || course.title || ""
      ).toLowerCase();
      const code = String(course.code || "").toLowerCase();
      const provider = String(course.provider || "").toLowerCase();
      const slug = String(course.slug || "").toLowerCase();
      const urlSlug = String(
        course.official_details_url_slug || "official-details"
      ).toLowerCase();

      return (
        examNameLabel.includes(q) ||
        code.includes(q) ||
        provider.includes(q) ||
        slug.includes(q) ||
        urlSlug.includes(q)
      );
    });
  }, [courses, listSearchQuery]);

  const handleCloseModal = () => {
    setShowOfficialModal(false);
    setModalMode("add");
    handleClearSelection();
  };

  const handleAddOfficialDetails = () => {
    handleClearSelection();
    setModalMode("add");
    setShowOfficialModal(true);
  };

  const handleEditFromTable = async (course) => {
    setModalMode("edit");
    setEditHydrating(true);
    setSelectedCourse(course);
    loadOfficialDetails(course);
    setShowOfficialModal(true);

    const fullCourse = await fetchCourseFullDetails(course);
    if (fullCourse) {
      const merged = mergeCourseData(course, fullCourse);
      setSelectedCourse(merged);
      loadOfficialDetails(merged);
    }
    setEditHydrating(false);
  };

  const openSelectCourseInModal = async (course) => {
    setShowSearchDropdown(false);
    setSearchQuery(course.title || "");
    setSelectedCourse(course);
    loadOfficialDetails(course);

    const fullCourse = await fetchCourseFullDetails(course);
    if (fullCourse) {
      const merged = { ...course, ...fullCourse };
      setSelectedCourse(merged);
      setSearchQuery(merged.title || course.title || "");
      // keep same rule again after merge
      setExamName(merged?.exam_name || "");
      setProvider(merged?.provider || "");
      loadOfficialDetails(merged);
    }
  };

  const loadOfficialDetails = (course) => {
    setPageUrlSlug(
      course?.official_details_url_slug != null
        ? String(course.official_details_url_slug)
        : ""
    );
    setExamName(course?.exam_name || course?.title || "");
    setExamCode(course?.code != null ? String(course.code) : "");
    setProvider(course?.provider || "");
    setOfficialDetailsContent(
      course.official_details_content || ""
    );

    setOfficialDetailsMetaTitle(
      course.official_details_meta_title || ""
    );

    setOfficialDetailsPageTitle(
      course.official_details_page_title || ""
    );

    setOfficialDetailsMetaKeywords(
      course.official_details_meta_keywords || ""
    );

    setOfficialDetailsMetaDescription(
      course.official_details_meta_description || ""
    );

    setOfficialDetailsUrlSlug(course.official_details_url_slug || "");

    setOfficialDetailsStatExamCode(
      course.official_details_stat_exam_code || ""
    );

    setOfficialDetailsStatDuration(
      course.official_details_stat_duration || ""
    );

    setOfficialDetailsStatTotalQuestions(
      course.official_details_stat_total_questions || ""
    );

    setOfficialDetailsStatCost(
      course.official_details_stat_cost || ""
    );

    setOfficialDetailsStatCertificationBody(
      course.official_details_stat_certification_body || ""
    );

    setOfficialDetailsStatValidity(
      course.official_details_stat_validity || ""
    );

    setOfficialDetailsFaqs(
      mapFaqsFromCourse(course.official_details_faqs)
    );
  };
  const isOfficialCourse = (course) =>
    course?.show_in_official_details === true ||
    course?.show_in_official_details === "true";

  const fetchCourseFullDetails = async (courseOrId) => {
    const course =
      courseOrId && typeof courseOrId === "object"
        ? courseOrId
        : { id: courseOrId };

    const courseId = course?.id;

    const providerPart =
      course?.provider_slug ||
      course?.providerSlug ||
      course?.provider_code ||
      course?.providerCode ||
      course?.provider?.slug ||
      course?.provider;

    const codePart =
      course?.code ||
      course?.exam_code ||
      course?.examCode;

    const examSlug =
      course?.exam_slug ||
      course?.examSlug ||
      course?.slug ||
      (providerPart && codePart
        ? `${String(providerPart).toLowerCase()}-${String(
            codePart
          )
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")}`
        : null);

    const candidateUrls = [
      `${API_BASE_URL}/api/courses/admin/${courseId}/`,
      `${API_BASE_URL}/api/courses/admin/${courseId}/detail/`,
      ...(examSlug
        ? [`${API_BASE_URL}/api/courses/exams/${examSlug}/`]
        : []),
    ];

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          headers: getAuthHeaders(),
        });

        if (!res.ok) continue;

        const data = await res.json();

        if (
          data?.success &&
          data?.data &&
          typeof data.data === "object"
        ) {
          return data.data;
        }

        if (
          data &&
          typeof data === "object" &&
          (data.id || data.code || data.title)
        ) {
          return data;
        }
      } catch {
        // try next
      }
    }

    return null;
  };

  const handleSelectCourse = async (course) => {
    setShowSearchDropdown(false);

    setSearchQuery(course.title || "");

    setSelectedCourse(course);

    loadOfficialDetails(course);

    const fullCourse = await fetchCourseFullDetails(course);

    if (fullCourse) {
      const merged = mergeCourseData(course, fullCourse);

      setSelectedCourse(merged);

      setSearchQuery(merged.title || course.title || "");

      loadOfficialDetails(merged);
    }
  };

  const handleClearSelection = () => {
    setSelectedCourse(null);

    setSearchQuery("");

    setShowSearchDropdown(false);

    setOfficialDetailsContent("");

    setOfficialDetailsMetaTitle("");

    setOfficialDetailsPageTitle("");

    setOfficialDetailsMetaKeywords("");

    setOfficialDetailsMetaDescription("");

    setOfficialDetailsUrlSlug("");

    setOfficialDetailsStatExamCode("");
    setOfficialDetailsStatDuration("");
    setOfficialDetailsStatTotalQuestions("");
    setOfficialDetailsStatCost("");
    setOfficialDetailsStatCertificationBody("");

    setOfficialDetailsStatValidity("");

    setOfficialDetailsFaqs([]);
    setPageUrlSlug("");
    setExamName("");
    setExamCode("");
    setProvider("");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearchQuery(value);

    if (
      selectedCourse &&
      value !== selectedCourse.title
    ) {
      setSelectedCourse(null);

      setOfficialDetailsContent("");

      setOfficialDetailsMetaTitle("");

      setOfficialDetailsPageTitle("");

      setOfficialDetailsMetaKeywords("");

      setOfficialDetailsMetaDescription("");

      setOfficialDetailsUrlSlug("");
      setOfficialDetailsStatExamCode("");
      setOfficialDetailsStatDuration("");
      setOfficialDetailsStatTotalQuestions("");
      setOfficialDetailsStatCost("");
      setOfficialDetailsStatCertificationBody("");

      setOfficialDetailsFaqs([]);
    }

    setShowSearchDropdown(value.trim().length > 0);
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/courses/admin/list/`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (res.status === 401) {
        setMessage(
          "❌ Authentication failed. Please log in again."
        );

        setTimeout(() => router.push("/admin/auth"), 2000);

        return;
      }

      const data = await res.json();

      if (data.success) {
        const officialDetailsCourses = (data.data || []).filter(
          isOfficialCourse
        );
      
        setCourses(officialDetailsCourses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);

      setMessage("❌ Error loading courses.");
    } finally {
      setCoursesLoading(false);
    }
  };
  const fetchProviders = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/providers/`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await res.json();

      if (data.success) {
        setProviders(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching providers", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!checkAuth()) {
        setMessage("❌ Authentication failed. Please log in as admin.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }
  
      await Promise.all([fetchCourses(), fetchProviders()]);
    };
  
    init();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const addOfficialFaq = () => {
    setOfficialDetailsFaqs((prev) => [
      ...prev,
      newFaqItem(),
    ]);
  };

  const removeOfficialFaq = (id) => {
    setOfficialDetailsFaqs((prev) =>
      prev.filter((faq) => faq.id !== id)
    );
  };

  const updateOfficialFaq = (id, field, value) => {
    setOfficialDetailsFaqs((prev) =>
      prev.map((faq) =>
        faq.id === id
          ? {
              ...faq,
              [field]: value,
            }
          : faq
      )
    );
  };

  const handleSave = async () => {
    if (!checkAuth()) {
      setMessage("❌ Please log in again.");
      setTimeout(() => router.push("/admin/auth"), 2000);
      return;
    }

    if (modalMode === "add" && !examName.trim()) {
      setMessage("❌ Exam Name is required");
      return;
    }
    
    if (modalMode === "add" && !pageUrlSlug.trim()) {
      setMessage("❌ Page URL slug is required");
      return;
    }

    if (modalMode === "edit" && !selectedCourse) {
      setMessage("❌ Exam not loaded");
      return;
    }

    if (!trimPageUrlSlug(pageUrlSlug)) {
      setMessage("❌ Page URL slug is required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = buildOfficialDetailsPayload({
        officialDetailsContent,
        officialDetailsMetaTitle,
        officialDetailsPageTitle,
        officialDetailsMetaKeywords,
        officialDetailsMetaDescription,
        officialDetailsUrlSlug: pageUrlSlug,
        officialDetailsStatExamCode,
        officialDetailsStatDuration,
        officialDetailsStatTotalQuestions,
        officialDetailsStatCost,
        officialDetailsStatCertificationBody,
        officialDetailsStatValidity,
        officialDetailsFaqs,
      });

      let courseId = selectedCourse?.id;
      let courseRecord = selectedCourse;

      if (modalMode === "add" && !selectedCourse) {
        const slug = trimPageUrlSlug(pageUrlSlug);
        if (!slug) {
          setMessage("❌ Enter a valid page URL slug");
          setLoading(false);
          return;
        }

        const title =
          officialDetailsPageTitle.trim() ||
          officialDetailsMetaTitle.trim() ||
          examName.trim() ||
          slug;

        const createRes = await fetch(
          `${API_BASE_URL}/api/courses/admin/create/`,
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              exam_name: examName.trim() || null,
              slug,
              code: resolveCourseCodeForSave(examCode, slug),
              provider: provider || null,
              actual_price: 0,
              offer_price: 0,
              show_in_official_details: true,
            }),
          }
        );

        if (createRes.status === 401) {
          setMessage("❌ Authentication failed. Please log in again.");
          setTimeout(() => router.push("/admin/auth"), 2000);
          return;
        }

        const createData = await createRes.json();
        if (!createRes.ok || !createData.success) {
          throw new Error(
            createData.error ||
              createData.message ||
              "Failed to create official details page"
          );
        }

        courseRecord = createData.data || createData.course;
        courseId = courseRecord?.id;
        if (!courseId) {
          throw new Error("Created page did not return an ID");
        }
      }

      const savedSlug = trimPageUrlSlug(pageUrlSlug);
      const savedCode = resolveCourseCodeForSave(
        examCode,
        savedSlug,
        courseRecord?.code || selectedCourse?.code
      );

      const res = await fetch(
        `${API_BASE_URL}/api/courses/admin/${courseId}/update/`,
        {
          method: "PUT",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            ...(modalMode === "edit" || selectedCourse
              ? {
                  exam_name: examName.trim() || null,
                  code: savedCode,
                  provider: provider || null,
                  show_in_official_details: true,
                }
              : {
                  code: savedCode,
                }),
          }),
        }
      );

      if (res.status === 401) {
        setMessage(
          "❌ Authentication failed. Please log in again."
        );

        setTimeout(() => router.push("/admin/auth"), 2000);

        return;
      }

      const data = await res.json();

      if (data.success) {
        setMessage(
          "✅ Official details saved successfully!"
        );

        setTimeout(() => setMessage(""), 3000);
        setShowOfficialModal(false);
        setModalMode("add");
        setSelectedCourse(null);
        setSearchQuery("");
        setListSearchQuery("");
        setExamName("");
        setShowSearchDropdown(false);
        setPageUrlSlug("");
        setExamCode("");
        setProvider("");

        const returnedCourse =
          (data?.data &&
            typeof data.data === "object" &&
            data.data) ||
          (data?.course &&
            typeof data.course === "object" &&
            data.course) ||
          null;

        if (returnedCourse) {
          const priorSlug = (courseRecord || selectedCourse)?.slug;
          const merged = {
            ...(courseRecord || selectedCourse || {}),
            ...returnedCourse,
            show_in_official_details: true,
          };
          // Official URL edits must never change the exam-details landing slug.
          if (priorSlug != null && String(priorSlug).trim() !== "") {
            merged.slug = priorSlug;
          }

          setCourses((prev) => {
            const updatedList = prev.some((c) => c.id === merged.id)
              ? prev.map((c) =>
                  c.id === merged.id ? { ...c, ...merged } : c
                )
              : [...prev, merged];

            return updatedList.filter(isOfficialCourse);
          });
        }

        // try {
        //   const coursesRes = await fetch(
        //     `${API_BASE_URL}/api/courses/admin/list/`,
        //     {
        //       headers: getAuthHeaders(),
        //     }
        //   );

        //   const coursesData = await coursesRes.json();

        //   if (
        //     coursesData.success &&
        //     coursesData.data
        //   ) {
        //     const officialDetailsCourses = coursesData.data.filter(
        //       (course) => course.show_in_official_details === true
        //     );
            
        //     setCourses(officialDetailsCourses);
        //   }
        // } catch {
        //   // non-fatal
        // }
      } else {
        setMessage(
          "❌ Error: " +
            (data.error ||
              "Failed to save official details")
        );
      }
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteOfficialDialog = (course) => {
    setCoursePendingDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteOfficialDetails = async () => {
    const course = coursePendingDelete;
    const courseId = course?.id || course?._id;
    if (!courseId) {
      setMessage("❌ Could not delete: missing course id.");
      setDeleteDialogOpen(false);
      setCoursePendingDelete(null);
      return;
    }

    if (!hasOfficialDetailsData(course)) {
      setMessage("ℹ️ This exam has no official details to delete.");
      setDeleteDialogOpen(false);
      setCoursePendingDelete(null);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (!checkAuth()) {
      setMessage("❌ Please log in again.");
      setDeleteDialogOpen(false);
      setCoursePendingDelete(null);
      setTimeout(() => router.push("/admin/auth"), 2000);
      return;
    }

    setDeletingOfficial(true);
    setMessage("");

    try {
      const removeEntirePage = isOfficialDetailsOnlyCourse(course);

      if (removeEntirePage) {
        const res = await fetch(
          `${API_BASE_URL}/api/courses/admin/${courseId}/delete/`,
          {
            method: "DELETE",
            headers: getAuthHeaders(),
          }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          throw new Error(data.error || "Failed to delete official details page");
        }
        setCourses((prev) =>
          prev.filter((item) => String(item.id || item._id) !== String(courseId))
        );
      } else {
        const res = await fetch(
          `${API_BASE_URL}/api/courses/admin/${courseId}/update/`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...EMPTY_OFFICIAL_DETAILS_PAYLOAD,
              show_in_official_details: false,
              clear_official_details: true,
            }),
          }
        );

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to delete official details");
        }
        await fetchCourses();
      }

      if (
        selectedCourse &&
        String(selectedCourse.id || selectedCourse._id) === String(courseId)
      ) {
        handleCloseModal();
      }

      setMessage(
        removeEntirePage
          ? "✅ Official details page deleted successfully!"
          : "✅ Official details deleted successfully!"
      );
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setDeletingOfficial(false);
      setDeleteDialogOpen(false);
      setCoursePendingDelete(null);
    }
  };

  const showDropdown =
    showSearchDropdown &&
    searchQuery.trim().length > 0 &&
    !selectedCourse;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0C1A35] mb-2">
            Official Details Manager
          </h1>

          <p className="text-[#0C1A35]/60">
            Content, FAQs, and SEO for each
            exam&apos;s public official details
            page.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleAddOfficialDetails}
          className="bg-[#1A73E8] hover:bg-[#1557B0] shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Official Details
        </Button>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.includes("❌")
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <Card className="mb-6 border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-[#0C1A35]">
            All Official Details Pages
          </CardTitle>
          <div className="relative mt-3">
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0C1A35]/40"
              aria-hidden
            />
            <Input
              value={listSearchQuery}
              onChange={(e) => setListSearchQuery(e.target.value)}
              placeholder="Search by exam name, code, provider, slug, or URL slug..."
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Name</TableHead>
                <TableHead>Exam Code</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>URL Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coursesLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-[#0C1A35]/60 py-8"
                  >
                    Loading official details pages...
                  </TableCell>
                </TableRow>
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-[#0C1A35]/60 py-8"
                  >
                    No exams found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium text-[#0C1A35]">
                      {course.exam_name || course.title || "-"}
                    </TableCell>
                    <TableCell>{course.code || "-"}</TableCell>
                    <TableCell>{course.provider || "-"}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                        {getPublicPageUrlPreview({
                          pageUrlSlug:
                            course.official_details_url_slug || "",
                          selectedCourse: course,
                        })}
                      </code>
                    </TableCell>
                      <TableCell>
                        {hasOfficialDetailsData(course) ? (
                          <Badge className="bg-green-100 text-green-700 border-0">
                            Has Data
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Empty</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2 justify-end">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEditFromTable(course)}
                            title="Edit official details"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => openDeleteOfficialDialog(course)}
                            title="Delete official details page"
                            disabled={loading || deletingOfficial}
                          >
                            <Trash2 className="w-4 h-4" />
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

        <Dialog
          open={showOfficialModal}
          onOpenChange={(open) => {
            if (!open) handleCloseModal();
            else setShowOfficialModal(true);
          }}
        >
          <DialogContent className="!w-[96vw] !max-w-[1200px] max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#0C1A35]">
                {modalMode === "add"
                  ? "Add Official Details"
                  : selectedCourse
                    ? `Edit Official Details: ${selectedCourse.title}`
                    : "Edit Official Details"}
              </DialogTitle>
              {selectedCourse && (
                <p className="text-sm text-[#0C1A35]/60">
                  {selectedCourse.code}
                  {selectedCourse.provider
                    ? ` · ${selectedCourse.provider}`
                    : ""}
                </p>
              )}
            </DialogHeader>

            <div className="space-y-6">
              {modalMode === "edit" && editHydrating ? (
                <p className="text-[#0C1A35]/60 text-center py-8">
                  Loading exam details...
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="exam-name">
                        Exam Name {modalMode === "add" ? "*" : ""}
                      </Label>
                      <Input
                        id="exam-name"
                        value={examName}
                        onChange={(e) => setExamName(e.target.value)}
                        placeholder="AWS Certified Solutions Architect Associate"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="exam-code">Exam Code (Optional)</Label>
                      <Input
                        id="exam-code"
                        value={examCode}
                        onChange={(e) => setExamCode(e.target.value)}
                        placeholder="e.g. AZ-900, SAA-C03 (uses URL slug if empty)"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="page-url-slug">Page URL Slug *</Label>
                      <Input
                        id="page-url-slug"
                        value={pageUrlSlug}
                        onChange={(e) => {
                          setPageUrlSlug(e.target.value);
                          setOfficialDetailsUrlSlug(e.target.value);
                        }}
                        placeholder="Enter the exact public URL path"
                        className="mt-1"
                      />
                      <p className="text-xs text-[#0C1A35]/50 mt-1">
                        Enter the exact URL path as it should appear on the website.
                      </p>
                      <p className="text-xs text-[#1A73E8] mt-2 font-medium">
                        Live URL:{" "}
                        <code className="bg-blue-50 px-1.5 py-0.5 rounded text-[#0C1A35]">
                          {getPublicPageUrlPreview({
                            pageUrlSlug,
                            selectedCourse,
                          })}
                        </code>
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="provider">Provider (Optional)</Label>
                      <Input
                        id="provider"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        placeholder="e.g. AWS, Microsoft, Google"
                        className="mt-1"
                      />
                    </div>
                  </div>
                <div>
                  <Label>Page Title</Label>

                  <p className="text-xs text-[#0C1A35]/50 mb-2">
                    Shown as the page heading (H1) on the official details page.
                  </p>

                  <Input
                    value={officialDetailsPageTitle}
                    onChange={(e) =>
                      setOfficialDetailsPageTitle(e.target.value)
                    }
                    placeholder="Official Exam Details"
                    className="mt-1"
                  />
                </div>

                {/* <div>
                  <Label>URL Slug</Label>

                  <p className="text-xs text-[#0C1A35]/50 mb-2">
                    Path segment after the exam slug.
                    Leave empty for default{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      official-details
                    </code>
                    .
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-[#0C1A35]/60 shrink-0">
                      /
                      {modalMode === "add"
                        ? slugifyPagePath(pageUrlSlug) || "your-page-slug"
                        : selectedCourse?.slug || "exam-slug"}
                      /
                    </span>

                    <Input
                      value={officialDetailsUrlSlug}
                      onChange={(e) =>
                        setOfficialDetailsUrlSlug(
                          e.target.value
                        )
                      }
                      placeholder="official-details"
                      className="flex-1 min-w-[12rem]"
                    />
                  </div>

                  <p className="text-xs text-[#1A73E8] mt-2 font-medium">
                    Live URL:{" "}
                    <code className="bg-blue-50 px-1.5 py-0.5 rounded text-[#0C1A35]">
                      {getOfficialExamInfoPathFromExam(
                        modalMode === "add"
                          ? {
                              title:
                                examName.trim() ||
                                officialDetailsPageTitle.trim() ||
                                slugifyPagePath(pageUrlSlug),
                              code:
                                officialDetailsStatExamCode.trim() ||
                                slugifyPagePath(pageUrlSlug),
                            }
                          : {
                              title: selectedCourse?.title || "",
                              code: selectedCourse?.code || "",
                              slug: selectedCourse?.slug || "",
                            }
                      )}
                    </code>
                  </p>
                </div> */}

                <div className="space-y-4 pt-2 border-t">
                  <h4 className="font-semibold text-[#0C1A35]">
                    Official Details Table (Shown Only If You Fill)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Exam code (table)</Label>
                      <Input
                        value={officialDetailsStatExamCode}
                        onChange={(e) =>
                          setOfficialDetailsStatExamCode(e.target.value)
                        }
                        placeholder="AZ-900"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Duration (table)</Label>
                      <Input
                        value={officialDetailsStatDuration}
                        onChange={(e) =>
                          setOfficialDetailsStatDuration(e.target.value)
                        }
                        placeholder="60 minutes"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Number of questions (table)</Label>
                      <Input
                        value={officialDetailsStatTotalQuestions}
                        onChange={(e) =>
                          setOfficialDetailsStatTotalQuestions(e.target.value)
                        }
                        placeholder="30–40 questions"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Cost (table)</Label>
                      <Input
                        value={officialDetailsStatCost}
                        onChange={(e) =>
                          setOfficialDetailsStatCost(e.target.value)
                        }
                        placeholder="$99 (₹8,000–₹9,000)"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Provider (table)</Label>
                      <Input
                        value={officialDetailsStatCertificationBody}
                        onChange={(e) =>
                          setOfficialDetailsStatCertificationBody(e.target.value)
                        }
                        placeholder="Microsoft Azure"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Certification Validity (table)</Label>
                      <Input
                        value={officialDetailsStatValidity}
                        onChange={(e) =>
                          setOfficialDetailsStatValidity(e.target.value)
                        }
                        placeholder="3 years"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-[#0C1A35]/55">
                    If you keep these empty, the table won&apos;t be shown on the
                    official details page.
                  </p>
                </div>

                <div className="space-y-4 pt-2 border-t">
                  <h4 className="font-semibold text-[#0C1A35]">
                    SEO (Official Details Page Only)
                  </h4>

                  <div>
                    <Label>Meta Title</Label>

                    <Input
                      value={officialDetailsMetaTitle}
                      onChange={(e) =>
                        setOfficialDetailsMetaTitle(
                          e.target.value
                        )
                      }
                      placeholder="Official AWS SAA-C03 Exam Information"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Meta Keywords</Label>

                    <Input
                      value={officialDetailsMetaKeywords}
                      onChange={(e) =>
                        setOfficialDetailsMetaKeywords(
                          e.target.value
                        )
                      }
                      placeholder="Comma-separated keywords"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Meta Description</Label>

                    <Textarea
                      value={
                        officialDetailsMetaDescription
                      }
                      onChange={(e) =>
                        setOfficialDetailsMetaDescription(
                          e.target.value
                        )
                      }
                      placeholder="Enter meta description for the official details page"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Label>Page Content</Label>

                  <div className="mt-2">
                    <TipTapEditor
                      key={`official-content-${selectedCourse?.id || "new"}-${modalMode}-${officialDetailsContent ? "loaded" : "empty"}`}
                      content={officialDetailsContent || ""}
                      onChange={(html) =>
                        setOfficialDetailsContent(html)
                      }
                      placeholder="Official exam information from the certification body..."
                    />
                  </div>
                </div>

                <div className="pt-2 border-t space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label>
                        FAQs (Official Details Page)
                      </Label>

                      <p className="text-xs text-[#0C1A35]/50 mt-1">
                        Shown on the official details
                        page only (separate from exam
                        page FAQs).
                      </p>
                    </div>

                    <Button
                      size="sm"
                      type="button"
                      onClick={addOfficialFaq}
                      className="shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add FAQ
                    </Button>
                  </div>

                  {officialDetailsFaqs.length === 0 ? (
                    <p className="text-sm text-[#0C1A35]/50 text-center py-6 border border-dashed border-gray-200 rounded-lg">
                      No FAQs yet. Click
                      &quot;Add FAQ&quot; to create one.
                    </p>
                  ) : (
                    officialDetailsFaqs.map(
                      (faq, index) => (
                        <Card
                          key={faq.id}
                          className="p-4 border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-[#0C1A35]/50">
                              FAQ {index + 1}
                            </span>

                            <Button
                              size="sm"
                              type="button"
                              variant="destructive"
                              onClick={() =>
                                removeOfficialFaq(
                                  faq.id
                                )
                              }
                              aria-label={`Delete FAQ ${
                                index + 1
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm text-gray-600 mb-1 block">
                                Question
                              </Label>

                              <Input
                                value={faq.question}
                                onChange={(e) =>
                                  updateOfficialFaq(
                                    faq.id,
                                    "question",
                                    e.target.value
                                  )
                                }
                                placeholder="Question"
                              />
                            </div>

                            <div>
                              <Label className="text-sm text-gray-600 mb-1 block">
                                Answer
                              </Label>

                              <Textarea
                                value={faq.answer || ""}
                                onChange={(e) =>
                                  updateOfficialFaq(
                                    faq.id,
                                    "answer",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter FAQ answer"
                                rows={4}
                              />
                            </div>
                          </div>
                        </Card>
                      )
                    )
                  )}
                </div>

                <div className="pt-4 border-t flex flex-wrap gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={
                      loading ||
                      editHydrating ||
                      (modalMode === "edit" && !selectedCourse) ||
                      !pageUrlSlug.trim() ||
                      (modalMode === "add" && !examName.trim())
                    }
                    className="bg-[#1A73E8] hover:bg-[#1557B0]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save Official Details"}
                  </Button>
                </div>
              </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            if (!deletingOfficial) {
              setDeleteDialogOpen(open);
              if (!open) setCoursePendingDelete(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete official details page?</AlertDialogTitle>
              <AlertDialogDescription>
                {coursePendingDelete ? (
                  <>
                    This will permanently remove official details for{" "}
                    <strong>
                      {coursePendingDelete.title ||
                        coursePendingDelete.code ||
                        "this exam"}
                    </strong>
                    {isOfficialDetailsOnlyCourse(coursePendingDelete)
                      ? " and delete the standalone official details page."
                      : ". The exam will remain; only official details content is removed."}
                  </>
                ) : (
                  "This action cannot be undone."
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingOfficial}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={deletingOfficial}
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmDeleteOfficialDetails();
                }}
              >
                {deletingOfficial ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }




// "use client";

// import { useState, useEffect, useMemo, useRef } from "react";
// import { useRouter } from "next/navigation";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// import {
//   Plus,
//   Save,
//   Trash2,
//   SearchIcon,
//   X,
//   Edit,
// } from "lucide-react";

// import { checkAuth, getAuthHeaders } from "@/utils/authCheck";

// import TipTapEditor from "@/components/editor/TipTapEditor";

// import { normalizeOfficialDetailsUrlSlug } from "@/app/exams/[provider]/[examCode]/examInfoUtils";
// import { hasOfficialDetailsData } from "@/components/exam/OfficialExamDetailsView";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// const slugifyPagePath = (value = "") =>
//   String(value)
//     .trim()
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "");

// const buildOfficialDetailsPayload = ({
//   officialDetailsContent,
//   officialDetailsMetaTitle,
//   officialDetailsPageTitle,
//   officialDetailsMetaKeywords,
//   officialDetailsMetaDescription,
//   officialDetailsUrlSlug,
//   officialDetailsStatExamCode,
//   officialDetailsStatDuration,
//   officialDetailsStatTotalQuestions,
//   officialDetailsStatCost,
//   officialDetailsStatCertificationBody,
//   officialDetailsStatValidity,
//   officialDetailsFaqs,
// }) => ({
//   official_details_content: officialDetailsContent || "",
//   official_details_meta_title: officialDetailsMetaTitle || "",
//   official_details_page_title: officialDetailsPageTitle || "",
//   official_details_meta_keywords: officialDetailsMetaKeywords || "",
//   official_details_meta_description: officialDetailsMetaDescription || "",
//   official_details_url_slug: normalizeOfficialDetailsUrlSlug(
//     officialDetailsUrlSlug || "official-details"
//   ),
//   official_details_stat_exam_code: officialDetailsStatExamCode?.trim() || "",
//   official_details_stat_duration: officialDetailsStatDuration?.trim() || "",
//   official_details_stat_total_questions:
//     officialDetailsStatTotalQuestions?.trim() || "",
//   official_details_stat_cost: officialDetailsStatCost?.trim() || "",
//   official_details_stat_certification_body:
//     officialDetailsStatCertificationBody?.trim() || "",
//   official_details_stat_validity: officialDetailsStatValidity?.trim() || "",
//   official_details_faqs: officialDetailsFaqs
//     .filter((f) => f.question.trim() !== "")
//     .map((f) => ({
//       question: f.question.trim(),
//       answer: f.answer || "",
//     })),
// });

// /** Clears all official-details fields on the server (no default url slug). */
// const EMPTY_OFFICIAL_DETAILS_PAYLOAD = {
//   official_details_content: "",
//   official_details_meta_title: "",
//   official_details_page_title: "",
//   official_details_meta_keywords: "",
//   official_details_meta_description: "",
//   official_details_url_slug: "",
//   official_details_stat_exam_code: "",
//   official_details_stat_duration: "",
//   official_details_stat_total_questions: "",
//   official_details_stat_cost: "",
//   official_details_stat_certification_body: "",
//   official_details_stat_validity: "",
//   official_details_faqs: [],
// };

// const newFaqItem = () => ({
//   id: `faq-${Date.now()}-${Math.random()
//     .toString(36)
//     .slice(2, 9)}`,
//   question: "",
//   answer: "",
// });

// const mapFaqsFromCourse = (faqs) => {
//   if (!faqs || faqs.length === 0) return [];

//   return faqs.map((f, i) => ({
//     id:
//       f.id ||
//       `faq-loaded-${i}-${f.question?.slice(0, 8) || "item"}`,
//     question: f.question || "",
//     answer: f.answer || "",
//   }));
// };

// function isOfficialDetailsOnlyCourse(course) {
//   if (!course) return false;
//   const practiceCount = Number(course.practice_exams) || 0;
//   const listLen = Array.isArray(course.practice_tests_list)
//     ? course.practice_tests_list.length
//     : 0;
//   const hasPractice = practiceCount > 0 || listLen > 0;
//   const hasAbout = Boolean(String(course.about || "").trim());
//   const hasProvider = Boolean(String(course.provider || "").trim());
//   return !hasPractice && !hasAbout && !hasProvider;
// }

// export default function OfficialDetailsManager() {
//   const router = useRouter();

//   const searchRef = useRef(null);
//   const dropdownRef = useRef(null);

//   const [courses, setCourses] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [showOfficialModal, setShowOfficialModal] = useState(false);
//   const [modalMode, setModalMode] = useState("add");

//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [coursePendingDelete, setCoursePendingDelete] = useState(null);
//   const [deletingOfficial, setDeletingOfficial] = useState(false);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [listSearchQuery, setListSearchQuery] = useState("");
//   const [showSearchDropdown, setShowSearchDropdown] =
//     useState(false);

//   const [officialDetailsContent, setOfficialDetailsContent] =
//     useState("");

//   const [officialDetailsMetaTitle, setOfficialDetailsMetaTitle] =
//     useState("");

//   const [officialDetailsPageTitle, setOfficialDetailsPageTitle] =
//     useState("");

//   const [
//     officialDetailsMetaKeywords,
//     setOfficialDetailsMetaKeywords,
//   ] = useState("");

//   const [
//     officialDetailsMetaDescription,
//     setOfficialDetailsMetaDescription,
//   ] = useState("");

//   const [officialDetailsUrlSlug, setOfficialDetailsUrlSlug] =
//     useState("");

//   const [
//     officialDetailsStatExamCode,
//     setOfficialDetailsStatExamCode,
//   ] = useState("");

//   const [
//     officialDetailsStatDuration,
//     setOfficialDetailsStatDuration,
//   ] = useState("");

//   const [
//     officialDetailsStatTotalQuestions,
//     setOfficialDetailsStatTotalQuestions,
//   ] = useState("");

//   const [
//     officialDetailsStatCost,
//     setOfficialDetailsStatCost,
//   ] = useState("");

//   const [
//     officialDetailsStatCertificationBody,
//     setOfficialDetailsStatCertificationBody,
//   ] = useState("");

//   const [
//     officialDetailsStatValidity,
//     setOfficialDetailsStatValidity,
//   ] = useState("");

//   const [officialDetailsFaqs, setOfficialDetailsFaqs] =
//     useState([]);

//   const [pageUrlSlug, setPageUrlSlug] = useState("");
//   const [examName, setExamName] = useState("");

//   const searchResults = useMemo(() => {
//     const q = searchQuery.trim().toLowerCase();

//     if (!q) return [];

//     return courses.filter((course) => {
//       const title = String(course.title || "").toLowerCase();
//       const code = String(course.code || "").toLowerCase();
//       const provider = String(course.provider || "").toLowerCase();
//       const slug = String(course.slug || "").toLowerCase();

//       return (
//         title.includes(q) ||
//         code.includes(q) ||
//         provider.includes(q) ||
//         slug.includes(q)
//       );
//     });
//   }, [courses, searchQuery]);

//   const filteredCourses = useMemo(() => {
//     const q = listSearchQuery.trim().toLowerCase();
//     if (!q) return courses;

//     return courses.filter((course) => {
//       const title = String(course.title || "").toLowerCase();
//       const code = String(course.code || "").toLowerCase();
//       const provider = String(course.provider || "").toLowerCase();
//       const slug = String(course.slug || "").toLowerCase();
//       const urlSlug = String(
//         course.official_details_url_slug || "official-details"
//       ).toLowerCase();

//       return (
//         title.includes(q) ||
//         code.includes(q) ||
//         provider.includes(q) ||
//         slug.includes(q) ||
//         urlSlug.includes(q)
//       );
//     });
//   }, [courses, listSearchQuery]);

//   const handleCloseModal = () => {
//     setShowOfficialModal(false);
//     setModalMode("add");
//     handleClearSelection();
//   };

//   const handleAddOfficialDetails = () => {
//     handleClearSelection();
//     setModalMode("add");
//     setShowOfficialModal(true);
//   };

//   const handleEditFromTable = async (course) => {
//     setModalMode("edit");
//     setShowOfficialModal(true);
//     await handleSelectCourse(course);
//   };

//   const openSelectCourseInModal = async (course) => {
//     setShowSearchDropdown(false);
//     setSearchQuery(course.title || "");
//     setSelectedCourse(course);
//     loadOfficialDetails(course);

//     const fullCourse = await fetchCourseFullDetails(course);
//     if (fullCourse) {
//       const merged = { ...course, ...fullCourse };
//       setSelectedCourse(merged);
//       setSearchQuery(merged.title || course.title || "");
//       loadOfficialDetails(merged);
//     }
//   };

//   const loadOfficialDetails = (course) => {
//     setPageUrlSlug(course?.slug || "");
//     setOfficialDetailsContent(
//       course.official_details_content || ""
//     );

//     setOfficialDetailsMetaTitle(
//       course.official_details_meta_title || ""
//     );

//     setOfficialDetailsPageTitle(
//       course.official_details_page_title || ""
//     );

//     setOfficialDetailsMetaKeywords(
//       course.official_details_meta_keywords || ""
//     );

//     setOfficialDetailsMetaDescription(
//       course.official_details_meta_description || ""
//     );

//     setOfficialDetailsUrlSlug(
//       course.official_details_url_slug || ""
//     );

//     setOfficialDetailsStatExamCode(
//       course.official_details_stat_exam_code || ""
//     );

//     setOfficialDetailsStatDuration(
//       course.official_details_stat_duration || ""
//     );

//     setOfficialDetailsStatTotalQuestions(
//       course.official_details_stat_total_questions || ""
//     );

//     setOfficialDetailsStatCost(
//       course.official_details_stat_cost || ""
//     );

//     setOfficialDetailsStatCertificationBody(
//       course.official_details_stat_certification_body || ""
//     );

//     setOfficialDetailsStatValidity(
//       course.official_details_stat_validity || ""
//     );

//     setOfficialDetailsFaqs(
//       mapFaqsFromCourse(course.official_details_faqs)
//     );
//   };

//   const fetchCourseFullDetails = async (courseOrId) => {
//     const course =
//       courseOrId && typeof courseOrId === "object"
//         ? courseOrId
//         : { id: courseOrId };

//     const courseId = course?.id;

//     const providerPart =
//       course?.provider_slug ||
//       course?.providerSlug ||
//       course?.provider_code ||
//       course?.providerCode ||
//       course?.provider?.slug ||
//       course?.provider;

//     const codePart =
//       course?.code ||
//       course?.exam_code ||
//       course?.examCode;

//     const examSlug =
//       course?.exam_slug ||
//       course?.examSlug ||
//       course?.slug ||
//       (providerPart && codePart
//         ? `${String(providerPart).toLowerCase()}-${String(
//             codePart
//           )
//             .toLowerCase()
//             .replace(/\s+/g, "-")
//             .replace(/-+/g, "-")}`
//         : null);

//     const candidateUrls = [
//       `${API_BASE_URL}/api/courses/admin/${courseId}/`,
//       `${API_BASE_URL}/api/courses/admin/${courseId}/detail/`,
//       ...(examSlug
//         ? [`${API_BASE_URL}/api/courses/exams/${examSlug}/`]
//         : []),
//     ];

//     for (const url of candidateUrls) {
//       try {
//         const res = await fetch(url, {
//           headers: getAuthHeaders(),
//         });

//         if (!res.ok) continue;

//         const data = await res.json();

//         if (
//           data?.success &&
//           data?.data &&
//           typeof data.data === "object"
//         ) {
//           return data.data;
//         }

//         if (
//           data &&
//           typeof data === "object" &&
//           (data.id || data.code || data.title)
//         ) {
//           return data;
//         }
//       } catch {
//         // try next
//       }
//     }

//     return null;
//   };

//   const handleSelectCourse = async (course) => {
//     setShowSearchDropdown(false);

//     setSearchQuery(course.title || "");

//     setSelectedCourse(course);

//     loadOfficialDetails(course);

//     const fullCourse = await fetchCourseFullDetails(course);

//     if (fullCourse) {
//       const merged = {
//         ...course,
//         ...fullCourse,
//       };

//       setSelectedCourse(merged);

//       setSearchQuery(merged.title || course.title || "");

//       loadOfficialDetails(merged);
//     }
//   };

//   const handleClearSelection = () => {
//     setSelectedCourse(null);

//     setSearchQuery("");

//     setShowSearchDropdown(false);

//     setOfficialDetailsContent("");

//     setOfficialDetailsMetaTitle("");

//     setOfficialDetailsPageTitle("");

//     setOfficialDetailsMetaKeywords("");

//     setOfficialDetailsMetaDescription("");

//     setOfficialDetailsUrlSlug("");

//     setOfficialDetailsStatExamCode("");
//     setOfficialDetailsStatDuration("");
//     setOfficialDetailsStatTotalQuestions("");
//     setOfficialDetailsStatCost("");
//     setOfficialDetailsStatCertificationBody("");

//     setOfficialDetailsStatValidity("");

//     setOfficialDetailsFaqs([]);
//     setPageUrlSlug("");
//   };

//   const handleSearchChange = (e) => {
//     const value = e.target.value;

//     setSearchQuery(value);

//     if (
//       selectedCourse &&
//       value !== selectedCourse.title
//     ) {
//       setSelectedCourse(null);

//       setOfficialDetailsContent("");

//       setOfficialDetailsMetaTitle("");

//       setOfficialDetailsPageTitle("");

//       setOfficialDetailsMetaKeywords("");

//       setOfficialDetailsMetaDescription("");

//       setOfficialDetailsUrlSlug("");
//       setOfficialDetailsStatExamCode("");
//       setOfficialDetailsStatDuration("");
//       setOfficialDetailsStatTotalQuestions("");
//       setOfficialDetailsStatCost("");
//       setOfficialDetailsStatCertificationBody("");

//       setOfficialDetailsFaqs([]);
//     }

//     setShowSearchDropdown(value.trim().length > 0);
//   };

//   const fetchCourses = async () => {
//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/api/courses/admin/list/`,
//         {
//           headers: getAuthHeaders(),
//         }
//       );

//       if (res.status === 401) {
//         setMessage(
//           "❌ Authentication failed. Please log in again."
//         );

//         setTimeout(() => router.push("/admin/auth"), 2000);

//         return;
//       }

//       const data = await res.json();

//       if (data.success) {
//         const officialDetailsCourses = data.data.filter((course) => {
//           return course.show_in_official_details === true;
//         });
        
//         setCourses(officialDetailsCourses);
//       }
//     } catch (error) {
//       console.error("Error fetching courses:", error);

//       setMessage("❌ Error loading courses.");
//     }
//   };

//   useEffect(() => {
//     if (!checkAuth()) {
//       setMessage(
//         "❌ Authentication failed. Please log in as admin."
//       );

//       setTimeout(() => router.push("/admin/auth"), 2000);

//       return;
//     }

//     fetchCourses();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target) &&
//         searchRef.current &&
//         !searchRef.current.contains(event.target)
//       ) {
//         setShowSearchDropdown(false);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleClickOutside
//     );

//     return () =>
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );
//   }, []);

//   const addOfficialFaq = () => {
//     setOfficialDetailsFaqs((prev) => [
//       ...prev,
//       newFaqItem(),
//     ]);
//   };

//   const removeOfficialFaq = (id) => {
//     setOfficialDetailsFaqs((prev) =>
//       prev.filter((faq) => faq.id !== id)
//     );
//   };

//   const updateOfficialFaq = (id, field, value) => {
//     setOfficialDetailsFaqs((prev) =>
//       prev.map((faq) =>
//         faq.id === id
//           ? {
//               ...faq,
//               [field]: value,
//             }
//           : faq
//       )
//     );
//   };

//   const handleSave = async () => {
//     if (!checkAuth()) {
//       setMessage("❌ Please log in again.");
//       setTimeout(() => router.push("/admin/auth"), 2000);
//       return;
//     }

//     if (modalMode === "add" && !examName.trim()) {
//       setMessage("❌ Exam Name is required");
//       return;
//     }
    
//     if (modalMode === "add" && !pageUrlSlug.trim()) {
//       setMessage("❌ Page URL slug is required");
//       return;
//     }

//     if (modalMode === "edit" && !selectedCourse) {
//       setMessage("❌ Exam not loaded");
//       return;
//     }

//     setLoading(true);
//     setMessage("");

//     try {
//       const payload = buildOfficialDetailsPayload({
//         officialDetailsContent,
//         officialDetailsMetaTitle,
//         officialDetailsPageTitle,
//         officialDetailsMetaKeywords,
//         officialDetailsMetaDescription,
//         officialDetailsUrlSlug,
//         officialDetailsStatExamCode,
//         officialDetailsStatDuration,
//         officialDetailsStatTotalQuestions,
//         officialDetailsStatCost,
//         officialDetailsStatCertificationBody,
//         officialDetailsStatValidity,
//         officialDetailsFaqs,
//       });

//       let courseId = selectedCourse?.id;
//       let courseRecord = selectedCourse;

//       if (modalMode === "add" && !selectedCourse) {
//         const slug = slugifyPagePath(pageUrlSlug);
//         if (!slug) {
//           setMessage("❌ Enter a valid page URL slug");
//           setLoading(false);
//           return;
//         }

//         const title =
//           officialDetailsPageTitle.trim() ||
//           officialDetailsMetaTitle.trim() ||
//           slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
//         const code =
//           officialDetailsStatExamCode.trim() ||
//           slug.toUpperCase().replace(/-/g, "").slice(0, 12);

//         const createRes = await fetch(
//           `${API_BASE_URL}/api/courses/admin/create/`,
//           {
//             method: "POST",
//             headers: {
//               ...getAuthHeaders(),
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               title,
//               slug,
//               code,
//               provider: null,
//               actual_price: 0,
//               offer_price: 0,
//               show_in_official_details: true,
//             }),
//           }
//         );

//         if (createRes.status === 401) {
//           setMessage("❌ Authentication failed. Please log in again.");
//           setTimeout(() => router.push("/admin/auth"), 2000);
//           return;
//         }

//         const createData = await createRes.json();
//         if (!createRes.ok || !createData.success) {
//           throw new Error(
//             createData.error ||
//               createData.message ||
//               "Failed to create official details page"
//           );
//         }

//         courseRecord = createData.data || createData.course;
//         courseId = courseRecord?.id;
//         if (!courseId) {
//           throw new Error("Created page did not return an ID");
//         }
//       }

//       const res = await fetch(
//         `${API_BASE_URL}/api/courses/admin/${courseId}/update/`,
//         {
//           method: "PUT",
//           headers: {
//             ...getAuthHeaders(),
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (res.status === 401) {
//         setMessage(
//           "❌ Authentication failed. Please log in again."
//         );

//         setTimeout(() => router.push("/admin/auth"), 2000);

//         return;
//       }

//       const data = await res.json();

//       if (data.success) {
//         if (data.success) {
//           setMessage("✅ Official details saved successfully!");
        
//           setSelectedCourse((prev) =>
//             prev
//               ? {
//                   ...prev,
//                   official_details_content: officialDetailsContent,
//                   official_details_meta_title: officialDetailsMetaTitle,
//                   official_details_page_title: officialDetailsPageTitle,
//                   official_details_meta_keywords: officialDetailsMetaKeywords,
//                   official_details_meta_description: officialDetailsMetaDescription,
//                   official_details_url_slug: officialDetailsUrlSlug,
//                   official_details_stat_exam_code: officialDetailsStatExamCode,
//                   official_details_stat_duration: officialDetailsStatDuration,
//                   official_details_stat_total_questions: officialDetailsStatTotalQuestions,
//                   official_details_stat_cost: officialDetailsStatCost,
//                   official_details_stat_certification_body: officialDetailsStatCertificationBody,
//                   official_details_stat_validity: officialDetailsStatValidity,
//                   official_details_faqs: officialDetailsFaqs,
//                 }
//               : prev
//           );
        
//           setTimeout(() => setMessage(""), 3000);
//           setShowOfficialModal(false);
//           setModalMode("add");
//           setSelectedCourse(null);
//           setSearchQuery("");
//           setListSearchQuery("");
//           setExamName("");
//           setShowSearchDropdown(false);
//           setPageUrlSlug("");
//         }
//         // setMessage(
//         //   "✅ Official details saved successfully!"
//         // // ✅ ONLY update selected course locally (NOT full list)
//         // setSelectedCourse((prev) => ({
//         //   ...prev,
//         //   official_details_content: officialDetailsContent,
//         //   official_details_url_slug: officialDetailsUrlSlug,
//         // }));
//         // );

//         // setTimeout(() => setMessage(""), 3000);
//         // setShowOfficialModal(false);
//         // setModalMode("add");
//         // setSelectedCourse(null);
//         // setSearchQuery("");
//         // setListSearchQuery("");
//         // setExamName("");
//         // setShowSearchDropdown(false);
//         // setPageUrlSlug("");

//         // const returnedCourse =
//         //   (data?.data &&
//         //     typeof data.data === "object" &&
//         //     data.data) ||
//         //   (data?.course &&
//         //     typeof data.course === "object" &&
//         //     data.course) ||
//         //   null;

//         // if (returnedCourse) {
//         //   const merged = {
//         //     ...(courseRecord || selectedCourse || {}),
//         //     ...returnedCourse,
//         //   };

//         //   // setCourses((prev) => {
//         //   //   const exists = prev.some((course) => course.id === merged.id);
//         //   //   if (exists) {
//         //   //     return prev.map((course) =>
//         //   //       course.id === merged.id ? { ...course, ...merged } : course
//         //   //     );
//         //   //   }
//         //   //   return [...prev, merged];
//         //   // });
//         // }

//         // try {
//         //   // const coursesRes = await fetch(
//         //   //   `${API_BASE_URL}/api/courses/admin/list/`,
//         //   //   {
//         //   //     headers: getAuthHeaders(),
//         //   //   }
//         //   // );

//         //   // const coursesData = await coursesRes.json();

//         //   // if (
//         //   //   coursesData.success &&
//         //   //   coursesData.data
//         //   // ) {
//         //   //   // setCourses(coursesData.data);
//         //   // }
//         // } catch {
//         //   // non-fatal
//         // }
//       } else {
//         setMessage(
//           "❌ Error: " +
//             (data.error ||
//               "Failed to save official details")
//         );
//       }
//     } catch (error) {
//       setMessage("❌ Error: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openDeleteOfficialDialog = (course) => {
//     setCoursePendingDelete(course);
//     setDeleteDialogOpen(true);
//   };

//   const handleConfirmDeleteOfficialDetails = async () => {
//     const course = coursePendingDelete;
//     const courseId = course?.id || course?._id;
//     if (!courseId) {
//       setMessage("❌ Could not delete: missing course id.");
//       setDeleteDialogOpen(false);
//       setCoursePendingDelete(null);
//       return;
//     }

//     if (!hasOfficialDetailsData(course)) {
//       setMessage("ℹ️ This exam has no official details to delete.");
//       setDeleteDialogOpen(false);
//       setCoursePendingDelete(null);
//       setTimeout(() => setMessage(""), 3000);
//       return;
//     }

//     if (!checkAuth()) {
//       setMessage("❌ Please log in again.");
//       setDeleteDialogOpen(false);
//       setCoursePendingDelete(null);
//       setTimeout(() => router.push("/admin/auth"), 2000);
//       return;
//     }

//     setDeletingOfficial(true);
//     setMessage("");

//     try {
//       const removeEntirePage = isOfficialDetailsOnlyCourse(course);

//       if (removeEntirePage) {
//         const res = await fetch(
//           `${API_BASE_URL}/api/courses/admin/${courseId}/delete/`,
//           {
//             method: "DELETE",
//             headers: getAuthHeaders(),
//           }
//         );
//         const data = await res.json().catch(() => ({}));
//         if (!res.ok || data.success === false) {
//           throw new Error(data.error || "Failed to delete official details page");
//         }
//         setCourses((prev) =>
//           prev.filter((item) => String(item.id || item._id) !== String(courseId))
//         );
//       } else {
//         const res = await fetch(
//           `${API_BASE_URL}/api/courses/admin/${courseId}/update/`,
//           {
//             method: "PUT",
//             headers: {
//               ...getAuthHeaders(),
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               ...EMPTY_OFFICIAL_DETAILS_PAYLOAD,
//               clear_official_details: true,
//             }),
//           }
//         );

//         const data = await res.json();
//         if (!res.ok || !data.success) {
//           throw new Error(data.error || "Failed to delete official details");
//         }
//         await fetchCourses();
//       }

//       if (
//         selectedCourse &&
//         String(selectedCourse.id || selectedCourse._id) === String(courseId)
//       ) {
//         handleCloseModal();
//       }

//       setMessage(
//         removeEntirePage
//           ? "✅ Official details page deleted successfully!"
//           : "✅ Official details deleted successfully!"
//       );
//       setTimeout(() => setMessage(""), 3000);
//     } catch (error) {
//       setMessage(`❌ Error: ${error.message}`);
//     } finally {
//       setDeletingOfficial(false);
//       setDeleteDialogOpen(false);
//       setCoursePendingDelete(null);
//     }
//   };

//   const showDropdown =
//     showSearchDropdown &&
//     searchQuery.trim().length > 0 &&
//     !selectedCourse;

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-[#0C1A35] mb-2">
//             Official Details Manager
//           </h1>

//           <p className="text-[#0C1A35]/60">
//             Content, FAQs, and SEO for each
//             exam&apos;s public official details
//             page.
//           </p>
//         </div>

//         <Button
//           type="button"
//           onClick={handleAddOfficialDetails}
//           className="bg-[#1A73E8] hover:bg-[#1557B0] shrink-0"
//         >
//           <Plus className="w-4 h-4 mr-2" />
//           Add Official Details
//         </Button>
//       </div>

//       {message && (
//         <div
//           className={`mb-4 p-4 rounded-lg ${
//             message.includes("❌")
//               ? "bg-red-50 text-red-700"
//               : "bg-green-50 text-green-700"
//           }`}
//         >
//           {message}
//         </div>
//       )}

//       <Card className="mb-6 border border-gray-200">
//         <CardHeader>
//           <CardTitle className="text-lg text-[#0C1A35]">
//             All Official Details Pages
//           </CardTitle>
//           <div className="relative mt-3">
//             <SearchIcon
//               className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0C1A35]/40"
//               aria-hidden
//             />
//             <Input
//               value={listSearchQuery}
//               onChange={(e) => setListSearchQuery(e.target.value)}
//               placeholder="Search by title, code, provider, slug, or URL slug..."
//               className="pl-9"
//             />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Title</TableHead>
//                 <TableHead>Code</TableHead>
//                 <TableHead>Provider</TableHead>
//                 <TableHead>URL Slug</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredCourses.length === 0 ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={6}
//                     className="text-center text-[#0C1A35]/60 py-8"
//                   >
//                     No exams found.
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredCourses.map((course) => (
//                   <TableRow key={course.id}>
//                     <TableCell className="font-medium text-[#0C1A35]">
//                       {course.title}
//                     </TableCell>
//                     <TableCell>{course.code || "-"}</TableCell>
//                     <TableCell>{course.provider || "-"}</TableCell>
//                     <TableCell>
//                       <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
//                         {normalizeOfficialDetailsUrlSlug(
//                           course.official_details_url_slug || "official-details"
//                         )}
//                       </code>
//                     </TableCell>
//                     <TableCell>
//                       {hasOfficialDetailsData(course) ? (
//                         <Badge className="bg-green-100 text-green-700 border-0">
//                           Has Data
//                         </Badge>
//                       ) : (
//                         <Badge variant="secondary">Empty</Badge>
//                       )}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="inline-flex gap-2 justify-end">
//                         <Button
//                           size="icon"
//                           variant="outline"
//                           onClick={() => handleEditFromTable(course)}
//                           title="Edit official details"
//                         >
//                           <Edit className="w-4 h-4" />
//                         </Button>
//                         <Button
//                           size="icon"
//                           variant="destructive"
//                           onClick={() => openDeleteOfficialDialog(course)}
//                           title="Delete official details page"
//                           disabled={loading || deletingOfficial}
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       <Dialog
//         open={showOfficialModal}
//         onOpenChange={(open) => {
//           if (!open) handleCloseModal();
//           else setShowOfficialModal(true);
//         }}
//       >
//         <DialogContent className="!w-[96vw] !max-w-[1200px] max-h-[92vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="text-[#0C1A35]">
//               {modalMode === "add"
//                 ? "Add Official Details"
//                 : selectedCourse
//                   ? `Edit Official Details: ${selectedCourse.title}`
//                   : "Edit Official Details"}
//             </DialogTitle>
//             {selectedCourse && (
//               <p className="text-sm text-[#0C1A35]/60">
//                 {selectedCourse.code}
//                 {selectedCourse.provider
//                   ? ` · ${selectedCourse.provider}`
//                   : ""}
//               </p>
//             )}
//           </DialogHeader>

//           <div className="space-y-6">
//             {modalMode === "edit" && !selectedCourse ? (
//               <p className="text-[#0C1A35]/60 text-center py-8">
//                 Loading exam details...
//               </p>
//             ) : (
//               <div className="space-y-6">
//                 {modalMode === "add" && (
//                   <div>
//                     <Label htmlFor="exam-name">
//                       Exam Name *
//                     </Label>

//                     <Input
//                       id="exam-name"
//                       value={examName}
//                       onChange={(e) => setExamName(e.target.value)}
//                       placeholder="AWS Certified Solutions Architect Associate"
//                       className="mt-1"
//                     />
//                   </div>
//                 )}
                
//               {modalMode === "add" && (
//                 <div>        
//                   <Label htmlFor="page-url-slug">Page URL Slug *</Label>
//                   <p className="text-xs text-[#0C1A35]/50 mb-2">
//                     Public page path prefix. Example:{" "}
//                     <code className="bg-gray-100 px-1 rounded">my-exam-name</code>{" "}
//                     creates{" "}
//                     <code className="bg-gray-100 px-1 rounded">
//                       /my-exam-name/official-details
//                     </code>
//                   </p>
//                   <Input
//                     id="page-url-slug"
//                     value={pageUrlSlug}
//                     onChange={(e) => setPageUrlSlug(e.target.value)}
//                     placeholder="my-exam-name"
//                     className="mt-1"
//                   />
//                 </div>
//               )}

//               <div>
//                 <Label>Page Title</Label>

//                 <p className="text-xs text-[#0C1A35]/50 mb-2">
//                   Shown as the page heading (H1) on the official details page.
//                 </p>

//                 <Input
//                   value={officialDetailsPageTitle}
//                   onChange={(e) =>
//                     setOfficialDetailsPageTitle(e.target.value)
//                   }
//                   placeholder="Official Exam Details"
//                   className="mt-1"
//                 />
//               </div>

//               <div>
//                 <Label>URL Slug</Label>

//                 <p className="text-xs text-[#0C1A35]/50 mb-2">
//                   Path segment after the exam slug.
//                   Leave empty for default{" "}
//                   <code className="bg-gray-100 px-1 rounded">
//                     official-details
//                   </code>
//                   .
//                 </p>

//                 <div className="flex items-center gap-2 flex-wrap">
//                   <span className="text-sm text-[#0C1A35]/60 shrink-0">
//                     /
//                     {modalMode === "add"
//                       ? slugifyPagePath(pageUrlSlug) || "your-page-slug"
//                       : selectedCourse?.slug || "exam-slug"}
//                     /
//                   </span>

//                   <Input
//                     value={officialDetailsUrlSlug}
//                     onChange={(e) =>
//                       setOfficialDetailsUrlSlug(
//                         e.target.value
//                       )
//                     }
//                     placeholder="official-details"
//                     className="flex-1 min-w-[12rem]"
//                   />
//                 </div>

//                 <p className="text-xs text-[#1A73E8] mt-2 font-medium">
//                   Live URL:{" "}
//                   <code className="bg-blue-50 px-1.5 py-0.5 rounded text-[#0C1A35]">
//                     /
//                     {modalMode === "add"
//                       ? slugifyPagePath(pageUrlSlug) || "your-page-slug"
//                       : selectedCourse?.slug || "exam-slug"}
//                     /
//                     {normalizeOfficialDetailsUrlSlug(
//                       officialDetailsUrlSlug ||
//                         "official-details"
//                     )}
//                   </code>
//                 </p>
//               </div>

//               <div className="space-y-4 pt-2 border-t">
//                 <h4 className="font-semibold text-[#0C1A35]">
//                   Official Details Table (Shown Only If You Fill)
//                 </h4>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label>Exam code (table)</Label>
//                     <Input
//                       value={officialDetailsStatExamCode}
//                       onChange={(e) =>
//                         setOfficialDetailsStatExamCode(e.target.value)
//                       }
//                       placeholder="AZ-900"
//                       className="mt-1"
//                     />
//                   </div>

//                   <div>
//                     <Label>Duration (table)</Label>
//                     <Input
//                       value={officialDetailsStatDuration}
//                       onChange={(e) =>
//                         setOfficialDetailsStatDuration(e.target.value)
//                       }
//                       placeholder="60 minutes"
//                       className="mt-1"
//                     />
//                   </div>

//                   <div>
//                     <Label>Number of questions (table)</Label>
//                     <Input
//                       value={officialDetailsStatTotalQuestions}
//                       onChange={(e) =>
//                         setOfficialDetailsStatTotalQuestions(e.target.value)
//                       }
//                       placeholder="30–40 questions"
//                       className="mt-1"
//                     />
//                   </div>

//                   <div>
//                     <Label>Cost (table)</Label>
//                     <Input
//                       value={officialDetailsStatCost}
//                       onChange={(e) =>
//                         setOfficialDetailsStatCost(e.target.value)
//                       }
//                       placeholder="$99 (₹8,000–₹9,000)"
//                       className="mt-1"
//                     />
//                   </div>

//                   <div>
//                     <Label>Certification body (table)</Label>
//                     <Input
//                       value={officialDetailsStatCertificationBody}
//                       onChange={(e) =>
//                         setOfficialDetailsStatCertificationBody(e.target.value)
//                       }
//                       placeholder="Microsoft Azure"
//                       className="mt-1"
//                     />
//                   </div>

//                   <div>
//                     <Label>Validity (table)</Label>
//                     <Input
//                       value={officialDetailsStatValidity}
//                       onChange={(e) =>
//                         setOfficialDetailsStatValidity(e.target.value)
//                       }
//                       placeholder="3 years"
//                       className="mt-1"
//                     />
//                   </div>
//                 </div>

//                 <p className="text-xs text-[#0C1A35]/55">
//                   If you keep these empty, the table won&apos;t be shown on the
//                   official details page.
//                 </p>
//               </div>

//               <div className="space-y-4 pt-2 border-t">
//                 <h4 className="font-semibold text-[#0C1A35]">
//                   SEO (Official Details Page Only)
//                 </h4>

//                 <div>
//                   <Label>Meta Title</Label>

//                   <Input
//                     value={officialDetailsMetaTitle}
//                     onChange={(e) =>
//                       setOfficialDetailsMetaTitle(
//                         e.target.value
//                       )
//                     }
//                     placeholder="Official AWS SAA-C03 Exam Information"
//                     className="mt-1"
//                   />
//                 </div>

//                 <div>
//                   <Label>Meta Keywords</Label>

//                   <Input
//                     value={officialDetailsMetaKeywords}
//                     onChange={(e) =>
//                       setOfficialDetailsMetaKeywords(
//                         e.target.value
//                       )
//                     }
//                     placeholder="Comma-separated keywords"
//                     className="mt-1"
//                   />
//                 </div>

//                 <div>
//                   <Label>Meta Description</Label>

//                   <Textarea
//                     value={
//                       officialDetailsMetaDescription
//                     }
//                     onChange={(e) =>
//                       setOfficialDetailsMetaDescription(
//                         e.target.value
//                       )
//                     }
//                     placeholder="Enter meta description for the official details page"
//                     rows={3}
//                     className="mt-1"
//                   />
//                 </div>
//               </div>

//               <div className="pt-2 border-t">
//                 <Label>Page Content</Label>

//                 <div className="mt-2">
//                   <TipTapEditor
//                     key={`official-content-${selectedCourse?.id || pageUrlSlug || "new"}`}
//                     content={
//                       officialDetailsContent || ""
//                     }
//                     onChange={(html) =>
//                       setOfficialDetailsContent(html)
//                     }
//                     placeholder="Official exam information from the certification body..."
//                   />
//                 </div>
//               </div>

//               <div className="pt-2 border-t space-y-4">
//                 <div className="flex items-center justify-between gap-3">
//                   <div>
//                     <Label>
//                       FAQs (Official Details Page)
//                     </Label>

//                     <p className="text-xs text-[#0C1A35]/50 mt-1">
//                       Shown on the official details
//                       page only (separate from exam
//                       page FAQs).
//                     </p>
//                   </div>

//                   <Button
//                     size="sm"
//                     type="button"
//                     onClick={addOfficialFaq}
//                     className="shrink-0"
//                   >
//                     <Plus className="w-4 h-4 mr-1" />
//                     Add FAQ
//                   </Button>
//                 </div>

//                 {officialDetailsFaqs.length === 0 ? (
//                   <p className="text-sm text-[#0C1A35]/50 text-center py-6 border border-dashed border-gray-200 rounded-lg">
//                     No FAQs yet. Click
//                     &quot;Add FAQ&quot; to create one.
//                   </p>
//                 ) : (
//                   officialDetailsFaqs.map(
//                     (faq, index) => (
//                       <Card
//                         key={faq.id}
//                         className="p-4 border border-gray-200"
//                       >
//                         <div className="flex items-center justify-between mb-3">
//                           <span className="text-xs font-medium text-[#0C1A35]/50">
//                             FAQ {index + 1}
//                           </span>

//                           <Button
//                             size="sm"
//                             type="button"
//                             variant="destructive"
//                             onClick={() =>
//                               removeOfficialFaq(
//                                 faq.id
//                               )
//                             }
//                             aria-label={`Delete FAQ ${
//                               index + 1
//                             }`}
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </Button>
//                         </div>

//                         <div className="space-y-3">
//                           <div>
//                             <Label className="text-sm text-gray-600 mb-1 block">
//                               Question
//                             </Label>

//                             <Input
//                               value={faq.question}
//                               onChange={(e) =>
//                                 updateOfficialFaq(
//                                   faq.id,
//                                   "question",
//                                   e.target.value
//                                 )
//                               }
//                               placeholder="Question"
//                             />
//                           </div>

//                           <div>
//                             <Label className="text-sm text-gray-600 mb-1 block">
//                               Answer
//                             </Label>

//                             <Textarea
//                               value={faq.answer || ""}
//                               onChange={(e) =>
//                                 updateOfficialFaq(
//                                   faq.id,
//                                   "answer",
//                                   e.target.value
//                                 )
//                               }
//                               placeholder="Enter FAQ answer"
//                               rows={4}
//                             />
//                           </div>
//                         </div>
//                       </Card>
//                     )
//                   )
//                 )}
//               </div>

//               <div className="pt-4 border-t flex flex-wrap gap-3 justify-end">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={handleCloseModal}
//                   disabled={loading}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleSave}
//                   disabled={
//                     loading ||
//                     (modalMode === "edit" && !selectedCourse) ||
//                     (modalMode === "add" && !pageUrlSlug.trim())
//                   }
//                   className="bg-[#1A73E8] hover:bg-[#1557B0]"
//                 >
//                   <Save className="w-4 h-4 mr-2" />
//                   {loading ? "Saving..." : "Save Official Details"}
//                 </Button>
//               </div>
//             </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>

//       <AlertDialog
//         open={deleteDialogOpen}
//         onOpenChange={(open) => {
//           if (!deletingOfficial) {
//             setDeleteDialogOpen(open);
//             if (!open) setCoursePendingDelete(null);
//           }
//         }}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete official details page?</AlertDialogTitle>
//             <AlertDialogDescription>
//               {coursePendingDelete ? (
//                 <>
//                   This will permanently remove official details for{" "}
//                   <strong>
//                     {coursePendingDelete.title ||
//                       coursePendingDelete.code ||
//                       "this exam"}
//                   </strong>
//                   {isOfficialDetailsOnlyCourse(coursePendingDelete)
//                     ? " and delete the standalone official details page."
//                     : ". The exam will remain; only official details content is removed."}
//                 </>
//               ) : (
//                 "This action cannot be undone."
//               )}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={deletingOfficial}>
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               disabled={deletingOfficial}
//               className="bg-destructive text-white hover:bg-destructive/90"
//               onClick={(e) => {
//                 e.preventDefault();
//                 handleConfirmDeleteOfficialDetails();
//               }}
//             >
//               {deletingOfficial ? "Deleting..." : "Delete"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }