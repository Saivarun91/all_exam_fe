"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TipTapEditor from "@/components/editor/TipTapEditor";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function SectionContentAdmin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [sectionSettings, setSectionSettings] = useState({
    content: "",
    heading: "",
  });

  useEffect(() => {
    fetchSectionSettings();
  }, []);

  const fetchSectionSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/section-content/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (data.success && data.data) {
        setSectionSettings({
          content: data.data.content || "",
          heading: data.data.heading || "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/home/admin/section-content/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: sectionSettings.content,
          heading: sectionSettings.heading,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Content saved successfully!");
      } else {
        setMessage("❌ Failed to save");
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {message && (
        <div className="mb-4 p-3 rounded bg-gray-100">
          {message}
        </div>
      )}
  
      <Card>
        <CardHeader>
          <CardTitle>Section Content</CardTitle>
        </CardHeader>
  
        <CardContent className="space-y-4">
  
          {/* ✅ Heading */}
          <div>
            <Label>Heading</Label>
            <Input
              value={sectionSettings.heading}
              onChange={(e) =>
                setSectionSettings({
                  ...sectionSettings,
                  heading: e.target.value,
                })
              }
              placeholder="Enter section heading"
            />
          </div>
  
          {/* ✅ Content */}
          <div>
            <Label>Content</Label>
            <div className="border p-2 rounded">
              <TipTapEditor
                content={sectionSettings.content}
                onChange={(html) =>
                  setSectionSettings({
                    ...sectionSettings,
                    content: html,
                  })
                }
              />
            </div>
          </div>
  
          {/* ✅ Save Button */}
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
  
        </CardContent>
      </Card>
    </div>
  );
}