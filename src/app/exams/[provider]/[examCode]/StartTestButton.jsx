"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function StartTestButton({
  url,
  label = "Start Practicing →",
  className = "w-full bg-[#1A73E8] text-white hover:bg-[#1557B0] h-12 text-lg",
  openInNewTab = true,
}) {
  const router = useRouter();
  const href = typeof url === "string" ? url.trim() : "";
  const [mounted, setMounted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkLogin = () => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  };

  useEffect(() => {
    const handleLogin = () => {
      if (!pendingUrl) return;
      setShowLoginModal(false);
      router.push(pendingUrl);
      setPendingUrl(null);
    };

    window.addEventListener("userLoggedIn", handleLogin);
    return () => window.removeEventListener("userLoggedIn", handleLogin);
  }, [pendingUrl, router]);

  if (!href) {
    return (
      <Button type="button" className={className} disabled>
        {label}
      </Button>
    );
  }

  const goToPractice = (targetUrl = href) => {
    if (openInNewTab && typeof window !== "undefined") {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(targetUrl);
  };

  const handleClick = () => {
    if (!mounted) return;

    if (!checkLogin()) {
      setPendingUrl(href);
      setShowLoginModal(true);
      return;
    }

    goToPractice(href);
  };

  return (
    <>
      <Button type="button" className={className} onClick={handleClick}>
        {label}
      </Button>

      {mounted ? (
        <Dialog
          open={showLoginModal}
          onOpenChange={(open) => {
            setShowLoginModal(open);
            if (!open) setPendingUrl(null);
          }}
        >
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
                onClick={() => {
                  setShowLoginModal(false);
                  setPendingUrl(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() =>
                  router.push(
                    `/auth/login?redirect=${encodeURIComponent(
                      pendingUrl || href
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
    </>
  );
}
