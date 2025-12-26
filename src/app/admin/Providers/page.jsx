"use client";

import { useEffect, useState } from "react";

export default function ProvidersAdmin() {
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState({ name: "", icon: "" });
  const [selected, setSelected] = useState([]);

  // Load all providers
  async function loadProviders() {
    const res = await fetch("/api/providers");
    const data = await res.json();
    setProviders(data);
  }

  useEffect(() => {
    loadProviders();
  }, []);

  // Create provider
  async function handleCreate(e) {
    e.preventDefault();

    const res = await fetch("/api/providers/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ name: "", icon: "" });
      loadProviders();
    }
  }

  // Delete provider
  async function deleteProvider(slug) {
    await fetch(`/api/providers/${slug}/delete/`, {
      method: "DELETE",
    });
    loadProviders();
  }

  // Bulk delete
  async function bulkDelete() {
    await fetch("/api/providers/bulk-delete/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: selected }),
    });

    setSelected([]);
    loadProviders();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">Manage Providers</h1>

      {/* Create Form */}
      <form
        onSubmit={handleCreate}
        className="p-4 border rounded mb-8 flex gap-4"
      >
        <input
          type="text"
          placeholder="Provider Name"
          className="border p-2 flex-1"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Icon (Cloud, Shield, Award...)"
          className="border p-2 flex-1"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          required
        />

        <button className="bg-blue-600 text-white px-4 rounded">
          Add Provider
        </button>
      </form>

      {/* Provider List */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3"></th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Icon</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {providers.map((p) => (
            <tr key={p.slug} className="border-b">
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={selected.includes(p.slug)}
                  onChange={() => {
                    if (selected.includes(p.slug)) {
                      setSelected(selected.filter((s) => s !== p.slug));
                    } else {
                      setSelected([...selected, p.slug]);
                    }
                  }}
                />
              </td>

              <td className="p-3">{p.name}</td>
              <td className="p-3">{p.icon}</td>

              <td className="p-3 text-center">
                <button
                  onClick={() => deleteProvider(p.slug)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bulk Delete */}
      {selected.length > 0 && (
        <button
          onClick={bulkDelete}
          className="mt-6 bg-red-600 text-white px-6 py-2 rounded"
        >
          Delete Selected ({selected.length})
        </button>
      )}
    </div>
  );
}
