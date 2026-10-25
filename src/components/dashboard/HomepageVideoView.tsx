"use client";

import React, { useState, useEffect } from "react";
import {
  Film,
  Upload,
  Play,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  Eye,
  Info,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import FileUploadModal from "@/components/uploads/FileUploadModal";

interface VideoHistoryItem {
  videoUrl: string;
  videoUrlMedium?: string;
  videoUrlSmall?: string;
  posterUrl?: string;
  title?: string;
  description?: string;
  version: number;
  replacedAt: string;
}

interface VideoConfig {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  videoUrlMedium?: string;
  videoUrlSmall?: string;
  posterUrl?: string;
  isPublished: boolean;
  version: number;
  history: VideoHistoryItem[];
  updatedAt: string;
}

export default function HomepageVideoView() {
  const { success, error } = useToast();
  const [videoConfig, setVideoConfig] = useState<VideoConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Replacement Form State
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newMediumVideoUrl, setNewMediumVideoUrl] = useState("");
  const [newSmallVideoUrl, setNewSmallVideoUrl] = useState("");
  const [newPosterUrl, setNewPosterUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Modals
  const [uploadModalCategory, setUploadModalCategory] = useState<"video" | "poster" | null>(null);
  const [rollbackTargetVersion, setRollbackTargetVersion] = useState<number | null>(null);
  const [isRollbacking, setIsRollbacking] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const fetchVideo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/homepage-video");
      const data = await res.json();
      if (data.success && data.video) {
        setVideoConfig(data.video);
        setNewVideoUrl(data.video.videoUrl || "");
        setNewMediumVideoUrl(data.video.videoUrlMedium || "");
        setNewSmallVideoUrl(data.video.videoUrlSmall || "");
        setNewPosterUrl(data.video.posterUrl || "");
        setNewTitle(data.video.title || "Homepage Header Video");
        setNewDescription(data.video.description || "");
      }
    } catch (e: unknown) {
      error(e instanceof Error ? e.message : "Error fetching homepage video");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideo();
  }, []);

  const handlePublishReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) {
      error("A primary video URL or uploaded file is required");
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch("/api/homepage-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: newVideoUrl.trim(),
          videoUrlMedium: newMediumVideoUrl.trim() || newVideoUrl.trim(),
          videoUrlSmall: newSmallVideoUrl.trim() || newVideoUrl.trim(),
          posterUrl: newPosterUrl.trim(),
          title: newTitle.trim(),
          description: newDescription.trim(),
          isPublished: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to publish replacement video");
      }

      success(data.message || "Homepage video updated & published live!");
      setVideoConfig(data.video);
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to publish replacement video");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRollbackConfirm = async () => {
    if (!rollbackTargetVersion) return;
    setIsRollbacking(true);

    try {
      const res = await fetch("/api/homepage-video/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetVersion: rollbackTargetVersion }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Rollback failed");
      }

      success(data.message || "Restored previous video version!");
      setVideoConfig(data.video);
      setRollbackTargetVersion(null);
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Rollback failed");
    } finally {
      setIsRollbacking(false);
    }
  };

  const handleTogglePublishState = async () => {
    if (!videoConfig) return;
    try {
      const res = await fetch("/api/homepage-video", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !videoConfig.isPublished }),
      });
      const data = await res.json();
      if (data.success) {
        success(
          videoConfig.isPublished
            ? "Homepage video unpublished (disabled from website)"
            : "Homepage video published live"
        );
        fetchVideo();
      }
    } catch {
      error("Failed to toggle publish status");
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p className="mt-3 text-xs">Loading homepage video settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Homepage Hero Video Management</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Replace, preview, and manage the background video playing on the Zenith Academy landing page hero section
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePublishState}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition ${
              videoConfig?.isPublished
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
            }`}
          >
            {videoConfig?.isPublished ? "Live on Website" : "Unpublished / Draft"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Current Live Video Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Currently Live on Homepage
              </span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px] text-white">
                Version {videoConfig?.version || 1}
              </span>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/5 group">
              {videoConfig?.videoUrl ? (
                <video
                  src={videoConfig.videoUrl}
                  poster={videoConfig.posterUrl}
                  controls
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-500 text-xs">
                  No video configured
                </div>
              )}
            </div>

            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Title:</span>
                <span className="text-white font-medium">{videoConfig?.title || "Header Video"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Updated:</span>
                <span className="text-zinc-300">
                  {videoConfig?.updatedAt ? new Date(videoConfig.updatedAt).toLocaleString() : "Recently"}
                </span>
              </div>
              <div className="py-1">
                <span className="text-zinc-400 block mb-0.5">Primary URL:</span>
                <span className="font-mono text-[10px] text-zinc-500 break-all select-all">
                  {videoConfig?.videoUrl}
                </span>
              </div>
            </div>
          </div>

          {/* Version History & Rollback Card */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-zinc-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Version History &amp; Rollback
              </h3>
            </div>

            {videoConfig?.history && videoConfig.history.length > 0 ? (
              <div className="space-y-2 mt-3">
                {videoConfig.history.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/5 p-2.5 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">Version {h.version}</span>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(h.replacedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate max-w-[200px]">
                        {h.title || "Archived Video"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewVideoUrl(h.videoUrl)}
                        className="p-1 rounded text-zinc-400 hover:text-white transition"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => setRollbackTargetVersion(h.version)}
                        className="rounded-lg bg-white/5 hover:bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white transition flex items-center gap-1"
                      >
                        <RotateCcw size={12} />
                        <span>Restore</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 mt-2">
                No past revisions yet. When you publish a replacement video, previous versions will be archived here for instant rollback.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Upload Replacement Form */}
        <div className="lg:col-span-7">
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 pb-4 border-b border-white/10">
              <Upload size={18} className="text-purple-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Publish Replacement Video</h3>
                <p className="text-xs text-zinc-400">
                  Upload a new video file or provide a URL to automatically replace the homepage video
                </p>
              </div>
            </div>

            <form onSubmit={handlePublishReplacement} className="mt-5 space-y-4">
              {/* Main Desktop Video */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Main Video (Desktop / Default) <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setUploadModalCategory("video")}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                  >
                    <Upload size={12} /> Upload Video File
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="/uploads/videos/... or https://domain.com/video.mp4"
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-xs font-mono"
                />
              </div>

              {/* Optional Tablet and Mobile Video Variants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Tablet Variant (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMediumVideoUrl}
                    onChange={(e) => setNewMediumVideoUrl(e.target.value)}
                    placeholder="Defaults to main video"
                    className="glass-input w-full rounded-xl px-4 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Mobile Variant (Optional)
                  </label>
                  <input
                    type="text"
                    value={newSmallVideoUrl}
                    onChange={(e) => setNewSmallVideoUrl(e.target.value)}
                    placeholder="Defaults to main video"
                    className="glass-input w-full rounded-xl px-4 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Poster Image */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-400">
                    Video Poster / Thumbnail Image
                  </label>
                  <button
                    type="button"
                    onClick={() => setUploadModalCategory("poster")}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                  >
                    + Upload Poster Image
                  </button>
                </div>
                <input
                  type="text"
                  value={newPosterUrl}
                  onChange={(e) => setNewPosterUrl(e.target.value)}
                  placeholder="https://... or /uploads/images/poster.jpg"
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-xs font-mono"
                />
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 2026 Batch Hero Video"
                    className="glass-input w-full rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Video Description
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Optional admin description"
                    className="glass-input w-full rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Live Preview of Pending Replacement */}
              {newVideoUrl && (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3">
                  <p className="text-xs font-medium text-zinc-300 mb-2 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>Replacement Preview (Ready to Publish)</span>
                  </p>
                  <video
                    src={newVideoUrl}
                    poster={newPosterUrl}
                    controls
                    playsInline
                    className="max-h-48 w-full rounded-lg object-contain bg-black"
                  />
                </div>
              )}

              <div className="pt-4 flex items-center justify-between border-t border-white/10">
                <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <Info size={13} />
                  <span>Publishing replaces the video on the live site automatically</span>
                </div>

                <button
                  type="submit"
                  disabled={isPublishing}
                  className="glass-button-primary rounded-xl px-6 py-2.5 text-xs font-medium flex items-center gap-2"
                >
                  {isPublishing ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} />
                      <span>Publish Replacement Video</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Upload File Modal */}
      {uploadModalCategory && (
        <FileUploadModal
          isOpen={Boolean(uploadModalCategory)}
          title={uploadModalCategory === "video" ? "Upload Homepage Replacement Video" : "Upload Video Poster Image"}
          category={uploadModalCategory === "video" ? "videos" : "images"}
          maxSizeMB={uploadModalCategory === "video" ? 120 : 15}
          onSuccess={(meta) => {
            if (uploadModalCategory === "video") {
              setNewVideoUrl(meta.url);
              if (!newMediumVideoUrl) setNewMediumVideoUrl(meta.url);
              if (!newSmallVideoUrl) setNewSmallVideoUrl(meta.url);
            } else {
              setNewPosterUrl(meta.url);
            }
            setUploadModalCategory(null);
            success(`Uploaded ${meta.fileName}`);
          }}
          onCancel={() => setUploadModalCategory(null)}
        />
      )}

      {/* Historical Video Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-3xl w-full flex flex-col items-center">
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-zinc-300"
            >
              Close &times;
            </button>
            <video
              src={previewVideoUrl}
              controls
              autoPlay
              className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Rollback Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(rollbackTargetVersion)}
        title="Restore Previous Video Version"
        description={`Are you sure you want to restore the video from version ${rollbackTargetVersion}? This will immediately update the live homepage hero background video.`}
        confirmLabel="Yes, Restore Version"
        variant="warning"
        isLoading={isRollbacking}
        onConfirm={handleRollbackConfirm}
        onCancel={() => setRollbackTargetVersion(null)}
      />
    </div>
  );
}
