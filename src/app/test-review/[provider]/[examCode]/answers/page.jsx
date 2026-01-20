"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Clock, Shield, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function ReviewAnswersPage() {
  const params = useParams();
  const router = useRouter();
  
  const provider = params?.provider;
  const examCode = params?.examCode;
  
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [navigatorPage, setNavigatorPage] = useState(1);
  const [exam, setExam] = useState(null);
  
  const QUESTIONS_PER_PAGE = 20;

  // Fetch exam data for title
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const normalizedProvider = provider?.toLowerCase().replace(/_/g, '-');
        const normalizedExamCode = examCode?.toLowerCase().replace(/_/g, '-');
        const slug = `${normalizedProvider}-${normalizedExamCode}`;
        
        const res = await fetch(`${API_BASE_URL}/api/courses/exams/${slug}/`);
        if (res.ok) {
          const data = await res.json();
          setExam(data);
          
          // Set dynamic page title
          if (typeof window !== "undefined") {
            const metaTitle = `Review Answers - ${data.title} (${data.code}) | AllExamQuestions`;
            document.title = metaTitle;
          }
        }
      } catch (error) {
        console.error("Error fetching exam data:", error);
      }
    };

    if (provider && examCode) {
      fetchExamData();
    }
  }, [provider, examCode]);

  useEffect(() => {
    loadReviewAnswers();
  }, []);

  const loadReviewAnswers = () => {
    try {
      // Get questions and user answers from sessionStorage
      const storedAnswers = sessionStorage.getItem('userAnswers');
      const storedQuestions = sessionStorage.getItem('testQuestions');
      const storedResults = sessionStorage.getItem('testResults');
      
      if (storedResults) {
        const results = JSON.parse(storedResults);
        
        // Try to get from testResults first, then fallback to separate storage
        let userAnswers = {};
        let questions = [];
        
        if (results.answers) {
          userAnswers = results.answers;
        } else if (storedAnswers) {
          userAnswers = JSON.parse(storedAnswers);
        }
        
        if (storedQuestions) {
          questions = JSON.parse(storedQuestions);
        }
        
        // Combine questions with user answers - show ALL questions
        const combined = questions.map((q, idx) => {
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
          
          // Check if correct (handle both single and multiple)
          // correct_answers is stored as array of option texts
          let isCorrect = false;
          let isUnanswered = userAnswerValue === null || userAnswerValue === undefined;
          
          if (!isUnanswered) {
            const correctAnswers = q.correct_answers || (q.correct_answer ? [q.correct_answer] : []);
            
            if (correctAnswers.length > 0) {
              if (Array.isArray(userAnswerValue)) {
                // Multiple choice - compare arrays of option texts
                const userAnswersNormalized = userAnswerValue.map(a => String(a).trim()).sort();
                const correctAnswersNormalized = correctAnswers.map(a => String(a).trim()).sort();
                isCorrect = JSON.stringify(userAnswersNormalized) === JSON.stringify(correctAnswersNormalized);
              } else {
                // Single choice - compare option text
                const userAnswerNormalized = String(userAnswerValue).trim();
                isCorrect = correctAnswers.some(ca => String(ca).trim() === userAnswerNormalized);
              }
            }
          }
          
          return {
            ...q,
            questionNumber: questionNum,
            userAnswer: userAnswerValue,
            isCorrect: isCorrect,
            isUnanswered: isUnanswered
          };
        });
        
        setQuestionsWithAnswers(combined);
      } else {
        alert('No test results found. Please complete a test first.');
        router.push(`/test-review/${provider}/${examCode}`);
      }
    } catch (error) {
      console.error('Error loading answers:', error);
      alert('Failed to load answers. Please try again.');
      router.push(`/test-review/${provider}/${examCode}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionNavigate = (index) => {
    setCurrentQuestionIndex(index);
    // Update navigator page if needed
    const newPage = Math.floor(index / QUESTIONS_PER_PAGE) + 1;
    if (newPage !== navigatorPage) {
      setNavigatorPage(newPage);
    }
    // Scroll to top of question
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionsWithAnswers.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Calculate pagination
  const totalNavigatorPages = Math.ceil(questionsWithAnswers.length / QUESTIONS_PER_PAGE);
  const startQuestion = (navigatorPage - 1) * QUESTIONS_PER_PAGE;
  const endQuestion = Math.min(startQuestion + QUESTIONS_PER_PAGE, questionsWithAnswers.length);
  
  // Update navigator page when current question changes
  useEffect(() => {
    if (questionsWithAnswers.length > 0) {
      const totalPages = Math.ceil(questionsWithAnswers.length / QUESTIONS_PER_PAGE);
      const newPage = Math.floor(currentQuestionIndex / QUESTIONS_PER_PAGE) + 1;
      if (newPage !== navigatorPage && newPage >= 1 && newPage <= totalPages) {
        setNavigatorPage(newPage);
      }
    }
  }, [currentQuestionIndex, questionsWithAnswers.length, navigatorPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
          <p className="text-[#0C1A35]/70">Loading review answers...</p>
        </div>
      </div>
    );
  }

  if (questionsWithAnswers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link
            href={`/test-review/${provider}/${examCode}`}
            className="inline-flex items-center text-sm text-[#0C1A35]/70 hover:text-[#1A73E8] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Link>
          <div className="text-center py-20">
            <p className="text-[#0C1A35]/70">No answers found. Please complete a test first.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questionsWithAnswers[currentQuestionIndex];
  const totalQuestions = questionsWithAnswers.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button - Fixed below main navbar */}
      <div className="bg-white border-b border-gray-200 fixed top-16 md:top-20 left-0 right-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/test-review/${provider}/${examCode}`)}
              className="inline-flex items-center text-sm text-[#0C1A35]/70 hover:text-[#1A73E8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </button>
            <div className="text-sm text-[#0C1A35]">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
          </div>
        </div>
      </div>
      
      {/* Spacer to account for fixed header */}
      <div className="h-14 md:h-[68px]"></div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Main Question Content */}
          <div className="flex-1">
            <Card className="border-[#DDE7FF]">
              <div className="p-6">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#0C1A35]">
                    Question {currentQuestion.questionNumber}
                  </h2>
                  <Badge className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                    currentQuestion.isUnanswered
                      ? 'bg-yellow-100 text-yellow-700'
                      : currentQuestion.isCorrect 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {currentQuestion.isUnanswered ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Unanswered
                      </span>
                    ) : currentQuestion.isCorrect ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Incorrect
                      </span>
                    )}
                  </Badge>
                </div>
                
                {/* Question Text */}
                <p className="mb-6 text-[#0C1A35] text-base leading-relaxed">
                  {currentQuestion.question_text || currentQuestion.text}
                </p>
                
                {/* Options */}
                <div className="space-y-3 mb-6">
                  {(() => {
                    // Handle both old format (option_a, option_b) and new format (options array)
                    let optionsList = [];
                    
                    if (currentQuestion.options && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0) {
                      // New format: options is an array of objects
                      optionsList = currentQuestion.options.map((opt, idx) => ({
                        letter: String.fromCharCode(65 + idx), // A, B, C, D...
                        text: typeof opt === 'string' ? opt : (opt.text || opt.label || opt.value || ''),
                        image: typeof opt === 'object' ? (opt.image_url || opt.image) : null,
                        explanation: typeof opt === 'object' ? (opt.explanation || '') : '',
                        originalIndex: idx // Store original index for correct answer matching
                      })).filter(opt => opt.text && opt.text.trim() !== '');
                    } else {
                      // Old format: option_a, option_b, etc.
                      ['A', 'B', 'C', 'D', 'E', 'F'].forEach((option) => {
                        const optionText = currentQuestion[`option_${option.toLowerCase()}`] || 
                                         currentQuestion[`option${option}`] || 
                                         currentQuestion[`option_${option}`] ||
                                         currentQuestion[`option_${option.toUpperCase()}`];
                        if (optionText && optionText.trim() !== '') {
                          optionsList.push({
                            letter: option,
                            text: optionText,
                            image: null
                          });
                        }
                      });
                    }
                    
                    // If still no options found, show message
                    if (optionsList.length === 0) {
                      return (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800 text-sm">No options available for this question.</p>
                        </div>
                      );
                    }
                    
                    // Build full options list with all metadata for normalization
                    const fullOptionsList = currentQuestion.options && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0
                      ? currentQuestion.options.map((opt, idx) => ({
                          index: idx,
                          letter: String.fromCharCode(65 + idx),
                          text: typeof opt === 'string' ? opt : (opt.text || opt.label || opt.value || '')
                        }))
                      : [];
                    
                    // Helper function to normalize answer to option text
                    const normalizeToOptionText = (answer) => {
                      const answerStr = String(answer).trim();
                      if (fullOptionsList.length > 0) {
                        // Try to find matching option by text, index, or letter
                        const matchedOpt = fullOptionsList.find(opt => {
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
                    
                    return optionsList.map((opt, optIdx) => {
                      const option = opt.letter;
                      const optionText = opt.text;
                      if (!optionText) return null;
                      
                      // Check if this is the user's answer
                      // User answers are stored as option text strings
                      const isUserAnswer = currentQuestion.userAnswer !== null && currentQuestion.userAnswer !== undefined
                        ? (Array.isArray(currentQuestion.userAnswer) 
                            ? currentQuestion.userAnswer.some(ua => {
                                const uaStr = String(ua).trim();
                                const optTextStr = String(optionText).trim();
                                return uaStr === optTextStr || uaStr.toLowerCase() === optTextStr.toLowerCase();
                              })
                            : (() => {
                                const uaStr = String(currentQuestion.userAnswer).trim();
                                const optTextStr = String(optionText).trim();
                                return uaStr === optTextStr || uaStr.toLowerCase() === optTextStr.toLowerCase();
                              })())
                        : false;
                      
                      // Check if this is the correct answer
                      // correct_answers can be stored as option text strings OR option indices OR option letters
                      const correctAnswers = currentQuestion.correct_answers || 
                                           (currentQuestion.correct_answer ? [currentQuestion.correct_answer] : []);
                      
                      let isCorrectAnswer = false;
                      
                      if (correctAnswers.length > 0) {
                        // Normalize current option text for comparison
                        const normalizedOptionText = String(optionText).trim().toLowerCase();
                        const currentOptionLetter = option.toUpperCase();
                        const currentOptionIndex = optIdx;
                        const currentLetterIndex = currentOptionLetter.charCodeAt(0) - 65; // A=0, B=1, etc.
                        
                        // Check each correct answer - try multiple matching strategies
                        isCorrectAnswer = correctAnswers.some(ca => {
                          const caStr = String(ca).trim();
                          const caStrLower = caStr.toLowerCase();
                          const normalizedCorrectAnswer = normalizeToOptionText(ca).toLowerCase().trim();
                          
                          // Strategy 1: Direct normalized comparison (most reliable)
                          if (normalizedCorrectAnswer === normalizedOptionText) {
                            return true;
                          }
                          
                          // Strategy 2: Direct string comparison (case-insensitive)
                          if (caStrLower === normalizedOptionText) {
                            return true;
                          }
                          
                          // Strategy 3: Match by letter (A, B, C, D, etc.)
                          if (caStr.length === 1 && /^[A-Z]$/i.test(caStr)) {
                            if (caStr.toUpperCase() === currentOptionLetter) {
                              return true;
                            }
                          }
                          
                          // Strategy 4: Match by numeric index (0, 1, 2, 3, etc.)
                          if (!isNaN(caStr) && !isNaN(parseInt(caStr))) {
                            const caIndex = parseInt(caStr);
                            // Match by option index
                            if (caIndex === currentOptionIndex) {
                              return true;
                            }
                            // Match by letter index (A=0, B=1, etc.)
                            if (caIndex === currentLetterIndex) {
                              return true;
                            }
                          }
                          
                          // Strategy 5: Partial text match (for cases where correct answer might be a substring)
                          if (normalizedOptionText.includes(caStrLower) || caStrLower.includes(normalizedOptionText)) {
                            // Only if both are substantial strings (not single characters)
                            if (caStr.length > 3 && normalizedOptionText.length > 3) {
                              return true;
                            }
                          }
                          
                          // Strategy 6: Match against full option text from options array
                          if (fullOptionsList && fullOptionsList.length > 0) {
                            const matchingOption = fullOptionsList.find(opt => {
                              const optText = String(opt.text).trim().toLowerCase();
                              return optText === caStrLower || optText === normalizedCorrectAnswer;
                            });
                            if (matchingOption) {
                              if (matchingOption.index === currentOptionIndex) {
                                return true;
                              }
                              if (matchingOption.letter === currentOptionLetter) {
                                return true;
                              }
                            }
                          }
                          
                          // Strategy 7: Match against optionsList (current list being rendered)
                          const matchingInCurrentList = optionsList.find(opt => {
                            const optText = String(opt.text).trim().toLowerCase();
                            return optText === caStrLower || optText === normalizedCorrectAnswer;
                          });
                          if (matchingInCurrentList && matchingInCurrentList.letter === currentOptionLetter) {
                            return true;
                          }
                          
                          return false;
                        });
                      }
                      
                      // Get option explanation if available
                      const optionExplanation = opt.explanation || '';
                    
                    // Determine styling
                    // Priority: Show correct answers in green, wrong user answers in red
                    let bgColor = 'bg-white';
                    let borderColor = 'border-gray-200';
                    let textColor = 'text-[#0C1A35]';
                    let labelColor = 'text-[#0C1A35]';
                    let badge = null;
                    
                    // Priority: Always show correct answers in green FIRST
                    if (isCorrectAnswer) {
                      if (isUserAnswer) {
                        // User's correct answer - green with checkmark
                        bgColor = 'bg-green-100';
                        borderColor = 'border-green-600 border-2';
                        textColor = 'text-green-900';
                        labelColor = 'text-green-700 font-bold';
                        badge = (
                          <Badge className="bg-green-600 text-white border-0 font-semibold">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Your Answer ✓ (Correct)
                          </Badge>
                        );
                      } else {
                        // Correct answer (not selected by user) - ALWAYS show in green
                        bgColor = 'bg-green-50';
                        borderColor = 'border-green-500 border-2';
                        textColor = 'text-green-900';
                        labelColor = 'text-green-700 font-semibold';
                        badge = (
                          <Badge className="bg-green-500 text-white border-0 font-semibold">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Correct Answer
                          </Badge>
                        );
                      }
                    } else if (isUserAnswer && !isCorrectAnswer) {
                      // User's wrong answer - red
                      bgColor = 'bg-red-50';
                      borderColor = 'border-red-500 border-2';
                      textColor = 'text-red-900';
                      labelColor = 'text-red-700';
                      badge = (
                        <Badge className="bg-red-500 text-white border-0 font-semibold">
                          <XCircle className="w-4 h-4 mr-1" />
                          Your Answer (Wrong)
                        </Badge>
                      );
                    } else {
                      // Default: not selected, not correct
                      bgColor = 'bg-white';
                      borderColor = 'border-gray-200';
                      textColor = 'text-[#0C1A35]';
                      labelColor = 'text-[#0C1A35]';
                    }
                    
                      return (
                        <div 
                          key={option}
                          className={`p-4 rounded-lg border-2 transition-all ${bgColor} ${borderColor} shadow-sm ${isCorrectAnswer ? 'ring-2 ring-green-300' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`font-semibold min-w-[24px] ${labelColor}`}>
                              {option}.
                            </span>
                            <div className="flex-1">
                              <span className={`${textColor} font-medium`}>
                                {optionText}
                              </span>
                              {optionExplanation && optionExplanation.trim() !== '' && (
                                <p className={`mt-2 text-sm ${isCorrectAnswer ? 'text-green-700 font-medium' : isUserAnswer && !isCorrectAnswer ? 'text-red-700' : 'text-gray-600'}`}>
                                  {optionExplanation}
                                </p>
                              )}
                            </div>
                            {badge}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                
                {/* Overall Explanation */}
                {currentQuestion.explanation && currentQuestion.explanation.trim() !== '' && (
                  <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Explanation:
                    </p>
                    <p className="text-blue-800 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="min-w-32"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="text-sm text-[#0C1A35]/70">
                    {currentQuestionIndex + 1} / {totalQuestions}
                  </div>

                  <Button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    className="bg-[#1A73E8] text-white hover:bg-[#1557B0] min-w-32"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Question Navigator Sidebar - Fixed Width */}
          <div className="w-64 flex-shrink-0">
            <Card className="border-[#DDE7FF] sticky top-[112px] md:top-[132px]">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="w-5 h-5 text-[#1A73E8]" />
                  <h3 className="font-semibold text-[#0C1A35]">Question Navigator</h3>
                </div>
                
                {/* Summary Stats */}
                <div className="space-y-1 text-sm mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-[#0C1A35]/70">
                    <span>Total:</span>
                    <span className="font-medium text-[#0C1A35]">{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between text-[#0C1A35]/70">
                    <span>Correct:</span>
                    <span className="font-semibold text-green-600">
                      {questionsWithAnswers.filter(q => q.isCorrect).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#0C1A35]/70">
                    <span>Incorrect:</span>
                    <span className="font-semibold text-red-600">
                      {questionsWithAnswers.filter(q => !q.isCorrect && !q.isUnanswered).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#0C1A35]/70">
                    <span>Unanswered:</span>
                    <span className="font-semibold text-yellow-600">
                      {questionsWithAnswers.filter(q => q.isUnanswered).length}
                    </span>
                  </div>
                </div>
                
                {/* Question Grid with Pagination */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {questionsWithAnswers.slice(startQuestion, endQuestion).map((q, localIdx) => {
                    const idx = startQuestion + localIdx;
                    const isCurrent = idx === currentQuestionIndex;
                    const isCorrect = q.isCorrect;
                    const isUnanswered = q.isUnanswered;
                    const isAnswered = !q.isUnanswered;
                    
                    return (
                      <button
                        key={q.questionNumber}
                        onClick={() => handleQuestionNavigate(idx)}
                        className={`
                          aspect-square rounded-lg border-2 font-semibold text-sm transition-all relative
                          ${isCurrent ? 'border-green-500 bg-green-500 text-white shadow-md' : ''}
                          ${!isCurrent && isCorrect ? 'border-green-300 bg-green-50 text-green-700' : ''}
                          ${!isCurrent && !isCorrect && isAnswered ? 'border-red-300 bg-red-50 text-red-700' : ''}
                          ${!isCurrent && isUnanswered ? 'border-yellow-300 bg-yellow-50 text-yellow-700' : ''}
                          ${!isCurrent && !isCorrect && !isAnswered && !isUnanswered ? 'border-gray-300 bg-white text-gray-600 hover:border-[#1A73E8]/50' : ''}
                        `}
                        title={`Question ${q.questionNumber}${isCorrect ? ' - Correct' : isUnanswered ? ' - Unanswered' : ' - Incorrect'}`}
                      >
                        <span className="relative z-10">{q.questionNumber}</span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Pagination Controls */}
                {totalNavigatorPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setNavigatorPage(prev => Math.max(1, prev - 1))}
                      disabled={navigatorPage === 1}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-[#0C1A35]/70 font-medium">
                      Page {navigatorPage}/{totalNavigatorPages}
                    </span>
                    <button
                      onClick={() => setNavigatorPage(prev => Math.min(totalNavigatorPages, prev + 1))}
                      disabled={navigatorPage === totalNavigatorPages}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

