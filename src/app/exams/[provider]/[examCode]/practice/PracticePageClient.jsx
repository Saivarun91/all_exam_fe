"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { buildPracticeTestSeoSegment } from "@/utils/practiceTestRouting";

function getTestKey(test, index) {
  return String(test?.id || test?.slug || test?.name || `practice-test-${index}`);
}

export default function PracticePageClient({
  practiceTests = [],
  provider = "",
  examCode = "",
  examTitle = "",
  examSlug = "",
  children = null,
}) {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingTestUrl, setPendingTestUrl] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [startModalTest, setStartModalTest] = useState(null);
  const [startModalUrl, setStartModalUrl] = useState("");

  const startModalMeta = useMemo(() => {
    const test = startModalTest || {};
    const questions =
      test.questions ?? test.total_questions ?? test.totalQuestions ?? 0;
    const duration = test.duration ?? test.time ?? test.time_limit ?? "";
    const difficulty = test.difficulty ?? test.level ?? "Intermediate";
    const title = test.title || test.name || "Practice Test";
    return {
      title,
      questions: Number.isFinite(Number(questions))
        ? String(Number(questions))
        : String(questions || 0),
      duration: String(duration || "").trim(),
      difficulty: String(difficulty || "").trim() || "Intermediate",
    };
  }, [startModalTest]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkLogin = () => {
    if (!mounted) return false;
    return !!localStorage.getItem("token");
  };

  const openStartModalForTest = (test, index = 0) => {
    const cleanSlug = buildPracticeTestSeoSegment({
      examName: examTitle,
      examCode,
      examSlug,
      test,
      index,
    });
    const url = `/${cleanSlug}`;
    setStartModalTest(test || null);
    setStartModalUrl(url);
    setStartModalOpen(true);
  };

  const handleViewPricing = () => {
    const url = `/exams/${provider}/${examCode}/practice/pricing`;

    if (!checkLogin()) {
      setPendingTestUrl(url);
      setShowLoginModal(true);
      return;
    }
    router.push(url);
  };

  useEffect(() => {
    const handleLogin = () => {
      if (pendingTestUrl) {
        setShowLoginModal(false);
        router.push(pendingTestUrl);
        setPendingTestUrl(null);
      }
    };

    window.addEventListener("userLoggedIn", handleLogin);
    return () => window.removeEventListener("userLoggedIn", handleLogin);
  }, [pendingTestUrl, router]);

  return (
    <div className="w-full">
      {practiceTests?.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0C1A35] mb-6">
            Practice Tests Included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {practiceTests.map((test, idx) => (
              <Card
                key={getTestKey(test, idx)}
                className="border-[#DDE7FF] bg-white shadow-sm hover:shadow-md hover:border-[#1A73E8]/30 transition-all rounded-xl py-0 gap-0"
              >
                <CardContent className="p-5 flex flex-col h-full">
                  <h3 className="font-semibold text-[#0C1A35] mb-2 text-lg">
                    {test?.title || test?.name || `Practice Test ${idx + 1}`}
                  </h3>
                  <p className="text-sm text-[#0C1A35]/65 mb-4">
                    {test?.questions || 0} Questions
                  </p>
                  <Button
                    type="button"
                    onClick={() => openStartModalForTest(test, idx)}
                    className="w-full mt-auto bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg"
                  >
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {children}

      <section className="mb-12">
        <div className="rounded-2xl border border-[#1A73E8]/20 bg-gradient-to-br from-[#0C1A35] to-[#0E2444] text-white p-8 sm:p-10 text-center shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#F0F4FF]">
            Unlock Full Practice Access
          </h2>
          <p className="text-[#F0F4FF]/85 mb-6 max-w-2xl mx-auto leading-relaxed">
            Get access to all premium practice tests, detailed explanations,
            and performance analytics to boost your exam success.
          </p>
          <Button
            type="button"
            onClick={handleViewPricing}
            className="bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold px-8 py-3 shadow-[0_4px_14px_rgba(26,115,232,0.35)]"
          >
            View Pricing Plans
          </Button>
        </div>
      </section>

      <Dialog open={startModalOpen} onOpenChange={setStartModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A73E8]/10 text-[#1A73E8]">
              <FileText className="h-7 w-7" aria-hidden />
            </div>
            <DialogTitle className="text-center text-[#0C1A35]">
              Ready to Start Your Test?
            </DialogTitle>
            <DialogDescription className="text-center">
              This practice test contains questions to help you prepare for the
              exam.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#DDE7FF] bg-[#F3F8FF] px-4 py-3 text-center">
                <div className="text-lg font-bold text-[#1A73E8]">
                  {startModalMeta.questions}
                </div>
                <div className="text-xs text-[#0C1A35]/65">Questions</div>
              </div>
              <div className="rounded-xl border border-[#DDE7FF] bg-[#F4FFF6] px-4 py-3 text-center">
                <div className="text-lg font-bold text-emerald-600">
                  {startModalMeta.duration || "—"}
                </div>
                <div className="text-xs text-[#0C1A35]/65">Duration</div>
              </div>
              <div className="rounded-xl border border-[#DDE7FF] bg-[#FBF5FF] px-4 py-3 text-center">
                <div className="text-lg font-bold text-purple-600">
                  {startModalMeta.difficulty}
                </div>
                <div className="text-xs text-[#0C1A35]/65">Difficulty</div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                type="button"
                variant="outline"
                className="sm:min-w-[160px]"
                onClick={() => setStartModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-[#1A73E8] hover:bg-[#1557B0] text-white sm:min-w-[160px]"
                onClick={() => {
                  if (!startModalUrl) return;
                  setStartModalOpen(false);
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem(`autostart:${startModalUrl}`, "1");
                  }
                  router.push(startModalUrl);
                }}
              >
                Start Test Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {mounted ? (
        <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login Required</DialogTitle>
              <DialogDescription>
                You need to login to start taking tests.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLoginModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() =>
                  router.push(
                    `/auth/login?redirect=${encodeURIComponent(
                      pendingTestUrl ||
                        `/exams/${provider}/${examCode}/practice`
                    )}`
                  )
                }
                className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0] text-white"
              >
                Login / Sign Up
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
