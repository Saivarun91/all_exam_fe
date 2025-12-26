// "use client";

// import { usePathname, useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function NotFound() {
//   const pathname = usePathname();
//   const router = useRouter();

//   useEffect(() => {
//     console.error("404 Error: User attempted to access non-existent route:", pathname);
//   }, [pathname]);

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-muted">
//       <div className="text-center">
//         <h1 className="mb-4 text-4xl font-bold">404</h1>
//         <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
//         <button
//           onClick={() => router.push("/")}
//           className="text-primary underline hover:text-primary/90"
//         >
//           Return to Home
//         </button>
//       </div>
//     </div>
//   );
// }


"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();
  const [suggestedRoutes, setSuggestedRoutes] = useState([]);

  // Dynamic logging and optional fetching of similar routes
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);

    // Example: dynamically suggest routes based on path
    const pathParts = pathname.split("/").filter(Boolean);
    const baseRoute = pathParts[0] || "";

    // Mock dynamic suggestion logic (replace with API if needed)
    const suggestionsMap = {
      exams: ["/exams/aws", "/exams/microsoft", "/exams/google"],
      practice: ["/practice/aws/saa-c03", "/practice/microsoft/az-104"],
      pricing: ["/pricing?provider=aws", "/pricing?provider=microsoft"]
    };

    setSuggestedRoutes(suggestionsMap[baseRoute] || []);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold text-foreground">404</h1>
          <p className="mb-6 text-xl text-muted-foreground">Oops! Page not found</p>

          <Button
            onClick={() => router.push("/")}
            className="mb-6"
          >
            Return to Home
          </Button>

          {suggestedRoutes.length > 0 && (
            <div>
              <p className="mb-2 text-muted-foreground">You might be looking for:</p>
              <div className="flex flex-col gap-2">
                {suggestedRoutes.map((route, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    onClick={() => router.push(route)}
                  >
                    {route}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
