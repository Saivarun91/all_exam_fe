"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "@/lib/navigation/client";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, CheckCircle2, Lock, Loader2, CreditCard, Ticket, Tag, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import {
  formatPrice,
  getPlanPriceFields,
} from "@/lib/currencyUtils";
import {
  buildCourseLookupSlugs,
  findPricingPlanBySlug,
  getExamPricingPath,
} from "@/utils/practiceTestRouting";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const INDIA_COUNTRY_CODE = "IN";
const DISPLAY_CURRENCY = "USD";

function computeOrderTotals(plan, currency, courseCurrency, selectedCoupon, gstPercentage, applyGst, isTelangana) {
  const { price: priceNum, original_price: originalPriceNum } = getPlanPriceFields(
    plan,
    currency,
    courseCurrency
  );
  const discount =
    originalPriceNum > 0 ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100) : 0;

  let finalAmount = priceNum;
  let couponDiscountAmount = 0;
  if (selectedCoupon) {
    const discountValue = parseFloat(selectedCoupon.discount_value || 0);
    const discountType = selectedCoupon.discount_type || "percentage";

    if (discountType === "percentage") {
      couponDiscountAmount = priceNum * (discountValue / 100);
      if (selectedCoupon.max_discount && couponDiscountAmount > selectedCoupon.max_discount) {
        couponDiscountAmount = selectedCoupon.max_discount;
      }
      if (discountValue > 100) {
        couponDiscountAmount = 0;
      }
      finalAmount = Math.max(0, priceNum - couponDiscountAmount);
    } else {
      couponDiscountAmount = discountValue;
      finalAmount = Math.max(0, priceNum - discountValue);
    }
    finalAmount = Math.round(finalAmount * 100) / 100;
    couponDiscountAmount = Math.round(couponDiscountAmount * 100) / 100;
  }

  const displayAmount = finalAmount;
  const hasApplicableGst = applyGst && gstPercentage > 0;
  const gstAmount = hasApplicableGst
    ? Math.round(displayAmount * (gstPercentage / 100) * 100) / 100
    : 0;
  const cgstAmount =
    hasApplicableGst && isTelangana ? Math.round((gstAmount / 2) * 100) / 100 : 0;
  const sgstAmount =
    hasApplicableGst && isTelangana ? Math.round((gstAmount / 2) * 100) / 100 : 0;
  const totalWithTax = Math.round((displayAmount + gstAmount) * 100) / 100;

  return {
    priceNum,
    originalPriceNum,
    displayAmount,
    couponDiscountAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    totalWithTax,
    discount,
    currency,
  };
}

function getPaymentCurrency(isIndiaBilling) {
  return isIndiaBilling ? "INR" : "USD";
}

function isIndiaCountry(country) {
  const normalized = String(country || "").trim().toLowerCase();
  if (!normalized) return false;
  return (
    normalized === "india" ||
    normalized === "in" ||
    normalized === "ind" ||
    normalized === "bharat" ||
    normalized.includes("india")
  );
}

function shouldApplyGst(billingCountry, detectedCountryCode, gstPercentage) {
  const hasGstRate = Number(gstPercentage) > 0;
  if (!hasGstRate) return false;
  if (isIndiaCountry(billingCountry)) return true;
  if (!String(billingCountry || "").trim() && detectedCountryCode === INDIA_COUNTRY_CODE) {
    return true;
  }
  return false;
}

function parseGstPercentage(data, plan) {
  const root = data?.data && typeof data.data === "object" ? data.data : data;
  const planList = Array.isArray(root?.pricing_plans) ? root.pricing_plans : [];
  const gstFromPlans = planList
    .map((p) => p?.gst_percentage ?? p?.tax_percentage)
    .find((value) => value != null && value !== "");

  const value = Number(
    plan?.gst_percentage ??
    plan?.tax_percentage ??
    root?.gst_percentage ??
    root?.tax_percentage ??
    gstFromPlans ??
    root?.platform_settings?.gst_percentage ??
    root?.platform_settings?.tax_percentage ??
    root?.pricing_tax?.gst_percentage ??
    root?.pricing_tax?.tax_percentage ??
    0
  );
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function enrichPlanWithGst(plan, courseGst) {
  if (!plan) return plan;
  const planGst = parseGstPercentage({ gst_percentage: courseGst, pricing_plans: [plan] }, plan);
  return {
    ...plan,
    gst_percentage: planGst,
    tax_percentage: planGst,
  };
}

function enrichPlanFeatures(plan, featureSource = []) {
  if (!plan) return plan;
  if ((!plan.features || plan.features.length === 0) && featureSource.length > 0) {
    plan.features = featureSource.map((f) => f.title || f.description || f);
  }
  return plan;
}

async function fetchExamBySlug(slug) {
  if (!slug) return null;
  const examRes = await fetch(
    `${API_BASE_URL}/api/courses/exams/${encodeURIComponent(slug)}/`
  );
  if (!examRes.ok) return null;
  return examRes.json();
}

async function fetchPricingByProviderExam(provider, examCode) {
  const normalizedProvider = String(provider || "")
    .toLowerCase()
    .replace(/_/g, "-")
    .trim();
  const normalizedExamCode = String(examCode || "")
    .toLowerCase()
    .replace(/_/g, "-")
    .trim();
  if (!normalizedProvider || !normalizedExamCode) return null;

  const pricingRes = await fetch(
    `${API_BASE_URL}/api/courses/pricing/${encodeURIComponent(normalizedProvider)}/${encodeURIComponent(normalizedExamCode)}/`
  );
  if (!pricingRes.ok) return null;
  return pricingRes.json();
}

function applyResolvedCheckoutData({
  pricingData,
  examData,
  planSlug,
  setExam,
  setPlan,
  setCourseCurrency,
  setGstPercentage,
  setCourseGstPercentage,
  setResolvedCourseSlug,
}) {
  const plans = Array.isArray(pricingData?.pricing_plans)
    ? pricingData.pricing_plans
    : Array.isArray(examData?.pricing_plans)
      ? examData.pricing_plans
      : [];

  if (!plans.length) return false;

  const featureSource =
    pricingData?.pricing_features || examData?.pricing_features || [];
  const selectedPlan =
    findPricingPlanBySlug(plans, planSlug) ||
    plans.find((p) => p && p.status !== "inactive") ||
    plans[0];

  if (!selectedPlan) return false;

  enrichPlanFeatures(selectedPlan, featureSource);

  const courseGst = parseGstPercentage(pricingData || examData, selectedPlan);
  const enrichedPlan = enrichPlanWithGst(selectedPlan, courseGst);

  setExam({
    title: pricingData?.course_title || examData?.title || "",
    code: pricingData?.course_code || examData?.code || "",
    slug: examData?.slug || pricingData?.course_slug || "",
  });
  setPlan(enrichedPlan);
  setCourseCurrency(
    pricingData?.currency || examData?.currency || "INR"
  );
  setGstPercentage(courseGst);
  setCourseGstPercentage(courseGst);
  setResolvedCourseSlug(
    examData?.slug || pricingData?.course_slug || ""
  );

  return true;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const provider = params?.provider;
  const examCode = params?.examCode;
  const planSlug = params?.plan; // Get plan from URL params (SEO-friendly)
  const courseSlugHint =
    searchParams.get("course") || searchParams.get("slug") || "";

  const [plan, setPlan] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [courseCurrency, setCourseCurrency] = useState("INR");
  const [currentStep, setCurrentStep] = useState("billing");
  const [detectedCountryCode, setDetectedCountryCode] = useState(INDIA_COUNTRY_CODE);
  const [gstPercentage, setGstPercentage] = useState(0);
  const [courseGstPercentage, setCourseGstPercentage] = useState(0);
  const [resolvedCourseSlug, setResolvedCourseSlug] = useState("");
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    phone: "",
    address: "",
    state: "",
    country: "",
    gst_id: "",
  });

  useEffect(() => {
    // Set page title
    if (provider && examCode) {
      const providerName = provider.charAt(0).toUpperCase() + provider.slice(1).replace(/-/g, ' ');
      const examCodeFormatted = examCode.toUpperCase().replace(/-/g, ' ');
      document.title = `Checkout - ${providerName} ${examCodeFormatted} | AllExamQuestions`;
    } else {
      document.title = "Checkout - Complete Your Purchase | AllExamQuestions";
    }
    
    console.log("Checkout page loaded:", { provider, examCode, planSlug });
    if (provider && examCode && planSlug) {
      fetchData();
      fetchCoupons();
    }
  }, [planSlug, provider, examCode, courseSlugHint]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const localeRegion = Intl.DateTimeFormat().resolvedOptions().locale?.split("-")?.[1]?.toUpperCase();
    if (localeRegion) {
      setDetectedCountryCode(localeRegion);
    }
  }, []);

  useEffect(() => {
    if (!plan || gstPercentage > 0) return;
    const pct = parseGstPercentage(
      { gst_percentage: courseGstPercentage, pricing_plans: [plan] },
      plan
    );
    if (pct > 0) {
      setGstPercentage(pct);
    }
  }, [plan, courseGstPercentage, gstPercentage]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const slugCandidates = buildCourseLookupSlugs({
        provider,
        examCode,
        courseSlug: courseSlugHint,
      });

      let resolved = false;

      const pricingData = await fetchPricingByProviderExam(provider, examCode);
      if (pricingData) {
        resolved = applyResolvedCheckoutData({
          pricingData,
          examData: null,
          planSlug,
          setExam,
          setPlan,
          setCourseCurrency,
          setGstPercentage,
          setCourseGstPercentage,
          setResolvedCourseSlug,
        });
      }

      if (!resolved) {
        for (const slug of slugCandidates) {
          const examData = await fetchExamBySlug(slug);
          if (!examData) continue;

          const pricingFromExam = await fetchPricingByProviderExam(
            examData.provider_slug || examData.provider,
            examData.code || examData.slug
          );

          resolved = applyResolvedCheckoutData({
            pricingData: pricingFromExam,
            examData,
            planSlug,
            setExam,
            setPlan,
            setCourseCurrency,
            setGstPercentage,
            setCourseGstPercentage,
            setResolvedCourseSlug,
          });

          if (resolved) break;
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
        const now = new Date();
        
        // Filter and process coupons - only show available ones
        const availableCoupons = (data.coupons || [])
          .map(coupon => {
            const isReusable = coupon.is_common === true;
            const userAlreadyUsed = !isReusable && userId && coupon.used_by && Array.isArray(coupon.used_by) 
              ? coupon.used_by.some(usedUserId => String(usedUserId) === String(userId))
              : !isReusable && coupon.is_used;
            
            // Check if coupon is expired
            const expiryDate = coupon.expiry_date ? new Date(coupon.expiry_date) : null;
            const isExpired = expiryDate ? expiryDate < now : false;
            
            return {
              ...coupon,
              is_used: isReusable ? false : (userAlreadyUsed || coupon.is_used),
              user_already_used: isReusable ? false : userAlreadyUsed,
              is_expired: isExpired
            };
          })
          .filter(coupon => {
            // Only show coupons that are: not expired, not used, and active
            return !coupon.is_expired && !coupon.user_already_used && !coupon.is_used && coupon.is_active !== false;
          });
        
        setCoupons(availableCoupons);
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

      const isIndiaBilling = isIndiaCountry(billingDetails.country);
      const applyGst = shouldApplyGst(billingDetails.country, detectedCountryCode, gstPercentage);
      const isTelangana = String(billingDetails.state || "").trim().toLowerCase() === "telangana";
      const paymentCurrency = getPaymentCurrency(isIndiaBilling);
      const paymentTotals = computeOrderTotals(
        plan,
        paymentCurrency,
        courseCurrency,
        selectedCoupon,
        gstPercentage,
        applyGst,
        isTelangana
      );
      const couponCode = selectedCoupon ? selectedCoupon.code : null;
      const amountToCharge = paymentTotals.totalWithTax;

      console.log("Creating Razorpay order for:", {
        provider,
        examCode,
        plan: plan.name,
        amount: amountToCharge,
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
          amount: amountToCharge,
          coupon_code: couponCode,
          currency: paymentCurrency,
          billing_details: billingDetails,
          tax_breakdown: {
            gst_percentage: gstPercentage,
            gst_amount: paymentTotals.gstAmount,
            cgst_amount: paymentTotals.cgstAmount,
            sgst_amount: paymentTotals.sgstAmount,
          },
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
            name: billingDetails.name || "",
            email: "",
            contact: billingDetails.phone || ""
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

  const handleBillingChange = (field, value) => {
    setBillingDetails((prev) => ({ ...prev, [field]: value }));
  };

  const validateBillingStep = () => {
    if (!billingDetails.name.trim()) return "Please enter your name";
    if (!billingDetails.phone.trim()) return "Please enter your phone number";
    if (!billingDetails.address.trim()) return "Please enter your address";
    if (!billingDetails.state.trim()) return "Please enter your state";
    if (!billingDetails.country.trim()) return "Please enter your country";
    return null;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode || !couponCode.trim()) {
      toast.error("Please enter a coupon code", {
        position: "top-right",
        duration: 3000,
      });
      return;
    }

    setApplyingCoupon(true);
    setCouponError(null);

    try {
      const token = localStorage.getItem('token');
      const isIndiaBilling = isIndiaCountry(billingDetails.country);
      const applyGst = shouldApplyGst(billingDetails.country, detectedCountryCode, gstPercentage);
      const paymentCurrency = getPaymentCurrency(isIndiaBilling);
      const { price: priceNum } = getPlanPriceFields(plan, paymentCurrency, courseCurrency);

      const response = await fetch(`${API_BASE_URL}/api/reviews/verify-coupon/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          amount: priceNum
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Invalid coupon code", {
          position: "top-right",
          duration: 3000,
        });
        setSelectedCoupon(null);
        return;
      }

      // If coupon is valid, set it as selected
      if (data.coupon) {
        setSelectedCoupon({
          id: data.coupon.coupon_id,
          code: data.coupon.code,
          discount_type: data.coupon.discount_type,
          discount_value: data.coupon.discount_value,
          max_discount: data.coupon.max_discount || null,
          discount: data.coupon.discount_type === 'percentage' 
            ? `${data.coupon.discount_value}% OFF` 
            : `${formatPrice(data.coupon.discount_value, paymentCurrency)} OFF`
        });
        toast.success(`Coupon ${data.coupon.code} applied successfully!`, {
          position: "top-right",
          duration: 3000,
        });
        setCouponError(null);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Failed to apply coupon. Please try again.", {
        position: "top-right",
        duration: 3000,
      });
      setSelectedCoupon(null);
    } finally {
      setApplyingCoupon(false);
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

      if (verifyData.payment_id) {
        sessionStorage.setItem("last_payment_id", verifyData.payment_id);
      }
      
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
    const pricingRedirect =
      getExamPricingPath({
        slug: resolvedCourseSlug || courseSlugHint,
        code: examCode,
      }) ||
      (resolvedCourseSlug || courseSlugHint
        ? `/${resolvedCourseSlug || courseSlugHint}/practice/pricing`
        : "") ||
      (provider && examCode
        ? `/exams/${provider}/${examCode}/practice/pricing`
        : "/exams");

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Plan Not Found</h1>
          <p className="text-gray-600 mb-2">The selected pricing plan could not be found.</p>
          {planSlug && (
            <p className="text-sm text-gray-500 mb-4">Requested plan: {planSlug}</p>
          )}
          <Button onClick={() => router.push(pricingRedirect)} className="bg-[#1A73E8]">
            View Pricing Plans
          </Button>
        </div>
      </div>
    );
  }

  const isIndiaBilling = isIndiaCountry(billingDetails.country);
  const applyGst = shouldApplyGst(billingDetails.country, detectedCountryCode, gstPercentage);
  const isTelangana = String(billingDetails.state || "").trim().toLowerCase() === "telangana";
  const paymentCurrency = getPaymentCurrency(isIndiaBilling);

  const displayTotals = computeOrderTotals(
    plan,
    DISPLAY_CURRENCY,
    courseCurrency,
    selectedCoupon,
    gstPercentage,
    applyGst,
    isTelangana
  );
  const paymentTotals = computeOrderTotals(
    plan,
    paymentCurrency,
    courseCurrency,
    selectedCoupon,
    gstPercentage,
    applyGst,
    isTelangana
  );

  const {
    priceNum,
    originalPriceNum,
    displayAmount,
    couponDiscountAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    totalWithTax,
    discount,
  } = displayTotals;
  const hasApplicableGst = applyGst && gstPercentage > 0;

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
              {currentStep === "billing" ? "Billing Details" : "Complete Your Purchase"}
            </h1>
            {currentStep === "summary" && (
              <p className="text-gray-600 mb-4">Secure payment powered by Razorpay</p>
            )}
          </div>

          {/* Single Column Layout */}
          <div className="max-w-3xl mx-auto">
            <Card className="border-gray-200 bg-white shadow-lg">
               
              <CardContent className="space-y-6 pt-6">
                {currentStep === "billing" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={billingDetails.name}
                          onChange={(e) => handleBillingChange("name", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={billingDetails.phone}
                          onChange={(e) => handleBillingChange("phone", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        value={billingDetails.address}
                        onChange={(e) => handleBillingChange("address", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                        placeholder="Enter billing address"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          value={billingDetails.state}
                          onChange={(e) => handleBillingChange("state", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                          placeholder="Enter state"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input
                          type="text"
                          value={billingDetails.country}
                          onChange={(e) => handleBillingChange("country", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                          placeholder="Enter country (e.g. India)"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter <strong>India</strong> to apply GST on the order summary.</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GST ID <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={billingDetails.gst_id}
                        onChange={(e) => handleBillingChange("gst_id", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                        placeholder="Enter GST ID (if applicable)"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={() => {
                          const errorMessage = validateBillingStep();
                          if (errorMessage) {
                            toast.error(errorMessage);
                            return;
                          }
                          setCurrentStep("summary");
                        }}
                        className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white py-5 text-base font-semibold"
                      >
                        Next
                      </Button>
                    </div>
                  </>
                )}

                {currentStep === "summary" && (
                  <>
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

                

                {/* Plan Features */}
                {/* <div>
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
                </div> */}

                <Separator />

                {/* Manual Coupon Input */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-[#1A73E8]" />
                    Have a Coupon Code?
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      placeholder="Enter coupon code"
                      style={{ textTransform: 'uppercase' }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
                      disabled={applyingCoupon}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyCoupon();
                        }
                      }}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="bg-[#1A73E8] hover:bg-[#1557B0] text-white px-6"
                    >
                      {applyingCoupon ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  {selectedCoupon && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-green-700 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <strong>{selectedCoupon.code}</strong> applied successfully! You'll save {selectedCoupon.discount} on this purchase.
                        </p>
                        <Button
                          onClick={() => {
                            setSelectedCoupon(null);
                            setCouponCode("");
                            setCouponError(null);
                            toast.success("Coupon removed", {
                              position: "top-right",
                              duration: 2000,
                            });
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-auto py-1 px-2"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Pricing */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg text-gray-700">Plan Price:</span>
                    <div className="text-right">
                      {/* Show original price and offer price if original_price exists */}
                      {originalPriceNum > 0 && originalPriceNum > priceNum ? (
                        <div className="flex flex-col items-end">
                          <span className="text-lg text-gray-400 line-through">{formatPrice(originalPriceNum, DISPLAY_CURRENCY, { round: true })}</span>
                          <span className="text-3xl font-bold text-gray-900">{formatPrice(priceNum, DISPLAY_CURRENCY, { round: true })}</span>
                          <span className="text-sm text-green-600 font-semibold mt-1">{discount}% OFF</span>
                        </div>
                      ) : (
                        <span className="text-3xl font-bold text-gray-900">{formatPrice(priceNum, DISPLAY_CURRENCY, { round: true })}</span>
                      )}
                    </div>
                  </div>
                  {selectedCoupon && couponDiscountAmount > 0 && (
                    <div className="flex items-center justify-between py-2 border-t">
                      <span className="text-sm text-green-600 font-semibold">Coupon Discount ({selectedCoupon.code})</span>
                      <span className="text-sm text-green-600 font-semibold">
                        -{formatPrice(couponDiscountAmount, DISPLAY_CURRENCY, { round: true })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t mt-2">
                    <span className="text-base font-medium text-gray-700">Subtotal</span>
                    <span className="text-lg font-semibold text-gray-900">{formatPrice(displayAmount, DISPLAY_CURRENCY, { round: true })}</span>
                  </div>
                  {hasApplicableGst && isTelangana && (
                    <>
                      <div className="flex items-center justify-between pt-2 border-t mt-2">
                        <span className="text-sm text-gray-700">CGST ({(gstPercentage / 2).toFixed(2)}%)</span>
                        <span className="text-sm font-semibold text-gray-900">{formatPrice(cgstAmount, DISPLAY_CURRENCY, { round: true })}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-gray-700">SGST ({(gstPercentage / 2).toFixed(2)}%)</span>
                        <span className="text-sm font-semibold text-gray-900">{formatPrice(sgstAmount, DISPLAY_CURRENCY, { round: true })}</span>
                      </div>
                    </>
                  )}
                  {hasApplicableGst && !isTelangana && (
                    <div className="flex items-center justify-between pt-2 border-t mt-2">
                      <span className="text-sm text-gray-700">GST ({gstPercentage.toFixed(2)}%)</span>
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(gstAmount, DISPLAY_CURRENCY, { round: true })}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t mt-2">
                    <span className="text-lg font-semibold text-gray-900">Grand Total</span>
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(totalWithTax, DISPLAY_CURRENCY, { round: true })}</span>
                  </div>
                  {isIndiaBilling && gstPercentage <= 0 && !hasApplicableGst && (
                    <p className="text-xs text-amber-700 mt-2">
                      GST is not configured for this course in admin pricing settings.
                    </p>
                  )}
                  {!isIndiaBilling && !hasApplicableGst && (
                    <p className="text-xs text-gray-500 mt-2">
                      GST applies only when billing country is India.
                    </p>
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
                    onClick={() => setCurrentStep("billing")}
                    variant="outline"
                    className="w-full mb-3"
                    disabled={processing}
                  >
                    Back to Billing
                  </Button>
                  <Button
                    onClick={handlePayment}
                    disabled={processing || !razorpayLoaded || displayAmount <= 0}
                    className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : !razorpayLoaded ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Loading Payment Gateway...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay {formatPrice(totalWithTax, DISPLAY_CURRENCY, { round: true })} and Continue
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
                </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}

