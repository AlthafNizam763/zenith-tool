"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  FileText,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";

interface UploadedFileMeta {
  url: string;
  fileName: string;
  fileFormat: string;
  fileSize: number;
}

interface FileUploadModalProps {
  isOpen: boolean;
  title: string;
  category: "images" | "videos" | "documents";
  allowedExtensions?: string[];
  maxSizeMB?: number;
  onSuccess: (meta: UploadedFileMeta) => void;
  onCancel: () => void;
}

const VERCEL_MAX_UPLOAD_BYTES = 4.3 * 1024 * 1024; // 4.3MB safe limit for Vercel Serverless

/**
 * Automatically compresses high-resolution photos (e.g. from mobile cameras)
 * so they fit smoothly within Vercel's serverless request body limits.
 */
async function compressImageIfNeeded(file: File): Promise<File> {
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return file;
  }

  // If already under 3MB, no compression needed
  if (file.size <= 3 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Limit maximum dimension to 2560px for crystal-clear retina/desktop viewing
      const maxDim = 2560;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(file);

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const cleanName = file.name.replace(/\.[^.]+$/, ".webp");
            const compressed = new File([blob], cleanName, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(compressed);
          } else {
            resolve(file);
          }
        },
        "image/webp",
        0.88
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export default function FileUploadModal({
  isOpen,
  title,
  category,
  allowedExtensions,
  maxSizeMB = 50,
  onSuccess,
  onCancel,
}: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [customUrl, setCustomUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const defaultExtensions =
    allowedExtensions ||
    (category === "images"
      ? [".jpg", ".jpeg", ".png", ".webp", ".svg"]
      : category === "videos"
      ? [".mp4", ".webm", ".mov"]
      : [".pdf", ".doc", ".docx", ".zip"]);

  const isSelectedFileTooLargeForVercel =
    Boolean(selectedFile) &&
    !selectedFile!.type.startsWith("image/") &&
    selectedFile!.size > VERCEL_MAX_UPLOAD_BYTES;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      setError(`File size (${sizeInMB.toFixed(1)}MB) exceeds limit of ${maxSizeMB}MB.`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    setError("");

    if (uploadMode === "url") {
      if (!customUrl.trim()) {
        setError("Please enter a valid URL");
        return;
      }

      const ext = customUrl.split(".").pop()?.toLowerCase() || category;
      onSuccess({
        url: customUrl.trim(),
        fileName: customUrl.split("/").pop() || "media_resource",
        fileFormat: ext,
        fileSize: 0,
      });
      return;
    }

    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    if (isSelectedFileTooLargeForVercel) {
      setError(
        "Direct uploads on Vercel are limited to 4.5MB. Please switch to 'Enter Media URL' to link larger videos or files."
      );
      return;
    }

    setIsUploading(true);
    setProgress(15);
    setStatusMessage("Preparing asset...");

    try {
      let fileToUpload = selectedFile;

      // Automatically optimize image if it exceeds 3MB
      if (selectedFile.type.startsWith("image/") && selectedFile.size > 3 * 1024 * 1024) {
        setStatusMessage("Optimizing image for fast upload...");
        setProgress(30);
        fileToUpload = await compressImageIfNeeded(selectedFile);
      }

      if (fileToUpload.size > VERCEL_MAX_UPLOAD_BYTES) {
        throw new Error(
          `File size (${(fileToUpload.size / (1024 * 1024)).toFixed(1)}MB) exceeds Vercel's 4.5MB upload limit. Please use the 'Enter Media URL' tab.`
        );
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("category", category);

      setStatusMessage("Uploading to Zenith cloud storage...");

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + 15;
        });
      }, 150);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);
      setStatusMessage("Finalizing...");

      const responseText = await res.text();
      let data: any = null;

      try {
        data = JSON.parse(responseText);
      } catch {
        if (
          res.status === 413 ||
          responseText.toLowerCase().includes("request entity too large")
        ) {
          throw new Error(
            "File size exceeds Vercel's 4.5MB serverless upload limit. Please use the 'Enter Media URL' tab to link this asset."
          );
        }
        throw new Error(
          `Server returned error (${res.status}): ${responseText.slice(0, 100)}`
        );
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to upload file");
      }

      setTimeout(() => {
        onSuccess(data.file);
      }, 300);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload error");
      setIsUploading(false);
      setProgress(0);
      setStatusMessage("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select a {category === "videos" ? "video" : category === "images" ? "image" : "document"} file to upload to the Zenith server
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/5 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch between file upload or direct URL */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setUploadMode("file");
              setError("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium transition ${
              uploadMode === "file"
                ? "bg-white text-zinc-900 shadow"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Upload size={14} />
            <span>Upload File from Device</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setUploadMode("url");
              setError("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium transition ${
              uploadMode === "url"
                ? "bg-white text-zinc-900 shadow"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <LinkIcon size={14} />
            <span>Enter Media URL</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        <div className="mt-4">
          {uploadMode === "file" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept={defaultExtensions.join(",")}
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] p-8 text-center transition hover:border-white/30 hover:bg-white/[0.05] cursor-pointer"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-zinc-300 group-hover:scale-110 transition">
                    {category === "videos" ? (
                      <Film size={24} />
                    ) : category === "images" ? (
                      <ImageIcon size={24} />
                    ) : (
                      <FileText size={24} />
                    )}
                  </div>
                  <p className="mt-3 text-sm font-medium text-zinc-200">
                    Click to browse or drag and drop file here
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Supported: {defaultExtensions.join(", ")} &bull; Direct upload up to 4.5MB
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                        {category === "videos" ? (
                          <Film size={18} />
                        ) : category === "images" ? (
                          <ImageIcon size={18} />
                        ) : (
                          <FileText size={18} />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="truncate text-xs font-medium text-white">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          {selectedFile.type.startsWith("image/") &&
                            selectedFile.size > 3 * 1024 * 1024 && (
                              <span className="ml-1.5 text-emerald-400 inline-flex items-center gap-0.5">
                                <Sparkles size={11} /> Auto-compressed for web
                              </span>
                            )}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl("");
                        setError("");
                      }}
                      className="text-xs text-zinc-400 hover:text-white transition"
                    >
                      Change
                    </button>
                  </div>

                  {/* Warning banner for non-image files exceeding 4.5MB */}
                  {isSelectedFileTooLargeForVercel && (
                    <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                      <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-400" />
                      <div className="flex-1">
                        <p className="font-medium text-amber-300">
                          File exceeds direct upload limit ({((selectedFile?.size || 0) / (1024 * 1024)).toFixed(1)} MB)
                        </p>
                        <p className="mt-0.5 text-amber-200/80 text-[11px] leading-relaxed">
                          Vercel serverless functions limit direct file payloads to 4.5MB. For large videos or documents, please switch to <strong>Enter Media URL</strong> to link your YouTube, Google Drive, Firebase, or cloud asset.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadMode("url");
                            setError("");
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-medium text-amber-200 hover:bg-amber-500/30 transition"
                        >
                          <LinkIcon size={12} />
                          Switch to Enter Media URL
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Media Preview Box */}
                  <div className="relative mt-2 overflow-hidden rounded-xl bg-black/60 border border-white/5 max-h-56 flex items-center justify-center">
                    {category === "images" && previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-52 w-auto object-contain rounded-lg"
                      />
                    )}
                    {category === "videos" && previewUrl && (
                      <video
                        src={previewUrl}
                        controls
                        playsInline
                        className="max-h-52 w-full object-contain"
                      />
                    )}
                    {category === "documents" && (
                      <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                        <FileText size={38} className="text-blue-400 mb-2" />
                        <span className="text-xs font-mono">{selectedFile.name}</span>
                        <span className="text-[11px] text-zinc-500 mt-1">
                          Document ready for validation and upload
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Direct URL to media resource (HTTPS)
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder={
                  category === "videos"
                    ? "https://firebasestorage.googleapis.com/... or https://youtu.be/..."
                    : "https://images.unsplash.com/... or cloud URL"
                }
                className="glass-input w-full rounded-xl px-4 py-2.5 text-sm"
              />
              <p className="mt-1 text-[11px] text-zinc-500">
                Use for Google Drive, Firebase, Cloudinary, YouTube, or CDN-hosted assets of any size
              </p>
            </div>
          )}

          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                <span>{statusMessage || "Uploading & processing asset..."}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            disabled={isUploading}
            onClick={onCancel}
            className="glass-button-secondary rounded-xl px-4 py-2 text-xs font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              isUploading ||
              (uploadMode === "file" &&
                (!selectedFile || isSelectedFileTooLargeForVercel))
            }
            onClick={handleUpload}
            className="glass-button-primary rounded-xl px-5 py-2 text-xs font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>{uploadMode === "file" ? "Upload & Save Media" : "Use URL"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
