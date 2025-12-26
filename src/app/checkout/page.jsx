 "use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              No Items to Checkout
            </h1>
            <p className="text-gray-600 mb-6">
              Please select a plan from an exam page to proceed with checkout.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
            <Link href="/exams" className="block">
              <Button variant="outline" className="w-full">
                Browse Exams
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
