"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, Check, X, Eye, Award } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/reviews/admin/all/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const result = await res.json();
      if (result.success) {
        setReviews(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (reviewId) => {
    try {
      const res = await fetch(`${API_BASE}/api/reviews/${reviewId}/approve/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchReviews();
        alert("Review approved successfully");
      } else {
        alert("Failed to approve review");
      }
    } catch (error) {
      console.error("Error approving review:", error);
      alert("Failed to approve review");
    }
  };

  const handleReject = async (reviewId) => {
    if (!confirm("Are you sure you want to reject this review?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/reviews/${reviewId}/reject/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchReviews();
        alert("Review rejected successfully");
      } else {
        alert("Failed to reject review");
      }
    } catch (error) {
      console.error("Error rejecting review:", error);
      alert("Failed to reject review");
    }
  };

  const handleToggleTestimonial = async (reviewId) => {
    try {
      const res = await fetch(`${API_BASE}/api/reviews/${reviewId}/testimonial/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchReviews();
        alert(data.message || "Testimonial status updated successfully");
      } else {
        alert(data.message || "Failed to update testimonial status");
      }
    } catch (error) {
      console.error("Error toggling testimonial:", error);
      alert("Failed to update testimonial status");
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === "pending") return !review.is_approved && review.is_active;
    if (filter === "approved") return review.is_approved && review.is_active;
    return review.is_active;
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Student Reviews</h1>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            All ({reviews.length})
          </Button>

          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Pending ({reviews.filter((r) => !r.is_approved && r.is_active).length})
          </Button>

          <Button
            variant={filter === "approved" ? "default" : "outline"}
            onClick={() => setFilter("approved")}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Approved ({reviews.filter((r) => r.is_approved && r.is_active).length})
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-10">Loading reviews...</p>
      ) : filteredReviews.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No reviews found.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 gap-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">

                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {review.user_name || 'Unknown User'}
                      </h3>

                      {review.rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={
                                i < (review.rating || 0)
                                  ? "fill-yellow-400 text-yellow-400 w-5 h-5"
                                  : "text-gray-300 w-5 h-5"
                              }
                            />
                          ))}

                          <span className="ml-2 text-sm font-semibold text-gray-700">
                            {review.rating || 0}/5
                          </span>
                        </div>
                      )}
                    </div>

                    {review.user_email && (
                      <p className="text-sm text-gray-500 mb-2">
                        Email: {review.user_email}
                      </p>
                    )}

                    {review.course_name && (
                      <p className="text-sm text-blue-600 mb-2">
                        Course: {review.course_name}
                      </p>
                    )}

                    <p className="text-sm text-gray-400">
                      {new Date(review.created_at).toLocaleString()}
                    </p>

                  </div>

                  <div
                    className={
                      review.is_approved
                        ? "px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"
                        : "px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700"
                    }
                  >
                    {review.is_approved ? "Approved" : "Pending"}
                  </div>
                </div>

                {(review.text || review.comment) && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Review Text:</p>
                    <p className="text-gray-700 leading-relaxed">
                      {review.text || review.comment}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  {!review.is_approved ? (
                    <>
                      <Button
                        onClick={() => handleApprove(review.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>

                      <Button
                        onClick={() => handleReject(review.id)}
                        variant="outline"
                        className="border-red-400 text-red-500 hover:bg-red-50"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleToggleTestimonial(review.id)}
                      variant={review.is_testimonial ? "default" : "outline"}
                      className={
                        review.is_testimonial
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "border-purple-400 text-purple-600 hover:bg-purple-50"
                      }
                      size="sm"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      {review.is_testimonial ? "Remove from Testimonials" : "Add to Testimonials"}
                    </Button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
