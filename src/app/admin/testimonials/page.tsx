"use client";

import { useEffect, useState } from "react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  quote: string;
  rating: number;
  displayOrder: number;
  active: boolean;
  createdAt: string;
}

interface FormState {
  name: string;
  location: string;
  quote: string;
  rating: number;
}

const emptyForm: FormState = { name: "", location: "", quote: "", rating: 5 };

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? "text-yellow-400" : "text-slate-200"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(emptyForm);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function fetchTestimonials() {
    const res = await fetch("/api/admin/testimonials");
    if (res.ok) {
      setTestimonials(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function handleAdd() {
    if (!addForm.name.trim() || !addForm.quote.trim()) {
      setError("Name and quote are required.");
      return;
    }
    setAdding(true);
    setError("");
    const res = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (res.ok) {
      setAddForm(emptyForm);
      setShowAddForm(false);
      await fetchTestimonials();
    } else {
      setError("Failed to add testimonial.");
    }
    setAdding(false);
  }

  function startEdit(t: Testimonial) {
    setEditId(t.id);
    setEditForm({ name: t.name, location: t.location, quote: t.quote, rating: t.rating });
    setError("");
  }

  async function handleSave(id: number) {
    if (!editForm.name.trim() || !editForm.quote.trim()) {
      setError("Name and quote are required.");
      return;
    }
    setSaving(id);
    setError("");
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setEditId(null);
      await fetchTestimonials();
    } else {
      setError("Failed to save changes.");
    }
    setSaving(null);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this testimonial? This cannot be undone.")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchTestimonials();
    }
    setDeleting(null);
  }

  async function handleToggleActive(t: Testimonial) {
    setToggling(t.id);
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !t.active }),
    });
    await fetchTestimonials();
    setToggling(null);
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const newList = [...testimonials];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;

    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setTestimonials(newList);

    await fetch("/api/admin/testimonials/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newList.map((t) => t.id) }),
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Testimonials</h1>
          <p className="text-slate-500 mt-1">Manage customer testimonials shown on the homepage.</p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setError(""); }}
          className="px-4 py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors"
        >
          + Add Testimonial
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="mb-6 bg-white rounded-xl border border-brand-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">New Testimonial</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="e.g. Sarah M."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
              <input
                type="text"
                value={addForm.location}
                onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                placeholder="e.g. Salt Lake City, UT"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Quote <span className="text-red-500">*</span>
            </label>
            <textarea
              value={addForm.quote}
              onChange={(e) => setAddForm({ ...addForm, quote: e.target.value })}
              placeholder="Their testimonial..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-1">Rating</label>
            <select
              value={addForm.rating}
              onChange={(e) => setAddForm({ ...addForm, rating: Number(e.target.value) })}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} stars</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={adding}
              className="px-4 py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-60 transition-colors"
            >
              {adding ? "Saving..." : "Add Testimonial"}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setAddForm(emptyForm); setError(""); }}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-3">Loading testimonials...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">No testimonials yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t, index) => (
            <div
              key={t.id}
              className={[
                "bg-white rounded-xl border p-5 shadow-sm transition-colors",
                t.active ? "border-slate-200" : "border-slate-200 opacity-60",
              ].join(" ")}
            >
              {editId === t.id ? (
                /* Edit form */
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Quote</label>
                    <textarea
                      value={editForm.quote}
                      onChange={(e) => setEditForm({ ...editForm, quote: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Rating</label>
                    <select
                      value={editForm.rating}
                      onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                      className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>{r} stars</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSave(t.id)}
                      disabled={saving === t.id}
                      className="px-4 py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-60 transition-colors"
                    >
                      {saving === t.id ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Display row */
                <div className="flex items-start gap-4">
                  {/* Reorder arrows */}
                  <div className="flex flex-col gap-1 pt-1">
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="px-1.5 py-0.5 text-xs border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === testimonials.length - 1}
                      className="px-1.5 py-0.5 text-xs border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800">{t.name}</p>
                      {t.location && (
                        <span className="text-xs text-slate-400">{t.location}</span>
                      )}
                      <StarRating value={t.rating} />
                    </div>
                    <p className="text-sm text-slate-600 italic line-clamp-2">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Active toggle */}
                    <button
                      onClick={() => handleToggleActive(t)}
                      disabled={toggling === t.id}
                      title={t.active ? "Active (click to deactivate)" : "Inactive (click to activate)"}
                      className={[
                        "w-8 h-8 rounded-full flex items-center justify-center border transition-colors text-xs",
                        t.active
                          ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                          : "bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200",
                      ].join(" ")}
                    >
                      {toggling === t.id ? "..." : t.active ? "✓" : "○"}
                    </button>
                    <button
                      onClick={() => startEdit(t)}
                      className="px-3 py-1.5 text-xs bg-brand-50 text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deleting === t.id}
                      className="px-3 py-1.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-60 transition-colors"
                    >
                      {deleting === t.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
