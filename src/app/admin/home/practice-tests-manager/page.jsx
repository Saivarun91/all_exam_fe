"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, SearchIcon, ClipboardList } from "lucide-react";
import { checkAuth, getAuthHeaders } from "@/utils/authCheck";
import AdminTablePagination, { ADMIN_TABLE_PAGE_SIZE } from "@/components/admin/AdminTablePagination";
import {
  buildAdminListUrl,
  DEFAULT_ADMIN_PAGINATION,
  normalizeAdminPagination,
  useDebouncedValue,
} from "@/lib/adminPagination";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function getPracticeTestCount(course) {
  if (
    course?.practice_tests_list &&
    Array.isArray(course.practice_tests_list)
  ) {
    return course.practice_tests_list.length;
  }
  return parseInt(course?.practice_exams, 10) || 0;
}

export default function PracticeTestsManagerPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [listPage, setListPage] = useState(1);
  const [listPagination, setListPagination] = useState(DEFAULT_ADMIN_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/admin/auth");
      return;
    }
  }, [router]);

  useEffect(() => {
    if (!checkAuth()) return;
    fetchCourses();
  }, [listPage, debouncedSearchQuery]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        buildAdminListUrl(`${API_BASE_URL}/api/courses/admin/list/`, {
          page: listPage,
          page_size: ADMIN_TABLE_PAGE_SIZE,
          search: debouncedSearchQuery.trim(),
          manager: "practice_tests",
        }),
        {
          headers: getAuthHeaders(),
          cache: "no-store",
        }
      );

      if (res.status === 401) {
        setMessage("Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setCourses(Array.isArray(data.data) ? data.data : []);
        setListPagination(normalizeAdminPagination(data.pagination));
      }
    } catch (error) {
      setMessage(`Error loading exams: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setListPage(1);
  }, [searchQuery]);

  const filteredCourses = courses;

  const handleDeleteExam = async (course) => {
    if (!course?.id) return;
    const ok = window.confirm(
      `Delete exam "${course.title || course.code}" and all its practice tests? This cannot be undone.`
    );
    if (!ok) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/courses/admin/${course.id}/delete/`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (res.status === 401) {
        setMessage("Authentication failed. Please log in again.");
        setTimeout(() => router.push("/admin/auth"), 2000);
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        setMessage(`Error: ${data?.error || "Failed to delete exam"}`);
        return;
      }

      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      setMessage("Exam deleted successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-center py-20 text-[#0C1A35]/70">Loading exams...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0C1A35] mb-2">
          Practice Tests Manager
        </h1>
        <p className="text-[#0C1A35]/60">
          Manage practice tests for all exams. Add, edit, and delete practice
          tests per exam.
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.toLowerCase().includes("error") ||
            message.includes("failed") ||
            message.includes("Authentication")
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            All Exams & Practice Tests
          </CardTitle>
          <div className="relative mt-3">
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0C1A35]/40"
              aria-hidden
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, code, provider, category, or slug..."
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Title</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Practice Tests</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-[#0C1A35]/60 py-8"
                  >
                    No exams found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => {
                  const testCount = getPracticeTestCount(course);
                  return (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium text-[#0C1A35]">
                        {course.title}
                      </TableCell>
                      <TableCell>{course.code || "-"}</TableCell>
                      <TableCell>{course.provider || "-"}</TableCell>
                      <TableCell>{course.category || "-"}</TableCell>
                      <TableCell>
                        {testCount > 0 ? (
                          <Badge className="bg-blue-100 text-blue-800 border-0">
                            {testCount} test{testCount !== 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">None</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2 justify-end">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              router.push(`/admin/courses/${course.id}/tests`)
                            }
                            title="Manage practice tests"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeleteExam(course)}
                            title="Delete exam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <AdminTablePagination
            currentPage={listPagination.page}
            totalPages={listPagination.total_pages}
            totalItems={listPagination.count}
            onPageChange={setListPage}
            itemLabel="exams"
          />
        </CardContent>
      </Card>
    </div>
  );
}
