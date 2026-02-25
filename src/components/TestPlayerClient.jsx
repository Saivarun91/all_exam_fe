"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Star, Compass, ChevronLeft, ChevronRight, FileText, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const FREE_QUESTIONS_LIMIT = 10;
const QUESTIONS_PER_PAGE = 20;

export default function TestPlayerClient({ exam, questions, test, provider, examCode, testId }) {
  const router = useRouter();
 
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, []);

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
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
  }, [exam]);

  

  // Timer countdown
  useEffect(() => {
    if (!testStarted || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, testStarted]);

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
    return isEnrolled || questionNum <= FREE_QUESTIONS_LIMIT;
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
    
    if (!isEnrolled && nextQuestion > FREE_QUESTIONS_LIMIT && nextQuestion <= questions.length) {
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
    const limit = isEnrolled ? questions.length : Math.min(FREE_QUESTIONS_LIMIT, questions.length);
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
    const limit = isEnrolled ? questions.length : Math.min(FREE_QUESTIONS_LIMIT, questions.length);
    return limit - getAnsweredCount();
  };

  const handleSubmit = async (autoSubmit = false) => {
    const answeredCount = getAnsweredCount();
    const totalAccessible = isEnrolled ? questions.length : Math.min(FREE_QUESTIONS_LIMIT, questions.length);
    
    if (!autoSubmit) {
      const confirmed = confirm(
        `You have answered ${answeredCount} out of ${totalAccessible} questions. Are you sure you want to submit?`
      );
      if (!confirmed) return;
    }

    if (!attemptId) {
      console.error('[TestPlayer] No attempt_id found.');
      alert('Error: Test attempt not found. Please start the test again.');
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
  if (Array.isArray(userAnswer)) {
    selectedAnswers = userAnswer.map(ans => {
      const index = question.options.findIndex(
        opt => (opt.text || opt) === ans
      );
      return index !== -1 ? String(index) : null;
    }).filter(val => val !== null);
  } else {
    const index = question.options.findIndex(
      opt => (opt.text || opt) === userAnswer
    );
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
        hasFullAccess: isEnrolled,
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

  const handleUpgradeClick = () => {
    router.push(`/exams/${provider}/${examCode}/practice/pricing`);
  };

  const handleStartTest = async () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    if (questions.length === 0) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }

    if (token.split('.').length !== 3) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setShowLoginPrompt(true);
      return;
    }

    try {
      const examId = exam.id ? String(exam.id) : null;
      
      if (!examId) {
        alert('Error: Could not find exam information. Please try again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/exams/attempt/get-or-create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          exam_id: examId,
          test_id: String(testId)
        })
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = 'Error starting test. Please try again.';
        let errorData = {};
        
        try {
          errorData = JSON.parse(responseText);
        } catch (jsonError) {
          errorMessage = responseText || `Server error (${response.status})`;
        }
        
        if (errorData && typeof errorData === 'object' && Object.keys(errorData).length > 0) {
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
        
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          setShowLoginPrompt(true);
          return;
        }
        
        alert(errorMessage);
        return;
      }

      let attemptData;
      try {
        attemptData = JSON.parse(responseText);
      } catch (parseError) {
        alert('Invalid response from server. Please try again.');
        return;
      }
      
      if (attemptData.success && attemptData.attempt_id) {
        setAttemptId(attemptData.attempt_id);
        setTestStarted(true);
      } else {
        const errorMsg = attemptData.message || 'Invalid response from server. Please try again.';
        alert(errorMsg);
      }
    } catch (error) {
      const errorMsg = error.message || 'Network error. Please check your connection and try again.';
      alert(errorMsg);
    }
  };

  

  
  
 
  const practiceTests = exam.practice_tests_list || [];
  let currentTest = null;
  
  if (practiceTests.length > 0) {
    // Remove ObjectId hash from testId for matching (e.g., "test-name-694e3de3" -> "test-name")
    const testIdWithoutHash = testId && typeof testId === 'string' ? testId.replace(/-[a-f0-9]{8}$/i, '') : testId;
    
    // Try exact match first
    currentTest = practiceTests.find(t => t.slug === testId);
    if (!currentTest) {
      // Try match without hash (e.g., "test-name" matches "test-name-694e3de3")
      currentTest = practiceTests.find(t => {
        const slugWithoutHash = t.slug && typeof t.slug === 'string' ? t.slug.replace(/-[a-f0-9]{8}$/i, '') : t.slug;
        return slugWithoutHash === testIdWithoutHash || slugWithoutHash === testId;
      });
    }
    if (!currentTest) {
      currentTest = practiceTests.find(t => String(t.id || t._id || '') === String(testId));
    }
    if (!currentTest && testId) {
      const testIndex = parseInt(testId) - 1;
      if (testIndex >= 0 && testIndex < practiceTests.length) {
        currentTest = practiceTests[testIndex];
      }
    }
  }
  
  if (!currentTest) {
    currentTest = {
      id: testId,
      name: `Practice Test ${testId}`,
      questions: questions.length || 0,
      duration: exam.duration || "30 minutes",
      difficulty: exam.difficulty || "Medium"
    };
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-[#0C1A35] mb-4">No Questions Available</h1>
          <p className="text-[#0C1A35]/70 mb-6">
            This test doesn't have any questions yet. Please add questions to this test.
          </p>
          <Button asChild className="bg-[#1A73E8] text-white hover:bg-[#1557B0]">
            <Link href={`/exams/${provider}/${examCode}/practice`}>
              Back to Practice Tests
            </Link>
          </Button>
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
            <Link href={`/exams/${provider}/${examCode}/practice`}>
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
                      {isEnrolled ? questions.length : `${Math.min(FREE_QUESTIONS_LIMIT, questions.length)} Free`}
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
                    className="bg-[#1A73E8] text-white hover:bg-[#1557B0] px-12"
                  >
                    <Clock className="w-5 h-5 mr-2" />
                    Start Test Now
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
  const accessibleQuestions = isEnrolled ? totalQuestions : Math.min(FREE_QUESTIONS_LIMIT, totalQuestions);
  const answeredCount = getAnsweredCount();
  const progressPercentage = (answeredCount / accessibleQuestions) * 100;

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
            <span className="font-semibold">Time Limit: {timeRemaining ? formatTimeLimit(timeRemaining) : "30 mins"}</span>
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
              {!isEnrolled && totalQuestions > FREE_QUESTIONS_LIMIT && (
                <div className="flex justify-between text-[#0C1A35]/70 mt-2 pt-2 border-t border-gray-200">
                  <span className="text-xs">Locked:</span>
                  <span className="font-medium text-[#0C1A35] text-xs">{totalQuestions - FREE_QUESTIONS_LIMIT} questions</span>
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
                Q{currentQuestion}. {currentQuestionData.question_text || currentQuestionData.question}
              </h2>
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
                      const optionText = option.text || option;
                      const optionValue = option.value || String.fromCharCode(65 + idx);

                      return (
                        <div
                          key={idx}
                          className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-[#1A73E8]/50 transition-colors bg-white"
                        >
                          <RadioGroupItem
                            value={optionText}
                            id={`option-${idx}`}
                            className="mt-1"
                          />
                          <Label
                            htmlFor={`option-${idx}`}
                            className="flex-1 cursor-pointer text-[#0C1A35] text-base leading-relaxed"
                          >
                            {optionValue}) {optionText}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                ) : (
                  options.map((option, idx) => {
                    const optionText = option.text || option;
                    const optionValue = option.value || String.fromCharCode(65 + idx);
                    const isChecked = Array.isArray(currentAnswer) && currentAnswer.includes(optionText);

                    return (
                      <div
                        key={idx}
                        className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-[#1A73E8]/50 transition-colors bg-white"
                      >
                        <Checkbox
                          id={`option-${idx}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => handleAnswerChange(optionText, checked)}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={`option-${idx}`}
                          className="flex-1 cursor-pointer text-[#0C1A35] text-base leading-relaxed"
                        >
                          {optionValue}) {optionText}
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
                onClick={() => handleSubmit(false)}
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
              <div className="py-4">
                <p className="mb-4">
                  You've reached the free question limit. Enroll to access all {questions.length} questions.
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
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              <div className="py-4">
                <p className="mb-6 text-gray-700">
                  You need to login to start taking tests.
                </p>
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
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
