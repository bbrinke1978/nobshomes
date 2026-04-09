"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ImageDropzoneProps {
  onUpload: (url: string) => void;
}

type UploadStatus = "idle" | "uploading" | "done" | "error";

export function ImageDropzone({ onUpload }: ImageDropzoneProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [progress, setProgress] = useState<string>("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setStatus("uploading");
      setErrorMessage("");

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        setProgress(`Uploading ${i + 1} of ${acceptedFiles.length}: ${file.name}`);

        try {
          // Step 1: Get SAS URL from server
          const urlRes = await fetch("/api/admin/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
            }),
          });

          if (!urlRes.ok) {
            throw new Error(`Failed to get upload URL: ${urlRes.statusText}`);
          }

          const { sasUrl, permanentUrl } = await urlRes.json();

          // Step 2: PUT file directly to Azure Blob Storage
          const uploadRes = await fetch(sasUrl, {
            method: "PUT",
            headers: {
              "x-ms-blob-type": "BlockBlob",
              "Content-Type": file.type,
            },
            body: file,
          });

          if (!uploadRes.ok) {
            throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
          }

          // Step 3: Notify parent with the permanent (read SAS) URL
          onUpload(permanentUrl);
        } catch (err) {
          setStatus("error");
          setErrorMessage(err instanceof Error ? err.message : "Upload failed");
          return;
        }
      }

      setStatus("done");
      setProgress("");
      // Reset to idle after brief success display
      setTimeout(() => setStatus("idle"), 2000);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10 MB
  });

  return (
    <div
      {...getRootProps()}
      className={[
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-brand-500 bg-brand-50"
          : "border-slate-300 hover:border-brand-400 bg-white",
        status === "error" ? "border-red-400 bg-red-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input {...getInputProps()} />

      {status === "uploading" && (
        <div>
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-slate-600 text-sm">{progress}</p>
        </div>
      )}

      {status === "done" && (
        <p className="text-green-600 font-medium">Upload complete!</p>
      )}

      {status === "error" && (
        <div>
          <p className="text-red-600 font-medium mb-1">Upload failed</p>
          <p className="text-red-500 text-sm">{errorMessage}</p>
          <p className="text-slate-500 text-sm mt-2">Click or drag to try again</p>
        </div>
      )}

      {status === "idle" && (
        <>
          {isDragActive ? (
            <p className="text-brand-600 font-medium">Drop images here...</p>
          ) : (
            <>
              <div className="w-12 h-12 mx-auto mb-3 text-slate-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
              <p className="text-slate-600 font-medium">
                Drag & drop images here, or click to select
              </p>
              <p className="text-slate-400 text-sm mt-1">
                JPG, PNG, WebP — up to 10 files, 10 MB each
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
