"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, FileQuestion, Plus, Trash2, Edit3, Search } from "lucide-react";

export default function AdminCategoryTestsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [categoryName, setCategoryName] = useState("");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [newTest, setNewTest] = useState({
    title: "",
    questions: "",
    duration: "",
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  // Fetch category and tests
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const catRes = await fetch(`${API_BASE_URL}/api/categories/${id}/`);
        if (!catRes.ok) throw new Error("Category not found");
        const catData = await catRes.json();
        setCategoryName(catData.name);

        const testRes = await fetch(`${API_BASE_URL}/api/tests/category/${id}/`);
        if (!testRes.ok) throw new Error("Failed to fetch tests");
        const testData = await testRes.json();
        setTests(testData);
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [id, API_BASE_URL]);

  // Select test for bulk delete
  const handleSelectTest = (testId) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!selectedTests.length) return alert("Select at least one test to delete.");
    if (!confirm(`Delete ${selectedTests.length} selected tests?`)) return;

    try {
      for (const testId of selectedTests) {
        await fetch(`${API_BASE_URL}/api/tests/${testId}/delete/`, {
          method: "DELETE",
        });
      }
      setTests(tests.filter((t) => !selectedTests.includes(t.id)));
      setSelectedTests([]);
      alert("✅ Selected tests deleted successfully!");
    } catch (err) {
      alert(`❌ ${err.message || "An unexpected error occurred"}`);
    }
  };

  // Delete single test
  const handleDeleteTest = async (testId) => {
    if (!confirm("Are you sure you want to delete this test?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/tests/${testId}/delete/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete test");
      setTests(tests.filter((t) => t.id !== testId));
      alert("✅ Test deleted successfully!");
    } catch (err) {
      alert(`❌ ${err.message || "An unexpected error occurred"}`);
    }
  };

  // Add new test
  const handleAddTest = async (e) => {
    e.preventDefault();
    const { title, questions, duration } = newTest;
    if (!title || !questions || !duration) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/tests/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: id,
          title,
          questions: Number(questions),
          duration: Number(duration),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create test");

      setTests((prev) => [...prev, data]);
      setShowAddModal(false);
      setNewTest({ title: "", questions: "", duration: "" });
      alert("✅ Test added successfully!");
    } catch (err) {
      alert(`❌ ${err.message || "An unexpected error occurred"}`);
    }
  };

  // Edit modal open
  const handleEditClick = (test) => {
    setEditingTest(test);
    setShowEditModal(true);
  };

  // Save edited test
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTest) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/tests/${editingTest.id}/update/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingTest.title,
          questions: editingTest.questions,
          duration: editingTest.duration,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update test");

      setTests((prev) => prev.map((t) => (t.id === editingTest.id ? { ...t, ...data } : t)));
      setShowEditModal(false);
      alert("✅ Test updated successfully!");
    } catch (err) {
      alert(`❌ ${err.message || "An unexpected error occurred"}`);
    }
  };

  const filteredTests = tests.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return <p className="text-center py-20 text-lg font-semibold text-gray-500">Loading tests...</p>;
  if (error)
    return <p className="text-center py-20 text-red-600 font-semibold">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-blue-50 py-16 px-6 relative">
      {/* HEADER */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
          {categoryName} Tests
        </h2>
        <p className="text-gray-600 mt-2 font-medium">(Admin Management)</p>

        {/* SEARCH BAR */}
        <div className="flex justify-center mt-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-lg"
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-4 mt-6">
          <Button
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Test
          </Button>

          {selectedTests.length > 0 && (
            <Button
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-pink-700 transition"
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Selected (
              {selectedTests.length})
            </Button>
          )}
        </div>
      </div>

      {/* GRID */}
      {filteredTests.length === 0 ? (
        <p className="text-center text-gray-500">No tests found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredTests.map((test) => (
            <Card
              key={test.id}
              className={`rounded-2xl border ${
                selectedTests.includes(test.id)
                  ? "border-red-400 bg-red-50/70"
                  : "border-gray-100 bg-white/90"
              } shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm`}
            >
              <CardHeader className="pb-0 flex justify-between items-center">
                <CardTitle className="text-2xl font-semibold text-indigo-700">
                  {test.title}
                </CardTitle>
                <Checkbox
                  checked={selectedTests.includes(test.id)}
                  onCheckedChange={() => handleSelectTest(test.id)}
                />
              </CardHeader>

              <CardContent className="space-y-3 pt-4">
                {/* Questions */}
                <div className="flex items-center gap-2 text-gray-700">
                  <FileQuestion className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm">
                    <strong>{test.questions}</strong> Questions
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm">
                    <strong>{test.duration}</strong> minutes
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-all"
                    onClick={() => router.push(`/admin/tests/${test.id}`)}
                  >
                    View
                  </Button>

                  <Button
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-all flex items-center gap-1"
                    onClick={() => handleEditClick(test)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" /> Edit
                  </Button>

                  <Button
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-all"
                    onClick={() => handleDeleteTest(test.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Test Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-[400px]">
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">Add New Test</h3>
            <form onSubmit={handleAddTest} className="space-y-4">
              <Input
                placeholder="Test Title"
                value={newTest.title}
                onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Number of Questions"
                value={newTest.questions}
                onChange={(e) => setNewTest({ ...newTest, questions: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Duration (minutes)"
                value={newTest.duration}
                onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })}
              />
              <div className="flex justify-end gap-3 mt-4">
                <Button type="submit" className="bg-green-500 text-white">
                  Save
                </Button>
                <Button
                  type="button"
                  className="bg-gray-300 text-gray-800"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Test Modal */}
      {showEditModal && editingTest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-[400px]">
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">Edit Test</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <Input
                placeholder="Test Title"
                value={editingTest.title}
                onChange={(e) => setEditingTest({ ...editingTest, title: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Number of Questions"
                value={editingTest.questions}
                onChange={(e) =>
                  setEditingTest({ ...editingTest, questions: Number(e.target.value) })
                }
              />
              <Input
                type="number"
                placeholder="Duration (minutes)"
                value={editingTest.duration}
                onChange={(e) =>
                  setEditingTest({ ...editingTest, duration: Number(e.target.value) })
                }
              />
              <div className="flex justify-end gap-3 mt-4">
                <Button type="submit" className="bg-green-500 text-white">
                  Update
                </Button>
                <Button
                  type="button"
                  className="bg-gray-300 text-gray-800"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
