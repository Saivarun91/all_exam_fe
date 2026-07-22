"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, RefreshCw, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

function formatDate(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function TestAttemptsAdminPage() {
  const [attempts, setAttempts] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [uniqueMembers, setUniqueMembers] = useState(0);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const pageSize = 50;

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchAttempts = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("Admin login required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (appliedSearch.trim()) {
        params.set("search", appliedSearch.trim());
      }
      if (examFilter) {
        params.set("exam_id", examFilter);
      }

      const res = await fetch(
        `${API_BASE}/api/exams/attempts/?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Failed to load attempts (${res.status})`);
      }

      const data = await res.json();
      setAttempts(Array.isArray(data.data) ? data.data : []);
      setTotal(Number(data.total) || 0);
      setUniqueMembers(Number(data.unique_members) || 0);
      setExams(Array.isArray(data.exams) ? data.exams : []);
    } catch (err) {
      setError(err.message || "Failed to load test attempts");
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, examFilter]);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  const handleDelete = async (row) => {
    const token = getToken();
    if (!token) return;

    const label = row.user_name || row.user_email || "this user";
    const confirmed = window.confirm(
      `Delete the attempt by ${label} (${row.test_name || "test"})? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(row.id);
      const res = await fetch(
        `${API_BASE}/api/exams/attempts/${row.id}/delete/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Failed to delete (${res.status})`);
      }

      // Refresh list + counts after deletion
      await fetchAttempts();
    } catch (err) {
      alert(err.message || "Failed to delete attempt");
    } finally {
      setDeletingId(null);
    }
  };

  const selectedExam = exams.find((e) => e.exam_id === examFilter) || null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1A35] flex items-center gap-2">
            <Users className="w-7 h-7 text-[#1A73E8]" />
            Test Takers
          </h1>
          <p className="text-sm text-[#0C1A35]/70 mt-1">
            Users who completed practice tests — updates as new attempts are claimed after login.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => fetchAttempts()}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-[#DDE7FF]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#0C1A35]">
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <form
              className="flex flex-1 flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                setAppliedSearch(searchQuery);
              }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email…"
                  className="pl-9"
                />
              </div>
              <Button
                type="submit"
                className="bg-[#1A73E8] hover:bg-[#1557B0] text-white"
              >
                Search
              </Button>
            </form>

            <select
              value={examFilter}
              onChange={(e) => {
                setPage(1);
                setExamFilter(e.target.value);
              }}
              className="h-10 rounded-md border border-input bg-white px-3 text-sm text-[#0C1A35] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/40 sm:min-w-[260px]"
            >
              <option value="">All Exams</option>
              {exams.map((exam) => (
                <option key={exam.exam_id || "unknown"} value={exam.exam_id}>
                  {exam.exam_title}
                  {exam.exam_code ? ` (${exam.exam_code})` : ""} — {exam.members}{" "}
                  member{exam.members === 1 ? "" : "s"}, {exam.attempts} attempt
                  {exam.attempts === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg border border-[#DDE7FF] bg-[#F3F8FF] px-4 py-2">
              <span className="text-lg font-bold text-[#1A73E8]">{total}</span>{" "}
              <span className="text-sm text-[#0C1A35]/70">
                attempt{total === 1 ? "" : "s"}
                {selectedExam ? ` for ${selectedExam.exam_title}` : " in total"}
              </span>
            </div>
            <div className="rounded-lg border border-[#DDE7FF] bg-[#F4FFF6] px-4 py-2">
              <span className="text-lg font-bold text-emerald-600">
                {uniqueMembers}
              </span>{" "}
              <span className="text-sm text-[#0C1A35]/70">
                member{uniqueMembers === 1 ? "" : "s"} took{" "}
                {selectedExam ? "this exam" : "tests"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#DDE7FF]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold text-[#0C1A35]">
              Completed attempts
            </CardTitle>
            <span className="text-sm text-[#0C1A35]/60">{total} total</span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-16 text-center text-[#0C1A35]/60">Loading…</div>
          ) : error ? (
            <div className="py-16 text-center text-red-600">{error}</div>
          ) : attempts.length === 0 ? (
            <div className="py-16 text-center text-[#0C1A35]/60">
              No test attempts found yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DDE7FF] text-left text-[#0C1A35]/70">
                    <th className="py-3 pr-4 font-medium">User</th>
                    <th className="py-3 pr-4 font-medium">Email</th>
                    <th className="py-3 pr-4 font-medium">Exam</th>
                    <th className="py-3 pr-4 font-medium">Test</th>
                    <th className="py-3 pr-4 font-medium">Score</th>
                    <th className="py-3 pr-4 font-medium">Result</th>
                    <th className="py-3 pr-4 font-medium">Completed</th>
                    <th className="py-3 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#EEF3FF] hover:bg-[#F8FBFF]"
                    >
                      <td className="py-3 pr-4 font-medium text-[#0C1A35]">
                        {row.user_name || "Unknown"}
                      </td>
                      <td className="py-3 pr-4 text-[#0C1A35]/80">
                        {row.user_email || "—"}
                      </td>
                      <td className="py-3 pr-4 text-[#0C1A35]/80">
                        <div>{row.exam_title || "—"}</div>
                        {row.exam_code ? (
                          <div className="text-xs text-[#0C1A35]/50">
                            {row.exam_code}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4 text-[#0C1A35]/80">
                        {row.test_name || "—"}
                      </td>
                      <td className="py-3 pr-4 text-[#0C1A35]">
                        {row.score ?? 0}/{row.total_marks ?? 0}{" "}
                        <span className="text-[#0C1A35]/55">
                          ({row.percentage ?? 0}%)
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          className={
                            row.passed
                              ? "bg-emerald-100 text-emerald-800 border-0"
                              : "bg-rose-100 text-rose-800 border-0"
                          }
                        >
                          {row.passed ? "Passed" : "Failed"}
                        </Badge>
                        {row.is_trial ? (
                          <Badge className="ml-2 bg-blue-50 text-[#1A73E8] border-0">
                            Guest claim
                          </Badge>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4 text-[#0C1A35]/80 whitespace-nowrap">
                        {formatDate(row.completed_at || row.created_at)}
                      </td>
                      <td className="py-3 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(row)}
                          disabled={deletingId === row.id}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete attempt"
                        >
                          <Trash2
                            className={`w-4 h-4 ${
                              deletingId === row.id ? "animate-pulse" : ""
                            }`}
                          />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && totalPages > 1 ? (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#DDE7FF]">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-[#0C1A35]/70">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
