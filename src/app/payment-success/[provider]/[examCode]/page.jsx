"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, BookOpen, Trophy, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function PaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  
  const provider = params?.provider;
  const examCode = params?.examCode;
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set page title
    document.title = "Payment Successful - Enrollment Confirmed | AllExamQuestions";
    
    if (provider && examCode) {
      fetchExamData();
    }
  }, [provider, examCode]);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const examTitle = exam?.title || `${provider?.toUpperCase()} ${examCode?.toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Success Icon and Message */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center shadow-2xl animate-pulse">
                <CheckCircle className="w-20 h-20 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-12 h-12 text-yellow-400 animate-bounce" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              🎉 Payment Successful!
            </h1>
            <p className="text-xl text-gray-700 mb-2">
              Your enrollment has been confirmed
            </p>
            <p className="text-lg text-gray-600">
              {examTitle}
            </p>
          </div>

          {/* Success Card */}
          <Card className="bg-white shadow-2xl border-2 border-green-200 mb-8">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* What You Get */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Gift className="w-6 h-6 text-[#1A73E8]" />
                    What You Now Have Access To:
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">All Practice Tests</p>
                        <p className="text-sm text-gray-600">Unlimited access to all practice questions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Detailed Explanations</p>
                        <p className="text-sm text-gray-600">Understand why answers are correct</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Performance Analytics</p>
                        <p className="text-sm text-gray-600">Track your progress and improvement</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Unlimited Attempts</p>
                        <p className="text-sm text-gray-600">Practice as many times as you want</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="border-t pt-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Next Steps:</h3>
                  <ol className="space-y-3 list-decimal list-inside text-gray-700">
                    <li>Start practicing with our comprehensive test questions</li>
                    <li>Review detailed explanations to understand concepts better</li>
                    <li>Track your performance and identify areas for improvement</li>
                    <li>Retake tests as many times as needed to master the material</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push(`/exams/${provider}/${examCode}/practice`)}
              className="bg-[#1A73E8] hover:bg-[#1557B0] text-white px-8 py-6 text-lg font-semibold shadow-lg"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Start Practicing Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-lg font-semibold"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Need help? <Link href="/contact" className="text-[#1A73E8] hover:underline">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

