"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BlogEditor } from "@/components/admin/BlogEditor";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!content || content === "<p></p>") {
      setError("Content is required.");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, excerpt, published }),
    });

    if (res.ok) {
      router.push("/admin/blog");
    } else {
      const text = await res.text();
      setError(text || "Failed to save post.");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">New Blog Post</h1>
          <p className="text-slate-500 mt-1">Write and publish a new article.</p>
        </div>
        <Link
          href="/admin/blog"
          className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 text-slate-800"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Excerpt
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary shown in post lists (optional)"
            rows={2}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 text-slate-800 resize-none"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <BlogEditor onChange={setContent} />
        </div>

        {/* Published toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
          />
          <label htmlFor="published" className="text-sm font-medium text-slate-700">
            Publish immediately (visible on public blog)
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving..." : "Save Post"}
          </button>
          <Link
            href="/admin/blog"
            className="px-6 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
