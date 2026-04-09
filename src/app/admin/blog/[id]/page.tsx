"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { BlogEditor } from "@/components/admin/BlogEditor";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPost() {
      const res = await fetch(`/api/admin/blog/${id}`);
      if (res.ok) {
        const post = await res.json();
        setTitle(post.title);
        setExcerpt(post.excerpt);
        setContent(post.content);
        setPublished(post.published);
      } else {
        setError("Post not found.");
      }
      setLoading(false);
    }
    fetchPost();
  }, [id]);

  async function handleSave() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch(`/api/admin/blog/${id}`, {
      method: "PUT",
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

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/blog");
    } else {
      setError("Failed to delete post.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-500 mt-3">Loading post...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Blog Post</h1>
          <p className="text-slate-500 mt-1">Update content and publish settings.</p>
        </div>
        <Link
          href="/admin/blog"
          className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Back to Posts
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
            placeholder="Brief summary shown in post lists"
            rows={2}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 text-slate-800 resize-none"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          {content && <BlogEditor initialContent={content} onChange={setContent} />}
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
            Published (visible on public blog)
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/admin/blog"
            className="px-6 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <div className="flex-1" />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-60 transition-colors"
          >
            {deleting ? "Deleting..." : "Delete Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
