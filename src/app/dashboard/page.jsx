

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, Clock, Trophy, TrendingUp, BookOpen,
  Award, Bell, Target, BarChart3, Users, Ticket, FileText, Copy, Check
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function Dashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCouponId, setCopiedCouponId] = useState(null);
  const lastFetchRef = useRef(0);



  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (token, signal) => {
    try {
      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        if (signal && !signal.aborted) {
          signal.abort();
        }
      }, 10000); // 10 second timeout

      const res = await fetch(`${API_BASE_URL}/api/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        lastFetchRef.current = Date.now(); // Track when data was fetched
        setDashboardData(data);
        setLoading(false);
        setError(null);
      } else if (res.status === 401) {
        router.push("/auth?redirect=/dashboard");
        return;
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      console.error("Dashboard Error:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login?redirect=/dashboard");
      return;
    }

    // Create AbortController for request cancellation
    const abortController = new AbortController();
    let refreshInterval;
    
    // Fetch initial data with signal for cancellation
    fetchDashboardData(token, abortController.signal);
    
    // Refresh dashboard data every 60 seconds (reduced frequency)
    refreshInterval = setInterval(() => {
      const newController = new AbortController();
      fetchDashboardData(token, newController.signal);
    }, 60000); // 60 seconds - reduced frequency
    
    // Also refresh when window regains focus (only if needed)
    const handleFocus = () => {
      // Only refresh if last fetch was more than 30 seconds ago
      const timeSinceLastFetch = Date.now() - lastFetchRef.current;
      const shouldRefresh = lastFetchRef.current === 0 || timeSinceLastFetch > 30000;
      
      if (shouldRefresh) {
        const newController = new AbortController();
        fetchDashboardData(token, newController.signal);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      abortController.abort(); // Cancel pending request
      if (refreshInterval) clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [router, fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    router.push("/");
  };

  const copyCouponCode = async (couponCode, couponId) => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopiedCouponId(couponId);
      setTimeout(() => setCopiedCouponId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Show skeleton loader instead of blocking spinner
  const SkeletonCard = () => (
    <div className="p-6 bg-white border-2 border-gray-200 rounded-xl animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded mt-4"></div>
        </div>
  );

  const SkeletonStat = () => (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
      </div>
          <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
    );

  // Only show error if we have an error and we're not loading
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Failed to Load Dashboard</h2>
          <p className="mb-4">{error || "Unknown error occurred"}</p>
          <Button onClick={() => {
            setError(null);
            setLoading(true);
            const token = localStorage.getItem("token");
            if (token) {
              const controller = new AbortController();
              fetchDashboardData(token, controller.signal);
            }
          }}>Retry</Button>
          <Button variant="outline" onClick={() => router.push("/")} className="ml-2">Go to Home</Button>
        </div>
      </div>
    );
  }

  const {
    userName = "Student",
    hasOngoingAttempt = false,
    ongoingAttempt,
    purchasedExams = [],
    freeAttempts = [],
    recommendedExams = [],
    topicPerformance = [],
    achievements = [],
    updates = [],
    overallAccuracy = 0,
    questionsAnswered = 0,
    timePracticing = "0m",
    testsCompleted = 0,
    averageScore = 0,
    coupons = [],
    testAttempts = [],
  } = dashboardData || {};

  return (
    <div className="min-h-screen bg-background">

      {/* --- MAIN CONTENT --- */}
      <main className="container mx-auto px-4 py-8">

        {/* ---------------- HEADER ---------------- */}
        <div className="flex items-center justify-between mb-8">
          <div>
            {loading ? (
              <>
                <div className="h-9 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
              </>
            ) : (
              <>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {userName}!
            </h1>
            <p className="text-muted-foreground">
                  Here's a quick snapshot of your exam preparation.
            </p>
              </>
            )}
          </div>

          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* ---------------- STATS CARDS ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            <>
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
            </>
          ) : (
            <>
          {/* Enrollments Stats Card */}
          <Card 
            className="shadow-lg cursor-pointer hover:shadow-xl transition-all hover:scale-105"
            onClick={() => {
              requestAnimationFrame(() => {
                const element = document.getElementById('enrollments-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              });
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Enrollments</p>
                  <p className="text-3xl font-bold">{purchasedExams.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coupons Stats Card */}
          <Card 
            className="shadow-lg cursor-pointer hover:shadow-xl transition-all hover:scale-105"
            onClick={() => {
              requestAnimationFrame(() => {
                const element = document.getElementById('coupons-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              });
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Coupons</p>
                  <p className="text-3xl font-bold">{coupons.length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Ticket className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Attempts Stats Card */}
          <Card 
            className="shadow-lg cursor-pointer hover:shadow-xl transition-all hover:scale-105"
            onClick={() => {
              requestAnimationFrame(() => {
                const element = document.getElementById('test-attempts-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              });
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Test Attempts</p>
                  <p className="text-3xl font-bold">{testAttempts.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Score Stats Card */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                  <p className="text-3xl font-bold">{averageScore}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>


        {/* ---------------- CONTINUE ATTEMPT ---------------- */}
        {hasOngoingAttempt && ongoingAttempt && (
          <Card className="mb-8 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Continue where you left off
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">{ongoingAttempt.examName}</h3>
                  <p className="text-muted-foreground">{ongoingAttempt.testName}</p>
                  <div className="flex gap-6 text-sm">
                    <span>Progress: <strong>{ongoingAttempt.progress} / {ongoingAttempt.totalQuestions}</strong></span>
                    <span>Last: <strong>{ongoingAttempt.lastAttempt}</strong></span>
                    <span>Time: <strong>{ongoingAttempt.timeSpent}</strong></span>
                  </div>
                  <Progress value={ongoingAttempt.progressPercent} className="h-2" />
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button asChild>
                    <Link href={`/exams/${ongoingAttempt.slug}/practice/${ongoingAttempt.testId}`}>
                      Continue <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/test-review/${ongoingAttempt.slug}`}>Review</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------------- ENROLLMENTS SECTION ---------------- */}
        <Card id="enrollments-section" className="mb-8 shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-primary" /> Your Enrollments ({loading ? '...' : purchasedExams.length})
                </CardTitle>
            <CardDescription className="text-base">Practice tests you have access to</CardDescription>
              </CardHeader>
          <CardContent className="p-6">
                {loading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : purchasedExams.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No Enrollments Yet</p>
                <p className="text-muted-foreground mb-4">Enroll in courses to start practicing</p>
                <Button asChild>
                  <Link href="/exams">Browse Exams</Link>
                </Button>
                  </div>
                ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedExams.map((exam) => (
                  <div 
                    key={exam.id} 
                    className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Decorative gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      {/* Header with title and badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 truncate group-hover:text-primary transition-colors">
                            {exam.name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {exam.provider} • {exam.code}
                          </p>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="ml-3 bg-blue-100 text-blue-700 border-blue-200 font-semibold whitespace-nowrap"
                        >
                          {exam.daysLeft} days
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 mt-6">
                        <Button 
                          asChild 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                              onClick={() => {
                                if (typeof window !== 'undefined') {
                                  sessionStorage.setItem('fromEnrolledCourses', 'true');
                                  sessionStorage.setItem('isStudentPage', 'true');
                                  sessionStorage.setItem('enrolledCourseId', exam.courseId || exam.id || '');
                                  sessionStorage.setItem('enrolledCourseSlug', exam.slug || '');
                                }
                              }}
                            >
                          <Link href={`/exams/${exam.slug}/practice`}>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Start Practice
                            </Link>
                          </Button>
                        <Button 
                          variant="outline" 
                          asChild 
                          className="w-full border-2 hover:bg-gray-50 font-medium"
                        >
                          <Link href={`/exams/${exam.provider.toLowerCase().replace(/\s+/g, '-')}/${exam.code.toLowerCase().replace(/\s+/g, '-')}`}>
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                          </Button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
                      </CardContent>
                    </Card>

        {/* ---------------- TEST ATTEMPTS SECTION ---------------- */}
        <Card id="test-attempts-section" className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Test Attempts ({testAttempts.length})
            </CardTitle>
            <CardDescription>Your complete test history and performance</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {testAttempts && testAttempts.length > 0 ? (
              <div className="max-h-[600px] overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
                {testAttempts.map((attempt) => (
                  <div 
                    key={attempt.id}
                    className={`p-4 rounded-lg border flex items-center justify-between gap-4 ${
                      attempt.passed 
                        ? 'bg-green-50/50 border-green-200' 
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-lg mb-1">{attempt.course_name || 'Practice Test'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(attempt.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {attempt.is_trial && (
                            <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                              Trial
                            </Badge>
                          )}
                          {attempt.passed && (
                            <Badge variant="default" className="text-xs bg-green-600">
                              Passed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {attempt.provider && attempt.exam_code ? (
                        <Button 
                          asChild 
                          className="!bg-green-600 hover:!bg-green-700 !text-white whitespace-nowrap"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              sessionStorage.setItem('testAttemptId', attempt.id);
                            }
                          }}
                        >
                          <Link href={`/test-review/${attempt.provider}/${attempt.exam_code}`}>
                            View Results
                          </Link>
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="whitespace-nowrap"
                          disabled
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">No Test Attempts Yet</p>
                <p className="text-muted-foreground mb-4">
                  Write a test to get experience and track your progress!
                </p>
                <Button asChild variant="outline">
                  <Link href="/exams">
                    Browse Exams <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ---------------- COUPONS SECTION ---------------- */}
        <Card id="coupons-section" className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" /> My Coupons ({coupons.length})
            </CardTitle>
            <CardDescription>
              {coupons.filter(c => {
                const isExpired = c.expiry_date ? new Date(c.expiry_date) < new Date() : false;
                return !c.is_used && !isExpired;
              }).length > 0 
                ? `${coupons.filter(c => {
                    const isExpired = c.expiry_date ? new Date(c.expiry_date) < new Date() : false;
                    return !c.is_used && !isExpired;
                  }).length} available coupon${coupons.filter(c => {
                    const isExpired = c.expiry_date ? new Date(c.expiry_date) < new Date() : false;
                    return !c.is_used && !isExpired;
                  }).length !== 1 ? 's' : ''} - Use each coupon only once`
                : "Discount codes available to you"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {coupons.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">No Coupons Available</p>
                <p className="text-muted-foreground mb-4">
                  Complete purchases or reviews to earn discount codes!
                </p>
              </div>
            ) : (
              <div>
                {/* Available Coupons Section */}
                {coupons.filter(c => {
                  const isExpired = c.expiry_date ? new Date(c.expiry_date) < new Date() : false;
                  return !c.is_used && !isExpired;
                }).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-green-700">Available Coupons</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {coupons.filter(c => {
                        const isExpired = c.expiry_date ? new Date(c.expiry_date) < new Date() : false;
                        return !c.is_used && !isExpired;
                      }).map((coupon) => (
                  <div 
                    key={coupon.id} 
                          className="p-5 rounded-lg border-2 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 border-yellow-300 hover:border-yellow-400 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-2xl font-bold text-gray-900 tracking-wider">{coupon.code}</code>
                          <button
                                  onClick={() => copyCouponCode(coupon.code, coupon.id)}
                                  className="p-1.5 rounded-md transition-colors text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                                  title="Copy coupon code"
                          >
                            {copiedCouponId === coupon.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                            </div>
                            <Badge variant="default" className="text-sm bg-green-600">
                              {coupon.discount} OFF
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            {coupon.expiry_date && (
                              <p className="text-gray-700">
                                Expires: {new Date(coupon.expiry_date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            )}
                            <p className="text-xs text-gray-600 italic">
                              💡 Use this coupon during checkout
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expired Coupons Section */}
                {coupons.filter(c => {
                  const isExpired = c.expiry_date ? new Date(c.expiry_date) < new Date() : false;
                  return !c.is_used && isExpired;
                }).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-red-700">Expired Coupons</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {coupons.filter(c => {
                        const isExpired = c.expiry_date ? new Date(c.expiry_date) < new Date() : false;
                        return !c.is_used && isExpired;
                      }).map((coupon) => (
                        <div 
                          key={coupon.id} 
                          className="p-5 rounded-lg border-2 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 opacity-75 relative"
                        >
                          {/* Overlay to indicate not available */}
                          <div className="absolute inset-0 bg-gray-200/30 rounded-lg flex items-center justify-center pointer-events-none">
                            <Badge variant="default" className="bg-red-600 text-white text-sm px-3 py-1">
                              Expired
                            </Badge>
                          </div>
                          
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <code className="text-2xl font-bold text-gray-500 tracking-wider line-through">{coupon.code}</code>
                                  <button
                                    className="p-1.5 rounded-md text-gray-400 cursor-not-allowed"
                                    disabled
                                    title="Coupon expired - Not available"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                                <Badge variant="default" className="bg-red-600 text-white text-xs mb-2">
                                  Expired
                                </Badge>
                              </div>
                              <Badge variant="default" className="text-sm bg-gray-500">
                                {coupon.discount} OFF
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                              {coupon.expiry_date && (
                                <p className="text-red-600 font-medium">
                                  ✗ Expired on: {new Date(coupon.expiry_date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              )}
                              <p className="text-red-600 font-semibold text-xs">
                                ⚠️ This coupon has expired and cannot be used
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Used/Not Available Coupons Section */}
                {coupons.filter(c => c.is_used).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-600">Already Used</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {coupons.filter(c => c.is_used).map((coupon) => (
                        <div 
                          key={coupon.id} 
                          className="p-5 rounded-lg border-2 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 opacity-75 relative"
                        >
                          {/* Overlay to indicate not available */}
                          <div className="absolute inset-0 bg-gray-200/30 rounded-lg flex items-center justify-center pointer-events-none">
                            <Badge variant="default" className="bg-red-600 text-white text-sm px-3 py-1">
                              Not Available
                            </Badge>
                          </div>
                          
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <code className="text-2xl font-bold text-gray-500 tracking-wider line-through">{coupon.code}</code>
                                  <button
                                    className="p-1.5 rounded-md text-gray-400 cursor-not-allowed"
                                    disabled
                                    title="Coupon already used - Not available"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                          <Badge variant="default" className="bg-gray-600 text-white text-xs mb-2">
                            Already Used
                          </Badge>
                      </div>
                              <Badge variant="default" className="text-sm bg-gray-500">
                        {coupon.discount} OFF
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      {coupon.used_at && (
                        <p className="text-gray-600 font-medium">
                          ✓ Used on: {new Date(coupon.used_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      )}
                              <p className="text-red-600 font-semibold text-xs">
                                ⚠️ This coupon can only be used once
                              </p>
                            </div>
                    </div>
                  </div>
                ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ---------------- OVERVIEW SECTION ---------------- */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Recommended Exams */}
            {recommendedExams.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> Recommended for You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {recommendedExams.map((exam) => (
                      <Card key={exam.id} className="p-4 border hover:border-primary transition">
                        <CardHeader>
                          <CardTitle className="text-base">{exam.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            {exam.questions} questions
                          </p>
                          <Button asChild className="w-full h-7 bg-blue-500 rounded">
                            <Link href={`/exams/${exam.slug}/practice`}>Explore</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-8">
            {/* Updates - Dynamic */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" /> Updates
                </CardTitle>
                <CardDescription>Recent notifications and updates</CardDescription>
              </CardHeader>
              <CardContent>
                {updates.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground">No new updates</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {updates.map((u) => (
                      <div 
                        key={u.id} 
                        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-full mt-0.5">
                            <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{u.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">{u.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </main>
    </div>
  );
}
