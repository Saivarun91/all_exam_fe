"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"

import { Eye, Trash2 } from "lucide-react";

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  // Helper function to calculate duration in months from enrolled_date and expiry_date
  const calculateDurationInMonths = (enrolledDate, expiryDate) => {
    if (!enrolledDate || !expiryDate) return 0;
    
    try {
      const enrolled = new Date(enrolledDate);
      const expiry = new Date(expiryDate);
      
      if (isNaN(enrolled.getTime()) || isNaN(expiry.getTime())) return 0;
      
      // Calculate the difference in milliseconds
      const diffTime = expiry - enrolled;
      
      // Convert to days
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Convert days to months (approximate: 30 days per month)
      const months = Math.round(diffDays / 30);
      
      return months > 0 ? months : 0;
    } catch (error) {
      console.error("Error calculating duration:", error);
      return 0;
    }
  };

  // Helper function to format duration display
  const formatDuration = (enrolledDate, expiryDate) => {
    const months = calculateDurationInMonths(enrolledDate, expiryDate);
    return `${months} month${months !== 1 ? 's' : ''}`;
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/enrollments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Response status:", res.status);
        throw new Error("Failed to fetch enrollments");
      }

      const result = await res.json();

      // Process enrollments and expand category enrollments to show courses
      const enrollmentPromises = (result.data || []).map(async (item) => {
        const baseEnrollment = {
          ...item,
          id: item.id || item._id || "",
          user_name: item.user_name || item.user_fullname || "Unknown User",
          user_email: item.user_email || "N/A",
          course_id: item.course_id,
          category: item.category || (item.category_name ? {
            id: item.category_id || "",
            name: item.category_name
          } : undefined),
          category_id: item.category_id || (item.category && item.category.id),
          duration_months: item.duration_months || 0,
          enrolled_date: item.enrolled_date || "",
          expiry_date: item.expiry_date || "",
          status: new Date(item.expiry_date) > new Date() ? "active" : "expired",
          payment: item.payment || undefined,
        };

        // If it's a course-level enrollment, show the course name
        if (item.course_id && item.course_name) {
          baseEnrollment.course_name = item.course_name;
          return [baseEnrollment];
        } 
        // If it's a category-level enrollment, fetch all courses in that category
        else if (item.category_id || (item.category && item.category.id)) {
          const categoryId = item.category_id || item.category.id;
          try {
            const coursesRes = await fetch(`${API_BASE}/api/courses/category/${categoryId}/`);
            if (coursesRes.ok) {
              const courses = await coursesRes.json();
              return courses.map((course) => ({
                ...baseEnrollment,
                id: `${baseEnrollment.id}-${course.id}`,
                originalEnrollmentId: baseEnrollment.id,
                course_id: course.id,
                course_name: course.name,
                courses: courses,
              }));
            } else {
              baseEnrollment.course_name = item.category_name || (item.category && item.category.name) || "Unknown Course";
              return [baseEnrollment];
            }
          } catch (err) {
            console.error(`Error fetching courses for category ${categoryId}:`, err);
            baseEnrollment.course_name = item.category_name || (item.category && item.category.name) || "Unknown Course";
            return [baseEnrollment];
          }
        } else {
          baseEnrollment.course_name = item.course_name || item.category_name || (item.category && item.category.name) || "Unknown Course";
          return [baseEnrollment];
        }
      });

      const enrollmentArrays = await Promise.all(enrollmentPromises);
      const allEnrollments = enrollmentArrays.flat();
      setEnrollments(allEnrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleRemove = async (id) => {
    if (!confirm("Are you sure you want to remove this enrollment?")) return;

    try {
      const enrollment = enrollments.find((e) => e.id === id);
      const enrollmentIdToDelete = enrollment?.originalEnrollmentId || id;

      const res = await fetch(`${API_BASE}/api/enrollments/${enrollmentIdToDelete}/delete/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete enrollment");

      if (enrollment?.originalEnrollmentId) {
        setEnrollments((prev) => prev.filter((e) => 
          e.originalEnrollmentId !== enrollment.originalEnrollmentId && 
          e.id !== enrollment.originalEnrollmentId
        ));
      } else {
        setEnrollments((prev) => prev.filter((e) => e.id !== id));
      }
      
      alert("Enrollment deleted successfully");
      fetchEnrollments();
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      alert("Failed to delete enrollment");
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Enrollments</h1>

      {loading ? (
        <p className="text-gray-500 text-center py-10">
          Loading enrollments...
        </p>
      ) : enrollments.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No enrollments found.</p>
      ) : (
        <div className="w-full overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full border-collapse divide-y divide-gray-200 bg-white">
              <thead className="bg-gradient-to-r from-sky-300 to-sky-400 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">User Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Enrolled On</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Payment ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enroll) => (
                  <tr key={enroll.id} className="hover:bg-sky-50 transition-colors duration-200">
                    <td className="px-4 py-4 whitespace-nowrap text-gray-800 font-medium text-sm">{enroll.user_name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-600 text-sm">{enroll.user_email || "N/A"}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700 text-sm">{enroll.course_name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700 text-sm">
                      {formatDuration(enroll.enrolled_date, enroll.expiry_date)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700 text-sm">{new Date(enroll.enrolled_date).toLocaleDateString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700 text-sm">{new Date(enroll.expiry_date).toLocaleDateString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                      {enroll.payment ? (
                        <div className="text-xs">
                          {(() => {
                            // Calculate actual paid amount after coupon discount
                            const paymentAmount = parseFloat(enroll.payment.amount || 0);
                            const discountAmount = parseFloat(enroll.payment.discount_amount || 0);
                            const hasCoupon = enroll.payment.coupon_code && discountAmount > 0;
                            
                            // Calculate actual paid amount: payment.amount - discount_amount (when coupon is used)
                            // This ensures we show the amount student actually paid after discount
                            let actualPaidAmount = paymentAmount;
                            if (hasCoupon && discountAmount > 0) {
                              actualPaidAmount = Math.max(0, paymentAmount - discountAmount);
                            }
                            
                            return (
                              <>
                                <div className="font-medium text-base">₹{actualPaidAmount.toFixed(2)}</div>
                                {hasCoupon && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    Coupon: {enroll.payment.coupon_code} (-₹{discountAmount.toFixed(2)})
                                  </div>
                                )}
                                <div className={`text-xs mt-1 font-medium ${enroll.payment.status === "completed" ? "text-green-600" : "text-orange-600"}`}>
                                  {enroll.payment.status}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No payment</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700 text-xs font-mono max-w-[120px] truncate" title={enroll.payment?.razorpay_payment_id || "—"}>
                      {enroll.payment?.razorpay_payment_id || "—"}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap font-semibold text-sm ${enroll.status === "active" ? "text-green-600" : "text-red-500"}`}>
                      {enroll.status}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button variant="outline" className="p-2 border-sky-400 text-sky-500 hover:bg-sky-50" onClick={() => setSelectedStudent(enroll)} title="View Details">
                          <Eye size={16} />
                        </Button>
                        <Button variant="outline" className="p-2 border-red-400 text-red-500 hover:bg-red-50" onClick={() => handleRemove(enroll.id)} title="Delete Enrollment">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Enrollment Details</h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 bg-sky-50 px-4 py-2 rounded-lg">Enrollment Information</h3>
              <div className="space-y-3 text-gray-700 pl-4">
                <div className="flex items-start"><span className="font-medium min-w-[140px]">User Name:</span> <span className="text-gray-800">{selectedStudent.user_name}</span></div>
                <div className="flex items-start"><span className="font-medium min-w-[140px]">Course:</span> <span className="text-gray-800">{selectedStudent.course_name}</span></div>
                <div className="flex items-start"><span className="font-medium min-w-[140px]">Duration:</span> <span className="text-gray-800">
                  {formatDuration(selectedStudent.enrolled_date, selectedStudent.expiry_date)}
                </span></div>
                <div className="flex items-start"><span className="font-medium min-w-[140px]">Enrolled On:</span> <span className="text-gray-800">{new Date(selectedStudent.enrolled_date).toLocaleDateString()}</span></div>
                <div className="flex items-start"><span className="font-medium min-w-[140px]">Expiry Date:</span> <span className="text-gray-800">{new Date(selectedStudent.expiry_date).toLocaleDateString()}</span></div>
                <div className="flex items-start"><span className="font-medium min-w-[140px]">Status:</span> <span className={`font-semibold ${selectedStudent.status === "active" ? "text-green-600" : "text-red-500"}`}>{selectedStudent.status.toUpperCase()}</span></div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 bg-green-50 px-4 py-2 rounded-lg">Payment Details</h3>
              {selectedStudent.payment ? (
                <div className="space-y-3 text-gray-700 pl-4">
                  {(() => {
                    const paymentAmount = parseFloat(selectedStudent.payment.amount || 0);
                    const discountAmount = parseFloat(selectedStudent.payment.discount_amount || 0);
                    const hasCoupon = selectedStudent.payment.coupon_code && discountAmount > 0;
                    
                    // Calculate actual paid amount after coupon discount
                    let actualPaidAmount = paymentAmount;
                    if (hasCoupon && discountAmount > 0) {
                      actualPaidAmount = Math.max(0, paymentAmount - discountAmount);
                    }
                    
                    return (
                      <>
                        <div className="flex items-start"><span className="font-medium min-w-[140px]">Payment ID:</span> <span className="text-gray-800 font-mono text-sm break-all">{selectedStudent.payment.razorpay_payment_id || "N/A"}</span></div>
                        <div className="flex items-start"><span className="font-medium min-w-[140px]">Order ID:</span> <span className="text-gray-800 font-mono text-sm break-all">{selectedStudent.payment.razorpay_order_id}</span></div>
                        <div className="flex items-start"><span className="font-medium min-w-[140px]">Amount Paid:</span> <span className="text-gray-800 font-semibold">{selectedStudent.payment.currency || "INR"} ₹{actualPaidAmount.toFixed(2)}</span></div>
                        {hasCoupon && (
                          <>
                            <div className="flex items-start"><span className="font-medium min-w-[140px]">Coupon Code:</span> <span className="text-gray-800 font-semibold text-blue-600">{selectedStudent.payment.coupon_code}</span></div>
                            <div className="flex items-start"><span className="font-medium min-w-[140px]">Discount Applied:</span> <span className="text-gray-800 font-semibold text-green-600">-{selectedStudent.payment.currency || "INR"} ₹{discountAmount.toFixed(2)}</span></div>
                            <div className="flex items-start"><span className="font-medium min-w-[140px]">Original Price:</span> <span className="text-gray-500 line-through text-sm">{selectedStudent.payment.currency || "INR"} ₹{paymentAmount.toFixed(2)}</span></div>
                          </>
                        )}
                      </>
                    );
                  })()}
                  <div className="flex items-start"><span className="font-medium min-w-[140px]">Payment Status:</span> <span className={`font-semibold ${selectedStudent.payment.status === "completed" ? "text-green-600" : selectedStudent.payment.status === "pending" ? "text-orange-600" : "text-red-500"}`}>{selectedStudent.payment.status.toUpperCase()}</span></div>
                  {selectedStudent.payment.paid_at && (<div className="flex items-start"><span className="font-medium min-w-[140px]">Paid At:</span> <span className="text-gray-800">{new Date(selectedStudent.payment.paid_at).toLocaleString()}</span></div>)}
                </div>
              ) : (
                <div className="pl-4"><p className="text-gray-500 italic">No payment information available</p></div>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t pt-4">
              <Button variant="default" className="bg-gray-700 hover:bg-gray-800 text-white" onClick={() => setSelectedStudent(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
