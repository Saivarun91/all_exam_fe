"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, RefreshCw, ArrowLeft, Calendar, User, Globe, Monitor } from "lucide-react";

export default function SearchLogsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLogs = useCallback(async () => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });

      if (debouncedSearchQuery.trim()) {
        params.append("search", debouncedSearchQuery.trim());
      }

      const response = await fetch(
        `${API_BASE_URL}/api/search-logs/?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Authentication failed. Please login again.");
          return;
        }
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.success) {
        setLogs(data.logs || []);

        if (data.pagination) {
          setTotalPages(data.pagination.pages || 1);
          setTotal(data.pagination.total || 0);
        }
      } else {
        throw new Error(data.message || "Failed to fetch logs");
      }
    } catch (error) {
      console.error("Error fetching search logs:", error);
      setError(error.message || "Failed to load search logs");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearchQuery, token, API_BASE_URL]);

  // Fetch logs when page or search query changes
  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [page, debouncedSearchQuery, token, fetchLogs]);

  const handleRefresh = () => {
    setPage(1);
    setSearchQuery("");
    setDebouncedSearchQuery("");
    fetchLogs();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/admin")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Search Logs</h1>
            </div>

            <Button
              onClick={handleRefresh}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search logs by query..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Total Logs</div>
              <div className="text-3xl font-bold text-blue-600">{total}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Current Page</div>
              <div className="text-3xl font-bold text-green-600">
                {page} / {totalPages}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Showing</div>
              <div className="text-3xl font-bold text-purple-600">
                {logs.length} logs
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Logs Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                Loading search logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No search logs found</p>
                <p className="text-sm text-gray-400 mt-2">
                  {debouncedSearchQuery
                    ? "Try adjusting your search query"
                    : "Search logs will appear here when users search"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">
                          Search Query
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          User
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          IP Address
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          User Agent
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Date & Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <Search className="h-4 w-4 text-blue-500" />
                              <span>{log.query || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {log.user_name || "Anonymous"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {log.ip_address || "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 max-w-xs">
                              <Monitor className="h-4 w-4 text-gray-400" />
                              <span
                                className="text-sm text-gray-600 truncate"
                                title={log.user_agent || "N/A"}
                              >
                                {truncateText(log.user_agent, 60)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {formatDate(log.created_at)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                    >
                      Previous
                    </Button>

                    <span className="text-gray-600 text-sm">
                      Page {page} of {totalPages} ({total} total logs)
                    </span>

                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
