"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import * as LucideIcons from "lucide-react";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    value: "",
    icon: "",
    gradient: "",
  });

  const { toast } = useToast();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const iconOptions = [
    "Users",
    "Target",
    "Star",
    "Activity",
    "Award",
    "Globe",
    "Rocket",
    "BarChart2",
    "TrendingUp",
    "Clock",
  ];

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/home/analytics/`);
      const json = await res.json();
      if (json.success && json.stats) {
        setStats(json.stats);
      } else {
        toast({
          title: "Failed to fetch analytics stats",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error fetching stats", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const url = editingId
        ? `${API_BASE}/home/analytics/update/${editingId}/`
        : `${API_BASE}/home/analytics/create/`;

      const res = await fetch(url, { method: "POST", body: formData });
      const json = await res.json();

      if (json.success) {
        toast({
          title: editingId
            ? "✅ Analytics stat updated successfully"
            : "✅ Analytics stat created successfully",
        });
        setForm({ title: "", value: "", icon: "", gradient: "" });
        setEditingId(null);
        fetchStats();
      } else {
        toast({
          title: json.message || "Error saving stat",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error saving stat", variant: "destructive" });
    }
  };

  const handleEdit = (stat) => {
    setEditingId(stat.id || null);
    setForm(stat);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this stat?")) return;

    try {
      const res = await fetch(`${API_BASE}/home/analytics/delete/${id}/`, {
        method: "DELETE",
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success !== false) {
        toast({ title: "🗑️ Deleted successfully" });
        fetchStats();
      } else {
        toast({
          title: json.message || "Delete failed",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error deleting stat", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setForm({ title: "", value: "", icon: "", gradient: "" });
    setEditingId(null);
  };

  if (loading)
    return (
      <section className="py-20 text-center text-muted-foreground">
        Loading...
      </section>
    );

  return (
    <div className="p-10 space-y-12 bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen">
      {/* --- Form Section --- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white/90 shadow-sm hover:shadow-md transition-all p-8 backdrop-blur-sm"
      >
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">
          {editingId ? "Edit Analytics Stat" : "Create Analytics Stat"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Active Students"
              required
              className="bg-white border-slate-300 focus:border-blue-400 focus:ring-blue-200"
            />
          </div>

          <div>
            <Label htmlFor="value">Value</Label>
            <Input
              name="value"
              value={form.value}
              onChange={handleChange}
              placeholder="e.g., 1200 or 95%"
              required
              className="bg-white border-slate-300 focus:border-blue-400 focus:ring-blue-200"
            />
          </div>

          <div>
            <Label htmlFor="icon">Icon</Label>
            <select
              name="icon"
              value={form.icon}
              onChange={handleChange}
              className="w-full border rounded-md p-2 text-gray-700 focus:ring focus:ring-primary/30"
              required
            >
              <option value="">Select an icon</option>
              {iconOptions.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Select a Lucide icon for the stat card.
            </p>
          </div>

          <div>
            <Label htmlFor="gradient">Gradient</Label>
            <Input
              name="gradient"
              value={form.gradient}
              onChange={handleChange}
              placeholder="e.g., from-sky-400 to-blue-500"
              className="bg-white border-slate-300 focus:border-blue-400 focus:ring-blue-200"
            />
          </div>

          <div className="flex justify-between pt-6 gap-3">
            <Button
              type="submit"
              className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white shadow-md"
            >
              {editingId ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-1/2 border-slate-300 text-slate-700 hover:bg-slate-100"
              onClick={resetForm}
            >
              Clear
            </Button>
          </div>
        </form>
      </motion.div>

      {/* --- Stats Display --- */}
      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8">
        {stats.length === 0 ? (
          <p className="text-center text-slate-500 col-span-3">
            No analytics stats found.
          </p>
        ) : (
          stats.map((stat, i) => {
            const IconComponent = LucideIcons[stat.icon] || LucideIcons.BarChart2;

            return (
              <motion.div
                key={stat.id ?? `${stat.title}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="relative border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl">
                  <CardHeader className="flex justify-between items-center pb-0">
                    <CardTitle className="text-lg font-semibold text-slate-700">
                      {stat.title}
                    </CardTitle>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}
                    >
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <p className="text-4xl font-bold text-slate-800 mb-4">
                      {stat.value}
                    </p>

                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(stat)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(stat.id)}
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
