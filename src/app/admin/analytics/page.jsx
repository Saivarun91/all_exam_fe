"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, Users, DollarSign, TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;

      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

        const response = await axios.get(
          `${API_BASE_URL}/api/categories/analytics/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setAnalyticsData({
            success: true,
            totalCourses: response.data.totalCourses || 0,
            totalRevenue: response.data.totalRevenue || 0,
            totalEnrolledStudents: response.data.totalEnrolledStudents || 0,
            enrollmentPerCourse: response.data.enrollmentPerCourse || [],
            revenuePerCourse: response.data.revenuePerCourse || [],
            topCourses: response.data.topCourses || [],
          });
        } else {
          setError(response.data.error || "Failed to fetch analytics");
        }
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || err.response?.data?.message
          : "Failed to fetch analytics";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error UI
  if (error || !analyticsData?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">
              <Activity className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Analytics</h3>
            <p className="text-red-600">{error || "Failed to load analytics data"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxEnrollment = analyticsData.enrollmentPerCourse.length > 0
    ? Math.max(...analyticsData.enrollmentPerCourse.map(item => item.students))
    : 0;

  const maxRevenue = analyticsData.revenuePerCourse.length > 0
    ? Math.max(...analyticsData.revenuePerCourse.map(item => item.revenue))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive insights into courses, enrollments, and revenue performance
              </p>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Total Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">Total Courses</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-blue-600">
                    {analyticsData.totalCourses}
                  </p>
                  <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                </div>
                <p className="text-sm text-gray-500 mt-2">Available courses in the platform</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Enrolled Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">Enrolled Students</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-green-600">
                    {analyticsData.totalEnrolledStudents.toLocaleString()}
                  </p>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-500 mt-2">Unique students enrolled</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-xl transition-all bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-yellow-600" />
                    </div>
                    <span className="text-gray-700 font-semibold">Total Revenue</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-yellow-600">
                    ₹{analyticsData.totalRevenue.toLocaleString('en-IN')}
                  </p>
                  <TrendingUp className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="text-sm text-gray-500 mt-2">From successful payments</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Enrollment per Course */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 border-purple-200 hover:shadow-xl transition-all bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-gray-800">Enrollment per Course</span>
                  <Badge className="ml-auto bg-purple-100 text-purple-700">
                    {analyticsData.enrollmentPerCourse.length} courses
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {analyticsData.enrollmentPerCourse.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No enrollments yet</p>
                    <p className="text-sm text-gray-400 mt-1">Enrollments will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {analyticsData.enrollmentPerCourse.map((item, idx) => {
                      const percentage = maxEnrollment > 0 ? (item.students / maxEnrollment) * 100 : 0;
                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 truncate">{item.course}</p>
                              <p className="text-sm text-gray-500">{item.students.toLocaleString()} students</p>
                            </div>
                            <Badge className="bg-purple-100 text-purple-700 font-bold ml-3">
                              {item.students}
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Revenue per Course */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-2 border-green-200 hover:shadow-xl transition-all bg-white">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-gray-800">Revenue per Course</span>
                  <Badge className="ml-auto bg-green-100 text-green-700">
                    {analyticsData.revenuePerCourse.length} courses
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {analyticsData.revenuePerCourse.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No revenue data yet</p>
                    <p className="text-sm text-gray-400 mt-1">Revenue will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {analyticsData.revenuePerCourse.map((item, idx) => {
                      const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 truncate">{item.course}</p>
                              <p className="text-sm text-gray-500">₹{item.revenue.toLocaleString('en-IN')}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700 font-bold ml-3">
                              ₹{item.revenue.toLocaleString('en-IN')}
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1 }}
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top Performing Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-2 border-yellow-200 hover:shadow-xl transition-all bg-white">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <span className="text-gray-800">Top Performing Courses</span>
                <Badge className="ml-auto bg-yellow-100 text-yellow-700">
                  Top {analyticsData.topCourses.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {analyticsData.topCourses.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No course data yet</p>
                  <p className="text-sm text-gray-400 mt-1">Top courses will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyticsData.topCourses.map((item, idx) => {
                    const medalColors = [
                      { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' }, // Gold
                      { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' }, // Silver
                      { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' }, // Bronze
                    ];
                    const medalColor = medalColors[idx] || { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + idx * 0.1 }}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 ${medalColor.border} ${medalColor.bg} hover:shadow-md transition-all`}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-12 h-12 rounded-full ${medalColor.bg} border-2 ${medalColor.border} flex items-center justify-center font-bold text-lg ${medalColor.text} flex-shrink-0`}>
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 truncate text-lg">{item.course}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.students.toLocaleString()} enrolled students
                            </p>
                          </div>
                        </div>
                        <Badge className={`${medalColor.bg} ${medalColor.text} font-bold text-lg px-4 py-1`}>
                          #{idx + 1}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <PieChart className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Average Enrollment per Course</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">
                    {analyticsData.enrollmentPerCourse.length > 0
                      ? Math.round(
                          analyticsData.enrollmentPerCourse.reduce((sum, item) => sum + item.students, 0) /
                          analyticsData.enrollmentPerCourse.length
                        )
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-100 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Average Revenue per Course</p>
                  <p className="text-2xl font-bold text-pink-600 mt-1">
                    ₹{analyticsData.revenuePerCourse.length > 0
                      ? Math.round(
                          analyticsData.revenuePerCourse.reduce((sum, item) => sum + item.revenue, 0) /
                          analyticsData.revenuePerCourse.length
                        ).toLocaleString('en-IN')
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
