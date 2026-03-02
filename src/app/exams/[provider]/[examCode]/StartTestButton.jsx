// "use client";

// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";

// export default function StartTestButton({ provider, examCode, test }) {
//   const router = useRouter();

//   const handleClick = () => {
//     const token = localStorage.getItem("token");

//     let identifier = test.slug || test.id;

//     if (!token) {
//       router.push(
//         `/auth/login?redirect=/exams/${provider}/${examCode}/practice/${identifier}`
//       );
//     } else {
//       router.push(
//         `/exams/${provider}/${examCode}/practice/${identifier}`
//       );
//     }
//   };

//   return (
//     <Button
//       onClick={handleClick}
//       className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0]"
//     >
//       Start Test
//     </Button>
//   );
// }




"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function StartTestButton({ url }) {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const checkLogin = () =>
    typeof window !== "undefined" && !!localStorage.getItem("token");

  const handleClick = () => {
    if (!checkLogin()) {
      setShowLoginModal(true);
    } else {
      router.push(url);
    }
  };

  return (
    <>
      <Button
        className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0] h-12 text-lg"
        onClick={handleClick}
      >
        Start Practicing →
      </Button>

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
              variant="outline"
              onClick={() => setShowLoginModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                router.push(`/auth/login?redirect=${encodeURIComponent(url)}`)
              }
              className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0] text-white"
            >
              Login / Sign Up
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}