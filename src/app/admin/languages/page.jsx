"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

export default function Languages() {
  const [languages, setLanguages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    is_active: true,
    font_family: "",
  });

  const [editingId, setEditingId] = useState(null);

  const fetchLanguages = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/languages/`
      );

      const data = await res.json();

      if (data.success) {
        setLanguages(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let url;
      let method;

      if (editingId) {
        url = `${API_BASE}/api/languages/update/${editingId}/`;
        method = "PUT";
      } else {
        url = `${API_BASE}/api/languages/create/`;
        method = "POST";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert(
          editingId
            ? "Language Updated"
            : "Language Created"
        );

        setFormData({
          name: "",
          code: "",
          is_active: true,
          font_family: "",
        });

        setEditingId(null);

        fetchLanguages();
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("languagesUpdated", {
              detail: { languageCode: formData.code },
            })
          );
          window.dispatchEvent(
            new CustomEvent("translationsUpdated", {
              detail: { languageCode: formData.code },
            })
          );
        }
      } else {
        const codeError = data.errors?.code?.[0];
        alert(
          data.message ||
            codeError ||
            "Could not save language. Please check the form and try again."
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (language) => {
    setEditingId(language.id);

    setFormData({
      name: language.name,
      code: language.code,
      is_active: language.is_active,
      font_family: language.font_family || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Delete this language?"
      );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/languages/delete/${id}/`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (data.success) {
        fetchLanguages();
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("languagesUpdated", {
              detail: { languageCode: formData.code },
            })
          );
          window.dispatchEvent(
            new CustomEvent("translationsUpdated", {
              detail: { languageCode: formData.code },
            })
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Languages Management
      </h1>

      <form
        onSubmit={handleSubmit}
        className="border rounded-lg p-4 mb-8"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Language Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />

          <input
            type="text"
            name="code"
            placeholder="Language Code (en, fr)"
            value={formData.code}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />
        </div>

        <div className="mt-4">
          <input
            type="text"
            name="font_family"
            placeholder="Font Family (optional, e.g. Poppins, Noto Sans)"
            value={formData.font_family}
            onChange={handleChange}
            className="border p-3 rounded w-full"
          />
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            Active
          </label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded mt-4"
        >
          {editingId
            ? "Update Language"
            : "Create Language"}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3">
                Name
              </th>
              <th className="border p-3">
                Code
              </th>
              <th className="border p-3">
                Font
              </th>
              <th className="border p-3">
                Active
              </th>
              <th className="border p-3">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {languages.map((language) => (
              <tr key={language.id}>
                <td className="border p-3">
                  {language.name}
                </td>

                <td className="border p-3">
                  {language.code}
                </td>

                <td className="border p-3">
                  {language.font_family || "Default"}
                </td>

                <td className="border p-3">
                  {language.is_active
                    ? "Yes"
                    : "No"}
                </td>

                <td className="border p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleEdit(language)
                      }
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          language.id
                        )
                      }
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {languages.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center p-6"
                >
                  No languages found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}