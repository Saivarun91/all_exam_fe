



"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Edit, Trash2, Save, X, SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { checkAuth, getAuthHeaders } from "@/utils/authCheck";
import TipTapEditor from "@/components/editor/TipTapEditor";
import { trimOfficialDetailsPathSegment } from "@/app/exams/[provider]/[examCode]/examInfoUtils";
import ExamBasicFormFields from "@/components/admin/ExamBasicFormFields";
import {
  getPublicPageUrlFromSlug,
  resolveCourseCodeForSave,
} from "@/utils/practiceTestRouting";
import {
  EMPTY_EXAM_BASIC_FORM,
  providerIdForAdminForm,
} from "@/components/admin/providerIdForAdminForm";
import { hasOfficialDetailsData } from "@/components/exam/OfficialExamDetailsView";
import AdminTablePagination, { ADMIN_TABLE_PAGE_SIZE } from "@/components/admin/AdminTablePagination";
import { getListPaginationSlice } from "@/components/common/ListPagination";
import {
  belongsInExamDetailsManager,
  courseHasExamDetails,
  isOfficialDetailsCourse,
} from "@/lib/examListingFilters";
import { escapeHtmlText } from "@/lib/htmlTextUtils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/** Clears exam-details page fields without removing the course record. */
const EMPTY_EXAM_DETAILS_PAYLOAD = {
  about: "",
  exam_details: "",
  details: "",
  page_heading: "",
  about_heading: "",
  exam_details_heading: "",
  why_matters_heading: "",
  whats_included_heading: "",
  topics_heading: "",
  practice_tests_heading: "",
  testimonials_heading: "",
  faqs_heading: "",
  test_instructions_heading: "",
  practice_page_section_1_heading: "",
  practice_page_section_1_content: "",
  practice_page_section_2_heading: "",
  practice_page_section_2_content: "",
  test_description: "",
  pass_rate: null,
  rating: null,
  difficulty: "",
  duration: "",
  passing_score: "",
  why_matters: "",
  whats_included: [],
  topics: [],
  testimonials: [],
  faqs: [],
  test_instructions: [],
  meta_title: "",
  meta_keywords: "",
  meta_description: "",
};

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

export default function ExamDetailsManager() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [listPage, setListPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState("basic");
  const [newExamForm, setNewExamForm] = useState(EMPTY_EXAM_BASIC_FORM);
  const [basicExamForm, setBasicExamForm] = useState(EMPTY_EXAM_BASIC_FORM);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [basicProviderDropdownOpen, setBasicProviderDropdownOpen] = useState(false);
  const [savingBasicInfo, setSavingBasicInfo] = useState(false);
  const [addingExam, setAddingExam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  // SEO states
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoMessage, setSeoMessage] = useState("");
  const [seoData, setSeoData] = useState({
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
  });

  // Form states for exam details
  const [aboutHeading, setAboutHeading] = useState("");
  const [aboutHeadingText, setAboutHeadingText] = useState("");
  const [aboutHeadingTag, setAboutHeadingTag] = useState("h2");
  const [aboutHeadingFontSize, setAboutHeadingFontSize] = useState("24");
  const [aboutHeadingFontWeight, setAboutHeadingFontWeight] = useState("700");
  const [pageHeadingText, setPageHeadingText] = useState("");
  const [pageHeadingTag, setPageHeadingTag] = useState("h1");
  const [pageHeadingFontSize, setPageHeadingFontSize] = useState("40");
  const [pageHeadingFontWeight, setPageHeadingFontWeight] = useState("700");
  const [examDetailsHeadingText, setExamDetailsHeadingText] = useState("");
  const [examDetailsHeadingTag, setExamDetailsHeadingTag] = useState("h2");
  const [examDetailsHeadingFontSize, setExamDetailsHeadingFontSize] = useState("24");
  const [examDetailsHeadingFontWeight, setExamDetailsHeadingFontWeight] = useState("700");
  
  // âœ… ADD THIS (you missed this)
  const [whyMattersHeadingText, setWhyMattersHeadingText] = useState("");
  const [whyMattersHeadingTag, setWhyMattersHeadingTag] = useState("h2");
  const [whyMattersHeadingFontSize, setWhyMattersHeadingFontSize] = useState("24");
  const [whyMattersHeadingFontWeight, setWhyMattersHeadingFontWeight] = useState("700");
  
  // What's Included Heading
  const [whatsIncludedHeadingText, setWhatsIncludedHeadingText] = useState("");
  const [whatsIncludedHeadingTag, setWhatsIncludedHeadingTag] = useState("h2");
  const [whatsIncludedHeadingFontSize, setWhatsIncludedHeadingFontSize] = useState("24");
  const [whatsIncludedHeadingFontWeight, setWhatsIncludedHeadingFontWeight] = useState("700");
  
  // Topics Covered Heading
  const [topicsHeadingText, setTopicsHeadingText] = useState("");
  const [topicsHeadingTag, setTopicsHeadingTag] = useState("h2");
  const [topicsHeadingFontSize, setTopicsHeadingFontSize] = useState("24");
  const [topicsHeadingFontWeight, setTopicsHeadingFontWeight] = useState("700");
  
  // Practice Tests Heading
  const [practiceTestsHeadingText, setPracticeTestsHeadingText] = useState("");
  const [practiceTestsHeadingTag, setPracticeTestsHeadingTag] = useState("h2");
  const [practiceTestsHeadingFontSize, setPracticeTestsHeadingFontSize] = useState("24");
  const [practiceTestsHeadingFontWeight, setPracticeTestsHeadingFontWeight] = useState("700");
  
  // Testimonials Heading
  const [testimonialsHeadingText, setTestimonialsHeadingText] = useState("");
  const [testimonialsHeadingTag, setTestimonialsHeadingTag] = useState("h2");
  const [testimonialsHeadingFontSize, setTestimonialsHeadingFontSize] = useState("24");
  const [testimonialsHeadingFontWeight, setTestimonialsHeadingFontWeight] = useState("700");
  
  // FAQs Heading
  const [faqsHeadingText, setFaqsHeadingText] = useState("");
  const [faqsHeadingTag, setFaqsHeadingTag] = useState("h2");
  const [faqsHeadingFontSize, setFaqsHeadingFontSize] = useState("24");
  const [faqsHeadingFontWeight, setFaqsHeadingFontWeight] = useState("700");
  
  // Test Instructions Heading
  const [testInstructionsHeadingText, setTestInstructionsHeadingText] = useState("");
  const [testInstructionsHeadingTag, setTestInstructionsHeadingTag] = useState("h2");
  const [testInstructionsHeadingFontSize, setTestInstructionsHeadingFontSize] = useState("24");
  const [testInstructionsHeadingFontWeight, setTestInstructionsHeadingFontWeight] = useState("700");

  // Practice hub page (/slug/practice) â€” two optional sections below the test list
  const [practiceHubS1HeadingText, setPracticeHubS1HeadingText] = useState("");
  const [practiceHubS1HeadingTag, setPracticeHubS1HeadingTag] = useState("h2");
  const [practiceHubS1HeadingFontSize, setPracticeHubS1HeadingFontSize] = useState("24");
  const [practiceHubS1HeadingFontWeight, setPracticeHubS1HeadingFontWeight] = useState("700");
  const [practiceHubS1Content, setPracticeHubS1Content] = useState("");
  const [practiceHubS2HeadingText, setPracticeHubS2HeadingText] = useState("");
  const [practiceHubS2HeadingTag, setPracticeHubS2HeadingTag] = useState("h2");
  const [practiceHubS2HeadingFontSize, setPracticeHubS2HeadingFontSize] = useState("24");
  const [practiceHubS2HeadingFontWeight, setPracticeHubS2HeadingFontWeight] = useState("700");
  const [practiceHubS2Content, setPracticeHubS2Content] = useState("");
  
  const [about, setAbout] = useState("");
  const [examDetails, setExamDetails] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [passRate, setPassRate] = useState("");
  const [rating, setRating] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [duration, setDuration] = useState("");
  const [passingScore, setPassingScore] = useState("");
  const [whyMatters, setWhyMatters] = useState("");

  // List fields
  const [whatsIncluded, setWhatsIncluded] = useState([""]);
  const [topics, setTopics] = useState([{ name: "", weight: "", explanation: "" }]);
  const [practiceTests, setPracticeTests] = useState([{ 
    name: "", 
    questions: "", 
    difficulty: "", 
    duration: "",
    description: ""
  }]);
  const [testimonials, setTestimonials] = useState([{ name: "", role: "", rating: 5, review: "", verified: false }]);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [testInstructions, setTestInstructions] = useState([""]);

  // Per-course SEO states
  const [metaTitle, setMetaTitle] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Official details page (separate from main exam SEO)
  const [officialDetailsContent, setOfficialDetailsContent] = useState("");
  const [officialDetailsMetaTitle, setOfficialDetailsMetaTitle] = useState("");
  const [officialDetailsMetaKeywords, setOfficialDetailsMetaKeywords] = useState("");
  const [officialDetailsMetaDescription, setOfficialDetailsMetaDescription] = useState("");
  const [officialDetailsUrlSlug, setOfficialDetailsUrlSlug] = useState("");
  const [officialDetailsFaqs, setOfficialDetailsFaqs] = useState([
    { question: "", answer: "" },
  ]);
  const [officialExamSearch, setOfficialExamSearch] = useState("");

  const filteredCoursesForOfficial = useMemo(() => {
    const q = officialExamSearch.trim().toLowerCase();
    if (!q) return [];
    return courses.filter((course) => {
      const title = String(course.title || "").toLowerCase();
      const code = String(course.code || "").toLowerCase();
      const provider = String(course.provider || "").toLowerCase();
      const slug = String(course.slug || "").toLowerCase();
      return (
        title.includes(q) ||
        code.includes(q) ||
        provider.includes(q) ||
        slug.includes(q)
      );
    });
  }, [courses, officialExamSearch]);

  // Reusable Heading Component Function
  const HeadingInput = ({ 
    label, 
    text, 
    setText, 
    tag, 
    setTag, 
    fontSize, 
    setFontSize, 
    fontWeight, 
    setFontWeight,
    placeholder = "Heading"
  }) => (
    <div>
      <Label>{label}</Label>
      <div className="space-y-3 mt-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
        />
        <div className="grid grid-cols-3 gap-3">
          {/* <div>
            <Label className="text-xs text-gray-600">Heading Tag</Label>
            <Select value={tag || "h2"} onValueChange={(value) => setTag(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1</SelectItem>
                <SelectItem value="h2">H2</SelectItem>
                <SelectItem value="h3">H3</SelectItem>
                <SelectItem value="h4">H4</SelectItem>
                <SelectItem value="h5">H5</SelectItem>
                <SelectItem value="h6">H6</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          {/* <div>
            <Label className="text-xs text-gray-600">Font Size (px)</Label>
            <Select value={String(fontSize || "24")} onValueChange={(value) => setFontSize(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12px</SelectItem>
                <SelectItem value="14">14px</SelectItem>
                <SelectItem value="16">16px</SelectItem>
                <SelectItem value="18">18px</SelectItem>
                <SelectItem value="20">20px</SelectItem>
                <SelectItem value="22">22px</SelectItem>
                <SelectItem value="24">24px</SelectItem>
                <SelectItem value="28">28px</SelectItem>
                <SelectItem value="32">32px</SelectItem>
                <SelectItem value="36">36px</SelectItem>
                <SelectItem value="40">40px</SelectItem>
                <SelectItem value="48">48px</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          {/* <div>
            <Label className="text-xs text-gray-600">Font Weight</Label>
            <Select value={String(fontWeight || "700")} onValueChange={(value) => setFontWeight(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select weight" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="400">Regular (400)</SelectItem>
                <SelectItem value="500">Medium (500)</SelectItem>
                <SelectItem value="600">Semibold (600)</SelectItem>
                <SelectItem value="700">Bold (700)</SelectItem>
                <SelectItem value="800">Extra Bold (800)</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </div>
      </div>
    </div>
  );

  const escapeHTML = escapeHtmlText;

  // Function to generate heading HTML from components
  const generateHeadingHTML = (text, tag, fontSize, fontWeight) => {
    const Tag = tag || "h2";
    const size = fontSize || "24";
    const weight = fontWeight || "700";
    const escapedText = escapeHTML(text || "");
    return `<${Tag} style="font-size: ${size}px; font-weight: ${weight};">${escapedText}</${Tag}>`;
  };

  // Function to parse heading HTML and extract components
  const parseHeadingHTML = (html, defaultText = "About This Exam") => {
    if (!html) {
      return {
        text: defaultText,
        tag: "h2",
        fontSize: "24",
        fontWeight: "700"
      };
    }

    // Check if it's plain text (doesn't contain HTML tags)
    if (!html.includes("<") || !html.includes(">")) {
      return {
        text: html,
        tag: "h2",
        fontSize: "24",
        fontWeight: "700"
      };
    }

    // Try to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const element = doc.body.firstElementChild;

    if (!element || !element.tagName) {
      return {
        text: html.replace(/<[^>]*>/g, ""), // Strip HTML tags if any
        tag: "h2",
        fontSize: "24",
        fontWeight: "700"
      };
    }

    const tag = element.tagName.toLowerCase();
    const text = element.textContent || element.innerText || "";
    const style = element.getAttribute("style") || "";
    
    // Extract font-size
    const fontSizeMatch = style.match(/font-size:\s*(\d+)px/);
    const fontSize = fontSizeMatch ? fontSizeMatch[1] : "24";

    // Extract font-weight (can be numeric or text)
    const fontWeightMatch = style.match(/font-weight:\s*([\w\d]+)/);
    let fontWeight = fontWeightMatch ? fontWeightMatch[1] : "700";
    
    // Convert text values to numeric equivalents for consistency
    if (fontWeight === "bold") {
      fontWeight = "700";
    } else if (fontWeight === "normal") {
      fontWeight = "normal";
    } else if (fontWeight === "semibold" || fontWeight === "semi-bold") {
      fontWeight = "600";
    }

    // Ensure all values are strings for Select components
    return { 
      text: String(text || defaultText), 
      tag: String(tag || "h2"), 
      fontSize: String(fontSize || "24"), 
      fontWeight: String(fontWeight || "700")
    };
  };

  useEffect(() => {
    // Check authentication
    if (!checkAuth()) {
      setMessage("âŒ Authentication failed. Please log in as admin.");
      setTimeout(() => {
        router.push("/admin/auth");
      }, 2000);
      return;
    }
    
    fetchCourses();
    fetchSeoData();
    fetchCategoriesAndProviders();
  }, []);

  useEffect(() => {
    if (!selectedCourse || providers.length === 0) return;
    setBasicExamForm((prev) => ({
      ...prev,
      provider: providerIdForAdminForm(selectedCourse, providers),
    }));
  }, [providers, selectedCourse?.id]);

  const fetchCategoriesAndProviders = async () => {
    try {
      const [categoriesRes, providersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/categories/`),
        fetch(`${API_BASE_URL}/api/providers/`),
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData.filter((c) => c.is_active !== false)
            : []
        );
      }

      if (providersRes.ok) {
        const providersData = await providersRes.json();
        setProviders(
          Array.isArray(providersData)
            ? providersData.filter((p) => p.is_active !== false)
            : []
        );
      }
    } catch (error) {
      console.error("Error fetching categories/providers:", error);
    }
  };

  // Fetch SEO Data
  const fetchSeoData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/exam-details-seo/`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401 || res.status === 404 || !res.ok) {
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        setSeoData({
          meta_title: data.data.meta_title || "",
          meta_keywords: data.data.meta_keywords || "",
          meta_description: data.data.meta_description || "",
        });
      }
    } catch (error) {
      console.error("Error fetching SEO data:", error);
    }
  };

  // Save SEO Data
  const handleSaveSeo = async () => {
    setSeoLoading(true);
    setSeoMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/exam-details-seo/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(seoData),
      });
      if (res.status === 401) {
        setSeoMessage("âŒ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        setSeoLoading(false);
        return;
      }
      if (res.status === 404) {
        setSeoMessage("âŒ API endpoint not found.");
        setSeoLoading(false);
        return;
      }
      if (!res.ok) {
        setSeoMessage("âŒ Error: " + res.statusText);
        setSeoLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSeoMessage("âœ… SEO meta information saved successfully!");
        setTimeout(() => setSeoMessage(""), 3000);
      } else {
        setSeoMessage("âŒ Error: " + (data.error || "Failed to save"));
      }
    } catch (error) {
      setSeoMessage("âŒ Error: " + error.message);
    } finally {
      setSeoLoading(false);
    }
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/list/`, {
        headers: getAuthHeaders()
      });

      if (res.status === 401) {
        setMessage("âŒ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setCourses(
          (data.data || []).filter(belongsInExamDetailsManager)
        );
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setMessage("âŒ Error loading courses. Check console for details.");
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchCourseFullDetails = async (courseOrId) => {
    const course =
      courseOrId && typeof courseOrId === "object"
        ? courseOrId
        : { id: courseOrId };
    const courseId = course?.id;

    const candidateUrls = [
      `${API_BASE_URL}/api/courses/admin/${courseId}/`,
      `${API_BASE_URL}/api/courses/admin/${courseId}/detail/`,
    ];

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          headers: getAuthHeaders(),
        });

        if (!res.ok) continue;
        const data = await res.json();

        if (data?.success && data?.data && typeof data.data === "object") {
          return data.data;
        }

        if (data && typeof data === "object" && (data.id || data.code || data.title)) {
          return data;
        }
      } catch (error) {
        // Try next endpoint
      }
    }

    return null;
  };

  const handleSelectCourse = async (course) => {
    // Quick immediate load from list item
    loadCourseDetails(course, false);

    // Then hydrate with full API details if available
    const fullCourse = await fetchCourseFullDetails(course);
    if (fullCourse) {
      const merged = mergeCourseData(course, fullCourse);
      loadCourseDetails(
        {
          ...merged,
          slug:
            fullCourse.slug != null
              ? String(fullCourse.slug)
              : course.slug != null
                ? String(course.slug)
                : "",
        },
        false
      );
    }
  };

  const loadCourseDetails = (course, showMessage = true) => {
    setSelectedCourse(course);
    
    // Load About heading
    const aboutHeadingData = parseHeadingHTML(course.about_heading || "");
    setAboutHeading(course.about_heading || "");
    setAboutHeadingText(aboutHeadingData.text);
    setAboutHeadingTag(aboutHeadingData.tag);
    setAboutHeadingFontSize(aboutHeadingData.fontSize);
    setAboutHeadingFontWeight(aboutHeadingData.fontWeight);

    // Load page H1 heading (shown at top of exam details page)
    const pageHeadingData = parseHeadingHTML(
      course.page_heading || "",
      course.title || "Exam Details"
    );
    setPageHeadingText(pageHeadingData.text);
    setPageHeadingTag(pageHeadingData.tag || "h1");
    setPageHeadingFontSize(pageHeadingData.fontSize || "40");
    setPageHeadingFontWeight(pageHeadingData.fontWeight);

    // Load Exam Details heading
    const examDetailsHeadingData = parseHeadingHTML(
      course.exam_details_heading || "",
      "Exam Details"
    );
    setExamDetailsHeadingText(examDetailsHeadingData.text);
    setExamDetailsHeadingTag(examDetailsHeadingData.tag);
    setExamDetailsHeadingFontSize(examDetailsHeadingData.fontSize);
    setExamDetailsHeadingFontWeight(examDetailsHeadingData.fontWeight);
    
    // Load Why Matters heading
    const whyMattersHeadingData = parseHeadingHTML(course.why_matters_heading || "", "Why This Certification Matters");
    setWhyMattersHeadingText(whyMattersHeadingData.text);
    setWhyMattersHeadingTag(whyMattersHeadingData.tag);
    setWhyMattersHeadingFontSize(whyMattersHeadingData.fontSize);
    setWhyMattersHeadingFontWeight(whyMattersHeadingData.fontWeight);
    
    // Load What's Included heading
    const whatsIncludedHeadingData = parseHeadingHTML(course.whats_included_heading || "", "What's Included in This Practice Pack");
    setWhatsIncludedHeadingText(whatsIncludedHeadingData.text);
    setWhatsIncludedHeadingTag(whatsIncludedHeadingData.tag);
    setWhatsIncludedHeadingFontSize(whatsIncludedHeadingData.fontSize);
    setWhatsIncludedHeadingFontWeight(whatsIncludedHeadingData.fontWeight);
    
    // Load Topics heading
    const topicsHeadingData = parseHeadingHTML(course.topics_heading || "", "Topics Covered");
    setTopicsHeadingText(topicsHeadingData.text);
    setTopicsHeadingTag(topicsHeadingData.tag);
    setTopicsHeadingFontSize(topicsHeadingData.fontSize);
    setTopicsHeadingFontWeight(topicsHeadingData.fontWeight);
    
    // Load Practice Tests heading
    const practiceTestsHeadingData = parseHeadingHTML(course.practice_tests_heading || "", "Available Practice Tests");
    setPracticeTestsHeadingText(practiceTestsHeadingData.text);
    setPracticeTestsHeadingTag(practiceTestsHeadingData.tag);
    setPracticeTestsHeadingFontSize(practiceTestsHeadingData.fontSize);
    setPracticeTestsHeadingFontWeight(practiceTestsHeadingData.fontWeight);
    
    // Load Testimonials heading
    const testimonialsHeadingData = parseHeadingHTML(course.testimonials_heading || "", "Student Success Stories");
    setTestimonialsHeadingText(testimonialsHeadingData.text);
    setTestimonialsHeadingTag(testimonialsHeadingData.tag);
    setTestimonialsHeadingFontSize(testimonialsHeadingData.fontSize);
    setTestimonialsHeadingFontWeight(testimonialsHeadingData.fontWeight);
    
    // Load FAQs heading
    const faqsHeadingData = parseHeadingHTML(course.faqs_heading || "", "Frequently Asked Questions");
    setFaqsHeadingText(faqsHeadingData.text);
    setFaqsHeadingTag(faqsHeadingData.tag);
    setFaqsHeadingFontSize(faqsHeadingData.fontSize);
    setFaqsHeadingFontWeight(faqsHeadingData.fontWeight);
    
    // Load Test Instructions heading
    const testInstructionsHeadingData = parseHeadingHTML(course.test_instructions_heading || "", "Test Instructions");
    setTestInstructionsHeadingText(testInstructionsHeadingData.text);
    setTestInstructionsHeadingTag(testInstructionsHeadingData.tag);
    setTestInstructionsHeadingFontSize(testInstructionsHeadingData.fontSize);
    setTestInstructionsHeadingFontWeight(testInstructionsHeadingData.fontWeight);

    const ph1h = parseHeadingHTML(course.practice_page_section_1_heading || "", "Extra section 1");
    setPracticeHubS1HeadingText(ph1h.text);
    setPracticeHubS1HeadingTag(ph1h.tag);
    setPracticeHubS1HeadingFontSize(ph1h.fontSize);
    setPracticeHubS1HeadingFontWeight(ph1h.fontWeight);
    setPracticeHubS1Content(course.practice_page_section_1_content || "");
    const ph2h = parseHeadingHTML(course.practice_page_section_2_heading || "", "Extra section 2");
    setPracticeHubS2HeadingText(ph2h.text);
    setPracticeHubS2HeadingTag(ph2h.tag);
    setPracticeHubS2HeadingFontSize(ph2h.fontSize);
    setPracticeHubS2HeadingFontWeight(ph2h.fontWeight);
    setPracticeHubS2Content(course.practice_page_section_2_content || "");
    
    setAbout(course.about || "");
    setExamDetails(course.exam_details || course.details || "");
    setTestDescription(course.test_description || "");
    setPassRate(course.pass_rate ? String(course.pass_rate) : "");
    setRating(course.rating || "");
    setDifficulty(course.difficulty || "");
    setDuration(course.duration || "");
    setPassingScore(course.passing_score || "");
    setWhyMatters(course.why_matters || "");
    
    setWhatsIncluded(course.whats_included && course.whats_included.length > 0 ? course.whats_included : [""]);
    setTopics(
      course.topics && course.topics.length > 0
        ? course.topics.map((t) => ({
            name: t.name || "",
            weight: t.weight ?? "",
            explanation:
              typeof t.explanation === "string"
                ? t.explanation
                : typeof t.description === "string"
                  ? t.description
                  : "",
          }))
        : [{ name: "", weight: "", explanation: "" }]
    );
    setPracticeTests(course.practice_tests_list && course.practice_tests_list.length > 0 ? course.practice_tests_list : [{ 
      name: "", 
      questions: "", 
      difficulty: "", 
      duration: "",
      description: ""
    }]);
    setTestimonials(course.testimonials && course.testimonials.length > 0 ? course.testimonials : [{ name: "", role: "", rating: 5, review: "", verified: false }]);
    setFaqs(course.faqs && course.faqs.length > 0 ? course.faqs : [{ question: "", answer: "" }]);
    setTestInstructions(course.test_instructions && course.test_instructions.length > 0 ? course.test_instructions : [""]);

    setOfficialDetailsContent(course.official_details_content || "");
    setOfficialDetailsMetaTitle(course.official_details_meta_title || "");
    setOfficialDetailsMetaKeywords(course.official_details_meta_keywords || "");
    setOfficialDetailsMetaDescription(course.official_details_meta_description || "");
    setOfficialDetailsUrlSlug(course.official_details_url_slug || "");
    setOfficialDetailsFaqs(
      course.official_details_faqs && course.official_details_faqs.length > 0
        ? course.official_details_faqs.map((f) => ({
            question: f.question || "",
            answer: f.answer || "",
          }))
        : [{ question: "", answer: "" }]
    );

    setMetaTitle(course.meta_title || "");
    setMetaKeywords(course.meta_keywords || "");
    setMetaDescription(course.meta_description || "");

    setBasicExamForm({
      name: course.title || course.name || "",
      slug: course.slug != null ? String(course.slug) : "",
      code: course.code || "",
      provider: providerIdForAdminForm(course, providers),
      category: course.category_slug || course.category || "",
      badge: course.badge || "",
      meta_title: course.meta_title || "",
      meta_keywords: course.meta_keywords || "",
      meta_description: course.meta_description || "",
      is_featured: !!course.is_featured,
      show_in_official_details:
        course.show_in_official_details === true ||
        course.show_in_official_details === "true",
    });
  };
  

  const buildExamDetailsPayload = (course) => {
    const resolvedSlug = basicExamForm.slug?.trim() ?? "";

    const aboutHeadingHTML = generateHeadingHTML(
        aboutHeadingText,
        aboutHeadingTag,
        aboutHeadingFontSize,
        aboutHeadingFontWeight
      );
      const pageHeadingHTML = generateHeadingHTML(
        pageHeadingText,
        pageHeadingTag || "h1",
        pageHeadingFontSize || "40",
        pageHeadingFontWeight
      );

      const examDetailsHeadingHTML = generateHeadingHTML(
        examDetailsHeadingText,
        examDetailsHeadingTag,
        examDetailsHeadingFontSize,
        examDetailsHeadingFontWeight
      );
      
      const whyMattersHeadingHTML = generateHeadingHTML(
        whyMattersHeadingText,
        whyMattersHeadingTag,
        whyMattersHeadingFontSize,
        whyMattersHeadingFontWeight
      );
      
      const whatsIncludedHeadingHTML = generateHeadingHTML(
        whatsIncludedHeadingText,
        whatsIncludedHeadingTag,
        whatsIncludedHeadingFontSize,
        whatsIncludedHeadingFontWeight
      );
      
      const topicsHeadingHTML = topicsHeadingText.trim()
        ? generateHeadingHTML(topicsHeadingText, "h2", "24", "700")
        : "";
      
      const practiceTestsHeadingHTML = generateHeadingHTML(
        practiceTestsHeadingText,
        practiceTestsHeadingTag,
        practiceTestsHeadingFontSize,
        practiceTestsHeadingFontWeight
      );
      
      const testimonialsHeadingHTML = testimonialsHeadingText.trim()
        ? generateHeadingHTML(testimonialsHeadingText, "h2", "24", "700")
        : "";
      
      const faqsHeadingHTML = generateHeadingHTML(
        faqsHeadingText,
        faqsHeadingTag,
        faqsHeadingFontSize,
        faqsHeadingFontWeight
      );
      
      const testInstructionsHeadingHTML = generateHeadingHTML(
        testInstructionsHeadingText,
        testInstructionsHeadingTag,
        testInstructionsHeadingFontSize,
        testInstructionsHeadingFontWeight
      );

      const practiceHubS1HeadingHTML = generateHeadingHTML(
        practiceHubS1HeadingText,
        practiceHubS1HeadingTag,
        practiceHubS1HeadingFontSize,
        practiceHubS1HeadingFontWeight
      );
      const practiceHubS2HeadingHTML = generateHeadingHTML(
        practiceHubS2HeadingText,
        practiceHubS2HeadingTag,
        practiceHubS2HeadingFontSize,
        practiceHubS2HeadingFontWeight
      );

    return {
      slug: resolvedSlug,
      show_in_official_details: !!basicExamForm.show_in_official_details,
      meta_title: basicExamForm.meta_title || metaTitle,
      meta_keywords: basicExamForm.meta_keywords || metaKeywords,
      meta_description: basicExamForm.meta_description || metaDescription,
      page_heading: pageHeadingHTML || "",
      about_heading: aboutHeadingHTML || "",
      exam_details_heading: examDetailsHeadingHTML || "",
      why_matters_heading: whyMattersHeadingHTML || "",
      whats_included_heading: whatsIncludedHeadingHTML || "",
      topics_heading: topicsHeadingHTML || "",
      practice_tests_heading: practiceTestsHeadingHTML || "",
      testimonials_heading: testimonialsHeadingHTML || "",
      faqs_heading: faqsHeadingHTML || "",
      test_instructions_heading: testInstructionsHeadingHTML || "",
      practice_page_section_1_heading: practiceHubS1HeadingHTML || "",
      practice_page_section_1_content: practiceHubS1Content || "",
      practice_page_section_2_heading: practiceHubS2HeadingHTML || "",
      practice_page_section_2_content: practiceHubS2Content || "",
      about,
      exam_details: examDetails,
      details: examDetails,
      test_description: testDescription,
      pass_rate: (passRate && String(passRate).trim() !== "") ? parseInt(String(passRate)) : null,
      rating: (rating && rating.toString().trim() !== "") ? parseFloat(rating) : null,
      difficulty,
      duration,
      passing_score: passingScore,
      why_matters: whyMatters,
      whats_included: whatsIncluded.filter(item => item.trim() !== ""),
      topics: topics.filter(t => t.name.trim() !== "").map(t => ({
        name: t.name,
        weight: t.weight || "",
        explanation: (t.explanation || "").trim(),
      })),
      practice_tests_list: practiceTests.filter(t => t.name.trim() !== "").map((t, idx) => ({
        id: t.id || (idx + 1).toString(),
        name: t.name,
        description: t.description || "",
        questions: parseInt(t.questions) || 0,
        difficulty: t.difficulty || "Intermediate",
        duration: t.duration || null,
        progress: t.progress || 0
      })),
      testimonials: testimonials.filter(t => t.name.trim() !== "").map(t => ({
        name: t.name,
        role: t.role,
        rating: parseInt(t.rating) || 5,
        review: t.review,
        verified: t.verified
      })),
      faqs: faqs.filter(f => f.question.trim() !== "").map(f => ({
        question: f.question,
        answer: f.answer
      })),
      test_instructions: testInstructions.filter(item => item.trim() !== "")
    };
  };

  const handleSave = async () => {
    if (!selectedCourse) {
      setMessage("âŒ Please select a course first");
      return;
    }

    if (!basicExamForm.slug?.trim()) {
      setMessage("Please enter exam slug");
      return;
    }

    if (!checkAuth()) {
      setMessage("âŒ Please log in again.");
      setTimeout(() => router.push("/admin/auth"), 2000);
      return;
    }

    setLoading(true);
    try {
      const payload = buildExamDetailsPayload(selectedCourse);
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/${selectedCourse.id}/update/`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        setMessage("âŒ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setMessage("Exam details updated successfully!");

        const savedSlug = payload.slug || basicExamForm.slug?.trim() || "";
        const returnedCourse =
          (data?.data && typeof data.data === "object" && data.data) ||
          (data?.course && typeof data.course === "object" && data.course) ||
          null;

        const mergedCourse = {
          ...selectedCourse,
          ...(returnedCourse || {}),
          slug: returnedCourse?.slug ?? savedSlug,
        };

        setSelectedCourse(mergedCourse);
        setBasicExamForm((prev) => ({
          ...prev,
          slug: mergedCourse.slug != null ? String(mergedCourse.slug) : savedSlug,
        }));

        setCourses((prev) =>
          prev
            .map((c) =>
              c.id === selectedCourse.id ? { ...c, ...mergedCourse } : c
            )
            .filter(belongsInExamDetailsManager)
        );

        loadCourseDetails(
          {
            ...mergedCourse,
            slug: mergedCourse.slug ?? savedSlug,
            about: payload.about ?? about,
            page_heading: payload.page_heading,
            topics: payload.topics,
            testimonials: payload.testimonials,
            faqs: payload.faqs,
            meta_title: payload.meta_title,
            meta_keywords: payload.meta_keywords,
            meta_description: payload.meta_description,
          },
          false
        );

        handleCloseEdit();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`âŒ Error: ${data.error || "Failed to update"}`);
      }
    } catch (error) {
      setMessage(`âŒ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for list management
  const addWhatsIncluded = () => setWhatsIncluded([...whatsIncluded, ""]);
  const removeWhatsIncluded = (index) => setWhatsIncluded(whatsIncluded.filter((_, i) => i !== index));
  const updateWhatsIncluded = (index, value) => {
    const updated = [...whatsIncluded];
    updated[index] = value;
    setWhatsIncluded(updated);
  };

  const addTopic = () => setTopics([...topics, { name: "", weight: "", explanation: "" }]);
  const removeTopic = (index) => setTopics(topics.filter((_, i) => i !== index));
  const updateTopic = (index, field, value) => {
    const updated = [...topics];
    updated[index][field] = value;
    setTopics(updated);
  };

  const addPracticeTest = () => setPracticeTests([...practiceTests, {
    name: "",
    questions: "",
    difficulty: "Intermediate",
    duration: "",
    description: ""
  }]);
  const removePracticeTest = (index) => setPracticeTests(practiceTests.filter((_, i) => i !== index));
  const updatePracticeTest = (index, field, value) => {
    const updated = [...practiceTests];
    updated[index][field] = value;
    setPracticeTests(updated);
  };

  const addTestimonial = () => setTestimonials([...testimonials, { name: "", role: "", rating: 5, review: "", verified: false }]);
  const removeTestimonial = (index) => setTestimonials(testimonials.filter((_, i) => i !== index));
  const updateTestimonial = (index, field, value) => {
    const updated = [...testimonials];
    updated[index][field] = value;
    setTestimonials(updated);
  };

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (index) => setFaqs(faqs.filter((_, i) => i !== index));
  const updateFaq = (index, field, value) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const addOfficialFaq = () =>
    setOfficialDetailsFaqs([...officialDetailsFaqs, { question: "", answer: "" }]);
  const removeOfficialFaq = (index) =>
    setOfficialDetailsFaqs(officialDetailsFaqs.filter((_, i) => i !== index));
  const updateOfficialFaq = (index, field, value) => {
    const updated = [...officialDetailsFaqs];
    updated[index][field] = value;
    setOfficialDetailsFaqs(updated);
  };

  const addTestInstruction = () => setTestInstructions([...testInstructions, ""]);
  const removeTestInstruction = (index) => setTestInstructions(testInstructions.filter((_, i) => i !== index));
  const updateTestInstruction = (index, value) => {
    const updated = [...testInstructions];
    updated[index] = value;
    setTestInstructions(updated);
  };

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((course) => {
      const title = String(course.title || "").toLowerCase();
      const code = String(course.code || "").toLowerCase();
      const provider = String(course.provider || "").toLowerCase();
      const category = String(course.category || "").toLowerCase();
      const slug = String(course.slug || "").toLowerCase();
      return (
        title.includes(query) ||
        code.includes(query) ||
        provider.includes(query) ||
        category.includes(query) ||
        slug.includes(query)
      );
    });
  }, [courses, searchQuery]);

  useEffect(() => {
    setListPage(1);
  }, [searchQuery]);

  const paginatedCourses = useMemo(
    () => getListPaginationSlice(filteredCourses, listPage, ADMIN_TABLE_PAGE_SIZE),
    [filteredCourses, listPage]
  );

  const handleAddExam = async (e) => {
    e.preventDefault();
    const { name, category } = newExamForm;
    if (!name?.trim()) {
      setMessage("Please enter exam name");
      return;
    }
    if (!category) {
      setMessage("Please select a category");
      return;
    }
    if (!newExamForm.slug?.trim()) {
      setMessage("Please enter exam slug");
      return;
    }

    setAddingExam(true);
    try {
      const slug = newExamForm.slug.trim();

      const res = await fetch(`${API_BASE_URL}/api/courses/admin/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          provider: newExamForm.provider || null,
          title: name.trim(),
          code: resolveCourseCodeForSave(newExamForm.code, slug),
          slug,
          category,
          badge: newExamForm.badge || "",
          actual_price: 0,
          offer_price: 0,
          meta_title: newExamForm.meta_title || "",
          meta_keywords: newExamForm.meta_keywords || "",
          meta_description: newExamForm.meta_description || "",
          is_featured: !!newExamForm.is_featured,
          show_in_official_details: !!newExamForm.show_in_official_details,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const fieldError =
          data?.errors?.slug?.[0] ||
          data?.errors?.code?.[0] ||
          data?.errors?.title?.[0];
        throw new Error(
          data?.error || data?.message || fieldError || "Failed to create exam"
        );
      }

      const created = data.data || data;
      const createdForList = { ...created };
      setCourses((prev) =>
        belongsInExamDetailsManager(createdForList)
          ? [...prev, createdForList]
          : prev
      );
      setShowAddExamModal(false);
      setNewExamForm(EMPTY_EXAM_BASIC_FORM);
      setProviderDropdownOpen(false);
      setMessage("Exam added successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setAddingExam(false);
    }
  };
  const handleAddExamFromModal = async () => {
    if (addingExam) return;

    if (!basicExamForm.name?.trim()) {
      setMessage("Please enter exam name");
      return;
    }
    if (!basicExamForm.category) {
      setMessage("Please select a category");
      return;
    }
    if (!basicExamForm.slug?.trim()) {
      setMessage("Please enter exam slug");
      return;
    }

    setAddingExam(true);
    setMessage("");
    try {
      const slug = basicExamForm.slug.trim();

      const createRes = await fetch(`${API_BASE_URL}/api/courses/admin/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          provider: basicExamForm.provider || null,
          title: basicExamForm.name.trim(),
          code: resolveCourseCodeForSave(basicExamForm.code, slug),
          slug,
          category: basicExamForm.category,
          badge: basicExamForm.badge || "",
          actual_price: 0,
          offer_price: 0,
          meta_title: basicExamForm.meta_title || "",
          meta_keywords: basicExamForm.meta_keywords || "",
          meta_description: basicExamForm.meta_description || "",
          is_featured: !!basicExamForm.is_featured,
          show_in_official_details: !!basicExamForm.show_in_official_details,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        const fieldError =
          createData?.errors?.slug?.[0] ||
          createData?.errors?.code?.[0] ||
          createData?.errors?.title?.[0];
        throw new Error(
          createData?.error ||
            createData?.message ||
            fieldError ||
            "Failed to create exam"
        );
      }

      const createdCourse = createData.data || createData;
      if (!createdCourse?.id) {
        throw new Error("Created course ID not returned from API");
      }

      const payload = buildExamDetailsPayload(createdCourse);
      const updateRes = await fetch(
        `${API_BASE_URL}/api/courses/admin/${createdCourse.id}/update/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        }
      );

      const updateData = await updateRes.json();
      if (!updateRes.ok || !updateData.success) {
        throw new Error(updateData.error || "Failed to save exam content");
      }

      setShowEditModal(false);
      setSelectedCourse(null);
      setMessage("Exam created successfully");
      setCourses((prev) => {
        const savedSlug =
          createdCourse.slug != null ? String(createdCourse.slug) : slug;
        const savedCourse = {
          ...createdCourse,
          slug: savedSlug,
          show_in_official_details: !!basicExamForm.show_in_official_details,
          about: payload.about,
          page_heading: payload.page_heading,
          topics: payload.topics,
          testimonials: payload.testimonials,
          faqs: payload.faqs,
          meta_title: payload.meta_title,
        };
        return belongsInExamDetailsManager(savedCourse)
          ? [...prev, savedCourse]
          : prev;
      });
      await fetchCourses();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setAddingExam(false);
    }
  };

  const handleSaveBasicInfo = async () => {
    if (!selectedCourse?.id) return;

    if (!basicExamForm.name?.trim()) {
      setMessage("Please enter exam name");
      return;
    }
    if (!basicExamForm.category) {
      setMessage("Please select a category");
      return;
    }
    if (!basicExamForm.slug?.trim()) {
      setMessage("Please enter exam slug");
      return;
    }

    setSavingBasicInfo(true);
    try {
      const trimmedSlug = basicExamForm.slug.trim();
      const res = await fetch(
        `${API_BASE_URL}/api/courses/admin/${selectedCourse.id}/update/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            title: basicExamForm.name.trim(),
            slug: trimmedSlug,
            code: resolveCourseCodeForSave(
              basicExamForm.code,
              trimmedSlug,
              selectedCourse.code
            ),
            provider: basicExamForm.provider || null,
            category: basicExamForm.category,
            badge: basicExamForm.badge || "",
            meta_title: basicExamForm.meta_title || "",
            meta_keywords: basicExamForm.meta_keywords || "",
            meta_description: basicExamForm.meta_description || "",
            is_featured: !!basicExamForm.is_featured,
            show_in_official_details: !!basicExamForm.show_in_official_details,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        const fieldError =
          data?.errors?.slug?.[0] ||
          data?.errors?.code?.[0] ||
          data?.errors?.title?.[0];
        throw new Error(
          data?.error || data?.message || fieldError || "Failed to update exam"
        );
      }

      const updated = data.data || {
        ...selectedCourse,
        title: basicExamForm.name.trim(),
        slug: trimmedSlug,
        code: basicExamForm.code || "",
        badge: basicExamForm.badge || "",
        meta_title: basicExamForm.meta_title || "",
        meta_keywords: basicExamForm.meta_keywords || "",
        meta_description: basicExamForm.meta_description || "",
        is_featured: !!basicExamForm.is_featured,
        show_in_official_details: !!basicExamForm.show_in_official_details,
      };

      const savedSlug =
        updated.slug != null ? String(updated.slug) : trimmedSlug;

      setCourses((prev) =>
        prev
          .map((c) =>
            c.id === selectedCourse.id ? { ...c, ...updated, slug: savedSlug } : c
          )
          .filter(belongsInExamDetailsManager)
      );
      setSelectedCourse({ ...selectedCourse, ...updated, slug: savedSlug });
      setBasicExamForm((prev) => ({ ...prev, slug: savedSlug }));
      setMetaTitle(basicExamForm.meta_title || "");
      setMetaKeywords(basicExamForm.meta_keywords || "");
      setMetaDescription(basicExamForm.meta_description || "");
      setMessage("Exam basic info saved successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setSavingBasicInfo(false);
    }
  };

  const handleEditClick = async (course) => {
    setActiveEditTab("content");
    setShowEditModal(true);
    await handleSelectCourse(course);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setSelectedCourse(null);
    setActiveEditTab("content");
  };

  const handleDeleteCourse = async (course) => {
    if (!course?.id) return;

    const linkedToOfficialDetails =
      isOfficialDetailsCourse(course) || hasOfficialDetailsData(course);
    const confirmMessage = linkedToOfficialDetails
      ? `Remove exam details for "${course.title || course.code}"? Official details will not be affected.`
      : `Delete exam "${course.title || course.code}"? This cannot be undone.`;

    const ok = window.confirm(confirmMessage);
    if (!ok) return;

    if (!checkAuth()) {
      setMessage("Authentication failed. Please log in again.");
      setTimeout(() => router.push("/admin/auth"), 2000);
      return;
    }

    try {
      if (linkedToOfficialDetails) {
        const res = await fetch(
          `${API_BASE_URL}/api/courses/admin/${course.id}/update/`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...EMPTY_EXAM_DETAILS_PAYLOAD,
              clear_exam_details: true,
            }),
          }
        );

        if (res.status === 401) {
          setMessage("Authentication failed. Please log in again.");
          setTimeout(() => router.push("/admin/auth"), 2000);
          return;
        }

        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.success === false) {
          setMessage(`Error: ${data?.error || "Failed to remove exam details"}`);
          return;
        }

        await fetchCourses();
        if (selectedCourse?.id === course.id) {
          handleCloseEdit();
        }
        setMessage("Exam details removed successfully. Official details were not changed.");
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/courses/admin/${course.id}/delete/`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (res.status === 401) {
        setMessage("Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        setMessage(`Error: ${data?.error || "Failed to delete exam"}`);
        return;
      }

      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      if (selectedCourse?.id === course.id) {
        handleCloseEdit();
      }
      setMessage("Exam deleted successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0C1A35] mb-2">Exam Details Manager</h1>
        <p className="text-[#0C1A35]/60">Manage detailed information for exam details pages</p>
      </div>

      {/* SEO Meta Information Card */}
      <Card className="mb-6 border border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl text-[#0C1A35]">SEO Meta Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="seo_meta_title">Meta Title</Label>
            <Input
              id="seo_meta_title"
              value={seoData.meta_title}
              onChange={(e) => setSeoData({ ...seoData, meta_title: e.target.value })}
              placeholder="Enter meta title (50-60 characters recommended)"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Appears in search engine results</p>
          </div>
          <div>
            <Label htmlFor="seo_meta_keywords">Meta Keywords</Label>
            <Input
              id="seo_meta_keywords"
              value={seoData.meta_keywords}
              onChange={(e) => setSeoData({ ...seoData, meta_keywords: e.target.value })}
              placeholder="Enter meta keywords (comma-separated)"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
          </div>
          <div>
            <Label htmlFor="seo_meta_description">Meta Description</Label>
            <Textarea
              id="seo_meta_description"
              value={seoData.meta_description}
              onChange={(e) => setSeoData({ ...seoData, meta_description: e.target.value })}
              placeholder="Enter meta description (150-160 characters recommended)"
              className="mt-1"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Brief description for search engines</p>
          </div>
          {seoMessage && (
            <div className={`p-3 rounded-lg ${seoMessage.includes("âœ…") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {seoMessage}
            </div>
          )}
          <Button
            onClick={handleSaveSeo}
            disabled={seoLoading}
            className="w-fit"
          >
            {seoLoading ? "Saving..." : "Save SEO Meta Information"}
          </Button>
        </CardContent>
      </Card>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.toLowerCase().includes("error") ||
            message.includes("failed") ||
            message.includes("Authentication")
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Exams</CardTitle>
            <Button
              onClick={() => {
                setSelectedCourse({
                  id: null,
                  title: "",
                  code: "",
                  provider: "",
                  category: "",
                  slug: "",
                });

                setBasicExamForm(EMPTY_EXAM_BASIC_FORM);

                setAbout("");
                setPageHeadingText("");

                setFaqs([]);
                setTopics([]);
                setTestimonials([]);

                setTopicsHeadingText("");
                setTestimonialsHeadingText("");

                setActiveEditTab("content");
                setShowEditModal(true);
              }}
              className="bg-[#1A73E8] hover:bg-[#1557B0]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Exam
            </Button>
          </div>
          <div className="relative mt-3">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0C1A35]/40" aria-hidden />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, code, provider, category, or slug..."
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>URL Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coursesLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-[#0C1A35]/60 py-8">
                    Loading exams...
                  </TableCell>
                </TableRow>
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-[#0C1A35]/60 py-8">
                    No exams found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCourses.items.map((course) => {
                  const hasData = courseHasExamDetails(course);
                  return (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium text-[#0C1A35]">{course.title}</TableCell>
                      <TableCell>{course.code || "-"}</TableCell>
                      <TableCell>{course.provider || "-"}</TableCell>
                      <TableCell>{course.category || "-"}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          {getPublicPageUrlFromSlug(course.slug || "")}
                        </code>
                      </TableCell>
                      <TableCell>
                        {hasData ? (
                          <Badge className="bg-green-100 text-green-700 border-0">Has Data</Badge>
                        ) : (
                          <Badge variant="secondary">Empty</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2 justify-end">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEditClick(course)}
                            title="Edit exam details"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeleteCourse(course)}
                            title="Delete exam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <AdminTablePagination
            currentPage={paginatedCourses.page}
            totalPages={paginatedCourses.totalPages}
            totalItems={paginatedCourses.totalItems}
            onPageChange={setListPage}
            itemLabel="exams"
          />
        </CardContent>
      </Card>

      <Dialog
        open={showEditModal}
        onOpenChange={(open) => {
          if (!open) handleCloseEdit();
          else setShowEditModal(true);
        }}
      >
        <DialogContent className="!w-[96vw] !max-w-[1200px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#0C1A35]">
              {selectedCourse?.id
                ? `Edit: ${selectedCourse.title}`
                : "Add New Exam"}
            </DialogTitle>
            {selectedCourse && (
              <p className="text-sm text-[#0C1A35]/60">
                {selectedCourse.code}
                {selectedCourse.provider ? ` · ${selectedCourse.provider}` : ""}
              </p>
            )}
          </DialogHeader>

          {selectedCourse && (
            <>
              <Tabs
                value={activeEditTab}
                onValueChange={setActiveEditTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  {/* <TabsTrigger value="basic">Basic Info</TabsTrigger> */}
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                  <TabsTrigger value="topics">Topics Covered</TabsTrigger>
                </TabsList>

                {/* <TabsContent value="basic" className="space-y-4 mt-4">
                  <ExamBasicFormFields
                    form={basicExamForm}
                    setForm={setBasicExamForm}
                    categories={categories}
                    providers={providers}
                    providerDropdownOpen={basicProviderDropdownOpen}
                    setProviderDropdownOpen={setBasicProviderDropdownOpen}
                    idPrefix="edit"
                  />
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={handleSaveBasicInfo}
                      disabled={savingBasicInfo}
                      className="bg-[#1A73E8] hover:bg-[#1557B0]"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {savingBasicInfo ? "Saving..." : "Save Basic Info"}
                    </Button>
                  </div>
                </TabsContent> */}

                <TabsContent value="content" className="space-y-4 mt-4">
                  <ExamBasicFormFields
                    form={basicExamForm}
                    setForm={setBasicExamForm}
                    categories={categories}
                    providers={providers}
                    providerDropdownOpen={basicProviderDropdownOpen}
                    setProviderDropdownOpen={setBasicProviderDropdownOpen}
                    idPrefix="edit"
                  />
                  <div>
                    <Label htmlFor="exam_page_title">Page Title</Label>
                    <Input
                      id="exam_page_title"
                      value={pageHeadingText}
                      onChange={(e) => setPageHeadingText(e.target.value)}
                      placeholder="Main heading shown on the exam page"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <div className="mt-2">
                      <TipTapEditor
                        key={`exam-content-${selectedCourse.id}`}
                        content={about || ""}
                        onChange={(html) => setAbout(html)}
                        placeholder="Exam page main content..."
                        className="min-h-[200px]"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 border rounded-lg p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <Label>FAQs</Label>
                      <Button size="sm" type="button" onClick={addFaq}>
                        <Plus className="w-4 h-4 mr-1" /> Add FAQ
                      </Button>
                    </div>
                    {faqs.map((faq, index) => (
                      <Card key={`faq-${index}`} className="p-4 bg-white">
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              value={faq.question}
                              onChange={(e) => updateFaq(index, "question", e.target.value)}
                              placeholder="Question"
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              type="button"
                              variant="destructive"
                              onClick={() => removeFaq(index)}
                              title="Remove FAQ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-600 mb-1 block">Answer</Label>
                            <Textarea
                              value={faq.answer || ""}
                              onChange={(e) => updateFaq(index, "answer", e.target.value)}
                              placeholder="Enter FAQ answer"
                              rows={4}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="testimonials" className="space-y-4 mt-4">
                  <HeadingInput
                    label="Testimonials Heading"
                    text={testimonialsHeadingText}
                    setText={setTestimonialsHeadingText}
                    tag={testimonialsHeadingTag}
                    setTag={setTestimonialsHeadingTag}
                    fontSize={testimonialsHeadingFontSize}
                    setFontSize={setTestimonialsHeadingFontSize}
                    fontWeight={testimonialsHeadingFontWeight}
                    setFontWeight={setTestimonialsHeadingFontWeight}
                    placeholder="Student Success Stories"
                  />
                  
                  <div className="flex items-center justify-between mb-2">
                    <Label>Testimonials</Label>
                    <Button size="sm" onClick={addTestimonial}>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                  {testimonials.map((testimonial, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={testimonial.name}
                            onChange={(e) => updateTestimonial(index, "name", e.target.value)}
                            placeholder="Name"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeTestimonial(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Input
                          value={testimonial.role}
                          onChange={(e) => updateTestimonial(index, "role", e.target.value)}
                          placeholder="Role/Title"
                        />
                        <div className="flex gap-2 items-center">
                          <Label className="text-sm">Rating:</Label>
                          <Select
                            value={testimonial.rating.toString()}
                            onValueChange={(value) => updateTestimonial(index, "rating", parseInt(value))}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((r) => (
                                <SelectItem key={r} value={r.toString()}>{r} stars</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <label className="flex items-center gap-2 ml-auto">
                            <input
                              type="checkbox"
                              checked={testimonial.verified}
                              onChange={(e) => updateTestimonial(index, "verified", e.target.checked)}
                            />
                            <span className="text-sm">Verified</span>
                          </label>
                        </div>
                        <Textarea
                          value={testimonial.review}
                          onChange={(e) => updateTestimonial(index, "review", e.target.value)}
                          placeholder="Review text..."
                          rows={3}
                        />
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="topics" className="space-y-6 mt-4">
                  <div>
                    <Label>Section title (optional)</Label>
                    <Input
                      value={topicsHeadingText}
                      onChange={(e) => setTopicsHeadingText(e.target.value)}
                      placeholder="Topics Covered"
                      className="mt-2"
                    />
                    <p className="text-xs text-[#0C1A35]/60 mt-1">
                      Shown on exam and practice pages. Defaults to &quot;Topics Covered&quot; if empty.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Topics</Label>
                      <Button size="sm" onClick={addTopic}>
                        <Plus className="w-4 h-4 mr-1" /> Add Topic
                      </Button>
                    </div>
                    <p className="text-xs text-[#0C1A35]/60 mb-3">
                      Enter topic name and percentage (e.g. 20, 20%, 10-20, 11-20%).
                    </p>
                    {topics.map((topic, index) => (
                      <Card key={index} className="p-4 mb-3 border border-gray-200">
                        <div className="flex gap-2 mb-3">
                          <Input
                            value={topic.name}
                            onChange={(e) => updateTopic(index, "name", e.target.value)}
                            placeholder="Topic name"
                            className="flex-1"
                          />
                          <Input
                            type="text"
                            value={topic.weight}
                            onChange={(e) => updateTopic(index, "weight", e.target.value)}
                            placeholder="Percentage"
                            className="w-40 shrink-0"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="shrink-0"
                            onClick={() => removeTopic(index)}
                            disabled={topics.length === 1 && !topic.name && !topic.weight}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Label className="text-xs text-gray-600 mb-1 block">
                          Explanation (optional)
                        </Label>
                        <Textarea
                          value={topic.explanation || ""}
                          onChange={(e) => updateTopic(index, "explanation", e.target.value)}
                          placeholder="Describe what this topic covers…"
                          rows={3}
                          className="text-sm resize-y min-h-[72px]"
                        />
                      </Card>
                    ))}
                  </div>
                </TabsContent>

              </Tabs>

              <div className="mt-6 flex gap-3 pt-4 border-t">
                <Button
                  onClick={async () => {
                    if (!selectedCourse?.id) {
                      await handleAddExamFromModal();
                      return;
                    }

                    if (!basicExamForm.slug?.trim()) {
                      setMessage("Please enter exam slug");
                      return;
                    }

                    await handleSaveBasicInfo();
                    await handleSave();
                  }}
                  disabled={loading || savingBasicInfo || addingExam}
                  className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading || addingExam
                    ? "Saving..."
                    : selectedCourse?.id
                      ? "Save Changes"
                      : "Add Exam"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseEdit}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAddExamModal}
        onOpenChange={(open) => {
          setShowAddExamModal(open);
          if (!open) {
            setNewExamForm(EMPTY_EXAM_BASIC_FORM);
            setProviderDropdownOpen(false);
          }
        }}
      >
        <DialogContent className="!w-[96vw] !max-w-[900px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#0C1A35]">Add New Exam</DialogTitle>
            <p className="text-sm text-[#0C1A35]/60">
              Create a new exam with category, provider, and SEO fields.
            </p>
          </DialogHeader>
          <form onSubmit={handleAddExam} className="space-y-4">
            <ExamBasicFormFields
              form={newExamForm}
              setForm={setNewExamForm}
              categories={categories}
              providers={providers}
              providerDropdownOpen={providerDropdownOpen}
              setProviderDropdownOpen={setProviderDropdownOpen}
              idPrefix="add"
            />
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={addingExam}
                className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]"
              >
                {addingExam ? "Adding..." : "Add Exam"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddExamModal(false);
                  setNewExamForm(EMPTY_EXAM_BASIC_FORM);
                  setProviderDropdownOpen(false);
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
  );
}









// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Plus, Edit, Trash2, Save, X, SearchIcon } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { checkAuth, getAuthHeaders } from "@/utils/authCheck";
// import TipTapEditor from "@/components/editor/TipTapEditor";
// import { normalizeOfficialDetailsUrlSlug } from "@/app/exams/[provider]/[examCode]/examInfoUtils";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// export default function ExamDetailsManager() {
//   const router = useRouter();
//   const [courses, setCourses] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [activeEditTab, setActiveEditTab] = useState("content");
//   const [examSlug, setExamSlug] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
  
//   // SEO states
//   const [seoLoading, setSeoLoading] = useState(false);
//   const [seoMessage, setSeoMessage] = useState("");
//   const [seoData, setSeoData] = useState({
//     meta_title: "",
//     meta_keywords: "",
//     meta_description: "",
//   });

//   // Form states for exam details
//   const [aboutHeading, setAboutHeading] = useState("");
//   const [aboutHeadingText, setAboutHeadingText] = useState("");
//   const [aboutHeadingTag, setAboutHeadingTag] = useState("h2");
//   const [aboutHeadingFontSize, setAboutHeadingFontSize] = useState("24");
//   const [aboutHeadingFontWeight, setAboutHeadingFontWeight] = useState("700");
//   const [pageHeadingText, setPageHeadingText] = useState("");
//   const [pageHeadingTag, setPageHeadingTag] = useState("h1");
//   const [pageHeadingFontSize, setPageHeadingFontSize] = useState("40");
//   const [pageHeadingFontWeight, setPageHeadingFontWeight] = useState("700");
//   const [examDetailsHeadingText, setExamDetailsHeadingText] = useState("");
//   const [examDetailsHeadingTag, setExamDetailsHeadingTag] = useState("h2");
//   const [examDetailsHeadingFontSize, setExamDetailsHeadingFontSize] = useState("24");
//   const [examDetailsHeadingFontWeight, setExamDetailsHeadingFontWeight] = useState("700");
  
//   // âœ… ADD THIS (you missed this)
//   const [whyMattersHeadingText, setWhyMattersHeadingText] = useState("");
//   const [whyMattersHeadingTag, setWhyMattersHeadingTag] = useState("h2");
//   const [whyMattersHeadingFontSize, setWhyMattersHeadingFontSize] = useState("24");
//   const [whyMattersHeadingFontWeight, setWhyMattersHeadingFontWeight] = useState("700");
  
//   // What's Included Heading
//   const [whatsIncludedHeadingText, setWhatsIncludedHeadingText] = useState("");
//   const [whatsIncludedHeadingTag, setWhatsIncludedHeadingTag] = useState("h2");
//   const [whatsIncludedHeadingFontSize, setWhatsIncludedHeadingFontSize] = useState("24");
//   const [whatsIncludedHeadingFontWeight, setWhatsIncludedHeadingFontWeight] = useState("700");
  
//   // Topics Covered Heading
//   const [topicsHeadingText, setTopicsHeadingText] = useState("");
//   const [topicsHeadingTag, setTopicsHeadingTag] = useState("h2");
//   const [topicsHeadingFontSize, setTopicsHeadingFontSize] = useState("24");
//   const [topicsHeadingFontWeight, setTopicsHeadingFontWeight] = useState("700");
  
//   // Practice Tests Heading
//   const [practiceTestsHeadingText, setPracticeTestsHeadingText] = useState("");
//   const [practiceTestsHeadingTag, setPracticeTestsHeadingTag] = useState("h2");
//   const [practiceTestsHeadingFontSize, setPracticeTestsHeadingFontSize] = useState("24");
//   const [practiceTestsHeadingFontWeight, setPracticeTestsHeadingFontWeight] = useState("700");
  
//   // Testimonials Heading
//   const [testimonialsHeadingText, setTestimonialsHeadingText] = useState("");
//   const [testimonialsHeadingTag, setTestimonialsHeadingTag] = useState("h2");
//   const [testimonialsHeadingFontSize, setTestimonialsHeadingFontSize] = useState("24");
//   const [testimonialsHeadingFontWeight, setTestimonialsHeadingFontWeight] = useState("700");
  
//   // FAQs Heading
//   const [faqsHeadingText, setFaqsHeadingText] = useState("");
//   const [faqsHeadingTag, setFaqsHeadingTag] = useState("h2");
//   const [faqsHeadingFontSize, setFaqsHeadingFontSize] = useState("24");
//   const [faqsHeadingFontWeight, setFaqsHeadingFontWeight] = useState("700");
  
//   // Test Instructions Heading
//   const [testInstructionsHeadingText, setTestInstructionsHeadingText] = useState("");
//   const [testInstructionsHeadingTag, setTestInstructionsHeadingTag] = useState("h2");
//   const [testInstructionsHeadingFontSize, setTestInstructionsHeadingFontSize] = useState("24");
//   const [testInstructionsHeadingFontWeight, setTestInstructionsHeadingFontWeight] = useState("700");

//   // Practice hub page (/slug/practice) â€” two optional sections below the test list
//   const [practiceHubS1HeadingText, setPracticeHubS1HeadingText] = useState("");
//   const [practiceHubS1HeadingTag, setPracticeHubS1HeadingTag] = useState("h2");
//   const [practiceHubS1HeadingFontSize, setPracticeHubS1HeadingFontSize] = useState("24");
//   const [practiceHubS1HeadingFontWeight, setPracticeHubS1HeadingFontWeight] = useState("700");
//   const [practiceHubS1Content, setPracticeHubS1Content] = useState("");
//   const [practiceHubS2HeadingText, setPracticeHubS2HeadingText] = useState("");
//   const [practiceHubS2HeadingTag, setPracticeHubS2HeadingTag] = useState("h2");
//   const [practiceHubS2HeadingFontSize, setPracticeHubS2HeadingFontSize] = useState("24");
//   const [practiceHubS2HeadingFontWeight, setPracticeHubS2HeadingFontWeight] = useState("700");
//   const [practiceHubS2Content, setPracticeHubS2Content] = useState("");
  
//   const [about, setAbout] = useState("");
//   const [examDetails, setExamDetails] = useState("");
//   const [testDescription, setTestDescription] = useState("");
//   const [passRate, setPassRate] = useState("");
//   const [rating, setRating] = useState("");
//   const [difficulty, setDifficulty] = useState("");
//   const [duration, setDuration] = useState("");
//   const [passingScore, setPassingScore] = useState("");
//   const [whyMatters, setWhyMatters] = useState("");

//   // List fields
//   const [whatsIncluded, setWhatsIncluded] = useState([""]);
//   const [topics, setTopics] = useState([{ name: "", weight: "", explanation: "" }]);
//   const [practiceTests, setPracticeTests] = useState([{ 
//     name: "", 
//     questions: "", 
//     difficulty: "", 
//     duration: "",
//     description: ""
//   }]);
//   const [testimonials, setTestimonials] = useState([{ name: "", role: "", rating: 5, review: "", verified: false }]);
//   const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
//   const [testInstructions, setTestInstructions] = useState([""]);

//   // Per-course SEO states
//   const [metaTitle, setMetaTitle] = useState("");
//   const [metaKeywords, setMetaKeywords] = useState("");
//   const [metaDescription, setMetaDescription] = useState("");

//   // Official details page (separate from main exam SEO)
//   const [officialDetailsContent, setOfficialDetailsContent] = useState("");
//   const [officialDetailsMetaTitle, setOfficialDetailsMetaTitle] = useState("");
//   const [officialDetailsMetaKeywords, setOfficialDetailsMetaKeywords] = useState("");
//   const [officialDetailsMetaDescription, setOfficialDetailsMetaDescription] = useState("");
//   const [officialDetailsUrlSlug, setOfficialDetailsUrlSlug] = useState("");
//   const [officialDetailsFaqs, setOfficialDetailsFaqs] = useState([
//     { question: "", answer: "" },
//   ]);
//   const [officialExamSearch, setOfficialExamSearch] = useState("");

//   const filteredCoursesForOfficial = useMemo(() => {
//     const q = officialExamSearch.trim().toLowerCase();
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
//   }, [courses, officialExamSearch]);

//   // Reusable Heading Component Function
//   const HeadingInput = ({ 
//     label, 
//     text, 
//     setText, 
//     tag, 
//     setTag, 
//     fontSize, 
//     setFontSize, 
//     fontWeight, 
//     setFontWeight,
//     placeholder = "Heading"
//   }) => (
//     <div>
//       <Label>{label}</Label>
//       <div className="space-y-3 mt-2">
//         <Input
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder={placeholder}
//         />
//         <div className="grid grid-cols-3 gap-3">
//           {/* <div>
//             <Label className="text-xs text-gray-600">Heading Tag</Label>
//             <Select value={tag || "h2"} onValueChange={(value) => setTag(value)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select tag" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="h1">H1</SelectItem>
//                 <SelectItem value="h2">H2</SelectItem>
//                 <SelectItem value="h3">H3</SelectItem>
//                 <SelectItem value="h4">H4</SelectItem>
//                 <SelectItem value="h5">H5</SelectItem>
//                 <SelectItem value="h6">H6</SelectItem>
//               </SelectContent>
//             </Select>
//           </div> */}
//           {/* <div>
//             <Label className="text-xs text-gray-600">Font Size (px)</Label>
//             <Select value={String(fontSize || "24")} onValueChange={(value) => setFontSize(value)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select size" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="12">12px</SelectItem>
//                 <SelectItem value="14">14px</SelectItem>
//                 <SelectItem value="16">16px</SelectItem>
//                 <SelectItem value="18">18px</SelectItem>
//                 <SelectItem value="20">20px</SelectItem>
//                 <SelectItem value="22">22px</SelectItem>
//                 <SelectItem value="24">24px</SelectItem>
//                 <SelectItem value="28">28px</SelectItem>
//                 <SelectItem value="32">32px</SelectItem>
//                 <SelectItem value="36">36px</SelectItem>
//                 <SelectItem value="40">40px</SelectItem>
//                 <SelectItem value="48">48px</SelectItem>
//               </SelectContent>
//             </Select>
//           </div> */}
//           {/* <div>
//             <Label className="text-xs text-gray-600">Font Weight</Label>
//             <Select value={String(fontWeight || "700")} onValueChange={(value) => setFontWeight(value)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select weight" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="normal">Normal</SelectItem>
//                 <SelectItem value="400">Regular (400)</SelectItem>
//                 <SelectItem value="500">Medium (500)</SelectItem>
//                 <SelectItem value="600">Semibold (600)</SelectItem>
//                 <SelectItem value="700">Bold (700)</SelectItem>
//                 <SelectItem value="800">Extra Bold (800)</SelectItem>
//               </SelectContent>
//             </Select>
//           </div> */}
//         </div>
//       </div>
//     </div>
//   );

//   // Function to escape HTML special characters
//   const escapeHTML = (str) => {
//     if (!str) return "";
//     return str
//       .replace(/&/g, "&amp;")
//       .replace(/</g, "&lt;")
//       .replace(/>/g, "&gt;")
//       .replace(/"/g, "&quot;")
//       .replace(/'/g, "&#039;");
//   };

//   // Function to generate heading HTML from components
//   const generateHeadingHTML = (text, tag, fontSize, fontWeight) => {
//     const Tag = tag || "h2";
//     const size = fontSize || "24";
//     const weight = fontWeight || "700";
//     const escapedText = escapeHTML(text || "");
//     return `<${Tag} style="font-size: ${size}px; font-weight: ${weight};">${escapedText}</${Tag}>`;
//   };

//   // Function to parse heading HTML and extract components
//   const parseHeadingHTML = (html, defaultText = "About This Exam") => {
//     if (!html) {
//       return {
//         text: defaultText,
//         tag: "h2",
//         fontSize: "24",
//         fontWeight: "700"
//       };
//     }

//     // Check if it's plain text (doesn't contain HTML tags)
//     if (!html.includes("<") || !html.includes(">")) {
//       return {
//         text: html,
//         tag: "h2",
//         fontSize: "24",
//         fontWeight: "700"
//       };
//     }

//     // Try to parse HTML
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(html, "text/html");
//     const element = doc.body.firstElementChild;

//     if (!element || !element.tagName) {
//       return {
//         text: html.replace(/<[^>]*>/g, ""), // Strip HTML tags if any
//         tag: "h2",
//         fontSize: "24",
//         fontWeight: "700"
//       };
//     }

//     const tag = element.tagName.toLowerCase();
//     const text = element.textContent || element.innerText || "";
//     const style = element.getAttribute("style") || "";
    
//     // Extract font-size
//     const fontSizeMatch = style.match(/font-size:\s*(\d+)px/);
//     const fontSize = fontSizeMatch ? fontSizeMatch[1] : "24";

//     // Extract font-weight (can be numeric or text)
//     const fontWeightMatch = style.match(/font-weight:\s*([\w\d]+)/);
//     let fontWeight = fontWeightMatch ? fontWeightMatch[1] : "700";
    
//     // Convert text values to numeric equivalents for consistency
//     if (fontWeight === "bold") {
//       fontWeight = "700";
//     } else if (fontWeight === "normal") {
//       fontWeight = "normal";
//     } else if (fontWeight === "semibold" || fontWeight === "semi-bold") {
//       fontWeight = "600";
//     }

//     // Ensure all values are strings for Select components
//     return { 
//       text: String(text || defaultText), 
//       tag: String(tag || "h2"), 
//       fontSize: String(fontSize || "24"), 
//       fontWeight: String(fontWeight || "700")
//     };
//   };

//   useEffect(() => {
//     // Check authentication
//     if (!checkAuth()) {
//       setMessage("âŒ Authentication failed. Please log in as admin.");
//       setTimeout(() => {
//         router.push("/admin/auth");
//       }, 2000);
//       return;
//     }
    
//     fetchCourses();
//     fetchSeoData();
//   }, []);

//   // Fetch SEO Data
//   const fetchSeoData = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/home/admin/exam-details-seo/`, {
//         headers: getAuthHeaders(),
//       });
//       if (res.status === 401 || res.status === 404 || !res.ok) {
//         return;
//       }
//       const data = await res.json();
//       if (data.success && data.data) {
//         setSeoData({
//           meta_title: data.data.meta_title || "",
//           meta_keywords: data.data.meta_keywords || "",
//           meta_description: data.data.meta_description || "",
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching SEO data:", error);
//     }
//   };

//   // Save SEO Data
//   const handleSaveSeo = async () => {
//     setSeoLoading(true);
//     setSeoMessage("");
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/home/admin/exam-details-seo/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...getAuthHeaders(),
//         },
//         body: JSON.stringify(seoData),
//       });
//       if (res.status === 401) {
//         setSeoMessage("âŒ Authentication failed. Please log in again.");
//         setTimeout(() => router.push("/admin/auth"), 2000);
//         setSeoLoading(false);
//         return;
//       }
//       if (res.status === 404) {
//         setSeoMessage("âŒ API endpoint not found.");
//         setSeoLoading(false);
//         return;
//       }
//       if (!res.ok) {
//         setSeoMessage("âŒ Error: " + res.statusText);
//         setSeoLoading(false);
//         return;
//       }
//       const data = await res.json();
//       if (data.success) {
//         setSeoMessage("âœ… SEO meta information saved successfully!");
//         setTimeout(() => setSeoMessage(""), 3000);
//       } else {
//         setSeoMessage("âŒ Error: " + (data.error || "Failed to save"));
//       }
//     } catch (error) {
//       setSeoMessage("âŒ Error: " + error.message);
//     } finally {
//       setSeoLoading(false);
//     }
//   };

//   const fetchCourses = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/courses/admin/list/`, {
//         headers: getAuthHeaders()
//       });

//       if (res.status === 401) {
//         setMessage("âŒ Authentication failed. Please log in again.");
//         setTimeout(() => router.push("/admin/auth"), 2000);
//         return;
//       }

//       const data = await res.json();

//       if (data.success) {
//         setCourses(data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching courses:", error);
//       setMessage("âŒ Error loading courses. Check console for details.");
//     }
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
//     const codePart = course?.code || course?.exam_code || course?.examCode;
//     const examSlug =
//       course?.exam_slug ||
//       course?.examSlug ||
//       course?.slug ||
//       (providerPart && codePart
//         ? `${String(providerPart).toLowerCase()}-${String(codePart).toLowerCase()}`
//             .replace(/\s+/g, "-")
//             .replace(/-+/g, "-")
//         : null);

//     const candidateUrls = [
//       `${API_BASE_URL}/api/courses/admin/${courseId}/`,
//       `${API_BASE_URL}/api/courses/admin/${courseId}/detail/`,
//       ...(examSlug ? [`${API_BASE_URL}/api/courses/exams/${examSlug}/`] : []),
//     ];

//     for (const url of candidateUrls) {
//       try {
//         const res = await fetch(url, {
//           headers: getAuthHeaders(),
//         });

//         if (!res.ok) continue;
//         const data = await res.json();

//         if (data?.success && data?.data && typeof data.data === "object") {
//           return data.data;
//         }

//         if (data && typeof data === "object" && (data.id || data.code || data.title)) {
//           return data;
//         }
//       } catch (error) {
//         // Try next endpoint
//       }
//     }

//     return null;
//   };

//   const handleSelectCourse = async (course) => {
//     // Quick immediate load from list item
//     loadCourseDetails(course, false);

//     // Then hydrate with full API details if available
//     const fullCourse = await fetchCourseFullDetails(course);
//     if (fullCourse) {
//       loadCourseDetails({ ...course, ...fullCourse }, false);
//     }
//   };

//   const loadCourseDetails = (course, showMessage = true) => {
//     setSelectedCourse(course);
    
//     // Load About heading
//     const aboutHeadingData = parseHeadingHTML(course.about_heading || "");
//     setAboutHeading(course.about_heading || "");
//     setAboutHeadingText(aboutHeadingData.text);
//     setAboutHeadingTag(aboutHeadingData.tag);
//     setAboutHeadingFontSize(aboutHeadingData.fontSize);
//     setAboutHeadingFontWeight(aboutHeadingData.fontWeight);

//     // Load page H1 heading (shown at top of exam details page)
//     const pageHeadingData = parseHeadingHTML(
//       course.page_heading || "",
//       course.title || "Exam Details"
//     );
//     setPageHeadingText(pageHeadingData.text);
//     setPageHeadingTag(pageHeadingData.tag || "h1");
//     setPageHeadingFontSize(pageHeadingData.fontSize || "40");
//     setPageHeadingFontWeight(pageHeadingData.fontWeight);

//     // Load Exam Details heading
//     const examDetailsHeadingData = parseHeadingHTML(
//       course.exam_details_heading || "",
//       "Exam Details"
//     );
//     setExamDetailsHeadingText(examDetailsHeadingData.text);
//     setExamDetailsHeadingTag(examDetailsHeadingData.tag);
//     setExamDetailsHeadingFontSize(examDetailsHeadingData.fontSize);
//     setExamDetailsHeadingFontWeight(examDetailsHeadingData.fontWeight);
    
//     // Load Why Matters heading
//     const whyMattersHeadingData = parseHeadingHTML(course.why_matters_heading || "", "Why This Certification Matters");
//     setWhyMattersHeadingText(whyMattersHeadingData.text);
//     setWhyMattersHeadingTag(whyMattersHeadingData.tag);
//     setWhyMattersHeadingFontSize(whyMattersHeadingData.fontSize);
//     setWhyMattersHeadingFontWeight(whyMattersHeadingData.fontWeight);
    
//     // Load What's Included heading
//     const whatsIncludedHeadingData = parseHeadingHTML(course.whats_included_heading || "", "What's Included in This Practice Pack");
//     setWhatsIncludedHeadingText(whatsIncludedHeadingData.text);
//     setWhatsIncludedHeadingTag(whatsIncludedHeadingData.tag);
//     setWhatsIncludedHeadingFontSize(whatsIncludedHeadingData.fontSize);
//     setWhatsIncludedHeadingFontWeight(whatsIncludedHeadingData.fontWeight);
    
//     // Load Topics heading
//     const topicsHeadingData = parseHeadingHTML(course.topics_heading || "", "Topics Covered");
//     setTopicsHeadingText(topicsHeadingData.text);
//     setTopicsHeadingTag(topicsHeadingData.tag);
//     setTopicsHeadingFontSize(topicsHeadingData.fontSize);
//     setTopicsHeadingFontWeight(topicsHeadingData.fontWeight);
    
//     // Load Practice Tests heading
//     const practiceTestsHeadingData = parseHeadingHTML(course.practice_tests_heading || "", "Available Practice Tests");
//     setPracticeTestsHeadingText(practiceTestsHeadingData.text);
//     setPracticeTestsHeadingTag(practiceTestsHeadingData.tag);
//     setPracticeTestsHeadingFontSize(practiceTestsHeadingData.fontSize);
//     setPracticeTestsHeadingFontWeight(practiceTestsHeadingData.fontWeight);
    
//     // Load Testimonials heading
//     const testimonialsHeadingData = parseHeadingHTML(course.testimonials_heading || "", "Student Success Stories");
//     setTestimonialsHeadingText(testimonialsHeadingData.text);
//     setTestimonialsHeadingTag(testimonialsHeadingData.tag);
//     setTestimonialsHeadingFontSize(testimonialsHeadingData.fontSize);
//     setTestimonialsHeadingFontWeight(testimonialsHeadingData.fontWeight);
    
//     // Load FAQs heading
//     const faqsHeadingData = parseHeadingHTML(course.faqs_heading || "", "Frequently Asked Questions");
//     setFaqsHeadingText(faqsHeadingData.text);
//     setFaqsHeadingTag(faqsHeadingData.tag);
//     setFaqsHeadingFontSize(faqsHeadingData.fontSize);
//     setFaqsHeadingFontWeight(faqsHeadingData.fontWeight);
    
//     // Load Test Instructions heading
//     const testInstructionsHeadingData = parseHeadingHTML(course.test_instructions_heading || "", "Test Instructions");
//     setTestInstructionsHeadingText(testInstructionsHeadingData.text);
//     setTestInstructionsHeadingTag(testInstructionsHeadingData.tag);
//     setTestInstructionsHeadingFontSize(testInstructionsHeadingData.fontSize);
//     setTestInstructionsHeadingFontWeight(testInstructionsHeadingData.fontWeight);

//     const ph1h = parseHeadingHTML(course.practice_page_section_1_heading || "", "Extra section 1");
//     setPracticeHubS1HeadingText(ph1h.text);
//     setPracticeHubS1HeadingTag(ph1h.tag);
//     setPracticeHubS1HeadingFontSize(ph1h.fontSize);
//     setPracticeHubS1HeadingFontWeight(ph1h.fontWeight);
//     setPracticeHubS1Content(course.practice_page_section_1_content || "");
//     const ph2h = parseHeadingHTML(course.practice_page_section_2_heading || "", "Extra section 2");
//     setPracticeHubS2HeadingText(ph2h.text);
//     setPracticeHubS2HeadingTag(ph2h.tag);
//     setPracticeHubS2HeadingFontSize(ph2h.fontSize);
//     setPracticeHubS2HeadingFontWeight(ph2h.fontWeight);
//     setPracticeHubS2Content(course.practice_page_section_2_content || "");
    
//     setAbout(course.about || "");
//     setExamDetails(course.exam_details || course.details || "");
//     setTestDescription(course.test_description || "");
//     setPassRate(course.pass_rate ? String(course.pass_rate) : "");
//     setRating(course.rating || "");
//     setDifficulty(course.difficulty || "");
//     setDuration(course.duration || "");
//     setPassingScore(course.passing_score || "");
//     setWhyMatters(course.why_matters || "");
    
//     setWhatsIncluded(course.whats_included && course.whats_included.length > 0 ? course.whats_included : [""]);
//     setTopics(
//       course.topics && course.topics.length > 0
//         ? course.topics.map((t) => ({
//             name: t.name || "",
//             weight: t.weight ?? "",
//             explanation:
//               typeof t.explanation === "string"
//                 ? t.explanation
//                 : typeof t.description === "string"
//                   ? t.description
//                   : "",
//           }))
//         : [{ name: "", weight: "", explanation: "" }]
//     );
//     setPracticeTests(course.practice_tests_list && course.practice_tests_list.length > 0 ? course.practice_tests_list : [{ 
//       name: "", 
//       questions: "", 
//       difficulty: "", 
//       duration: "",
//       description: ""
//     }]);
//     setTestimonials(course.testimonials && course.testimonials.length > 0 ? course.testimonials : [{ name: "", role: "", rating: 5, review: "", verified: false }]);
//     setFaqs(course.faqs && course.faqs.length > 0 ? course.faqs : [{ question: "", answer: "" }]);
//     setTestInstructions(course.test_instructions && course.test_instructions.length > 0 ? course.test_instructions : [""]);

//     setOfficialDetailsContent(course.official_details_content || "");
//     setOfficialDetailsMetaTitle(course.official_details_meta_title || "");
//     setOfficialDetailsMetaKeywords(course.official_details_meta_keywords || "");
//     setOfficialDetailsMetaDescription(course.official_details_meta_description || "");
//     setOfficialDetailsUrlSlug(course.official_details_url_slug || "");
//     setOfficialDetailsFaqs(
//       course.official_details_faqs && course.official_details_faqs.length > 0
//         ? course.official_details_faqs.map((f) => ({
//             question: f.question || "",
//             answer: f.answer || "",
//           }))
//         : [{ question: "", answer: "" }]
//     );

//     setMetaTitle(course.meta_title || "");
//     setMetaKeywords(course.meta_keywords || "");
//     setMetaDescription(course.meta_description || "");
//     setExamSlug(course.slug || "");
//   };
  

//   const handleSave = async () => {
//     if (!selectedCourse) {
//       setMessage("âŒ Please select a course first");
//       return;
//     }

//     if (!checkAuth()) {
//       setMessage("âŒ Please log in again.");
//       setTimeout(() => router.push("/admin/auth"), 2000);
//       return;
//     }

//     setLoading(true);
//     try {
//       // Generate heading HTML from components
//       const aboutHeadingHTML = generateHeadingHTML(
//         aboutHeadingText,
//         aboutHeadingTag,
//         aboutHeadingFontSize,
//         aboutHeadingFontWeight
//       );
//       const pageHeadingHTML = generateHeadingHTML(
//         pageHeadingText,
//         pageHeadingTag || "h1",
//         pageHeadingFontSize || "40",
//         pageHeadingFontWeight
//       );

//       const examDetailsHeadingHTML = generateHeadingHTML(
//         examDetailsHeadingText,
//         examDetailsHeadingTag,
//         examDetailsHeadingFontSize,
//         examDetailsHeadingFontWeight
//       );
      
//       const whyMattersHeadingHTML = generateHeadingHTML(
//         whyMattersHeadingText,
//         whyMattersHeadingTag,
//         whyMattersHeadingFontSize,
//         whyMattersHeadingFontWeight
//       );
      
//       const whatsIncludedHeadingHTML = generateHeadingHTML(
//         whatsIncludedHeadingText,
//         whatsIncludedHeadingTag,
//         whatsIncludedHeadingFontSize,
//         whatsIncludedHeadingFontWeight
//       );
      
//       const topicsHeadingHTML = topicsHeadingText.trim()
//         ? generateHeadingHTML(topicsHeadingText, "h2", "24", "700")
//         : "";
      
//       const practiceTestsHeadingHTML = generateHeadingHTML(
//         practiceTestsHeadingText,
//         practiceTestsHeadingTag,
//         practiceTestsHeadingFontSize,
//         practiceTestsHeadingFontWeight
//       );
      
//       const testimonialsHeadingHTML = testimonialsHeadingText.trim()
//         ? generateHeadingHTML(testimonialsHeadingText, "h2", "24", "700")
//         : "";
      
//       const faqsHeadingHTML = generateHeadingHTML(
//         faqsHeadingText,
//         faqsHeadingTag,
//         faqsHeadingFontSize,
//         faqsHeadingFontWeight
//       );
      
//       const testInstructionsHeadingHTML = generateHeadingHTML(
//         testInstructionsHeadingText,
//         testInstructionsHeadingTag,
//         testInstructionsHeadingFontSize,
//         testInstructionsHeadingFontWeight
//       );

//       const practiceHubS1HeadingHTML = generateHeadingHTML(
//         practiceHubS1HeadingText,
//         practiceHubS1HeadingTag,
//         practiceHubS1HeadingFontSize,
//         practiceHubS1HeadingFontWeight
//       );
//       const practiceHubS2HeadingHTML = generateHeadingHTML(
//         practiceHubS2HeadingText,
//         practiceHubS2HeadingTag,
//         practiceHubS2HeadingFontSize,
//         practiceHubS2HeadingFontWeight
//       );

//       const payload = {
//         slug: examSlug.trim()
//           ? examSlug.trim().replace(/_/g, "-").toLowerCase()
//           : selectedCourse.slug,
//         meta_title: metaTitle,
//         meta_keywords: metaKeywords,
//         meta_description: metaDescription,
//         official_details_content: officialDetailsContent || "",
//         official_details_meta_title: officialDetailsMetaTitle || "",
//         official_details_meta_keywords: officialDetailsMetaKeywords || "",
//         official_details_meta_description: officialDetailsMetaDescription || "",
//         official_details_url_slug: normalizeOfficialDetailsUrlSlug(
//           officialDetailsUrlSlug || "official-details"
//         ),
//         official_details_faqs: officialDetailsFaqs
//           .filter((f) => f.question.trim() !== "")
//           .map((f) => ({
//             question: f.question.trim(),
//             answer: f.answer || "",
//           })),
//         page_heading: pageHeadingHTML || "",
//         about_heading: aboutHeadingHTML || "",
//         exam_details_heading: examDetailsHeadingHTML || "",
//         why_matters_heading: whyMattersHeadingHTML || "",
//         whats_included_heading: whatsIncludedHeadingHTML || "",
//         topics_heading: topicsHeadingHTML || "",
//         practice_tests_heading: practiceTestsHeadingHTML || "",
//         testimonials_heading: testimonialsHeadingHTML || "",
//         faqs_heading: faqsHeadingHTML || "",
//         test_instructions_heading: testInstructionsHeadingHTML || "",
//         practice_page_section_1_heading: practiceHubS1HeadingHTML || "",
//         practice_page_section_1_content: practiceHubS1Content || "",
//         practice_page_section_2_heading: practiceHubS2HeadingHTML || "",
//         practice_page_section_2_content: practiceHubS2Content || "",
//         about,
//         exam_details: examDetails,
//         details: examDetails,
//         test_description: testDescription,
//         pass_rate: (passRate && String(passRate).trim() !== "") ? parseInt(String(passRate)) : null,
//         rating: (rating && rating.toString().trim() !== "") ? parseFloat(rating) : null,
//         difficulty,
//         duration,
//         passing_score: passingScore,
//         why_matters: whyMatters,
//         whats_included: whatsIncluded.filter(item => item.trim() !== ""),
//         topics: topics.filter(t => t.name.trim() !== "").map(t => ({
//           name: t.name,
//           weight: t.weight || "",
//           explanation: (t.explanation || "").trim(),
//         })),
//         practice_tests_list: practiceTests.filter(t => t.name.trim() !== "").map((t, idx) => ({
//           id: t.id || (idx + 1).toString(),
//           name: t.name,
//           description: t.description || "",
//           questions: parseInt(t.questions) || 0,
//           difficulty: t.difficulty || "Intermediate",
//           duration: t.duration || null,
//           progress: t.progress || 0
//         })),
//         testimonials: testimonials.filter(t => t.name.trim() !== "").map(t => ({
//           name: t.name,
//           role: t.role,
//           rating: parseInt(t.rating) || 5,
//           review: t.review,
//           verified: t.verified
//         })),
//         faqs: faqs.filter(f => f.question.trim() !== "").map(f => ({
//           question: f.question,
//           answer: f.answer
//         })),
//         test_instructions: testInstructions.filter(item => item.trim() !== "")
//       };
//       console.log("payload : ",payload);
//       const res = await fetch(`${API_BASE_URL}/api/courses/admin/${selectedCourse.id}/update/`, {
//         method: "PUT",
//         headers: {
//           ...getAuthHeaders(),
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(payload)
//       });

//       if (res.status === 401) {
//         setMessage("âŒ Authentication failed. Please log in again.");
//         setTimeout(() => router.push("/admin/auth"), 2000);
//         setLoading(false);
//         return;
//       }

//       const data = await res.json();

//       if (data.success) {
//         setMessage("Exam details updated successfully!");
//         setShowEditModal(false);

//         // Prefer server-returned updated object (most reliable)
//         const returnedCourse =
//           (data?.data && typeof data.data === "object" && data.data) ||
//           (data?.course && typeof data.course === "object" && data.course) ||
//           null;
//         if (returnedCourse) {
//           loadCourseDetails({ ...selectedCourse, ...returnedCourse }, false);
//         }

//         const latestCourse = await fetchCourseFullDetails(selectedCourse);
//         if (latestCourse) {
//           loadCourseDetails({ ...selectedCourse, ...latestCourse }, false);
//         }
        
//         // Fetch the updated courses list from server
//         try {
//           const coursesRes = await fetch(`${API_BASE_URL}/api/courses/admin/list/`, {
//             headers: getAuthHeaders()
//           });
//           const coursesData = await coursesRes.json();
          
//           if (coursesData.success && coursesData.data) {
//             setCourses(
//               coursesData.data.filter(
//                 (course) => !course.show_in_official_details
//               )
//             );
//             // Find and reload the updated course
//             const updatedCourse = coursesData.data.find(c => c.id === selectedCourse.id);
//         if (updatedCourse) {
//               // Some list responses can omit rich-content fields.
//               // Keep freshly saved values so form doesn't appear empty after save.
//               const hydratedCourse = {
//                 ...selectedCourse,
//                 ...updatedCourse,
//                 page_heading:
//                   updatedCourse.page_heading ?? payload.page_heading,
//                 exam_details:
//                   updatedCourse.exam_details ?? payload.exam_details ?? examDetails,
//                 details: updatedCourse.details ?? payload.details ?? examDetails,
//                 exam_details_heading:
//                   updatedCourse.exam_details_heading ??
//                   payload.exam_details_heading,
//                 test_description:
//                   updatedCourse.test_description ??
//                   payload.test_description ??
//                   testDescription,
//                 topics:
//                   updatedCourse.topics ?? payload.topics ?? selectedCourse.topics,
//                 practice_page_section_1_heading:
//                   updatedCourse.practice_page_section_1_heading ??
//                   payload.practice_page_section_1_heading,
//                 practice_page_section_1_content:
//                   updatedCourse.practice_page_section_1_content ??
//                   payload.practice_page_section_1_content,
//                 practice_page_section_2_heading:
//                   updatedCourse.practice_page_section_2_heading ??
//                   payload.practice_page_section_2_heading,
//                 practice_page_section_2_content:
//                   updatedCourse.practice_page_section_2_content ??
//                   payload.practice_page_section_2_content,
//                 official_details_content:
//                   updatedCourse.official_details_content ??
//                   payload.official_details_content,
//                 official_details_meta_title:
//                   updatedCourse.official_details_meta_title ??
//                   payload.official_details_meta_title,
//                 official_details_meta_keywords:
//                   updatedCourse.official_details_meta_keywords ??
//                   payload.official_details_meta_keywords,
//                 official_details_meta_description:
//                   updatedCourse.official_details_meta_description ??
//                   payload.official_details_meta_description,
//                 official_details_url_slug:
//                   updatedCourse.official_details_url_slug ??
//                   payload.official_details_url_slug,
//                 official_details_faqs:
//                   updatedCourse.official_details_faqs ??
//                   payload.official_details_faqs,
//               };
//               loadCourseDetails(hydratedCourse, false);
//             }
//           }
//         } catch (err) {
//           console.error("Error reloading courses:", err);
//         }
        
//         setTimeout(() => setMessage(""), 3000);
//       } else {
//         setMessage(`âŒ Error: ${data.error || "Failed to update"}`);
//       }
//     } catch (error) {
//       setMessage(`âŒ Error: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper functions for list management
//   const addWhatsIncluded = () => setWhatsIncluded([...whatsIncluded, ""]);
//   const removeWhatsIncluded = (index) => setWhatsIncluded(whatsIncluded.filter((_, i) => i !== index));
//   const updateWhatsIncluded = (index, value) => {
//     const updated = [...whatsIncluded];
//     updated[index] = value;
//     setWhatsIncluded(updated);
//   };

//   const addTopic = () => setTopics([...topics, { name: "", weight: "", explanation: "" }]);
//   const removeTopic = (index) => setTopics(topics.filter((_, i) => i !== index));
//   const updateTopic = (index, field, value) => {
//     const updated = [...topics];
//     updated[index][field] = value;
//     setTopics(updated);
//   };

//   const addPracticeTest = () => setPracticeTests([...practiceTests, {
//     name: "",
//     questions: "",
//     difficulty: "Intermediate",
//     duration: "",
//     description: ""
//   }]);
//   const removePracticeTest = (index) => setPracticeTests(practiceTests.filter((_, i) => i !== index));
//   const updatePracticeTest = (index, field, value) => {
//     const updated = [...practiceTests];
//     updated[index][field] = value;
//     setPracticeTests(updated);
//   };

//   const addTestimonial = () => setTestimonials([...testimonials, { name: "", role: "", rating: 5, review: "", verified: false }]);
//   const removeTestimonial = (index) => setTestimonials(testimonials.filter((_, i) => i !== index));
//   const updateTestimonial = (index, field, value) => {
//     const updated = [...testimonials];
//     updated[index][field] = value;
//     setTestimonials(updated);
//   };

//   const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
//   const removeFaq = (index) => setFaqs(faqs.filter((_, i) => i !== index));
//   const updateFaq = (index, field, value) => {
//     const updated = [...faqs];
//     updated[index][field] = value;
//     setFaqs(updated);
//   };

//   const addOfficialFaq = () =>
//     setOfficialDetailsFaqs([...officialDetailsFaqs, { question: "", answer: "" }]);
//   const removeOfficialFaq = (index) =>
//     setOfficialDetailsFaqs(officialDetailsFaqs.filter((_, i) => i !== index));
//   const updateOfficialFaq = (index, field, value) => {
//     const updated = [...officialDetailsFaqs];
//     updated[index][field] = value;
//     setOfficialDetailsFaqs(updated);
//   };

//   const addTestInstruction = () => setTestInstructions([...testInstructions, ""]);
//   const removeTestInstruction = (index) => setTestInstructions(testInstructions.filter((_, i) => i !== index));
//   const updateTestInstruction = (index, value) => {
//     const updated = [...testInstructions];
//     updated[index] = value;
//     setTestInstructions(updated);
//   };

//   const filteredCourses = useMemo(() => {
//     const query = searchQuery.trim().toLowerCase();
//     if (!query) return courses;
//     return courses.filter((course) => {
//       const title = String(course.title || "").toLowerCase();
//       const code = String(course.code || "").toLowerCase();
//       const provider = String(course.provider || "").toLowerCase();
//       const slug = String(course.slug || "").toLowerCase();
//       return (
//         title.includes(query) ||
//         code.includes(query) ||
//         provider.includes(query) ||
//         slug.includes(query)
//       );
//     });
//   }, [courses, searchQuery]);

//   const handleEditClick = async (course) => {
//     setActiveEditTab("content");
//     setShowEditModal(true);
//     await handleSelectCourse(course);
//   };

//   const handleCloseEdit = () => {
//     setShowEditModal(false);
//     setSelectedCourse(null);
//     setActiveEditTab("content");
//   };

//   const handleDeleteCourse = async (course) => {
//     if (!course?.id) return;
//     const ok = window.confirm(
//       `Delete exam "${course.title || course.code}"? This cannot be undone.`
//     );
//     if (!ok) return;

//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/api/courses/admin/${course.id}/delete/`,
//         {
//           method: "DELETE",
//           headers: getAuthHeaders(),
//         }
//       );

//       if (res.status === 401) {
//         setMessage("Authentication failed. Please log in again.");
//         setTimeout(() => router.push("/admin/auth"), 2000);
//         return;
//       }

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok || data?.success === false) {
//         setMessage(`Error: ${data?.error || "Failed to delete exam"}`);
//         return;
//       }

//       setCourses((prev) => prev.filter((c) => c.id !== course.id));
//       if (selectedCourse?.id === course.id) {
//         handleCloseEdit();
//       }
//       setMessage("Exam deleted successfully.");
//       setTimeout(() => setMessage(""), 3000);
//     } catch (error) {
//       setMessage(`Error: ${error.message}`);
//     }
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-[#0C1A35] mb-2">Exam Details Manager</h1>
//         <p className="text-[#0C1A35]/60">Manage detailed information for exam details pages</p>
//       </div>

//       {/* SEO Meta Information Card */}
//       <Card className="mb-6 border border-blue-200">
//         <CardHeader>
//           <CardTitle className="text-xl text-[#0C1A35]">SEO Meta Information</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label htmlFor="seo_meta_title">Meta Title</Label>
//             <Input
//               id="seo_meta_title"
//               value={seoData.meta_title}
//               onChange={(e) => setSeoData({ ...seoData, meta_title: e.target.value })}
//               placeholder="Enter meta title (50-60 characters recommended)"
//               className="mt-1"
//             />
//             <p className="text-xs text-gray-500 mt-1">Appears in search engine results</p>
//           </div>
//           <div>
//             <Label htmlFor="seo_meta_keywords">Meta Keywords</Label>
//             <Input
//               id="seo_meta_keywords"
//               value={seoData.meta_keywords}
//               onChange={(e) => setSeoData({ ...seoData, meta_keywords: e.target.value })}
//               placeholder="Enter meta keywords (comma-separated)"
//               className="mt-1"
//             />
//             <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
//           </div>
//           <div>
//             <Label htmlFor="seo_meta_description">Meta Description</Label>
//             <Textarea
//               id="seo_meta_description"
//               value={seoData.meta_description}
//               onChange={(e) => setSeoData({ ...seoData, meta_description: e.target.value })}
//               placeholder="Enter meta description (150-160 characters recommended)"
//               className="mt-1"
//               rows={3}
//             />
//             <p className="text-xs text-gray-500 mt-1">Brief description for search engines</p>
//           </div>
//           {seoMessage && (
//             <div className={`p-3 rounded-lg ${seoMessage.includes("âœ…") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
//               {seoMessage}
//             </div>
//           )}
//           <Button
//             onClick={handleSaveSeo}
//             disabled={seoLoading}
//             className="w-fit"
//           >
//             {seoLoading ? "Saving..." : "Save SEO Meta Information"}
//           </Button>
//         </CardContent>
//       </Card>

//       {message && (
//         <div
//           className={`mb-4 p-4 rounded-lg ${
//             message.toLowerCase().includes("error") ||
//             message.includes("failed") ||
//             message.includes("Authentication")
//               ? "bg-red-50 text-red-700"
//               : "bg-green-50 text-green-700"
//           }`}
//         >
//           {message}
//         </div>
//       )}

//       <Card className="mb-6">
//         <CardHeader>
//           <CardTitle>All Exams</CardTitle>
//           <div className="relative mt-3">
//             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0C1A35]/40" aria-hidden />
//             <Input
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Search by title, code, provider, or slug..."
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
//                 <TableHead>Status</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredCourses.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={5} className="text-center text-[#0C1A35]/60 py-8">
//                     No exams found.
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredCourses.map((course) => {
//                   const hasData =
//                     course.about ||
//                     course.meta_title ||
//                     course.topics?.length > 0 ||
//                     course.testimonials?.length > 0 ||
//                     course.faqs?.length > 0;
//                   return (
//                     <TableRow key={course.id}>
//                       <TableCell className="font-medium text-[#0C1A35]">{course.title}</TableCell>
//                       <TableCell>{course.code || "-"}</TableCell>
//                       <TableCell>{course.provider || "-"}</TableCell>
//                       <TableCell>
//                         {hasData ? (
//                           <Badge className="bg-green-100 text-green-700 border-0">Has Data</Badge>
//                         ) : (
//                           <Badge variant="secondary">Empty</Badge>
//                         )}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <div className="inline-flex gap-2 justify-end">
//                           <Button
//                             size="icon"
//                             variant="outline"
//                             onClick={() => handleEditClick(course)}
//                             title="Edit exam details"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </Button>
//                           <Button
//                             size="icon"
//                             variant="destructive"
//                             onClick={() => handleDeleteCourse(course)}
//                             title="Delete exam"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       <Dialog
//         open={showEditModal}
//         onOpenChange={(open) => {
//           if (!open) handleCloseEdit();
//           else setShowEditModal(true);
//         }}
//       >
//         <DialogContent className="!w-[96vw] !max-w-[1200px] max-h-[92vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="text-[#0C1A35]">
//               {selectedCourse ? `Edit: ${selectedCourse.title}` : "Edit exam"}
//             </DialogTitle>
//             {selectedCourse && (
//               <p className="text-sm text-[#0C1A35]/60">
//                 {selectedCourse.code}
//                 {selectedCourse.provider ? ` · ${selectedCourse.provider}` : ""}
//               </p>
//             )}
//           </DialogHeader>

//           {selectedCourse && (
//             <>
//               <Tabs
//                 value={activeEditTab}
//                 onValueChange={setActiveEditTab}
//                 className="w-full"
//               >
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="content">Content</TabsTrigger>
//                   <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
//                   <TabsTrigger value="topics">Topics Covered</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="content" className="space-y-4 mt-4">
//                   <div>
//                     <Label htmlFor="exam_meta_title">Meta Title</Label>
//                     <Input
//                       id="exam_meta_title"
//                       value={metaTitle}
//                       onChange={(e) => setMetaTitle(e.target.value)}
//                       placeholder="SEO meta title (50-60 characters)"
//                       className="mt-1"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="exam_meta_keywords">Meta Keywords</Label>
//                     <Input
//                       id="exam_meta_keywords"
//                       value={metaKeywords}
//                       onChange={(e) => setMetaKeywords(e.target.value)}
//                       placeholder="keyword1, keyword2, keyword3"
//                       className="mt-1"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="exam_meta_description">Meta Description</Label>
//                     <Textarea
//                       id="exam_meta_description"
//                       value={metaDescription}
//                       onChange={(e) => setMetaDescription(e.target.value)}
//                       placeholder="SEO meta description (150-160 characters)"
//                       rows={3}
//                       className="mt-1"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="exam_url_slug">URL Slug</Label>
//                     <Input
//                       id="exam_url_slug"
//                       value={examSlug}
//                       onChange={(e) => setExamSlug(e.target.value)}
//                       placeholder="exam-url-slug"
//                       className="mt-1"
//                     />
//                     <p className="text-xs text-[#0C1A35]/50 mt-1">
//                       Used in the public exam URL path.
//                     </p>
//                   </div>
//                   <div>
//                     <Label htmlFor="exam_page_title">Page Title</Label>
//                     <Input
//                       id="exam_page_title"
//                       value={pageHeadingText}
//                       onChange={(e) => setPageHeadingText(e.target.value)}
//                       placeholder="Main heading shown on the exam page"
//                       className="mt-1"
//                     />
//                   </div>
//                   <div>
//                     <Label>Content</Label>
//                     <div className="mt-2">
//                       <TipTapEditor
//                         key={`exam-content-${selectedCourse.id}`}
//                         content={about || ""}
//                         onChange={(html) => setAbout(html)}
//                         placeholder="Exam page main content..."
//                         className="min-h-[200px]"
//                       />
//                     </div>
//                   </div>
//                   <div className="space-y-3 border rounded-lg p-4 bg-gray-50/50">
//                     <div className="flex items-center justify-between">
//                       <Label>FAQs</Label>
//                       <Button size="sm" type="button" onClick={addFaq}>
//                         <Plus className="w-4 h-4 mr-1" /> Add FAQ
//                       </Button>
//                     </div>
//                     {faqs.map((faq, index) => (
//                       <Card key={`faq-${index}`} className="p-4 bg-white">
//                         <div className="space-y-3">
//                           <div className="flex gap-2">
//                             <Input
//                               value={faq.question}
//                               onChange={(e) => updateFaq(index, "question", e.target.value)}
//                               placeholder="Question"
//                               className="flex-1"
//                             />
//                             <Button
//                               size="sm"
//                               type="button"
//                               variant="destructive"
//                               onClick={() => removeFaq(index)}
//                               title="Remove FAQ"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </Button>
//                           </div>
//                           <div>
//                             <Label className="text-sm text-gray-600 mb-1 block">Answer</Label>
//                             <Textarea
//                               value={faq.answer || ""}
//                               onChange={(e) => updateFaq(index, "answer", e.target.value)}
//                               placeholder="Enter FAQ answer"
//                               rows={4}
//                               className="text-sm"
//                             />
//                           </div>
//                         </div>
//                       </Card>
//                     ))}
//                   </div>
//                 </TabsContent>

//                 <TabsContent value="testimonials" className="space-y-4 mt-4">
//                   <HeadingInput
//                     label="Testimonials Heading"
//                     text={testimonialsHeadingText}
//                     setText={setTestimonialsHeadingText}
//                     tag={testimonialsHeadingTag}
//                     setTag={setTestimonialsHeadingTag}
//                     fontSize={testimonialsHeadingFontSize}
//                     setFontSize={setTestimonialsHeadingFontSize}
//                     fontWeight={testimonialsHeadingFontWeight}
//                     setFontWeight={setTestimonialsHeadingFontWeight}
//                     placeholder="Student Success Stories"
//                   />
                  
//                   <div className="flex items-center justify-between mb-2">
//                     <Label>Testimonials</Label>
//                     <Button size="sm" onClick={addTestimonial}>
//                       <Plus className="w-4 h-4 mr-1" /> Add
//                     </Button>
//                   </div>
//                   {testimonials.map((testimonial, index) => (
//                     <Card key={index} className="p-4">
//                       <div className="space-y-3">
//                         <div className="flex gap-2">
//                           <Input
//                             value={testimonial.name}
//                             onChange={(e) => updateTestimonial(index, "name", e.target.value)}
//                             placeholder="Name"
//                             className="flex-1"
//                           />
//                           <Button
//                             size="sm"
//                             variant="destructive"
//                             onClick={() => removeTestimonial(index)}
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </Button>
//                         </div>
//                         <Input
//                           value={testimonial.role}
//                           onChange={(e) => updateTestimonial(index, "role", e.target.value)}
//                           placeholder="Role/Title"
//                         />
//                         <div className="flex gap-2 items-center">
//                           <Label className="text-sm">Rating:</Label>
//                           <Select
//                             value={testimonial.rating.toString()}
//                             onValueChange={(value) => updateTestimonial(index, "rating", parseInt(value))}
//                           >
//                             <SelectTrigger className="w-24">
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {[1, 2, 3, 4, 5].map((r) => (
//                                 <SelectItem key={r} value={r.toString()}>{r} stars</SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                           <label className="flex items-center gap-2 ml-auto">
//                             <input
//                               type="checkbox"
//                               checked={testimonial.verified}
//                               onChange={(e) => updateTestimonial(index, "verified", e.target.checked)}
//                             />
//                             <span className="text-sm">Verified</span>
//                           </label>
//                         </div>
//                         <Textarea
//                           value={testimonial.review}
//                           onChange={(e) => updateTestimonial(index, "review", e.target.value)}
//                           placeholder="Review text..."
//                           rows={3}
//                         />
//                       </div>
//                     </Card>
//                   ))}
//                 </TabsContent>

//                 <TabsContent value="topics" className="space-y-6 mt-4">
//                   <div>
//                     <Label>Section title (optional)</Label>
//                     <Input
//                       value={topicsHeadingText}
//                       onChange={(e) => setTopicsHeadingText(e.target.value)}
//                       placeholder="Topics Covered"
//                       className="mt-2"
//                     />
//                     <p className="text-xs text-[#0C1A35]/60 mt-1">
//                       Shown on exam and practice pages. Defaults to &quot;Topics Covered&quot; if empty.
//                     </p>
//                   </div>

//                   <div>
//                     <div className="flex items-center justify-between mb-2">
//                       <Label>Topics</Label>
//                       <Button size="sm" onClick={addTopic}>
//                         <Plus className="w-4 h-4 mr-1" /> Add Topic
//                       </Button>
//                     </div>
//                     <p className="text-xs text-[#0C1A35]/60 mb-3">
//                       Enter topic name and percentage (e.g. 20, 20%, 10-20, 11-20%).
//                     </p>
//                     {topics.map((topic, index) => (
//                       <Card key={index} className="p-4 mb-3 border border-gray-200">
//                         <div className="flex gap-2 mb-3">
//                           <Input
//                             value={topic.name}
//                             onChange={(e) => updateTopic(index, "name", e.target.value)}
//                             placeholder="Topic name"
//                             className="flex-1"
//                           />
//                           <Input
//                             type="text"
//                             value={topic.weight}
//                             onChange={(e) => updateTopic(index, "weight", e.target.value)}
//                             placeholder="Percentage"
//                             className="w-40 shrink-0"
//                           />
//                           <Button
//                             size="sm"
//                             variant="destructive"
//                             className="shrink-0"
//                             onClick={() => removeTopic(index)}
//                             disabled={topics.length === 1 && !topic.name && !topic.weight}
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </Button>
//                         </div>
//                         <Label className="text-xs text-gray-600 mb-1 block">
//                           Explanation (optional)
//                         </Label>
//                         <Textarea
//                           value={topic.explanation || ""}
//                           onChange={(e) => updateTopic(index, "explanation", e.target.value)}
//                           placeholder="Describe what this topic covers…"
//                           rows={3}
//                           className="text-sm resize-y min-h-[72px]"
//                         />
//                       </Card>
//                     ))}
//                   </div>
//                 </TabsContent>

//               </Tabs>

//               <div className="mt-6 flex gap-3 pt-4 border-t">
//                 <Button
//                   onClick={handleSave}
//                   disabled={loading}
//                   className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]"
//                 >
//                   <Save className="w-4 h-4 mr-2" />
//                   {loading ? "Saving..." : "Save Changes"}
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={handleCloseEdit}
//                   className="flex-1"
//                 >
//                   <X className="w-4 h-4 mr-2" />
//                   Cancel
//                 </Button>
//               </div>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

