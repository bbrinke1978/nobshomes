"use client";

import { useEffect, useState } from "react";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import Image from "next/image";

interface GalleryImage {
  id: number;
  blobUrl: string;
  alt: string;
  projectName: string;
  displayOrder: number;
  createdAt: string;
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [edits, setEdits] = useState<Record<number, { alt: string; projectName: string }>>({});

  async function fetchImages() {
    const res = await fetch("/api/admin/gallery");
    if (res.ok) {
      const data = await res.json();
      setImages(data);
      // Initialize edits with current values
      const initialEdits: Record<number, { alt: string; projectName: string }> = {};
      for (const img of data) {
        initialEdits[img.id] = { alt: img.alt, projectName: img.projectName };
      }
      setEdits(initialEdits);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchImages();
  }, []);

  async function handleUpload(blobUrl: string) {
    const res = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blobUrl, alt: "", projectName: "" }),
    });
    if (res.ok) {
      await fetchImages();
    }
  }

  async function handleSave(id: number) {
    setSaving(id);
    const { alt, projectName } = edits[id] ?? { alt: "", projectName: "" };
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt, projectName }),
    });
    if (res.ok) {
      await fetchImages();
    }
    setSaving(null);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchImages();
    }
    setDeleting(null);
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

    setImages(newImages);

    await fetch("/api/admin/gallery/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newImages.map((img) => img.id) }),
    });
  }

  function handleEditChange(id: number, field: "alt" | "projectName", value: string) {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { alt: "", projectName: "" }), [field]: value },
    }));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gallery Management</h1>
        <p className="text-slate-500 mt-1">
          Upload and manage project photos for the public gallery.
        </p>
      </div>

      {/* Upload dropzone */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Upload Images</h2>
        <ImageDropzone onUpload={handleUpload} />
      </div>

      {/* Gallery grid */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-3">
          Current Gallery
          {images.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({images.length} image{images.length !== 1 ? "s" : ""})
            </span>
          )}
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-500 mt-3">Loading gallery...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">
              No gallery images yet. Upload your first image above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
              >
                {/* Image thumbnail */}
                <div className="relative w-full h-48 bg-slate-100">
                  <Image
                    src={image.blobUrl}
                    alt={image.alt || "Gallery image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized={image.blobUrl.includes("blob.core.windows.net")}
                  />
                </div>

                {/* Controls */}
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={edits[image.id]?.projectName ?? image.projectName}
                      onChange={(e) =>
                        handleEditChange(image.id, "projectName", e.target.value)
                      }
                      placeholder="e.g. Salt Lake City Renovation"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={edits[image.id]?.alt ?? image.alt}
                      onChange={(e) =>
                        handleEditChange(image.id, "alt", e.target.value)
                      }
                      placeholder="Describe the image for accessibility"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {/* Reorder */}
                    <button
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMove(index, "down")}
                      disabled={index === images.length - 1}
                      className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      ↓
                    </button>

                    {/* Save */}
                    <button
                      onClick={() => handleSave(image.id)}
                      disabled={saving === image.id}
                      className="flex-1 px-3 py-1.5 text-xs bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-60 transition-colors"
                    >
                      {saving === image.id ? "Saving..." : "Save"}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(image.id)}
                      disabled={deleting === image.id}
                      className="px-3 py-1.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-60 transition-colors"
                    >
                      {deleting === image.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
