"use client";

import { useState, useEffect } from "react";
import TiptapEditor from "@/components/editor/TipTapEditor";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SeoIntroAdmin() {
  const [heading, setHeading] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch saved SEO intro
  const fetchSeoIntro = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/seo-intro/`);
      const data = await res.json();

      if (data.success && data.data) {
        setHeading(data.data.heading || "");
        setContent(data.data.content || "");
      }
    } catch (err) {
      console.error("Error fetching SEO Intro:", err);
    } finally {
      setLoading(false); // ✅ only render editor after content is set
    }
  };

  useEffect(() => {
    fetchSeoIntro();
  }, []);

  // Save SEO intro
  const saveSeoIntro = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/seo-intro/save/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heading, content }),
      });

      const data = await res.json();

      if (data.success) {
        alert("SEO Intro saved successfully");
        fetchSeoIntro(); // refetch so editor shows latest saved content
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Wait for content before rendering editor
  if (loading) return <p>Loading SEO Intro...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">SEO Intro Section</h2>

      {/* Heading */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Heading</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Content</label>
        <TiptapEditor value={content} onChange={setContent} />
      </div>

      <button
        onClick={saveSeoIntro}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}