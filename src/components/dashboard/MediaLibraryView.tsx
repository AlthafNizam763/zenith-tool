"use client";

import React, { useState } from "react";
import {
  Folder,
  Film,
  Image as ImageIcon,
  FileText,
  Copy,
  ExternalLink,
  Upload,
  Check,
  Search,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import FileUploadModal from "@/components/uploads/FileUploadModal";

export default function MediaLibraryView() {
  const { success } = useToast();
  const [filterCategory, setFilterCategory] = useState<"all" | "images" | "videos" | "documents">("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Common assets curated from initial Zenith setup
  const [mediaAssets, setMediaAssets] = useState([
    {
      name: "web_header_bg_bigscreen.mp4",
      url: "https://firebasestorage.googleapis.com/v0/b/zenithacademylive.firebasestorage.app/o/web_header_video%2Fweb%20bg%20(bigscreen).mp4?alt=media&token=6a0192ac-1719-43fd-8201-cf6264e45458",
      type: "videos" as const,
      size: "88.1 MB",
    },
    {
      name: "web_header_bg_medium.mp4",
      url: "https://firebasestorage.googleapis.com/v0/b/zenithacademylive.firebasestorage.app/o/web_header_video%2Fweb%20bg%20(medium).mp4?alt=media&token=2e5cbf32-a34f-4445-946c-d8a2262ff3b2",
      type: "videos" as const,
      size: "86.0 MB",
    },
    {
      name: "Zenith_Academy_Rankfile_Official.pdf",
      url: "https://cdn.builder.io/api/v1/image/assets/TEMP/0f20e046bbc93b7e07c213660b86d641a802c743b79a74f470d9c6aedcf26551?apiKey=a9ef1b359bc94027b911d1891520fd40&",
      type: "documents" as const,
      size: "14.1 MB",
    },
    {
      name: "banner_batch_admission.jpg",
      url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
      type: "images" as const,
      size: "1.2 MB",
    },
    {
      name: "banner_mock_tests.jpg",
      url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
      type: "images" as const,
      size: "950 KB",
    },
  ]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    success("Media URL copied to clipboard!");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredAssets = mediaAssets.filter(
    (a) => filterCategory === "all" || a.type === filterCategory
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Media &amp; File Asset Library</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Browse, upload, and reference media files across videos, images, and documents
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="glass-button-primary rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2 self-start sm:self-auto"
        >
          <Upload size={16} />
          <span>Upload File to Server</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel rounded-2xl p-3 flex items-center gap-2 border border-white/10 overflow-x-auto">
        <button
          onClick={() => setFilterCategory("all")}
          className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
            filterCategory === "all"
              ? "bg-white text-zinc-900 shadow"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          All Assets ({mediaAssets.length})
        </button>
        <button
          onClick={() => setFilterCategory("videos")}
          className={`rounded-xl px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition ${
            filterCategory === "videos"
              ? "bg-white text-zinc-900 shadow"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Film size={13} />
          <span>Videos</span>
        </button>
        <button
          onClick={() => setFilterCategory("images")}
          className={`rounded-xl px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition ${
            filterCategory === "images"
              ? "bg-white text-zinc-900 shadow"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <ImageIcon size={13} />
          <span>Images</span>
        </button>
        <button
          onClick={() => setFilterCategory("documents")}
          className={`rounded-xl px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition ${
            filterCategory === "documents"
              ? "bg-white text-zinc-900 shadow"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileText size={13} />
          <span>Documents</span>
        </button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset, i) => (
          <div
            key={i}
            className="glass-panel glass-panel-hover rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between"
          >
            <div className="relative h-40 bg-black/60 flex items-center justify-center overflow-hidden">
              {asset.type === "images" && (
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="h-full w-full object-cover"
                />
              )}
              {asset.type === "videos" && (
                <video
                  src={asset.url}
                  className="h-full w-full object-cover"
                  muted
                />
              )}
              {asset.type === "documents" && (
                <div className="flex flex-col items-center justify-center text-zinc-400">
                  <FileText size={42} className="text-blue-400 mb-1" />
                  <span className="text-[11px] font-mono uppercase">Document Asset</span>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                {asset.type === "videos" ? (
                  <Film size={11} />
                ) : asset.type === "images" ? (
                  <ImageIcon size={11} />
                ) : (
                  <FileText size={11} />
                )}
                <span className="capitalize">{asset.type}</span>
              </div>
            </div>

            <div className="p-4">
              <p className="font-medium text-xs text-white truncate" title={asset.name}>
                {asset.name}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{asset.size}</p>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleCopy(asset.url)}
                  className="glass-button-secondary rounded-lg px-2.5 py-1 text-[11px] font-medium flex items-center gap-1.5"
                >
                  {copiedUrl === asset.url ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-zinc-400 hover:text-white"
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isUploadModalOpen && (
        <FileUploadModal
          isOpen={isUploadModalOpen}
          title="Upload Media Asset to Library"
          category={filterCategory === "all" ? "images" : filterCategory}
          onSuccess={(meta) => {
            setMediaAssets((prev) => [
              {
                name: meta.fileName,
                url: meta.url,
                type: (filterCategory === "all" ? "images" : filterCategory) as "images" | "videos" | "documents",
                size: `${(meta.fileSize / (1024 * 1024)).toFixed(1)} MB`,
              },
              ...prev,
            ]);
            setIsUploadModalOpen(false);
            success(`Uploaded ${meta.fileName} to library`);
          }}
          onCancel={() => setIsUploadModalOpen(false)}
        />
      )}
    </div>
  );
}
