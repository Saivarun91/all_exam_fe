"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, CheckCircle2, Lock, Loader2, CreditCard, Ticket, Tag, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  
  const provider = params?.provider;
  const examCode = params?.examCode;
  const planSlug = params?.plan; // Get plan from URL params (SEO-friendly)

  const [plan, setPlan] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  useEffect(() => {
    console.log("Checkout page loaded:", { provider, examCode, planSlug });
    if (provider && examCode && planSlug) {
      fetchData();
      fetchCoupons();
    }
  }, [planSlug, provider, examCode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Normalize provider and examCode for API call
      const normalizedProvider = provider.toLowerCase().replace(/_/g, '-');
      const normalizedExamCode = examCode.toLowerCase().replace(/_/g, '-');
      
      // Try fetching from pricing API first
      const pricingRes = await fetch(`${API_BASE_URL}/api/courses/pricing/${normalizedProvider}/${normalizedExamCode}/`);
      
      let planFound = false;
      if (pricingRes.ok) {
        const pricingData = await pricingRes.json();
        
        // Check if pricing_plans exist and are not empty
        if (pricingData.pricing_plans && Array.isArray(pricingData.pricing_plans) && pricingData.pricing_plans.length > 0) {
          setExam({
            title: pricingData.course_title,
            code: pricingData.course_code
          });
          
          // Find the selected plan from pricing_plans
          const normalizedPlanSlug = planSlug?.toLowerCase().trim();
          const selectedPlan = pricingData.pricing_plans.find(p => {
            if (!p.name) return false;
            const planNameNormalized = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            return planNameNormalized === normalizedPlanSlug || 
                   p.name.toLowerCase() === normalizedPlanSlug?.replace(/-/g, ' ') ||
                   p.name.toLowerCase() === normalizedPlanSlug;
          });
          
          if (selectedPlan) {
            // Ensure features are populated from plan.features or pricing_features
            if (!selectedPlan.features || selectedPlan.features.length === 0) {
              // Try to get features from pricing_features if available
              if (pricingData.pricing_features && pricingData.pricing_features.length > 0) {
                selectedPlan.features = pricingData.pricing_features.map(f => f.title || f.description || f);
              }
            }
            setPlan(selectedPlan);
            planFound = true;
          } else if (pricingData.pricing_plans.length > 0) {
            // Fallback to first plan if exact match not found
            const fallbackPlan = pricingData.pricing_plans[0];
            if (!fallbackPlan.features || fallbackPlan.features.length === 0) {
              if (pricingData.pricing_features && pricingData.pricing_features.length > 0) {
                fallbackPlan.features = pricingData.pricing_features.map(f => f.title || f.description || f);
              }
            }
            setPlan(fallbackPlan);
            planFound = true;
          }
        }
      }
      
      // Fallback: try course API if pricing API didn't return plans or plan not found
      if (!planFound) {
        const slug = `${normalizedProvider}-${normalizedExamCode}`;
        const examRes = await fetch(`${API_BASE_URL}/api/courses/exams/${slug}/`);
        
        if (examRes.ok) {
          const examData = await examRes.json();
          setExam(examData);
          
          if (examData.pricing_plans && Array.isArray(examData.pricing_plans) && examData.pricing_plans.length > 0) {
            const normalizedPlanSlug = planSlug?.toLowerCase().trim();
            const selectedPlan = examData.pricing_plans.find(p => {
              if (!p.name) return false;
              const planNameNormalized = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              return planNameNormalized === normalizedPlanSlug || 
                     p.name.toLowerCase() === normalizedPlanSlug?.replace(/-/g, ' ') ||
                     p.name.toLowerCase() === normalizedPlanSlug;
            }) || examData.pricing_plans[0];
            
            // Ensure features are populated
            if (selectedPlan && (!selectedPlan.features || selectedPlan.features.length === 0)) {
              if (examData.pricing_features && examData.pricing_features.length > 0) {
                selectedPlan.features = examData.pricing_features.map(f => f.title || f.description || f);
              }
            }
            setPlan(selectedPlan);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoadingCoupons(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const userId = localStorage.getItem('user_id') || data.user_id;
        
        // Get all coupons (both available and used) to show "already used" status
        const allCoupons = (data.coupons || []).map(coupon => {
          // Check if user has already used this coupon
          const userAlreadyUsed = userId && coupon.used_by && Array.isArray(coupon.used_by) 
            ? coupon.used_by.some(usedUserId => String(usedUserId) === String(userId))
            : coupon.is_used;
          
          return {
            ...coupon,
            is_used: userAlreadyUsed || coupon.is_used,
            user_already_used: userAlreadyUsed
          };
        });
        
        setCoupons(allCoupons);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please login to continue with payment");
        router.push('/auth');
        setProcessing(false);
        return;
      }

      // Extract price amount (original price - backend will apply coupon discount)
      const priceNum = parseFloat(plan.price?.replace(/[₹$,]/g, '') || 0);
      const couponCode = selectedCoupon ? selectedCoupon.code : null;

      console.log("Creating Razorpay order for:", {
        provider,
        examCode,
        plan: plan.name,
        amount: priceNum,
        coupon: couponCode
      });

      // Normalize provider and examCode for API
      const normalizedProvider = provider.toLowerCase().replace(/_/g, '-');
      const normalizedExamCode = examCode.toLowerCase().replace(/_/g, '-');

      // Call backend to create Razorpay order
      const orderResponse = await fetch(`${API_BASE_URL}/api/enrollments/payment/create-pricing-order/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: normalizedProvider,
          exam_code: normalizedExamCode,
          plan_name: plan.name,
          amount: priceNum, // Send original amount - backend will apply coupon discount
          coupon_code: couponCode
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to create payment order");
      }

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create payment order");
      }

      console.log("Razorpay order created:", orderData);

      // Initialize Razorpay
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: orderData.key_id,
          amount: orderData.amount, // Use amount from backend (backend applies coupon discount)
          currency: orderData.currency,
          name: "AllExamQuestions",
          description: `${plan.name} Plan - ${exam?.title || examCode}`,
          order_id: orderData.order_id,
          handler: function (response) {
            console.log("Razorpay payment response:", response);
            handlePaymentSuccess(response, orderData);
          },
          prefill: {
            name: "",
            email: "",
            contact: ""
          },
          theme: {
            color: "#1A73E8"
          },
          modal: {
            ondismiss: function() {
              setProcessing(false);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        throw new Error("Razorpay is not loaded. Please refresh the page and try again.");
      }

    } catch (error) {
      console.error("Payment error:", error);
      alert(`Payment failed: ${error.message}`);
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async (response, orderData) => {
    try {
      const token = localStorage.getItem('token');
      console.log("Verifying payment:", response);

      // Normalize provider and examCode
      const normalizedProvider = provider.toLowerCase().replace(/_/g, '-');
      const normalizedExamCode = examCode.toLowerCase().replace(/_/g, '-');
      const slug = `${normalizedProvider}-${normalizedExamCode}`;

      // Find course ID from backend
      const slugRes = await fetch(`${API_BASE_URL}/api/courses/exams/${slug}/`);
      if (!slugRes.ok) {
        throw new Error("Failed to fetch course details");
      }
      const courseData = await slugRes.json();

      // Call backend to verify payment and create enrollment
      const verifyResponse = await fetch(`${API_BASE_URL}/api/enrollments/payment/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          payment_id: orderData.payment_id,
          course_id: courseData.id,
          duration_months: parseInt(plan.duration?.replace(/[^0-9]/g, '')) || 12,
          pricing_plan_id: plan.id || plan._id || null,
          duration_days: plan.duration_days || null
        })
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Payment verification failed");
      }

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error(verifyData.message || "Payment verification failed");
      }

      console.log("Payment verified:", verifyData);
      
      // Redirect to success page
      setProcessing(false);
      router.push(`/payment-success/${provider}/${examCode}`);
    } catch (error) {
      console.error("Payment verification error:", error);
      alert(`Payment verification failed: ${error.message}`);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!plan || !exam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Plan Not Found</h1>
          <p className="text-gray-600 mb-2">The selected pricing plan could not be found.</p>
          {planSlug && (
            <p className="text-sm text-gray-500 mb-4">Requested plan: {planSlug}</p>
          )}
          <Button onClick={() => router.push(`/exams/${provider}/${examCode}/practice/pricing`)} className="bg-[#1A73E8]">
            View Pricing Plans
          </Button>
        </div>
      </div>
    );
  }

  // Extract price numbers for calculations
  const priceNum = parseFloat(plan.price?.replace(/[₹$,]/g, '') || 0);
  const originalPriceNum = parseFloat(plan.original_price?.replace(/[₹$,]/g, '') || 0);
  const discount = originalPriceNum > 0 ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100) : 0;
  
  // Calculate final amount with coupon discount
  let finalAmount = priceNum;
  if (selectedCoupon) {
    const discountValue = parseFloat(selectedCoupon.discount_value || 0);
    const discountType = selectedCoupon.discount_type || 'percentage';
    
    if (discountType === 'percentage') {
      finalAmount = priceNum * (1 - discountValue / 100);
    } else {
      finalAmount = Math.max(0, priceNum - discountValue);
    }
    finalAmount = Math.round(finalAmount * 100) / 100;
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        strategy="lazyOnload"
      />
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Back Button */}
          <Link
            href={`/exams/${provider}/${examCode}/practice/pricing`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#1A73E8] mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </Link>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Complete Your Purchase
            </h1>
            <p className="text-gray-600">
              Secure payment powered by Razorpay
            </p>
          </div>

          {/* Single Column Layout */}
          <div className="max-w-3xl mx-auto">
            <Card className="border-gray-200 bg-white shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="text-2xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Course Info */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {exam?.title || `${provider?.toUpperCase()} ${examCode?.toUpperCase()}`}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {plan.name} Plan
                    </span>
                    <span className="text-gray-600">{plan.duration}</span>
                  </div>
                </div>

                <Separator />

                {/* Plan Features */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {plan.features && plan.features.length > 0 ? (
                      plan.features.map((feature, idx) => {
                        // Handle both string features and object features
                        const featureText = typeof feature === 'string' ? feature : (feature.title || feature.description || feature);
                        return (
                          <div key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{featureText}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-sm text-gray-500">
                        No features listed for this plan.
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Available Coupons */}
                {!loadingCoupons && coupons.length > 0 && (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-[#1A73E8]" />
                        Available Coupons
                      </h3>
                      <div className="space-y-2">
                        {coupons.map((coupon) => {
                          const isExpired = coupon.expiry_date ? new Date(coupon.expiry_date) < new Date() : false;
                          const isSelected = selectedCoupon?.id === coupon.id;
                          const isAlreadyUsed = coupon.is_used || coupon.user_already_used;
                          const isDisabled = isExpired || isAlreadyUsed;
                          
                          return (
                            <div
                              key={coupon.id}
                              onClick={() => !isDisabled && setSelectedCoupon(isSelected ? null : coupon)}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                isDisabled
                                  ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                  : isSelected
                                  ? 'border-[#1A73E8] bg-blue-50 cursor-pointer'
                                  : 'border-gray-200 bg-white hover:border-[#1A73E8] hover:bg-blue-50 cursor-pointer'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Tag className={`w-5 h-5 ${isSelected ? 'text-[#1A73E8]' : isDisabled ? 'text-gray-300' : 'text-gray-400'}`} />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`font-semibold ${isDisabled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                        {coupon.code}
                                      </span>
                                      {isAlreadyUsed ? (
                                        <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                                          Already Used
                                        </Badge>
                                      ) : isExpired ? (
                                        <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                                          Expired
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                          {coupon.discount}
                                        </Badge>
                                      )}
                                    </div>
                                    {isAlreadyUsed && coupon.used_at && (
                                      <p className="text-xs text-red-600 mt-1">
                                        Used on: {new Date(coupon.used_at).toLocaleDateString()}
                                      </p>
                                    )}
                                    {isExpired && !isAlreadyUsed && coupon.expiry_date && (
                                      <p className="text-xs text-red-600 mt-1">
                                        Expired on: {new Date(coupon.expiry_date).toLocaleDateString()}
                                      </p>
                                    )}
                                    {!isExpired && !isAlreadyUsed && coupon.expiry_date && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Expires: {new Date(coupon.expiry_date).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {isSelected && !isDisabled && (
                                  <CheckCircle2 className="w-5 h-5 text-[#1A73E8]" />
                                )}
                                {isAlreadyUsed && (
                                  <Lock className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {selectedCoupon && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700">
                            <strong>{selectedCoupon.code}</strong> will be applied at checkout. You'll save {selectedCoupon.discount}!
                          </p>
                        </div>
                      )}
                    </div>
                    <Separator />
                  </>
                )}

                {/* Pricing */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg text-gray-700">Plan Price:</span>
                    <div className="text-right">
                      {plan.original_price && plan.original_price !== plan.price && (
                        <span className="text-lg text-gray-400 line-through block">{plan.original_price}</span>
                      )}
                      {selectedCoupon && priceNum !== finalAmount && (
                        <span className="text-lg text-gray-400 line-through block">{plan.price}</span>
                      )}
                      <span className="text-3xl font-bold text-gray-900">
                        {selectedCoupon && priceNum !== finalAmount 
                          ? `₹${finalAmount.toFixed(2)}`
                          : plan.price}
                      </span>
                    </div>
                  </div>
                  {selectedCoupon && priceNum !== finalAmount && (
                    <div className="flex items-center justify-between py-2 border-t">
                      <span className="text-sm text-green-600 font-semibold">Coupon Discount ({selectedCoupon.code})</span>
                      <span className="text-sm text-green-600 font-semibold">
                        -₹{(priceNum - finalAmount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {discount > 0 && !selectedCoupon && (
                    <div className="flex items-center justify-between py-2 border-t">
                      <span className="text-sm text-green-600 font-semibold">Discount Applied</span>
                      <span className="text-sm text-green-600 font-semibold">{discount}% OFF</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t mt-2">
                    <span className="text-sm text-gray-600">Payment Type</span>
                    <span className="text-sm text-gray-600">One-time payment • No subscription</span>
                  </div>
                </div>

                <Separator />

                {/* Security Notice */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Secure Payment</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Your payment is processed securely through Razorpay. We never store your card details.
                    </p>
                  </div>
                </div>

                {/* Pay Button */}
                <div className="pt-4">
                  <Button
                    onClick={handlePayment}
                    disabled={processing || !razorpayLoaded}
                    className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white py-6 text-lg font-semibold shadow-lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay {plan.price} and Continue
                      </>
                    )}
                  </Button>

                  <div className="text-center mt-4">
                    <Link
                      href={`/exams/${provider}/${examCode}/practice/pricing`}
                      className="text-sm text-gray-600 hover:text-[#1A73E8] flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Pricing Plans
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}

