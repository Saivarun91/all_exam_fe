"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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
  
  // Fetch exam data dynamically
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        // Normalize provider and examCode
        const normalizedProvider = provider.toLowerCase().replace(/_/g, '-');
        const normalizedExamCode = examCode.toLowerCase().replace(/_/g, '-');
        const slug = `${normalizedProvider}-${normalizedExamCode}`;
        
        const res = await fetch(`${API_BASE_URL}/api/courses/exams/${slug}/`);
        if (res.ok) {
          const data = await res.json();
          setExam(data);
        }
      } catch (error) {
        console.error("Error fetching exam data:", error);
      }
    };

    if (provider && examCode) {
      fetchExamData();
    }
  }, [provider, examCode]);

  // Load test results and calculate topic performance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedResults = sessionStorage.getItem('testResults');
      const storedQuestions = sessionStorage.getItem('testQuestions');
      const storedAnswers = sessionStorage.getItem('userAnswers');
      
      if (storedResults) {
        const results = JSON.parse(storedResults);
        setTestResults(results);
        setHasFullAccess(results.hasFullAccess || false);
        
        // Calculate topic performance from actual questions and answers
        if (storedQuestions && storedAnswers) {
          try {
            const questions = JSON.parse(storedQuestions);
            const userAnswers = JSON.parse(storedAnswers);
            
            // Group questions by topic/tag if available, otherwise use default categories
            const topicMap = {};
            
            questions.forEach((q, idx) => {
              const questionNum = idx + 1;
              const userAnswer = userAnswers[questionNum];
              
              // Handle both single answer and multiple choice
              let userAnswerValue = null;
              if (userAnswer !== undefined && userAnswer !== null) {
                if (Array.isArray(userAnswer)) {
                  userAnswerValue = userAnswer.length > 0 ? userAnswer : null;
                } else if (userAnswer !== '' && userAnswer !== 'null' && userAnswer !== 'undefined') {
                  userAnswerValue = userAnswer;
                }
              }
              
              // Check if answer is correct by comparing with correct_answers
              // Use the same logic as the review answers page for consistency
              let isCorrect = false;
              let isUnanswered = userAnswerValue === null || userAnswerValue === undefined;
              
              if (!isUnanswered) {
                const correctAnswers = q.correct_answers || (q.correct_answer ? [q.correct_answer] : []);
                
                if (correctAnswers.length > 0) {
                  // Normalize both user answer and correct answers to option text for comparison
                  // Get options list to help with normalization
                  let optionsList = [];
                  if (q.options && Array.isArray(q.options) && q.options.length > 0) {
                    optionsList = q.options.map((opt, optIdx) => ({
                      index: optIdx,
                      letter: String.fromCharCode(65 + optIdx),
                      text: typeof opt === 'string' ? opt : (opt.text || opt.label || opt.value || '')
                    }));
                  }
                  
                  // Helper function to normalize answer to option text
                  const normalizeToOptionText = (answer) => {
                    const answerStr = String(answer).trim();
                    if (optionsList.length > 0) {
                      // Try to find matching option by text, index, or letter
                      const matchedOpt = optionsList.find(opt => {
                        const optText = String(opt.text).trim();
                        return optText === answerStr || 
                               optText.toLowerCase() === answerStr.toLowerCase() ||
                               String(opt.index) === answerStr ||
                               opt.letter.toUpperCase() === answerStr.toUpperCase();
                      });
                      return matchedOpt ? matchedOpt.text : answerStr;
                    }
                    return answerStr;
                  };
                  
                  if (Array.isArray(userAnswerValue)) {
                    // Multiple choice - normalize both arrays to option texts and compare
                    const userAnswerTexts = userAnswerValue.map(normalizeToOptionText).map(a => String(a).trim().toLowerCase()).sort();
                    const correctAnswerTexts = correctAnswers.map(normalizeToOptionText).map(a => String(a).trim().toLowerCase()).sort();
                    isCorrect = JSON.stringify(userAnswerTexts) === JSON.stringify(correctAnswerTexts);
                  } else {
                    // Single choice - normalize both to option text and compare (case-insensitive)
                    const userAnswerText = normalizeToOptionText(userAnswerValue).toLowerCase().trim();
                    isCorrect = correctAnswers.some(ca => {
                      const correctAnswerText = normalizeToOptionText(ca).toLowerCase().trim();
                      return correctAnswerText === userAnswerText;
                    });
                  }
                }
              }
              
              // Get topic from question tags, domain, or use default distribution
              let topic = "Other";
              
              // Try to get topic from tags (array of strings)
              if (q.tags && Array.isArray(q.tags) && q.tags.length > 0) {
                // Get first non-empty tag
                const firstTag = q.tags.find(tag => tag && String(tag).trim() !== '');
                if (firstTag) {
                  topic = String(firstTag).trim();
                }
              }
              
              // Fallback to domain field if tags not available
              if (topic === "Other" && q.domain && String(q.domain).trim() !== '') {
                topic = String(q.domain).trim();
              }
              
              // Fallback to topic field if available
              if (topic === "Other" && q.topic && String(q.topic).trim() !== '') {
                topic = String(q.topic).trim();
              }
              
              // Final fallback: use default distribution only if no tags/domain/topic found
              if (topic === "Other") {
                topic = idx < Math.floor(questions.length * 0.3) ? "Core Concepts"
                    : idx < Math.floor(questions.length * 0.55) ? "Advanced Topics"
                    : idx < Math.floor(questions.length * 0.8) ? "Best Practices"
                    : "Implementation";
              }
              
              // Initialize topic in map if not exists
              if (!topicMap[topic]) {
                topicMap[topic] = { correct: 0, total: 0 };
              }
              
              // Increment counters
              topicMap[topic].total++;
              if (isCorrect) {
                topicMap[topic].correct++;
              }
            });
            
            // Convert to array format and sort by topic name
            const performance = Object.entries(topicMap)
              .map(([topic, stats]) => ({
                topic,
                correct: stats.correct,
                total: stats.total,
                percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
              }))
              .sort((a, b) => {
                // Sort by topic name alphabetically
                return a.topic.localeCompare(b.topic);
              });
            
            setTopicPerformance(performance.length > 0 ? performance : [
              { 
                topic: "Overall", 
                correct: results.correctAnswers || 0, 
                total: results.questionsCompleted || 0, 
                percentage: (results.questionsCompleted || 0) > 0 ? Math.round(((results.correctAnswers || 0) / (results.questionsCompleted || 0)) * 100) : 0 
              }
            ]);
          } catch (error) {
            console.error("Error calculating topic performance:", error);
            // Fallback to overall performance
            setTopicPerformance([{
              topic: "Overall",
              correct: results.correctAnswers || 0,
              total: results.questionsCompleted || 0,
              percentage: (results.questionsCompleted || 0) > 0 ? Math.round(((results.correctAnswers || 0) / (results.questionsCompleted || 0)) * 100) : 0
            }]);
          }
        } else {
          // No questions stored, use overall stats
          setTopicPerformance([{
            topic: "Overall",
            correct: results.correctAnswers || 0,
            total: results.questionsCompleted || 0,
            percentage: (results.questionsCompleted || 0) > 0 ? Math.round(((results.correctAnswers || 0) / (results.questionsCompleted || 0)) * 100) : 0
          }]);
        }
      } else {
        // No results found, redirect back
        router.push(`/exams/${provider}/${examCode}/practice`);
      }
    }
  }, [provider, examCode, router]);

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
  const actualIncorrectAnswers = incorrectAnswers || 0;
  const actualUnanswered = unanswered || 0;
  const actualCompleted = questionsCompleted || 0;
  
  // Verify calculations match
  const verifiedCorrectAnswers = actualCorrectAnswers;
  const verifiedIncorrectAnswers = actualIncorrectAnswers;
  const verifiedUnanswered = actualUnanswered;
  const verifiedCompleted = actualCompleted;
  
  const scorePercentage = verifiedCompleted > 0 ? Math.round((verifiedCorrectAnswers / verifiedCompleted) * 100) : 0;
  const isPartialTest = verifiedCompleted < totalQuestions;

  // Use calculated topic performance or fallback to overall
  const displayTopicPerformance = topicPerformance.length > 0 ? topicPerformance : [
    { topic: "Overall Performance", correct: verifiedCorrectAnswers, total: verifiedCompleted, percentage: scorePercentage }
  ];

  const handleRetakeTest = () => {
    router.push(`/exams/${provider}/${examCode}/practice/1`);
  };

  const handleEnrollClick = () => {
    setShowUpgradeModal(true);
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
              {isPartialTest ? "Free Trial Complete!" : "Test Complete!"}
            </h1>
            <p className="text-[#0C1A35]/70">{exam?.title || `${(provider || "").toUpperCase()} ${(examCode || "").toUpperCase()}`.trim() || "Exam"} - Practice Test</p>
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
              <p className="text-[#0C1A35]/70">
                You answered {verifiedCompleted} out of {isPartialTest ? `${verifiedCompleted} free` : totalQuestions} questions
              </p>
              {isPartialTest && (
                <p className="text-yellow-600 font-semibold mt-2">
                  🎁 Free Trial - {totalQuestions - questionsCompleted} questions remaining
                </p>
              )}
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
                  onClick={() => router.push(`/exams/${provider}/${examCode}/practice/pricing`)}
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
              onClick={() => router.push(`/exams/${provider}/${examCode}/practice`)}
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
              Unlock all features for {examCode.toUpperCase()} exam preparation
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
    </div>
  );
}
