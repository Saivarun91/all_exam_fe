"use client";

import { useState, useEffect } from "react";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Flag, Clock, X, Menu, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function TestPlayer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider");
  const examCode = searchParams.get("examCode");
  const testId = searchParams.get("testId");

  // State
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Fetch exam and questions, and get/create test attempt
  useEffect(() => {
    if (!provider || !examCode || !testId) return;

    const fetchData = async () => {
      try {
        // Fetch exam details
        const slug = `${provider}-${examCode}`.toLowerCase();
        const examRes = await fetch(`${API_BASE_URL}/api/courses/exams/${slug}/`);
        
        if (!examRes.ok) throw new Error("Exam not found");
        
        const examData = await examRes.json();
        setExam(examData);

        // Get or create test attempt (requires authentication)
        const token = getAuthToken();
        if (token) {
          try {
            const attemptRes = await fetch(`${API_BASE_URL}/api/exams/attempt/get-or-create/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                exam_id: examData.id,
                test_id: testId
              })
            });

            if (attemptRes.ok) {
              const attemptData = await attemptRes.json();
              if (attemptData.success) {
                setAttemptId(attemptData.attempt_id);
                
                // Use questions from attempt if available
                if (attemptData.questions && attemptData.questions.length > 0) {
                  setQuestions(attemptData.questions);
                  
                  // Restore answers from existing attempt if any
                  const existingAnswers = {};
                  attemptData.questions.forEach((q, idx) => {
                    if (q.user_selected_answers && q.user_selected_answers.length > 0) {
                      existingAnswers[idx + 1] = Array.isArray(q.user_selected_answers) 
                        ? q.user_selected_answers 
                        : [q.user_selected_answers];
                    }
                  });
                  if (Object.keys(existingAnswers).length > 0) {
                    setAnswers(existingAnswers);
                  }
                  
                  // Set timer
                  if (attemptData.time_limit) {
                    setTimeRemaining(attemptData.time_limit * 60);
                  }
                } else {
                  // Fallback to fetching questions directly
                  const questionsRes = await fetch(`${API_BASE_URL}/api/questions/test/${examData.id}/${testId}/`);
                  if (questionsRes.ok) {
                    const questionsData = await questionsRes.json();
                    if (questionsData.success && questionsData.questions) {
                      setQuestions(questionsData.questions);
                      const testDuration = questionsData.test?.duration || examData.duration;
                      if (testDuration) {
                        const minutes = parseInt(testDuration.match(/\d+/)?.[0] || 90);
                        setTimeRemaining(minutes * 60);
                      }
                    }
                  }
                }
              }
            } else {
              // If attempt creation fails, still try to fetch questions
              console.warn("Failed to get/create test attempt, fetching questions directly");
              const questionsRes = await fetch(`${API_BASE_URL}/api/questions/test/${examData.id}/${testId}/`);
              if (questionsRes.ok) {
                const questionsData = await questionsRes.json();
                if (questionsData.success && questionsData.questions) {
                  setQuestions(questionsData.questions);
                  const testDuration = questionsData.test?.duration || examData.duration;
                  if (testDuration) {
                    const minutes = parseInt(testDuration.match(/\d+/)?.[0] || 90);
                    setTimeRemaining(minutes * 60);
                  }
                }
              }
            }
          } catch (attemptErr) {
            console.error("Error getting test attempt:", attemptErr);
            // Fallback to fetching questions directly
            const questionsRes = await fetch(`${API_BASE_URL}/api/questions/test/${examData.id}/${testId}/`);
            if (questionsRes.ok) {
              const questionsData = await questionsRes.json();
              if (questionsData.success && questionsData.questions) {
                setQuestions(questionsData.questions);
                const testDuration = questionsData.test?.duration || examData.duration;
                if (testDuration) {
                  const minutes = parseInt(testDuration.match(/\d+/)?.[0] || 90);
                  setTimeRemaining(minutes * 60);
                }
              }
            }
          }
        } else {
          // Not authenticated - just fetch questions
          const questionsRes = await fetch(`${API_BASE_URL}/api/questions/test/${examData.id}/${testId}/`);
          if (questionsRes.ok) {
            const questionsData = await questionsRes.json();
            if (questionsData.success && questionsData.questions) {
              setQuestions(questionsData.questions);
              const testDuration = questionsData.test?.duration || examData.duration;
              if (testDuration) {
                const minutes = parseInt(testDuration.match(/\d+/)?.[0] || 90);
                setTimeRemaining(minutes * 60);
              }
            }
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, [provider, examCode, testId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
          <p className="text-[#0C1A35]/70">Loading test...</p>
        </div>
      </div>
    );
  }

  // Error or no questions state
  if (error || !exam || questions.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-[#0C1A35] mb-4">
            {questions.length === 0 ? "No Questions Available" : "Test Not Found"}
          </h1>
          <p className="text-[#0C1A35]/70 mb-6">
            {questions.length === 0 
              ? "This test doesn't have any questions yet. Please add questions in the admin panel at /admin/questions"
              : "The test you're looking for doesn't exist or has been moved."}
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

  const totalQuestions = questions.length;
  const progress = (currentQuestion / totalQuestions) * 100;
  const examTitle = `${exam.provider} ${exam.code}`.toUpperCase();

  const currentQuestionData = questions[currentQuestion - 1];
  const currentAnswer = answers[currentQuestion];

  const handleAnswerChange = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) setCurrentQuestion(currentQuestion - 1);
  };
console.log("attemptId", attemptId);
  const handleFlag = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestion)) newFlagged.delete(currentQuestion);
    else newFlagged.add(currentQuestion);
    setFlaggedQuestions(newFlagged);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        alert("Please log in to submit your test.");
        router.push(`/auth?redirect=/TestPage?provider=${provider}&examCode=${examCode}&testId=${testId}`);
        return;
      }

      if (!attemptId) {
        alert("Test attempt not found. Please refresh the page and try again.");
        setSubmitting(false);
        return;
      }

      // Prepare user answers in the format expected by the backend
      const userAnswers = questions.map((q, idx) => {
        const questionNum = idx + 1;
        const answer = answers[questionNum];
        return {
          question_id: q.id || q._id || String(questionNum),
          selected_answers: Array.isArray(answer) ? answer : (answer ? [answer] : [])
        };
      });

      // Submit test attempt
      const submitRes = await fetch(`${API_BASE_URL}/api/exams/attempt/${attemptId}/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_answers: userAnswers
        })
      });

      if (submitRes.ok) {
        const submitData = await submitRes.json();
        if (submitData.success) {
          alert(`Test submitted successfully! Score: ${submitData.score}/${totalQuestions} (${submitData.percentage.toFixed(1)}%)`);
          router.push(`/exams/${provider}/${examCode}/practice`);
        } else {
          alert(`Error submitting test: ${submitData.message || 'Unknown error'}`);
          setSubmitting(false);
        }
      } else {
        const errorData = await submitRes.json().catch(() => ({}));
        alert(`Error submitting test: ${errorData.message || 'Failed to submit test'}`);
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Error submitting test:", err);
      alert("An error occurred while submitting the test. Please try again.");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleQuestionNavigate = (questionNum) => {
    setCurrentQuestion(questionNum);
    setMobileNavOpen(false);
  };

  const getAnsweredCount = () => Object.keys(answers).length;
  const getRemainingCount = () => totalQuestions - getAnsweredCount();

  const QuestionNavigator = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="font-semibold text-[#0C1A35] mb-3">Question Navigator</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-[#0C1A35]/70">
            <span>Answered:</span>
            <span className="font-medium text-[#0C1A35]">{getAnsweredCount()} / {totalQuestions}</span>
          </div>
          <div className="flex justify-between text-[#0C1A35]/70">
            <span>Remaining:</span>
            <span className="font-medium text-[#0C1A35]">{getRemainingCount()}</span>
          </div>
          {flaggedQuestions.size > 0 && (
            <div className="flex justify-between text-[#0C1A35]/70">
              <span>Flagged:</span>
              <span className="font-medium text-yellow-600">{flaggedQuestions.size}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((_, idx) => {
            const qNum = idx + 1;
            const isAnswered = answers[qNum] !== undefined;
            const isCurrent = qNum === currentQuestion;
            const isFlagged = flaggedQuestions.has(qNum);

            return (
              <button
                key={qNum}
                onClick={() => handleQuestionNavigate(qNum)}
                className={`
                  relative aspect-square rounded-lg border-2 font-semibold text-sm transition-all
                  ${isCurrent ? "border-[#1A73E8] bg-[#1A73E8] text-white shadow-md" : ""}
                  ${!isCurrent && isAnswered ? "border-green-500 bg-green-50 text-green-700" : ""}
                  ${!isCurrent && !isAnswered ? "border-gray-300 bg-white text-[#0C1A35]/70 hover:border-[#1A73E8]/50" : ""}
                  ${isFlagged && !isCurrent ? "ring-2 ring-yellow-400 ring-offset-1" : ""}
                `}
              >
                {qNum}
                {isFlagged && (
                  <Flag className="w-3 h-3 absolute top-0.5 right-0.5 text-yellow-500 fill-yellow-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!currentQuestionData) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading question...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/exams/${provider}/${examCode}/practice`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Exit Test</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
              <div className="hidden md:block">
                <div className="font-semibold text-[#0C1A35]">{examTitle}</div>
                <div className="text-xs text-[#0C1A35]/60">
                  Question {currentQuestion} of {totalQuestions}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {timeRemaining !== null && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                  <Clock className="w-4 h-4 text-[#1A73E8]" />
                  <span className="font-mono font-semibold text-[#0C1A35]">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <QuestionNavigator />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Area */}
          <div className="lg:col-span-3">
            <Card className="border-gray-200">
              <div className="p-6">
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#0C1A35]/70">Progress</span>
                    <span className="text-sm font-semibold text-[#0C1A35]">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Question */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[#0C1A35]">
                      Question {currentQuestion}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFlag}
                      className={flaggedQuestions.has(currentQuestion) ? "text-yellow-600" : ""}
                    >
                      <Flag className={`w-4 h-4 ${flaggedQuestions.has(currentQuestion) ? "fill-yellow-400" : ""}`} />
                    </Button>
                  </div>

                  <p className="text-[#0C1A35] leading-relaxed mb-4">
                    {currentQuestionData.question_text}
                  </p>

                  {currentQuestionData.question_image && (
                    <img
                      src={getOptimizedImageUrl(currentQuestionData.question_image, 800, 600)}
                      alt="Question"
                      width={800}
                      height={600}
                      className="max-w-full h-auto rounded-lg mb-4 border border-gray-200"
                      style={{ maxWidth: '100%', height: 'auto' }}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 800px"
                      decoding="async"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}

                  {currentQuestionData.question_type === "multiple" && (
                    <p className="text-sm text-[#1A73E8] font-medium mb-4">
                      ✓ Select all that apply
                    </p>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestionData.question_type === "single" ? (
                    <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
                      {currentQuestionData.options.map((option, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            currentAnswer === option.text
                              ? "border-[#1A73E8] bg-[#1A73E8]/5"
                              : "border-gray-200 hover:border-[#1A73E8]/50"
                          }`}
                          onClick={() => handleAnswerChange(option.text)}
                        >
                          <RadioGroupItem value={option.text} id={`option-${idx}`} className="mt-0.5" />
                          <Label
                            htmlFor={`option-${idx}`}
                            className="flex-1 cursor-pointer text-[#0C1A35]"
                          >
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-3">
                      {currentQuestionData.options.map((option, idx) => {
                        const isChecked = Array.isArray(currentAnswer) && currentAnswer.includes(option.text);
                        return (
                          <div
                            key={idx}
                            className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              isChecked
                                ? "border-[#1A73E8] bg-[#1A73E8]/5"
                                : "border-gray-200 hover:border-[#1A73E8]/50"
                            }`}
                            onClick={() => {
                              const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                              if (current.includes(option.text)) {
                                handleAnswerChange(current.filter(a => a !== option.text));
                              } else {
                                handleAnswerChange([...current, option.text]);
                              }
                            }}
                          >
                            <Checkbox
                              checked={isChecked}
                              id={`option-${idx}`}
                              className="mt-0.5"
                            />
                            <Label
                              htmlFor={`option-${idx}`}
                              className="flex-1 cursor-pointer text-[#0C1A35]"
                            >
                              {option.text}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="text-sm text-[#0C1A35]/70">
                    {currentQuestion} / {totalQuestions}
                  </div>

                  {currentQuestion < totalQuestions ? (
                    <Button onClick={handleNext} className="bg-[#1A73E8] hover:bg-[#1557B0]">
                      Next
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit} 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={submitting}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {submitting ? "Submitting..." : "Submit Test"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Question Navigator (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-24 border-gray-200">
              <QuestionNavigator />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

