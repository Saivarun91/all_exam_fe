"use client";

import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import TiptapEditor from "@/components/editor/TipTapEditor";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const SeoIntroAdmin = forwardRef(function SeoIntroAdmin(props, ref) {
  const [heading, setHeading] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSeoIntro = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/seo-intro/`, {
        cache: "no-store",
      });
      if (!res.ok) {
        console.error("SEO Intro fetch failed:", res.status);
        return;
      }
      const data = await res.json();

      if (data.success && data.data) {
        setHeading(data.data.heading || "");
        setContent(data.data.content || "");
      }
    } catch (err) {
      console.error("Error fetching SEO Intro:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeoIntro();
  }, [fetchSeoIntro]);

  const saveSeoIntro = useCallback(async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE_URL}/api/home/seo-intro/save/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ heading, content }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        await fetchSeoIntro();
        return { ok: true, message: data.message || "Saved" };
      }
      return {
        ok: false,
        message: data.error || data.detail || `HTTP ${res.status}`,
      };
    } catch (err) {
      console.error(err);
      return { ok: false, message: err.message || "Network error" };
    }
  }, [heading, content, fetchSeoIntro]);

  useImperativeHandle(
    ref,
    () => ({
      saveSeoIntro,
    }),
    [saveSeoIntro]
  );

  if (loading) return <p>Loading SEO Intro...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">SEO Intro Section</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Heading</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Content</label>
        <TiptapEditor content={content || ""} onChange={setContent} />
      </div>

      <button
        type="button"
        onClick={async () => {
          const r = await saveSeoIntro();
          alert(r.ok ? "SEO Intro saved successfully" : `Save failed: ${r.message}`);
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save SEO Intro
      </button>
    </div>
  );
});

export default SeoIntroAdmin;
