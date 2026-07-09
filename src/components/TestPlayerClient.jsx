"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "@/lib/navigation/client";
import Link from "next/link";
import { Clock, Star, Compass, ChevronLeft, ChevronRight, FileText, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import TipTapContent from "@/components/editor/TipTapContent";
import { normalizeAnswersToIndexKey } from "@/utils/testReviewDisplay";
import { getExamPracticePath } from "@/utils/practiceTestRouting";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const FREE_QUESTIONS_LIMIT = 10;
const GUEST_ATTEMPT_ID = "guest-local";
const QUESTIONS_PER_PAGE = 20;

const isGarbageImageRef = (url) =>
  typeof url === "string" &&
  (url.includes("GridFS") ||
    url.includes("gridfs") ||
    url.includes("ObjectId("));

/** Absolute http(s) URL, or site-relative /media paths joined to API origin */
const resolveMediaUrl = (url) => {
  if (url == null || url === "") return null;
  const s = typeof url === "string" ? url.trim() : String(url);
  if (!s || isGarbageImageRef(s)) return null;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("//")) return `https:${s}`;
  if (s.startsWith("/")) return `${API_BASE_URL}${s}`;
  return s;
};

const hasHtmlContent = (value) =>
  typeof value === "string" && /<\/?[a-z][\s\S]*>/i.test(value);

/** TipTap / ProseMirror JSON → plain text for display (never "[object Object]"). */
const extractPlainFromProseMirrorLike = (node, depth = 0) => {
  if (depth > 50 || node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node !== "object") return "";
  let out = "";
  if (typeof node.text === "string") out += node.text;
  if (node.attrs && typeof node.attrs === "object") {
    for (const key of ["label", "title", "name", "alt", "caption"]) {
      const v = node.attrs[key];
      if (typeof v === "string" && v.trim()) {
        out = out ? `${out} ${v.trim()}` : v.trim();
      }
    }
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      const piece = extractPlainFromProseMirrorLike(child, depth + 1);
      if (piece) out = out ? `${out} ${piece}` : piece;
    }
  }
  return out.replace(/\s+/g, " ").trim();
};

/** Coerce question/option content to a display string; objects are parsed, not Stringified. */
const contentToDisplayString = (content) => {
  if (content == null || content === "") return "";
  if (typeof content === "string") return content;
  if (typeof content === "object") {
    const fromDoc = extractPlainFromProseMirrorLike(content);
    if (fromDoc) return fromDoc;
    if (typeof content.text === "string") return content.text;
    if (content.text && typeof content.text === "object") {
      const inner = extractPlainFromProseMirrorLike(content.text);
      if (inner) return inner;
    }
    for (const key of ["label", "title", "name", "alt"]) {
      const v = content[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return "";
  }
  return String(content);
};

const RichContent = ({ content, className = "" }) => {
  const safeContent = contentToDisplayString(content);
  if (!safeContent.trim()) return null;

  if (hasHtmlContent(safeContent)) {
    return <TipTapContent content={safeContent} className={`break-words ${className}`} />;
  }

  return (
    <div className={`whitespace-pre-wrap break-words ${className}`}>{safeContent}</div>
  );
};

export default function TestPlayerClient({ exam, questions, test, provider, examCode, testId }) {
  const router = useRouter();

  const practiceHubPath =
    getExamPracticePath(exam) ||
    (provider && examCode
      ? `/exams/${provider}/${examCode}/practice`
      : "/exams");

  // State

  const [testStarted, setTestStarted] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // Test player state
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [navigatorPage, setNavigatorPage] = useState(1);
  const [attemptId, setAttemptId] = useState(null);
  const [isStartingTest, setIsStartingTest] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [autostartPending, setAutostartPending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const handleSubmitRef = useRef(null);
  const timeRemainingRef = useRef(null);
  /** Prevents double time-up submit (Strict Mode / duplicate ticks). */
  const autoTimeExpiredSubmitRef = useRef(false);

  timeRemainingRef.current = timeRemaining;

  const currentTest = useMemo(() => {
    const practiceTests = exam?.practice_tests_list || [];
    if (practiceTests.length === 0) {
      return {
        id: testId,
        name: `Practice Test ${testId}`,
        questions: questions.length || 0,
        duration: exam?.duration || "30 minutes",
        difficulty: exam?.difficulty || "Medium",
        free_trial_questions: test?.free_trial_questions,
      };
    }

    const testIdWithoutHash =
      testId && typeof testId === "string"
        ? testId.replace(/-[a-f0-9]{8}$/i, "")
        : testId;

    let match = practiceTests.find((t) => t.slug === testId);
    if (!match) {
      match = practiceTests.find((t) => {
        const slugWithoutHash =
          t.slug && typeof t.slug === "string"
            ? t.slug.replace(/-[a-f0-9]{8}$/i, "")
            : t.slug;
        return slugWithoutHash === testIdWithoutHash || slugWithoutHash === testId;
      });
    }
    if (!match) {
      match = practiceTests.find(
        (t) => String(t.id || t._id || "") === String(testId)
      );
    }
    if (!match && testId) {
      const testIndex = parseInt(testId, 10) - 1;
      if (testIndex >= 0 && testIndex < practiceTests.length) {
        match = practiceTests[testIndex];
      }
    }

    return (
      match || {
        id: testId,
        name: `Practice Test ${testId}`,
        questions: questions.length || 0,
        duration: exam?.duration || "30 minutes",
        difficulty: exam?.difficulty || "Medium",
      }
    );
  }, [exam, testId, test, questions.length]);

  const freeQuestionsLimit = useMemo(() => {
    const raw =
      test?.free_trial_questions ?? currentTest?.free_trial_questions;
    const parsed = parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return FREE_QUESTIONS_LIMIT;
  }, [test, currentTest]);

  const isFreeExam = useMemo(() => {
    const accessType = exam?.pricing_access_type || "paid";
    return String(accessType).toLowerCase() === "free";
  }, [exam?.pricing_access_type]);

  const hasFullAccess = isEnrolled || isFreeExam;

  const getAccessibleCount = () =>
    hasFullAccess
      ? questions.length
      : Math.min(freeQuestionsLimit, questions.length);

  // Precompute option text -> index lookups once per question set so submit stays fast.
  const optionIndexLookups = useMemo(
    () =>
      questions.map((question) => {
        const map = new Map();
        const opts = Array.isArray(question?.options) ? question.options : [];
        for (let i = 0; i < opts.length; i++) {
          const raw = opts[i]?.text ?? opts[i];
          const key = raw == null ? "" : String(raw);
          if (!map.has(key)) map.set(key, i);
        }
        return map;
      }),
    [questions]
  );

  // Get authentication token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token || token.trim() === '') {
        return null;
      }
      return token;
    }
    return null;
  };

  // Check if user is logged in
  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token);
    setAuthReady(true);
  }, []);

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      if (isFreeExam) {
        setIsEnrolled(true);
        setCheckingEnrollment(false);
        return;
      }

      const token = getAuthToken();
      
      if (!token || !exam?.id) {
        setIsEnrolled(false);
        setCheckingEnrollment(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/enrollments/check/${exam.id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setIsEnrolled(data.already_enrolled || false);
        } else {
          setIsEnrolled(false);
        }
      } catch (err) {
        setIsEnrolled(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    if (exam) {
      checkEnrollment();
    }
  }, [exam, isFreeExam]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTimeLimit = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} mins`;
  };

  const parseDuration = (duration) => {
    if (!duration) return 30;
    if (typeof duration === 'number') return duration;
    if (typeof duration === 'string') {
      const match = duration.match(/\d+/);
      return match ? parseInt(match[0]) : 30;
    }
    return 30;
  };

  const formatDurationDisplay = (duration) => {
    const minutes = parseDuration(duration);
    return `${minutes} mins`;
  };

  const canAccessQuestion = (questionNum) => {
    return hasFullAccess || questionNum <= freeQuestionsLimit;
  };

  const handleAnswerChange = (optionText, checked = null) => {
    if (!canAccessQuestion(currentQuestion)) return;
    
    const currentQuestionData = questions[currentQuestion - 1];
    const questionType = currentQuestionData?.question_type?.toLowerCase();
    const correctAnswersCount = currentQuestionData?.correct_answers?.length || 0;
    const isSingle = questionType === "single" || (questionType !== "multiple" && correctAnswersCount <= 1);
    
    if (isSingle) {
      setAnswers({ ...answers, [currentQuestion]: optionText });
    } else {
      const currentAnswers = Array.isArray(answers[currentQuestion]) ? answers[currentQuestion] : [];
      let newAnswers;
      
      if (checked === null) {
        newAnswers = [optionText];
      } else if (checked) {
        newAnswers = [...currentAnswers, optionText];
      } else {
        newAnswers = currentAnswers.filter(ans => ans !== optionText);
      }
      
      setAnswers({ ...answers, [currentQuestion]: newAnswers });
    }
  };

  const handleNext = () => {
    const nextQuestion = currentQuestion + 1;
    
    if (!hasFullAccess && nextQuestion > freeQuestionsLimit && nextQuestion <= questions.length) {
      setShowUpgradeModal(true);
      return;
    }
    
    if (currentQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      const newPage = Math.ceil(nextQuestion / QUESTIONS_PER_PAGE);
      if (newPage !== navigatorPage) {
        setNavigatorPage(newPage);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
      const newPage = Math.ceil((currentQuestion - 1) / QUESTIONS_PER_PAGE);
      if (newPage !== navigatorPage) {
        setNavigatorPage(newPage);
      }
    }
  };

  const handleQuestionNavigate = (questionNum) => {
    if (!canAccessQuestion(questionNum)) {
      setShowUpgradeModal(true);
      return;
    }
    setCurrentQuestion(questionNum);
    const newPage = Math.ceil(questionNum / QUESTIONS_PER_PAGE);
    setNavigatorPage(newPage);
  };

  const getAnsweredCount = () => {
    const limit = getAccessibleCount();
    return Object.keys(answers).filter(q => {
      const qNum = parseInt(q);
      if (qNum > limit) return false;
      const answer = answers[q];
      if (!answer) return false;
      if (Array.isArray(answer)) {
        return answer.length > 0;
      }
      return answer !== "" && answer !== null;
    }).length;
  };

  const getRemainingCount = () => {
    const limit = getAccessibleCount();
    return limit - getAnsweredCount();
  };

  const scoreGuestAnswers = (accessibleQuestions) => {
    let correct = 0;
    let unanswered = 0;

    for (let i = 0; i < accessibleQuestions.length; i++) {
      const q = accessibleQuestions[i];
      const questionNum = i + 1;
      const userAnswer = answers[questionNum];
      const hasAnswer =
        userAnswer &&
        (Array.isArray(userAnswer) ? userAnswer.length > 0 : userAnswer !== "");

      if (!hasAnswer) {
        unanswered++;
        continue;
      }

      const correctAnswers =
        q.correct_answers || (q.correct_answer ? [q.correct_answer] : []);
      if (!correctAnswers.length) continue;

      const opts = q.options && Array.isArray(q.options) ? q.options : [];
      let isCorrect = false;

      if (opts.length > 0) {
        const userKey = normalizeAnswersToIndexKey(userAnswer, opts);
        const correctKey = normalizeAnswersToIndexKey(correctAnswers, opts);
        isCorrect = userKey === correctKey && userKey !== "";
      } else if (Array.isArray(userAnswer)) {
        const userAnswerTexts = userAnswer
          .map((a) => String(a).trim().toLowerCase())
          .sort();
        const correctAnswerTexts = correctAnswers
          .map((a) => String(a).trim().toLowerCase())
          .sort();
        isCorrect =
          JSON.stringify(userAnswerTexts) === JSON.stringify(correctAnswerTexts);
      } else {
        const userAnswerText = String(userAnswer).trim().toLowerCase();
        isCorrect = correctAnswers.some(
          (ca) => String(ca).trim().toLowerCase() === userAnswerText
        );
      }

      if (isCorrect) correct++;
    }

    return { correct, unanswered };
  };

  const finishGuestTest = (totalAccessible) => {
    const accessibleQuestions = questions.slice(0, totalAccessible);
    const { correct, unanswered } = scoreGuestAnswers(accessibleQuestions);
    const incorrect = totalAccessible - correct - unanswered;
    const totalDurationSeconds = parseDuration(
      currentTest?.duration ?? test?.duration ?? exam?.duration ?? "30"
    ) * 60;
    const elapsedSeconds = totalDurationSeconds - (timeRemaining || 0);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const timeTaken = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    const percentage =
      totalAccessible > 0 ? Math.round((correct / totalAccessible) * 100) : 0;

    const testResults = {
      questionsCompleted: totalAccessible,
      totalQuestions: questions.length,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unanswered,
      timeTaken,
      hasFullAccess: false,
      answers,
      percentage,
      passed: percentage >= 70,
      attemptId: GUEST_ATTEMPT_ID,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("testResults", JSON.stringify(testResults));
      sessionStorage.setItem("userAnswers", JSON.stringify(answers));
      sessionStorage.setItem(
        "testQuestions",
        JSON.stringify(accessibleQuestions)
      );
      sessionStorage.setItem("attemptId", GUEST_ATTEMPT_ID);
    }

    router.push(`/test-review/${provider}/${examCode}`);
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (isSubmitting) return;
    const totalAccessible = getAccessibleCount();

    if (!attemptId) {
      console.error('[TestPlayer] No attempt_id found.');
      alert('Error: Test attempt not found. Please start the test again.');
      return;
    }

    if (attemptId === GUEST_ATTEMPT_ID) {
      setIsSubmitting(true);
      try {
        finishGuestTest(totalAccessible);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        alert('You must be logged in to submit the test.');
        setIsSubmitting(false);
        return;
      }

      const userAnswers = [];
      const accessibleQuestions = questions.slice(0, totalAccessible);
      
      for (let i = 0; i < accessibleQuestions.length; i++) {
        const question = accessibleQuestions[i];
        const questionId = question.id || question._id || question.question_id;
        const questionNum = i + 1;
        const userAnswer = answers[questionNum];
        
        if (!questionId) continue;
        
        let selectedAnswers = [];

        if (userAnswer && question.options) {
          const options = Array.isArray(question.options) ? question.options : [];
          const textToIndexMap = optionIndexLookups[i] || new Map();
          const resolveIndex = (ans) => {
            if (ans == null) return -1;
            const s = String(ans);
            if (/^\d+$/.test(s)) {
              const optionIndex = parseInt(s, 10);
              if (optionIndex >= 0 && optionIndex < options.length) return optionIndex;
            }
            return textToIndexMap.get(s) ?? -1;
          };
          if (Array.isArray(userAnswer)) {
            selectedAnswers = userAnswer
              .map((ans) => {
                const index = resolveIndex(ans);
                return index !== -1 ? String(index) : null;
              })
              .filter((val) => val !== null);
          } else {
            const index = resolveIndex(userAnswer);
            if (index !== -1) {
              selectedAnswers = [String(index)];
            }
          }
        }

        userAnswers.push({
          question_id: String(questionId),
          selected_answers: selectedAnswers
        });
      }

      const submitResponse = await fetch(`${API_BASE_URL}/api/exams/attempt/${attemptId}/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_answers: userAnswers
        })
      });

      if (!submitResponse.ok) {
        let errorMessage = 'Error submitting test. Please try again.';
        try {
          const errorData = await submitResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          const errorText = await submitResponse.text().catch(() => 'Unknown error');
          errorMessage = `Server error (${submitResponse.status}): ${errorText || 'Please try again.'}`;
        }
        alert(errorMessage);
        setIsSubmitting(false);
        return;
      }

      let submitData;
      try {
        submitData = await submitResponse.json();
      } catch (parseError) {
        alert('Error: Invalid response from server. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      if (!submitData.success) {
        alert(submitData.message || 'Failed to submit test. Please try again.');
        setIsSubmitting(false);
        return;
      }

      let unanswered = 0;
      for (let i = 1; i <= totalAccessible; i++) {
        const userAnswer = answers[i];
        if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
          unanswered++;
        }
      }
      
      const totalDurationSeconds = parseDuration(exam?.duration) * 60;
const elapsedSeconds = totalDurationSeconds - (timeRemaining || 0);

const minutes = Math.floor(elapsedSeconds / 60);
const seconds = elapsedSeconds % 60;

const timeTaken = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      const testResults = {
        questionsCompleted: totalAccessible,
        totalQuestions: questions.length,
        correctAnswers: submitData.score || 0,
        incorrectAnswers: totalAccessible - (submitData.score || 0) - unanswered,
        unanswered,
        timeTaken,
        hasFullAccess: hasFullAccess,
        answers: answers,
        percentage: submitData.percentage || 0,
        passed: submitData.passed || false,
        attemptId: attemptId
      };
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('testResults', JSON.stringify(testResults));
        sessionStorage.setItem('userAnswers', JSON.stringify(answers));
        sessionStorage.setItem('testQuestions', JSON.stringify(questions.slice(0, totalAccessible)));
        sessionStorage.setItem('attemptId', attemptId);
      }
      
      router.push(`/test-review/${provider}/${examCode}`);
      setIsSubmitting(false);
    } catch (error) {
      console.error('[TestPlayer] Error submitting test:', error);
      alert('Error submitting test. Please try again.');
      setIsSubmitting(false);
    }
  };

  handleSubmitRef.current = handleSubmit;

  // Countdown: keep a fixed-size dependency array ([testStarted, timerActive]) so React never sees a changing hook arity (e.g. after Fast Refresh).
  // `timerActive` only flips when the test starts (timer armed), not on every tick, so the interval is not recreated every second.
  // Only auto-submit when the clock actually reaches the last second (prev === 1), not when time was already 0 (expired resume / bad state).
  const timerActive = testStarted && timeRemaining != null;
  useEffect(() => {
    if (!timerActive) return;

    const startSeconds = timeRemainingRef.current ?? 0;
    if (startSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev == null) return prev;
        if (prev === 1) {
          clearInterval(timer);
          if (!autoTimeExpiredSubmitRef.current) {
            autoTimeExpiredSubmitRef.current = true;
            const submit = handleSubmitRef.current;
            if (typeof submit === "function") void submit(true);
          }
          return 0;
        }
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, timerActive]);

  const handleUpgradeClick = () => {
    router.push(`/exams/${provider}/${examCode}/practice/pricing`);
  };

  const startGuestTestSession = () => {
    const limitMinutes = Math.max(
      1,
      parseDuration(
        currentTest?.duration ?? test?.duration ?? exam?.duration ?? "30"
      )
    );
    const totalSeconds = Math.floor(limitMinutes * 60);
    autoTimeExpiredSubmitRef.current = false;
    setAttemptId(GUEST_ATTEMPT_ID);
    setTimeRemaining(totalSeconds);
    setTestStarted(true);
  };

  const [autostartRequested, setAutostartRequested] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search || "");
    const queryAutoStart = params.get("autostart");
    const fromQuery =
      queryAutoStart === "1" ||
      String(queryAutoStart).toLowerCase() === "true";
    const pathKey = `autostart:${window.location.pathname}`;
    const fromSession = sessionStorage.getItem(pathKey) === "1";
    if (fromQuery || fromSession) {
      sessionStorage.removeItem(pathKey);
      setAutostartRequested(true);
      setAutostartPending(true);
    }
  }, []);

  const autostartFiredRef = useRef(false);

  const resolveApiTestId = () => {
    const raw = test?.id ?? test?._id ?? testId;
    if (raw == null || raw === "") return String(testId ?? "1");
    const rawStr = String(raw).trim();
    if (/^\d+$/.test(rawStr)) return rawStr;
    const practiceTests = exam?.practice_tests_list || [];
    const match = practiceTests.find(
      (t) =>
        String(t?.id || t?._id || "") === rawStr ||
        String(t?.slug || "").replace(/-[a-f0-9]{8}$/i, "") ===
          rawStr.replace(/-[a-f0-9]{8}$/i, "")
    );
    if (match) {
      const idx = practiceTests.indexOf(match);
      return String(idx >= 0 ? idx + 1 : rawStr);
    }
    return rawStr;
  };

  const handleStartTest = async () => {
    if (isStartingTest || testStarted) {
      return;
    }

    if (questions.length === 0) {
      setAutostartPending(false);
      return;
    }

    setIsStartingTest(true);
    try {
      const token = getAuthToken();
      const tokenValid = !!token && token.split(".").length === 3;
      const useServerAttempt =
        tokenValid && isLoggedIn && hasFullAccess && !!exam?.id;

      if (!useServerAttempt) {
        if (token && !tokenValid && typeof window !== "undefined") {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }
        startGuestTestSession();
        return;
      }

      const examId = String(exam.id);
      const apiTestId = resolveApiTestId();
      let response;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        response = await fetch(`${API_BASE_URL}/api/exams/attempt/get-or-create/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            exam_id: examId,
            test_id: apiTestId,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch {
        startGuestTestSession();
        return;
      }

      const responseText = await response.text();

      if (!response.ok) {
        if (response.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }
        startGuestTestSession();
        return;
      }

      let attemptData;
      try {
        attemptData = JSON.parse(responseText);
      } catch {
        startGuestTestSession();
        return;
      }

      if (attemptData.success && attemptData.attempt_id) {
        const limitMinutes = Math.max(
          1,
          typeof attemptData.time_limit === "number" && attemptData.time_limit > 0
            ? attemptData.time_limit
            : parseDuration(test?.duration ?? exam?.duration ?? "30")
        );
        const totalSeconds = Math.floor(limitMinutes * 60);
        let initialSeconds = totalSeconds;
        if (attemptData.is_existing && attemptData.start_time) {
          const started = Date.parse(attemptData.start_time);
          if (!Number.isNaN(started)) {
            const elapsed = Math.floor((Date.now() - started) / 1000);
            initialSeconds = Math.max(0, totalSeconds - elapsed);
          }
        }
        if (initialSeconds <= 0) {
          initialSeconds = totalSeconds;
        }

        autoTimeExpiredSubmitRef.current = false;
        setAttemptId(attemptData.attempt_id);
        setTimeRemaining(initialSeconds);
        setTestStarted(true);
      } else {
        startGuestTestSession();
      }
    } catch {
      startGuestTestSession();
    } finally {
      setIsStartingTest(false);
      setAutostartPending(false);
    }
  };

  // If requested via URL flag, skip the "Ready" screen and start immediately.
  useEffect(() => {
    if (!autostartRequested) return;
    if (autostartFiredRef.current) return;
    if (testStarted) return;
    if (!exam) return;
    if (!questions || questions.length === 0) return;
    if (!authReady || checkingEnrollment) return;

    autostartFiredRef.current = true;
    void handleStartTest();
  }, [
    autostartRequested,
    testStarted,
    exam,
    questions?.length,
    authReady,
    checkingEnrollment,
    hasFullAccess,
    isLoggedIn,
  ]);

  

  
  
 
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-[#0C1A35] mb-4">No Questions Available</h1>
          <p className="text-[#0C1A35]/70 mb-6">
            This test doesn't have any questions yet. Please add questions to this test.
          </p>
          <Button asChild className="bg-[#1A73E8] text-white hover:bg-[#1557B0]">
            <Link href={practiceHubPath}>Back to Practice Tests</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!testStarted && autostartPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#1A73E8]/20 border-t-[#1A73E8]" />
          <p className="text-lg font-medium text-[#0C1A35]">Opening your test...</p>
          <p className="text-sm text-[#0C1A35]/60">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="mb-4">
            <Button asChild variant="ghost">
            <Link href={practiceHubPath}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Practice Tests
            </Link>
            </Button>
          </div>
          <Card className="border-[#DDE7FF]">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-[#1A73E8]/10 flex items-center justify-center mx-auto">
                  <FileText className="w-10 h-10 text-[#1A73E8]" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-[#0C1A35] mb-2">
                    Ready to Start Your Test?
                  </h2>
                  <p className="text-[#0C1A35]/70 mb-6 max-w-2xl mx-auto">
                    {exam.test_description || `This practice test contains questions to help you prepare for the exam.`}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-3xl font-bold text-[#1A73E8] mb-1">
                      {hasFullAccess ? questions.length : `${Math.min(freeQuestionsLimit, questions.length)} Free`}
                    </div>
                    <div className="text-sm text-[#0C1A35]/70">Questions</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {timeRemaining ? formatTimeLimit(timeRemaining) : formatDurationDisplay(currentTest?.duration || exam?.duration)}
                    </div>
                    <div className="text-sm text-[#0C1A35]/70">Duration</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {currentTest.difficulty || exam.difficulty || "Medium"}
                    </div>
                    <div className="text-sm text-[#0C1A35]/70">Difficulty</div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={handleStartTest}
                    disabled={isStartingTest || questions.length === 0}
                    className="bg-[#1A73E8] text-white hover:bg-[#1557B0] px-12"
                  >
                    <Clock className="w-5 h-5 mr-2" />
                    {isStartingTest ? "Starting..." : "Start Test Now"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion - 1];
  const questionType = currentQuestionData?.question_type?.toLowerCase();
  const correctAnswersCount = currentQuestionData?.correct_answers?.length || 0;
  const isSingleChoice = questionType === "single" || 
    (questionType !== "multiple" && correctAnswersCount <= 1);
  const currentAnswer = isSingleChoice 
    ? (answers[currentQuestion] || "") 
    : (Array.isArray(answers[currentQuestion]) ? answers[currentQuestion] : []);
  const totalQuestions = questions.length;
  const accessibleQuestions = hasFullAccess ? totalQuestions : Math.min(freeQuestionsLimit, totalQuestions);
  const answeredCount = getAnsweredCount();
  const progressPercentage = (answeredCount / accessibleQuestions) * 100;
  const atFreeQuestionLimit =
    !hasFullAccess &&
    (currentQuestion >= accessibleQuestions ||
      answeredCount >= accessibleQuestions);

  const getOptions = () => {
    if (currentQuestionData.options && Array.isArray(currentQuestionData.options)) {
      return currentQuestionData.options;
    }
    const options = [];
    if (currentQuestionData.option_a) options.push({ text: currentQuestionData.option_a, value: 'A' });
    if (currentQuestionData.option_b) options.push({ text: currentQuestionData.option_b, value: 'B' });
    if (currentQuestionData.option_c) options.push({ text: currentQuestionData.option_c, value: 'C' });
    if (currentQuestionData.option_d) options.push({ text: currentQuestionData.option_d, value: 'D' });
    if (currentQuestionData.option_e) options.push({ text: currentQuestionData.option_e, value: 'E' });
    if (currentQuestionData.option_f) options.push({ text: currentQuestionData.option_f, value: 'F' });
    return options;
  };

  const options = getOptions();
  const totalNavigatorPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
  const startQuestion = (navigatorPage - 1) * QUESTIONS_PER_PAGE + 1;
  const endQuestion = Math.min(navigatorPage * QUESTIONS_PER_PAGE, totalQuestions);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-[#0C1A35] to-[#0E2444] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="text-sm">Course: {exam.title || `${exam.provider} ${exam.code}`}</span>
            </div>
            <div className="h-6 w-px bg-white/30"></div>
            <div>
              <h1 className="text-2xl font-bold">{currentTest.name || `Test ${testId}`}</h1>
              <div className="flex items-center gap-1 text-sm mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>Test: {currentTest.name || `Test ${testId}`}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#1A73E8]/20 px-4 py-2 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="font-semibold font-mono">
              {timeRemaining != null
                ? `Time left: ${formatTime(timeRemaining)}`
                : `Time limit: ${formatDurationDisplay(currentTest?.duration || exam?.duration)}`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-5 h-5 text-[#1A73E8]" />
              <h3 className="font-semibold text-[#0C1A35]">Question Navigator</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-[#0C1A35]/70">
                <span>Total Questions:</span>
                <span className="font-medium text-[#0C1A35]">{totalQuestions}</span>
              </div>
              <div className="flex justify-between text-[#0C1A35]/70">
                <span>Answered:</span>
                <span className="font-medium text-[#0C1A35]">{answeredCount} / {accessibleQuestions}</span>
              </div>
              <div className="flex justify-between text-[#0C1A35]/70">
                <span>Remaining:</span>
                <span className="font-medium text-[#0C1A35]">{getRemainingCount()}</span>
              </div>
              {!hasFullAccess && totalQuestions > freeQuestionsLimit && (
                <div className="flex justify-between text-[#0C1A35]/70 mt-2 pt-2 border-t border-gray-200">
                  <span className="text-xs">Locked:</span>
                  <span className="font-medium text-[#0C1A35] text-xs">{totalQuestions - freeQuestionsLimit} questions</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalQuestions }, (_, idx) => {
                const qNum = idx + 1;
                const answer = answers[qNum];
                const isAnswered = answer && (
                  Array.isArray(answer) ? answer.length > 0 : (answer !== "" && answer !== null)
                );
                const isCurrent = qNum === currentQuestion;
                const isLocked = !canAccessQuestion(qNum);
                const isVisible = qNum >= startQuestion && qNum <= endQuestion;

                if (!isVisible) return null;

                return (
                  <button
                    key={qNum}
                    onClick={() => handleQuestionNavigate(qNum)}
                    disabled={isLocked}
                    className={`
                      aspect-square rounded-lg border-2 font-semibold text-sm transition-all relative
                      ${isCurrent ? "border-green-500 bg-green-500 text-white shadow-md scale-105" : ""}
                      ${!isCurrent && isAnswered && !isLocked ? "border-green-300 bg-green-50 text-green-700" : ""}
                      ${!isCurrent && !isAnswered && !isLocked ? "border-gray-300 bg-white text-gray-600 hover:border-[#1A73E8]/50" : ""}
                      ${isLocked ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
                    `}
                    title={isLocked ? "Enroll to unlock this question" : `Question ${qNum}`}
                  >
                    <span className="relative z-10">{qNum}</span>
                    {isLocked && (
                      <Lock className="absolute top-0.5 right-0.5 w-3.5 h-3.5 text-gray-500" strokeWidth={2.5} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {totalNavigatorPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setNavigatorPage(prev => Math.max(1, prev - 1))}
                disabled={navigatorPage === 1}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">Page {navigatorPage}/{totalNavigatorPages}</span>
              <button
                onClick={() => setNavigatorPage(prev => Math.min(totalNavigatorPages, prev + 1))}
                disabled={navigatorPage === totalNavigatorPages}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col bg-white">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Answered: {answeredCount}/{accessibleQuestions} ({Math.round(progressPercentage)}%)
              </span>
              {timeRemaining !== null && (
                <div className="flex items-center gap-2 bg-[#1A73E8]/10 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 text-[#1A73E8]" />
                  <span className="font-mono font-semibold text-[#0C1A35] text-sm">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
            <Progress value={progressPercentage} className="h-1" />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-[#0C1A35] mb-2">
                Q{currentQuestion}.
              </h2>
              <RichContent
                content={currentQuestionData.question_text || currentQuestionData.question}
                className="text-[#0C1A35] text-base leading-relaxed mb-3"
              />
              {(() => {
                const raw = currentQuestionData.question_image;
                let src = resolveMediaUrl(raw);
                if (
                  !src &&
                  currentQuestionData?.id &&
                  /^[a-fA-F0-9]{24}$/.test(String(currentQuestionData.id)) &&
                  raw &&
                  isGarbageImageRef(String(raw))
                ) {
                  src = `${API_BASE_URL}/api/exams/questions/${currentQuestionData.id}/image/`;
                }
                return src ? (
                  <img
                    src={src}
                    alt={`Question ${currentQuestion}`}
                    className="mb-4 max-h-80 w-auto max-w-full rounded-md border border-gray-200 object-contain"
                  />
                ) : null;
              })()}
              <div className="mb-6">
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {currentQuestionData.marks || 1} Mark
                </span>
              </div>

              <div className="space-y-3">
                {isSingleChoice ? (
                  <RadioGroup
                    value={currentAnswer || ""}
                    onValueChange={(value) => handleAnswerChange(value)}
                  >
                    {options.map((option, idx) => {
                      const selectionValue = String(idx);
                      const optionLetter =
                        (typeof option === "object" && option?.value) ||
                        String.fromCharCode(65 + idx);
                      const displayContent =
                        typeof option === "object" && option != null
                          ? option.text
                          : option;
                      const optImg = resolveMediaUrl(option?.image_url || option?.image);

                      return (
                        <div
                          key={idx}
                          className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-[#1A73E8]/50 transition-colors bg-white"
                        >
                          <RadioGroupItem
                            value={selectionValue}
                            id={`option-${idx}`}
                            className="mt-1"
                          />
                          <Label
                            htmlFor={`option-${idx}`}
                            className="flex-1 cursor-pointer text-[#0C1A35] text-base leading-relaxed"
                          >
                            <div className="flex items-start gap-2">
                              <span>{optionLetter})</span>
                              <div className="flex-1">
                                <RichContent content={displayContent} />
                                {optImg ? (
                                  <img
                                    src={optImg}
                                    alt={`Option ${optionLetter}`}
                                    className="mt-2 max-h-60 w-auto max-w-full rounded-md border border-gray-200 object-contain"
                                  />
                                ) : null}
                              </div>
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                ) : (
                  options.map((option, idx) => {
                      const selectionValue = String(idx);
                      const optionLetter =
                        (typeof option === "object" && option?.value) ||
                        String.fromCharCode(65 + idx);
                      const displayContent =
                        typeof option === "object" && option != null
                          ? option.text
                          : option;
                      const isChecked =
                        Array.isArray(currentAnswer) &&
                        currentAnswer.includes(selectionValue);
                      const optImgCb = resolveMediaUrl(option?.image_url || option?.image);

                    return (
                      <div
                        key={idx}
                        className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-[#1A73E8]/50 transition-colors bg-white"
                      >
                        <Checkbox
                          id={`option-${idx}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleAnswerChange(selectionValue, checked)
                          }
                          className="mt-1"
                        />
                        <Label
                          htmlFor={`option-${idx}`}
                          className="flex-1 cursor-pointer text-[#0C1A35] text-base leading-relaxed"
                        >
                          <div className="flex items-start gap-2">
                            <span>{optionLetter})</span>
                            <div className="flex-1">
                              <RichContent content={displayContent} />
                              {optImgCb ? (
                                <img
                                  src={optImgCb}
                                  alt={`Option ${optionLetter}`}
                                  className="mt-2 max-h-60 w-auto max-w-full rounded-md border border-gray-200 object-contain"
                                />
                              ) : null}
                            </div>
                          </div>
                        </Label>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 1}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300 min-w-24"
            >
              Previous
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
              onClick={() => setShowSubmitConfirm(true)}
                disabled={isSubmitting}
                className="bg-green-600 text-white hover:bg-green-700 min-w-32"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </Button>

              {currentQuestion < accessibleQuestions && (
                <Button
                  onClick={handleNext}
                  className="bg-[#1A73E8] text-white hover:bg-[#1557B0] min-w-32"
                >
                  Save & Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock All Questions</DialogTitle>
            <DialogDescription>
              You've reached the free question limit.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-sm text-gray-700">
              Enroll to access all {questions.length} questions.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setShowUpgradeModal(false)} variant="outline" className="flex-1">
                Continue Free Test
              </Button>
              <Button onClick={handleUpgradeClick} className="flex-1 bg-[#1A73E8] text-white hover:bg-[#1557B0]">
                Enroll Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Test?</DialogTitle>
            <DialogDescription>
              Please confirm before submitting your test.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-gray-700">
              You have answered <span className="font-semibold">{answeredCount}</span> out of{" "}
              <span className="font-semibold">{accessibleQuestions}</span> questions that are available to you.
            </p>
            <p className="text-sm text-gray-700">
              You can review your answers before submitting, or submit now to see your results.
            </p>
            <div className={`flex gap-3 pt-2 ${atFreeQuestionLimit ? "justify-center" : ""}`}>
              {!atFreeQuestionLimit && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowSubmitConfirm(false)}
                  disabled={isSubmitting}
                >
                  Continue Test
                </Button>
              )}
              <Button
                type="button"
                className={`${atFreeQuestionLimit ? "w-full" : "flex-1"} bg-green-600 text-white hover:bg-green-700`}
                onClick={async () => {
                  setShowSubmitConfirm(false);
                  await handleSubmit(false);
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to login to start taking tests.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowLoginPrompt(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => router.push(`/auth/login?redirect=/exams/${provider}/${examCode}/practice/${testId}`)} 
                className="flex-1 bg-[#1A73E8] text-white hover:bg-[#1557B0]"
              >
                Login / Sign Up
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
