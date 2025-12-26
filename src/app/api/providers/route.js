import { NextResponse } from "next/server";

export async function GET() {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const res = await fetch(`${API_BASE}/api/providers/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return fallback providers if backend is unavailable
    const fallbackProviders = [
      { id: "1", name: "AWS", slug: "aws" },
      { id: "2", name: "Microsoft Azure", slug: "azure" },
      { id: "3", name: "Google Cloud", slug: "google" },
      { id: "4", name: "Cisco", slug: "cisco" },
      { id: "5", name: "CompTIA", slug: "comptia" },
    ];
    
    return NextResponse.json(fallbackProviders);
  }
}

