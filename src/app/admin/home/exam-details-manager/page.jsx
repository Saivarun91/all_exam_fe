"use client";

import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { checkAuth, getAuthHeaders } from "@/utils/authCheck";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function ExamDetailsManager() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
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
  const [about, setAbout] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [passRate, setPassRate] = useState("");
  const [rating, setRating] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [duration, setDuration] = useState("");
  const [passingScore, setPassingScore] = useState("");
  const [whyMatters, setWhyMatters] = useState("");

  // List fields
  const [whatsIncluded, setWhatsIncluded] = useState([""]);
  const [topics, setTopics] = useState([{ name: "", weight: "" }]);
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

  useEffect(() => {
    // Check authentication
    if (!checkAuth()) {
      setMessage("❌ Authentication failed. Please log in as admin.");
      setTimeout(() => {
        router.push("/admin/auth");
      }, 2000);
      return;
    }
    
    fetchCourses();
    fetchSeoData();
  }, []);

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
        setSeoMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        setSeoLoading(false);
        return;
      }
      if (res.status === 404) {
        setSeoMessage("❌ API endpoint not found.");
        setSeoLoading(false);
        return;
      }
      if (!res.ok) {
        setSeoMessage("❌ Error: " + res.statusText);
        setSeoLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSeoMessage("✅ SEO meta information saved successfully!");
        setTimeout(() => setSeoMessage(""), 3000);
      } else {
        setSeoMessage("❌ Error: " + (data.error || "Failed to save"));
      }
    } catch (error) {
      setSeoMessage("❌ Error: " + error.message);
    } finally {
      setSeoLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/list/`, {
        headers: getAuthHeaders()
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setMessage("❌ Error loading courses. Check console for details.");
    }
  };

  const loadCourseDetails = (course, showMessage = true) => {
    setSelectedCourse(course);
    setAbout(course.about || "");
    setTestDescription(course.test_description || "");
    setPassRate(course.pass_rate || "");
    setRating(course.rating || "");
    setDifficulty(course.difficulty || "");
    setDuration(course.duration || "");
    setPassingScore(course.passing_score || "");
    setWhyMatters(course.why_matters || "");
    
    setWhatsIncluded(course.whats_included && course.whats_included.length > 0 ? course.whats_included : [""]);
    setTopics(course.topics && course.topics.length > 0 ? course.topics : [{ name: "", weight: "" }]);
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
  };

  const handleSave = async () => {
    if (!selectedCourse) {
      setMessage("❌ Please select a course first");
      return;
    }

    if (!checkAuth()) {
      setMessage("❌ Please log in again.");
      setTimeout(() => router.push("/admin/auth"), 2000);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        about,
        test_description: testDescription,
        pass_rate: (passRate && passRate.trim() !== "") ? parseInt(passRate) : null,
        rating: (rating && rating.toString().trim() !== "") ? parseFloat(rating) : null,
        difficulty,
        duration,
        passing_score: passingScore,
        why_matters: whyMatters,
        whats_included: whatsIncluded.filter(item => item.trim() !== ""),
        topics: topics.filter(t => t.name.trim() !== "").map(t => ({
          name: t.name,
          weight: t.weight || ""
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
      console.log("payload : ",payload);
      const res = await fetch(`${API_BASE_URL}/api/courses/admin/${selectedCourse.id}/update/`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        setMessage("❌ Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Exam details updated successfully!");
        
        // Fetch the updated courses list from server
        try {
          const coursesRes = await fetch(`${API_BASE_URL}/api/courses/admin/list/`, {
            headers: getAuthHeaders()
          });
          const coursesData = await coursesRes.json();
          
          if (coursesData.success && coursesData.data) {
            setCourses(coursesData.data);
            // Find and reload the updated course
            const updatedCourse = coursesData.data.find(c => c.id === selectedCourse.id);
        if (updatedCourse) {
              loadCourseDetails(updatedCourse, false);
            }
          }
        } catch (err) {
          console.error("Error reloading courses:", err);
        }
        
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to update"}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
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

  const addTopic = () => setTopics([...topics, { name: "", weight: "" }]);
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

  const addTestInstruction = () => setTestInstructions([...testInstructions, ""]);
  const removeTestInstruction = (index) => setTestInstructions(testInstructions.filter((_, i) => i !== index));
  const updateTestInstruction = (index, value) => {
    const updated = [...testInstructions];
    updated[index] = value;
    setTestInstructions(updated);
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
            <div className={`p-3 rounded-lg ${seoMessage.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
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
        <div className={`mb-4 p-4 rounded-lg ${message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Course Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {courses.map((course) => {
                const hasData = course.about || course.topics?.length > 0 || course.testimonials?.length > 0 || course.faqs?.length > 0;
                return (
                <button
                  key={course.id}
                  onClick={() => loadCourseDetails(course)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedCourse?.id === course.id
                      ? "border-[#1A73E8] bg-[#1A73E8]/10"
                      : "border-gray-200 hover:border-[#1A73E8]/50"
                  }`}
                >
                    <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-[#0C1A35]">{course.title}</div>
                      {hasData && (
                        <Badge className="bg-green-100 text-green-700 text-xs border-0">
                          ✓ Has Data
                        </Badge>
                      )}
                    </div>
                  <div className="text-sm text-[#0C1A35]/60">{course.code}</div>
                  <Badge variant="secondary" className="mt-1 text-xs">{course.provider}</Badge>
                </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right: Details Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedCourse ? `Edit: ${selectedCourse.title}` : "Select a course to edit"}
            </CardTitle>
            {selectedCourse && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-semibold text-blue-900 mb-2">Current Data Status:</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                  <div>✅ About: {selectedCourse.about ? "Saved" : "Empty"}</div>
                  <div>✅ Pass Rate: {selectedCourse.pass_rate ? `${selectedCourse.pass_rate}%` : "Not set"}</div>
                  <div>✅ Topics: {selectedCourse.topics?.length || 0} topics</div>
                  <div>✅ Practice Tests: {selectedCourse.practice_tests_list?.length || 0} tests</div>
                  <div>✅ Testimonials: {selectedCourse.testimonials?.length || 0} testimonials</div>
                  <div>✅ FAQs: {selectedCourse.faqs?.length || 0} FAQs</div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!selectedCourse ? (
              <p className="text-[#0C1A35]/60 text-center py-8">
                Please select a course from the left to manage its details
              </p>
            ) : (
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="tests">Tests</TabsTrigger>
                  <TabsTrigger value="social">Social</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4 text-[#0C1A35]">Saved Data Preview</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold">About:</Label>
                        <p className="text-sm text-[#0C1A35]/70 mt-1">
                          {selectedCourse.about || <span className="text-red-500">Not set</span>}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-sm font-semibold">Pass Rate:</Label>
                          <p className="text-sm text-[#0C1A35]/70">{selectedCourse.pass_rate ? `${selectedCourse.pass_rate}%` : "Not set"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Rating:</Label>
                          <p className="text-sm text-[#0C1A35]/70">{selectedCourse.rating ? `${selectedCourse.rating}/5` : "Not set"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Difficulty:</Label>
                          <p className="text-sm text-[#0C1A35]/70">{selectedCourse.difficulty || "Not set"}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Topics ({selectedCourse.topics?.length || 0}):</Label>
                        {selectedCourse.topics && selectedCourse.topics.length > 0 ? (
                          <ul className="text-sm text-[#0C1A35]/70 mt-1 list-disc list-inside">
                            {selectedCourse.topics.map((topic, idx) => (
                              <li key={idx}>{topic.name} - {topic.weight}{topic.weight && !topic.weight.toString().includes('%') ? '%' : ''}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-red-500 mt-1">No topics added</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Practice Tests ({selectedCourse.practice_tests_list?.length || 0}):</Label>
                        {selectedCourse.practice_tests_list && selectedCourse.practice_tests_list.length > 0 ? (
                          <ul className="text-sm text-[#0C1A35]/70 mt-1 list-disc list-inside">
                            {selectedCourse.practice_tests_list.map((test, idx) => (
                              <li key={idx}>
                                {test.name} - {test.questions} questions
                                {test.duration && ` - ${test.duration}`}
                                {test.difficulty && ` (${test.difficulty})`}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-red-500 mt-1">No practice tests added</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Testimonials ({selectedCourse.testimonials?.length || 0}):</Label>
                        {selectedCourse.testimonials && selectedCourse.testimonials.length > 0 ? (
                          <ul className="text-sm text-[#0C1A35]/70 mt-1 list-disc list-inside">
                            {selectedCourse.testimonials.map((t, idx) => (
                              <li key={idx}>{t.name} - {t.rating}⭐</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-red-500 mt-1">No testimonials added</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">FAQs ({selectedCourse.faqs?.length || 0}):</Label>
                        {selectedCourse.faqs && selectedCourse.faqs.length > 0 ? (
                          <ul className="text-sm text-[#0C1A35]/70 mt-1 list-disc list-inside">
                            {selectedCourse.faqs.map((faq, idx) => (
                              <li key={idx}>{faq.question}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-red-500 mt-1">No FAQs added</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">What's Included ({selectedCourse.whats_included?.length || 0}):</Label>
                        {selectedCourse.whats_included && selectedCourse.whats_included.length > 0 ? (
                          <ul className="text-sm text-[#0C1A35]/70 mt-1 list-disc list-inside">
                            {selectedCourse.whats_included.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-red-500 mt-1">No items added</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Test Instructions ({selectedCourse.test_instructions?.length || 0}):</Label>
                        {selectedCourse.test_instructions && selectedCourse.test_instructions.length > 0 ? (
                          <ul className="text-sm text-[#0C1A35]/70 mt-1 list-disc list-inside">
                            {selectedCourse.test_instructions.map((instruction, idx) => (
                              <li key={idx}>{instruction}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-red-500 mt-1">No instructions added</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <Label>About (Description)</Label>
                    <Textarea
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="Describe the exam certification..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Test Description (shown on test player page)</Label>
                    <Textarea
                      value={testDescription}
                      onChange={(e) => setTestDescription(e.target.value)}
                      placeholder="e.g., This practice test contains questions to help you prepare. You can take this test in timed mode or review mode. Choose your preferred mode below."
                      rows={3}
                    />
                    <p className="text-sm text-gray-500 mt-1">This appears at the top of the test player page</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Pass Rate (%)</Label>
                      <Input
                        type="number"
                        value={passRate}
                        onChange={(e) => setPassRate(e.target.value)}
                        placeholder="94"
                      />
                    </div>
                    <div>
                      <Label>Rating (out of 5)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        placeholder="4.8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Difficulty</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="130 minutes"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Passing Score</Label>
                    <Input
                      value={passingScore}
                      onChange={(e) => setPassingScore(e.target.value)}
                      placeholder="720/1000"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Label>Why This Certification Matters</Label>
                    <Textarea
                      value={whyMatters}
                      onChange={(e) => setWhyMatters(e.target.value)}
                      placeholder="Explain why this certification is important..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>What's Included</Label>
                      <Button size="sm" onClick={addWhatsIncluded}>
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                    {whatsIncluded.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Textarea
                          value={item}
                          onChange={(e) => updateWhatsIncluded(index, e.target.value)}
                          placeholder="Feature included... (supports multiple lines and paragraphs)"
                          rows={4}
                          className="flex-1 resize-y"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeWhatsIncluded(index)}
                          className="self-start"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Topics Covered</Label>
                      <Button size="sm" onClick={addTopic}>
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                    {topics.map((topic, index) => (
                      <div key={index} className="flex gap-2 mb-2">
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
                          placeholder="Weight (e.g., 10, 11-20, 11-20%)"
                          className="w-32"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeTopic(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="tests" className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Practice Tests</Label>
                    <Button size="sm" onClick={addPracticeTest}>
                      <Plus className="w-4 h-4 mr-1" /> Add Test
                    </Button>
                  </div>
                  {practiceTests.map((test, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={test.name}
                            onChange={(e) => updatePracticeTest(index, "name", e.target.value)}
                            placeholder="Test name (e.g., Practice Test 1)"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removePracticeTest(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={test.description || ""}
                          onChange={(e) => updatePracticeTest(index, "description", e.target.value)}
                          placeholder="Test description (optional)"
                          rows={2}
                          className="mb-2"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            type="number"
                            value={test.questions}
                            onChange={(e) => updatePracticeTest(index, "questions", e.target.value)}
                            placeholder="Questions"
                          />
                          <Input
                            value={test.duration}
                            onChange={(e) => updatePracticeTest(index, "duration", e.target.value)}
                            placeholder="Duration (e.g., 60 min)"
                          />
                          <Select
                            value={test.difficulty}
                            onValueChange={(value) => updatePracticeTest(index, "difficulty", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  ))}

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Test Instructions (shown on test player page)</Label>
                      <Button size="sm" onClick={addTestInstruction}>
                        <Plus className="w-4 h-4 mr-1" /> Add Instruction
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Add instructions that will be shown to users before starting the test</p>
                    {testInstructions.map((instruction, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          value={instruction}
                          onChange={(e) => updateTestInstruction(index, e.target.value)}
                          placeholder="e.g., You can navigate between questions using Next and Previous buttons"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeTestInstruction(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-4">
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
                                <SelectItem key={r} value={r.toString()}>{r} ⭐</SelectItem>
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

                <TabsContent value="faq" className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>FAQs</Label>
                    <Button size="sm" onClick={addFaq}>
                      <Plus className="w-4 h-4 mr-1" /> Add FAQ
                    </Button>
                  </div>
                  {faqs.map((faq, index) => (
                    <Card key={index} className="p-4">
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
                            variant="destructive"
                            onClick={() => removeFaq(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => updateFaq(index, "answer", e.target.value)}
                          placeholder="Answer"
                          rows={2}
                        />
                      </div>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            )}

            {selectedCourse && (
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save All Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCourse(null)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

