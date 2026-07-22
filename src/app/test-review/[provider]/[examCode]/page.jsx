"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "@/lib/navigation/client";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Clock, RotateCcw, List, Lock, Trophy, X, Check, Shield, Star, MessageSquare, Copy, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { normalizeAnswersToIndexKey } from "@/utils/testReviewDisplay";
import {
  buildPracticeTestSeoSegment,
  getExamLandingPath,
  getExamPricingPath,
  getStoredExamSlug,
} from "@/utils/practiceTestRouting";
import { parseExamTopics } from "@/lib/parseExamTopics";

const SCROLL_TO_PRACTICE_TESTS_KEY = "scrollToPracticeTests";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const normalizeTopicKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const collectQuestionTopicCandidates = (question) => {
  const candidates = [];
  if (Array.isArray(question?.tags)) {
    question.tags.forEach((tag) => {
      const value = String(tag || "").trim();
      if (value) candidates.push(value);
    });
  }
  ["domain", "topic", "category", "subject"].forEach((key) => {
    const value = String(question?.[key] || "").trim();
    if (value) candidates.push(value);
  });
  return candidates;
};

/** Match a question to one of the exam's configured topic names. */
const matchQuestionToExamTopic = (question, examTopics) => {
  if (!examTopics.length) return null;

  const candidates = collectQuestionTopicCandidates(question);
  if (!candidates.length) return null;

  const normalizedTopics = examTopics.map((topic) => ({
    name: topic.name,
    key: normalizeTopicKey(topic.name),
  }));

  for (const candidate of candidates) {
    const key = normalizeTopicKey(candidate);
    if (!key) continue;
    const exact = normalizedTopics.find((topic) => topic.key === key);
    if (exact) return exact.name;
  }

  for (const candidate of candidates) {
    const key = normalizeTopicKey(candidate);
    if (!key || key.length < 3) continue;
    const partial = normalizedTopics.find(
      (topic) =>
        topic.key.includes(key) ||
        key.includes(topic.key) ||
        topic.key.split(" ").some((part) => part.length > 3 && key.includes(part)) ||
        key.split(" ").some((part) => part.length > 3 && topic.key.includes(part))
    );
    if (partial) return partial.name;
  }

  return null;
};

/** Assign untagged questions across exam topics using topic weights. */
const assignTopicByWeight = (questionIndex, totalQuestions, examTopics) => {
  if (!examTopics.length) return "General";
  if (totalQuestions <= 0) return examTopics[0].name;

  const weights = examTopics.map((topic) => {
    const weight = Number(topic.progressValue);
    return Number.isFinite(weight) && weight > 0 ? weight : 1;
  });
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || examTopics.length;
  const position = (questionIndex + 0.5) / totalQuestions;

  let cumulative = 0;
  for (let i = 0; i < examTopics.length; i++) {
    cumulative += weights[i] / totalWeight;
    if (position <= cumulative) return examTopics[i].name;
  }
  return examTopics[examTopics.length - 1].name;
};

const isQuestionAnswerCorrect = (question, userAnswerValue) => {
  if (userAnswerValue === null || userAnswerValue === undefined) return false;
  const correctAnswers =
    question.correct_answers ||
    (question.correct_answer ? [question.correct_answer] : []);
  if (!correctAnswers.length) return false;

  const opts =
    question.options && Array.isArray(question.options) ? question.options : [];
  if (opts.length > 0) {
    const userKey = normalizeAnswersToIndexKey(userAnswerValue, opts);
    const correctKey = normalizeAnswersToIndexKey(correctAnswers, opts);
    return userKey === correctKey && userKey !== "";
  }
  if (Array.isArray(userAnswerValue)) {
    const userAnswerTexts = userAnswerValue
      .map((a) => String(a).trim().toLowerCase())
      .sort();
    const correctAnswerTexts = correctAnswers
      .map((a) => String(a).trim().toLowerCase())
      .sort();
    return JSON.stringify(userAnswerTexts) === JSON.stringify(correctAnswerTexts);
  }
  const userAnswerText = String(userAnswerValue).trim().toLowerCase();
  return correctAnswers.some(
    (ca) => String(ca).trim().toLowerCase() === userAnswerText
  );
};

const resolveUserAnswerValue = (userAnswer) => {
  if (userAnswer === undefined || userAnswer === null) return null;
  if (Array.isArray(userAnswer)) {
    return userAnswer.length > 0 ? userAnswer : null;
  }
  if (
    userAnswer === "" ||
    userAnswer === "null" ||
    userAnswer === "undefined"
  ) {
    return null;
  }
  return userAnswer;
};

/**
 * Build topic performance from the exam's configured topics (preferred)
 * or from question tags when the exam has no topics configured.
 * Never invents static placeholder topic names.
 */
const buildTopicPerformance = (questions, userAnswers, examTopicsRaw, results) => {
  const examTopics = parseExamTopics(examTopicsRaw || []);
  const questionList = Array.isArray(questions) ? questions : [];
  const answerMap = userAnswers && typeof userAnswers === "object" ? userAnswers : {};

  const scored = questionList.map((question, idx) => {
    const userAnswerValue = resolveUserAnswerValue(answerMap[idx + 1]);
    return {
      question,
      index: idx,
      isCorrect: isQuestionAnswerCorrect(question, userAnswerValue),
      matchedTopic: matchQuestionToExamTopic(question, examTopics),
      tagTopic: collectQuestionTopicCandidates(question)[0] || null,
    };
  });

  // 1) Exam has configured topics → always show those topic names
  if (examTopics.length > 0) {
    const topicMap = {};
    examTopics.forEach((topic) => {
      topicMap[topic.name] = { correct: 0, total: 0 };
    });

    scored.forEach((row) => {
      const topicName =
        row.matchedTopic ||
        assignTopicByWeight(row.index, scored.length, examTopics);
      if (!topicMap[topicName]) {
        topicMap[topicName] = { correct: 0, total: 0 };
      }
      topicMap[topicName].total += 1;
      if (row.isCorrect) topicMap[topicName].correct += 1;
    });

    return examTopics.map((topic) => {
      const stats = topicMap[topic.name] || { correct: 0, total: 0 };
      return {
        topic: topic.name,
        correct: stats.correct,
        total: stats.total,
        percentage:
          stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      };
    });
  }

  // 2) No exam topics → group by real question tags/domains
  const tagMap = {};
  scored.forEach((row) => {
    const topicName = row.tagTopic || "General";
    if (!tagMap[topicName]) tagMap[topicName] = { correct: 0, total: 0 };
    tagMap[topicName].total += 1;
    if (row.isCorrect) tagMap[topicName].correct += 1;
  });

  const fromTags = Object.entries(tagMap)
    .map(([topic, stats]) => ({
      topic,
      correct: stats.correct,
      total: stats.total,
      percentage:
        stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }))
    .sort((a, b) => a.topic.localeCompare(b.topic));

  if (fromTags.length > 0) return fromTags;

  // 3) Last resort: overall score only (no invented topic names)
  const completed = Number(results?.questionsCompleted) || scored.length || 0;
  const correct = Number(results?.correctAnswers) || 0;
  return [
    {
      topic: "Overall",
      correct,
      total: completed,
      percentage: completed > 0 ? Math.round((correct / completed) * 100) : 0,
    },
  ];
};

export default function TestReview() {
  const params = useParams();
  const router = useRouter();
  
  const provider = params?.provider;
  const examCode = params?.examCode;
  
  const [testResults, setTestResults] = useState(null);
  const [exam, setExam] = useState(null);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("3months");
  const [includePDF, setIncludePDF] = useState(false);
  const [topicPerformance, setTopicPerformance] = useState([]);
  
  // Review submission states
  const [reviewRating, setReviewRating] = useState(0); // Start with 0, user must select
  const [hoveredRating, setHoveredRating] = useState(0); // For hover effect
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [couponCode, setCouponCode] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPricingUrl, setPendingPricingUrl] = useState(null);
  
  // Fetch exam data dynamically
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const normalizedExamCode = decodeURIComponent(String(examCode || ""))
          .trim()
          .toLowerCase()
          .replace(/_/g, "-");
        const normalizedProvider = decodeURIComponent(String(provider || ""))
          .trim()
          .toLowerCase()
          .replace(/_/g, "-");

        const slugCandidates = [
          normalizedExamCode,
          normalizedProvider && normalizedExamCode
            ? `${normalizedProvider}-${normalizedExamCode}`
            : "",
        ].filter(Boolean);

        let data = null;
        for (const slug of slugCandidates) {
          const res = await fetch(
            `${API_BASE_URL}/api/courses/exams/${encodeURIComponent(slug)}/`
          );
          if (res.ok) {
            data = await res.json();
            break;
          }
        }

        if (!data) return;

        setExam(data);

        if (typeof window !== "undefined") {
          const finalTitle = data.meta_title
            ? `${data.meta_title} - Test Review`
            : `${data.title} (${data.code}) - Test Review | AllExamQuestions`;

          document.title = finalTitle;

          let metaDescriptionTag = document.querySelector("meta[name='description']");
          if (!metaDescriptionTag) {
            metaDescriptionTag = document.createElement("meta");
            metaDescriptionTag.name = "description";
            document.head.appendChild(metaDescriptionTag);
          }

          metaDescriptionTag.content =
            data.meta_description ||
            `Review your ${data.title} practice test results on AllExamQuestions.`;
        }
      } catch (error) {
        console.error("Error fetching exam data:", error);
      }
    };

    if (provider && examCode) {
      fetchExamData();
    }
  }, [provider, examCode]);

  // Load test results once from sessionStorage (requires login for guest submissions)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedResults = sessionStorage.getItem("testResults");
    if (!storedResults) {
      router.push(`/exams/${provider}/${examCode}/practice`);
      return;
    }

    try {
      const results = JSON.parse(storedResults);
      const token = localStorage.getItem("token");
      const needsLogin =
        results?.requiresLoginForResults === true ||
        results?.attemptId === "guest-local" ||
        sessionStorage.getItem("pendingGuestTestResults");

      if (needsLogin && !token) {
        router.replace(
          `/auth/login?redirect=${encodeURIComponent(
            `/test-review/${provider}/${examCode}`
          )}`
        );
        return;
      }

      setTestResults(results);
      setHasFullAccess(results.hasFullAccess || false);
    } catch (error) {
      console.error("Error loading test results:", error);
      router.push(`/exams/${provider}/${examCode}/practice`);
    }
  }, [provider, examCode, router]);

  // Claim guest attempt after login so admin can see who took the test
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const claimRaw = sessionStorage.getItem("guestClaimMeta");
    if (!claimRaw) return;

    let claimed = false;
    const claimGuestAttempt = async () => {
      if (claimed) return;
      claimed = true;
      try {
        const meta = JSON.parse(claimRaw);
        if (!meta?.exam_id && !meta?.test_id) {
          sessionStorage.removeItem("guestClaimMeta");
          sessionStorage.removeItem("pendingGuestTestResults");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/exams/attempt/claim-guest/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(meta),
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.attempt_id) {
            sessionStorage.setItem("attemptId", data.attempt_id);
            try {
              const stored = sessionStorage.getItem("testResults");
              if (stored) {
                const results = JSON.parse(stored);
                results.attemptId = data.attempt_id;
                results.requiresLoginForResults = false;
                sessionStorage.setItem("testResults", JSON.stringify(results));
                setTestResults((prev) =>
                  prev
                    ? {
                        ...prev,
                        attemptId: data.attempt_id,
                        requiresLoginForResults: false,
                      }
                    : prev
                );
              }
            } catch {
              /* ignore */
            }
          }
        }
      } catch (err) {
        console.error("Failed to claim guest attempt:", err);
      } finally {
        sessionStorage.removeItem("guestClaimMeta");
        sessionStorage.removeItem("pendingGuestTestResults");
      }
    };

    void claimGuestAttempt();
  }, []);

  // Calculate performance by exam topics (or question tags) once results + exam are ready
  useEffect(() => {
    if (typeof window === "undefined" || !testResults) return;

    try {
      const storedQuestions = sessionStorage.getItem("testQuestions");
      const storedAnswers = sessionStorage.getItem("userAnswers");
      let storedExamTopics = null;
      try {
        const rawTopics = sessionStorage.getItem("examTopics");
        if (rawTopics) storedExamTopics = JSON.parse(rawTopics);
      } catch {
        storedExamTopics = null;
      }

      // Prefer topics saved at test finish; fall back to live exam details
      const examTopicsRaw =
        (Array.isArray(storedExamTopics) && storedExamTopics.length > 0
          ? storedExamTopics
          : null) ||
        (Array.isArray(exam?.topics) && exam.topics.length > 0
          ? exam.topics
          : []) ||
        [];

      if (!storedQuestions || !storedAnswers) {
        setTopicPerformance(
          buildTopicPerformance([], {}, examTopicsRaw, testResults)
        );
        return;
      }

      const questions = JSON.parse(storedQuestions);
      const userAnswers = JSON.parse(storedAnswers);
      setTopicPerformance(
        buildTopicPerformance(questions, userAnswers, examTopicsRaw, testResults)
      );
    } catch (error) {
      console.error("Error calculating topic performance:", error);
      setTopicPerformance(
        buildTopicPerformance([], {}, exam?.topics, testResults)
      );
    }
  }, [testResults, exam]);

  const pricingUrl =
    getExamPricingPath({
      slug: getStoredExamSlug(exam) || exam?.slug,
      title: exam?.title,
      code: exam?.code,
    }) ||
    (getStoredExamSlug(exam) || exam?.slug
      ? `/${getStoredExamSlug(exam) || exam.slug}/practice/pricing`
      : "") ||
    (provider && examCode
      ? `/exams/${provider}/${examCode}/practice/pricing`
      : "");

  useEffect(() => {
    const handleLogin = () => {
      if (pendingPricingUrl) {
        setShowLoginModal(false);
        router.push(pendingPricingUrl);
        setPendingPricingUrl(null);
      }
    };

    window.addEventListener("userLoggedIn", handleLogin);
    return () => window.removeEventListener("userLoggedIn", handleLogin);
  }, [pendingPricingUrl, router]);

  if (!testResults) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
          <p className="text-[#0C1A35]/70">Loading results...</p>
        </div>
      </div>
    );
  }

  const { questionsCompleted, totalQuestions, correctAnswers, incorrectAnswers, unanswered, timeTaken } = testResults;
  
  // Recalculate to ensure accuracy
  const actualCorrectAnswers = correctAnswers || 0;
  const actualIncorrectAnswers = incorrectAnswers  || 0;
  const actualUnanswered = unanswered || 0;
  const actualCompleted = questionsCompleted - unanswered || 0;
  
  // Verify calculations match
  const verifiedCorrectAnswers = actualCorrectAnswers;
  const verifiedIncorrectAnswers = actualIncorrectAnswers;
  const verifiedUnanswered = actualUnanswered;
  const verifiedCompleted = actualCompleted;
  
  const scorePercentage = verifiedCompleted > 0 ? Math.round((verifiedCorrectAnswers / verifiedCompleted) * 100) : 0;
  const isPartialTest = verifiedCompleted < totalQuestions;

  const examDisplayName =
    exam?.title?.trim() ||
    exam?.name?.trim() ||
    decodeURIComponent(String(examCode || ""))
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) ||
    "Exam";

  // Use calculated topic performance (exam topics / question tags) — never invent static names
  const displayTopicPerformance =
    topicPerformance.length > 0
      ? topicPerformance
      : [
          {
            topic: "Overall",
            correct: verifiedCorrectAnswers,
            total: verifiedCompleted,
            percentage: scorePercentage,
          },
        ];

  const handleRetakeTest = () => {
    // Prefer the exact public SEO URL used when the test was started.
    let testPath = String(testResults?.testPath || "")
      .trim()
      .split("?")[0]
      .split("#")[0];

    if (!testPath || testPath.startsWith("/exams/")) {
      const practiceTests = Array.isArray(exam?.practice_tests_list)
        ? exam.practice_tests_list
        : Array.isArray(exam?.practice_tests)
          ? exam.practice_tests
          : [];
      const parsedIndex = Number(testResults?.testIndex);
      const idx =
        Number.isFinite(parsedIndex) && parsedIndex >= 0
          ? parsedIndex
          : 0;
      const test = practiceTests[idx] || practiceTests[0] || null;
      const segment = buildPracticeTestSeoSegment({
        examName: exam?.title || exam?.name,
        examCode: exam?.code || examCode,
        examSlug: getStoredExamSlug(exam) || exam?.slug,
        test,
        index: test ? idx : 0,
      });
      if (segment) {
        testPath = `/${segment}`;
      }
    }

    if (!testPath) return;

    if (typeof window !== "undefined") {
      // Same autostart signal as exam-details "Start Test Now" — clean URL.
      sessionStorage.setItem(`autostart:${testPath}`, "1");
    }
    router.push(testPath);
  };

  const handleViewAllTests = () => {
    const landing =
      getExamLandingPath({
        slug: getStoredExamSlug(exam) || exam?.slug,
        title: exam?.title || exam?.name,
        code: exam?.code || examCode,
      }) ||
      (getStoredExamSlug(exam) || exam?.slug
        ? `/${getStoredExamSlug(exam) || exam.slug}`
        : "") ||
      (provider && examCode ? `/exams/${provider}/${examCode}` : "");

    if (!landing) return;

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(SCROLL_TO_PRACTICE_TESTS_KEY, "1");
      } catch {
        // ignore
      }
    }
    router.push(landing);
  };

  const handleEnrollClick = () => {
    setShowUpgradeModal(true);
  };

  const handleContinueFullTest = () => {
    const targetUrl =
      pricingUrl ||
      (provider && examCode
        ? `/exams/${provider}/${examCode}/practice/pricing`
        : "");
    if (!targetUrl) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setPendingPricingUrl(targetUrl);
      setShowLoginModal(true);
      return;
    }
    router.push(targetUrl);
  };

  const handlePurchase = (planId) => {
    // Navigate to checkout page (SEO-friendly lowercase URL)
    router.push(`/checkout/${provider}/${examCode}?plan=${planId}`);
  };

  // Review answers now navigates to separate page - no function needed

  const handleReviewSubmit = async () => {
    // Review text is optional, only rating is required
    if (!reviewRating) {
      alert('Please select a rating before submitting');
      return;
    }
    
    setSubmittingReview(true);
    
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id');
      
      if (!token) {
        alert('Please login to submit a review');
        router.push('/auth?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }
      
      if (!userId) {
        // Try to get user ID from token or user object
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user.id) {
              // Use user.id if available
            }
          }
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/api/reviews/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          exam_code: examCode,
          provider: provider,
          rating: reviewRating,
          review_text: reviewText.trim() || '', // Optional, can be empty
          score: scorePercentage
        })
      });
      
      const result = await response.json();
      
      if (response.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('id');
        router.push('/auth?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }
      
      if (result.success || response.ok) {
        setReviewSubmitted(true);
        setReviewText(''); // Clear form
        
        // Get coupon code if provided
        if (result.coupon) {
          setCouponCode(result.coupon.code);
          setShowCouponModal(true);
          // Also store in localStorage for easy access
          localStorage.setItem('lastCouponCode', result.coupon.code);
        } else {
          alert('✅ Thank you for your review!');
        }
      } else {
        alert('Failed to submit review: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Review submission error:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const plans = [
    {
      id: "1month",
      duration: "1 Month",
      price: 79.99,
      originalPrice: 88.88,
      perDay: 2.58,
      color: "blue",
      popular: false
    },
    {
      id: "3months",
      duration: "3 Months",
      price: 159.99,
      originalPrice: 177.77,
      perDay: 1.76,
      color: "gray",
      popular: true
    }
  ];

  const pdfPrice = 139.99;
  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const totalPrice = selectedPlanData ? (includePDF ? selectedPlanData.price + pdfPrice : selectedPlanData.price) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header removed - using main site header if needed */}

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <Link
            href={`/exams/${provider}/${examCode}`}
            className="inline-flex items-center text-sm text-[#0C1A35]/70 hover:text-[#1A73E8] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exam Details
          </Link>

          {/* Main Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-[#1A73E8]/10 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-[#1A73E8]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0C1A35] mb-2">
              {isPartialTest ? "Practice Test Completed!" : "Test Complete!"}
            </h1>
            <p className="text-[#0C1A35]/70">{examDisplayName} - Practice Test</p>
          </div>

          {/* Score Card */}
          <Card className="bg-white p-6 md:p-8 shadow-md mb-6 border-[#DDE7FF]">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#1A73E8]/10 mb-4">
                <span className="text-4xl font-bold text-[#1A73E8]">{scorePercentage}%</span>
              </div>
              <h2 className="text-2xl font-bold text-[#0C1A35] mb-2">
                {scorePercentage >= 70 ? "Great Job!" : scorePercentage >= 50 ? "Good Effort!" : "Keep Practicing!"}
              </h2>
              {/* <p className="text-[#0C1A35]/70">
                You answered {verifiedCompleted} out of {isPartialTest ? `${verifiedCompleted} free` : totalQuestions} questions
              </p> */}
              {/* {isPartialTest && (
                <p className="text-yellow-600 font-semibold mt-2">
                  🎁 Free Trial - {totalQuestions - questionsCompleted} questions remaining
                </p>
              )} */}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{verifiedCorrectAnswers}</div>
                <div className="text-xs text-green-600">Correct</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-700">{verifiedIncorrectAnswers}</div>
                <div className="text-xs text-red-600">Incorrect</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">{timeTaken || '0:00'}</div>
                <div className="text-xs text-blue-600">Time Taken</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
                <List className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">{verifiedCompleted}/{totalQuestions}</div>
                <div className="text-xs text-purple-600">Completed</div>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#0C1A35]/70">Your Score</span>
                <span className="font-semibold text-[#0C1A35]">{scorePercentage}%</span>
              </div>
              <Progress value={scorePercentage} className="h-3" />
            </div>
          </Card>

          {/* Topic-wise Performance */}
          <Card className="bg-white p-6 md:p-8 shadow-md mb-6 border-[#DDE7FF]">
            <h3 className="text-xl font-bold text-[#0C1A35] mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#1A73E8]" />
              Performance by Topic
            </h3>
            <div className="space-y-4">
              {displayTopicPerformance.map((topic, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#0C1A35]">{topic.topic}</span>
                    <span className="text-sm text-[#0C1A35]/70">
                      {topic.correct}/{topic.total} correct ({topic.percentage}%)
                    </span>
                  </div>
                  <Progress value={topic.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </Card>

          {/* Upsell Banner for Free Users */}
          {!hasFullAccess && isPartialTest && (
            <Card className="bg-gradient-to-r from-[#1A73E8] to-[#1557B0] text-white p-6 md:p-8 shadow-lg mb-6 border-0">
              <div className="text-center">
                <Lock className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h3 className="text-2xl font-bold mb-2">🔓 Unlock the Full Test Experience</h3>
                <p className="text-white/90 mb-4">
                  You've completed the free trial. Get access to:
                </p>
                <ul className="text-left max-w-md mx-auto mb-6 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span>
                    <span>All practice questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span>
                    <span>Detailed explanations for every answer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span>
                    <span>Performance tracking and analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span>
                    <span>Unlimited practice attempts</span>
                  </li>
                  {/* <li className="flex items-start gap-2">
                    <span className="text-white">✓</span>
                    <span>No Captcha / Robot Checks</span>
                  </li> */}
                </ul>
                <Button
                  size="lg"
                  className="bg-white text-[#1A73E8] hover:bg-white/90 font-semibold"
                  onClick={handleContinueFullTest}
                >
                  Continue Full Test →
                </Button>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button
              variant="outline"
              size="lg"
              onClick={handleRetakeTest}
              className="border-[#1A73E8] text-[#1A73E8] hover:bg-[#1A73E8]/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Test
            </Button>
            
            <Button
              size="lg"
              onClick={() => router.push(`/test-review/${provider}/${examCode}/answers`)}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              <List className="w-4 h-4 mr-2" />
              Review Answers
            </Button>
            
            <Button
              size="lg"
              onClick={handleViewAllTests}
              className="bg-[#1A73E8] text-white hover:bg-[#1557B0]"
            >
              View All Tests →
            </Button>
            
            <Button
              size="lg"
              onClick={() => router.push('/dashboard')}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Go to Dashboard →
            </Button>
          </div>

          {/* Review Submission Section */}
          <Card className="mb-6 border-[#DDE7FF]">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-[#1A73E8]" />
                <h3 className="text-xl font-bold text-[#0C1A35]">Share Your Experience</h3>
              </div>
              
              {!reviewSubmitted ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0C1A35] mb-2">
                      How would you rate this practice test? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isActive = star <= (hoveredRating || reviewRating);
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(0)}
                              className={`transition-all transform hover:scale-110 ${
                                isActive ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              aria-label={`Rate ${star} out of 5 stars`}
                            >                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
                              <Star 
                                className={`w-10 h-10 ${isActive ? 'fill-yellow-400' : ''} transition-all`}
                              />
                            </button>
                          );
                        })}
                      </div>
                      {reviewRating > 0 ? (
                        <span className="ml-4 text-lg font-semibold text-[#0C1A35]">
                          {reviewRating}/5
                        </span>
                      ) : (
                        <span className="ml-4 text-sm text-gray-500 italic">
                          Click stars to rate
                        </span>
                      )}
                    </div>
                    {reviewRating === 0 && (
                      <p className="text-xs text-red-500 mt-1">Please select a rating</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#0C1A35] mb-2">
                      Your Review (Optional)
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
                      rows={4}
                      placeholder="Share your experience with this practice test... (e.g., quality of questions, difficulty level, explanations, etc.)"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleReviewSubmit}
                    disabled={submittingReview || !reviewRating}
                    className="bg-[#1A73E8] text-white hover:bg-[#1557B0]"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">Review Submitted Successfully!</p>
                      <p className="text-sm text-green-600">Thank you for your feedback.</p>
                    </div>
                  </div>
                  
                  {couponCode && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-5 h-5 text-yellow-600" />
                        <p className="font-bold text-yellow-900">🎉 You've earned a coupon code!</p>
                      </div>
                      <p className="text-sm text-yellow-800 mb-3">
                        Use this code during checkout to get a discount on any course enrollment.
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white border-2 border-yellow-400 rounded-lg px-4 py-3">
                          <code className="text-2xl font-bold text-yellow-900 tracking-wider">{couponCode}</code>
                        </div>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(couponCode);
                            alert('Coupon code copied to clipboard!');
                          }}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-yellow-700 mt-2">
                        💡 Save this code! You can use it when enrolling in any course.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Motivational Message */}
          <Card className="bg-blue-50 border-blue-200 p-6">
            <div className="text-center">
              <h4 className="font-semibold text-[#0C1A35] mb-2">
                {scorePercentage >= 70 ? "🎉 Excellent work!" : "💪 Keep going!"}
              </h4>
              <p className="text-sm text-[#0C1A35]/70">
                {scorePercentage >= 70 
                  ? "You're on the right track! Keep practicing to maintain your performance."
                  : "Practice makes perfect! Review the topics you struggled with and try again."
                }
              </p>
            </div>
          </Card>
        </div>
      </main>

      {/* Pricing Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-5xl p-0 gap-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold text-[#0C1A35]">
              Contributor Access
            </DialogTitle>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogHeader>
          
          <div className="p-6">
            <p className="text-center text-[#0C1A35]/70 mb-6">
              Unlock all features for {examDisplayName} exam preparation
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative overflow-hidden border-2 transition-all ${
                    selectedPlan === plan.id 
                      ? "border-[#1A73E8] shadow-lg" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0">
                      <Badge className="rounded-none rounded-bl-lg bg-[#1A73E8] text-white border-0 px-3 py-1">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  
                  <div className={`${plan.color === "blue" ? "bg-[#1A73E8]" : "bg-gray-800"} text-white p-4 text-center`}>
                    <h3 className="text-xl font-bold">
                      ${plan.price.toFixed(2)} (Valid for {plan.duration})
                    </h3>
                  </div>

                  <div className="p-6">
                    {/* Visual Product */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className={`w-40 h-32 ${plan.color === "blue" ? "bg-gradient-to-br from-blue-50 to-blue-100" : "bg-gradient-to-br from-gray-100 to-gray-200"} rounded-lg flex items-center justify-center border-2 ${plan.color === "blue" ? "border-blue-200" : "border-gray-300"}`}>
                          <div className="text-center">
                            <p className="text-xs font-bold text-gray-700 mb-1">CONTRIBUTOR</p>
                            <p className="text-xs font-bold text-gray-700 mb-1">ACCESS</p>
                            <p className="text-2xl font-bold text-gray-800">{plan.duration === "1 Month" ? "31" : "93"}</p>
                            <p className="text-xs text-gray-600">DAYS</p>
                          </div>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                          <Shield className="w-8 h-8 text-green-600 fill-green-100" />
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#0C1A35]">{plan.duration}</span>
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold text-white ${plan.color === "blue" ? "bg-green-600" : "bg-gray-700"}`}>
                            ${plan.perDay} / day
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#0C1A35]">All Questions for 1 Exam</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#0C1A35]">Inline Discussions</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#0C1A35]">No Captcha / Robot Checks</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#0C1A35]">Includes New Updates</span>
                      </div>
                    </div>

                    {/* PDF Add-on */}
                    <div className="border-t pt-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id={`pdf-${plan.id}`}
                          checked={selectedPlan === plan.id && includePDF}
                          onCheckedChange={(checked) => {
                            setSelectedPlan(plan.id);
                            setIncludePDF(checked);
                          }}
                        />
                        <label htmlFor={`pdf-${plan.id}`} className="text-sm text-[#0C1A35] cursor-pointer">
                          PDF Version of Practice Questions & Answers (+${pdfPrice.toFixed(2)})
                        </label>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-gray-400 line-through text-sm">${plan.originalPrice.toFixed(2)}</span>
                        <span className="text-2xl font-bold text-[#0C1A35]">
                          ${selectedPlan === plan.id && includePDF ? (plan.price + pdfPrice).toFixed(2) : plan.price.toFixed(2)}
                        </span>
                        <Badge className="bg-green-600 text-white">10% Off</Badge>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6"
                      onClick={() => handlePurchase(plan.id)}
                    >
                      Get {plan.duration} Access - ${selectedPlan === plan.id && includePDF ? (plan.price + pdfPrice).toFixed(2) : plan.price.toFixed(2)}
                    </Button>
                    
                    <p className="text-center text-xs text-gray-500 mt-2">*One Time Payment</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Coupon Code Modal */}
      <Dialog open={showCouponModal} onOpenChange={setShowCouponModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-[#0C1A35] flex items-center justify-center gap-2">
              <Gift className="w-8 h-8 text-yellow-500" />
              🎉 Congratulations!
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4 py-4">
            <p className="text-lg text-[#0C1A35]">
              Thank you for your review! You've earned a special discount coupon.
            </p>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6">
              <p className="text-sm text-yellow-800 mb-3 font-semibold">Your Coupon Code:</p>
              <div className="bg-white border-2 border-yellow-400 rounded-lg px-6 py-4 mb-4">
                <code className="text-3xl font-bold text-yellow-900 tracking-widest">{couponCode}</code>
              </div>
              <p className="text-xs text-yellow-700 mb-4">
                Get <strong>10% discount</strong> on any course enrollment!
              </p>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(couponCode);
                  alert('✅ Coupon code copied to clipboard!');
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Coupon Code
              </Button>
            </div>
            
            <p className="text-sm text-[#0C1A35]/70">
              Use this code during checkout when enrolling in any course to get your discount.
            </p>
            
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowCouponModal(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowCouponModal(false);
                  router.push('/exams');
                }}
                className="flex-1 bg-[#1A73E8] text-white hover:bg-[#1557B0]"
              >
                Browse Courses
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please log in to unlock the full test and access all questions.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowLoginModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                router.push(
                  `/auth/login?redirect=${encodeURIComponent(
                    pendingPricingUrl || pricingUrl || window.location.pathname
                  )}`
                )
              }
              className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0] text-white"
            >
              Login / Sign Up
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
