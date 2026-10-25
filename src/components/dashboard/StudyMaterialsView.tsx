"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  Upload,
  Download,
  RotateCcw,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Info,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import FileUploadModal from "@/components/uploads/FileUploadModal";

interface HistoryEntry {
  fileUrl: string;
  fileName: string;
  fileFormat: string;
  fileSize: number;
  coverImageUrl?: string;
  version: number;
  replacedAt: string;
  note?: string;
}

interface MaterialData {
  _id: string;
  logicalId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileFormat: string;
  fileSize: number;
  coverImageUrl?: string;
  version: number;
  history: HistoryEntry[];
  isPublished: boolean;
  updatedAt: string;
}

export default function StudyMaterialsView() {
  const { success, error } = useToast();
  const [material, setMaterial] = useState<MaterialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Replacement Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFileUrl, setNewFileUrl] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileFormat, setNewFileFormat] = useState("pdf");
  const [newFileSize, setNewFileSize] = useState(0);
  const [newCoverImageUrl, setNewCoverImageUrl] = useState("");
  const [replacementNote, setReplacementNote] = useState("");

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCoverUploadOpen, setIsCoverUploadOpen] = useState(false);
  const [isConfirmReplaceOpen, setIsConfirmReplaceOpen] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [rollbackVersion, setRollbackVersion] = useState<number | null>(null);
  const [isRollbacking, setIsRollbacking] = useState(false);

  const fetchMaterial = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/study-materials?logicalId=rank_file");
      const data = await res.json();
      if (data.success && data.material) {
        setMaterial(data.material);
        setNewTitle(data.material.title || "Zenith Academy Rank File 2026");
        setNewDescription(data.material.description || "");
        setNewFileUrl(data.material.fileUrl || "");
        setNewFileName(data.material.fileName || "rank_file.pdf");
        setNewFileFormat(data.material.fileFormat || "pdf");
        setNewFileSize(data.material.fileSize || 0);
        setNewCoverImageUrl(data.material.coverImageUrl || "");
      }
    } catch {
      error("Failed to load study materials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterial();
  }, []);

  const handleTriggerReplace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileUrl) {
      error("A valid file URL or uploaded document is required");
      return;
    }
    setIsConfirmReplaceOpen(true);
  };

  const handleExecuteReplace = async () => {
    setIsReplacing(true);
    try {
      const res = await fetch("/api/study-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logicalId: "rank_file",
          title: newTitle.trim(),
          description: newDescription.trim(),
          fileUrl: newFileUrl.trim(),
          fileName: newFileName.trim() || "rank_file.pdf",
          fileFormat: newFileFormat.trim() || "pdf",
          fileSize: newFileSize,
          coverImageUrl: newCoverImageUrl.trim(),
          note: replacementNote.trim() || "Rank file replaced via Zenith-Tool",
          isPublished: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to replace study material");
      }

      success(data.message || "Rank file replaced and published successfully!");
      setMaterial(data.material);
      setIsConfirmReplaceOpen(false);
      setReplacementNote("");
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Replacement failed");
    } finally {
      setIsReplacing(false);
    }
  };

  const handleRollbackConfirm = async () => {
    if (!rollbackVersion) return;
    setIsRollbacking(true);

    try {
      const res = await fetch("/api/study-materials/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logicalId: "rank_file",
          targetVersion: rollbackVersion,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to restore version");
      }

      success(data.message || `Restored version ${rollbackVersion} successfully`);
      setMaterial(data.material);
      setRollbackVersion(null);
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Rollback failed");
    } finally {
      setIsRollbacking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p className="mt-3 text-xs">Loading study material configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Structured Study Materials Management</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Safely replace the Rank File and coursebook materials without manual code modification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-emerald-400">
            Logical ID: rank_file &bull; v{material?.version || 1}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Currently Configured File & History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active File Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-4">
              Current Live Rank File
            </span>

            <div className="flex items-start gap-4">
              {/* Cover or Format Icon */}
              <div className="h-28 w-24 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center">
                {material?.coverImageUrl ? (
                  <img
                    src={material.coverImageUrl}
                    alt="Book Cover"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileText size={36} className="text-blue-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-white truncate">
                  {material?.title || "Zenith Academy Rank File"}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-1 truncate">
                  {material?.fileName}
                </p>

                <div className="mt-2.5 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded bg-white/10 px-2 py-0.5 font-medium text-zinc-300 uppercase">
                    {material?.fileFormat || "PDF"}
                  </span>
                  <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-zinc-400">
                    {material?.fileSize
                      ? `${(material.fileSize / (1024 * 1024)).toFixed(2)} MB`
                      : "External"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                Updated: {material?.updatedAt ? new Date(material.updatedAt).toLocaleDateString() : "Live"}
              </span>

              <a
                href={material?.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button-secondary rounded-lg px-3 py-1.5 font-medium flex items-center gap-1.5 text-zinc-200"
              >
                <Download size={13} />
                <span>Download / View</span>
              </a>
            </div>
          </div>

          {/* Version History & Rollback */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-zinc-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                File Replacement History &amp; Rollback
              </h3>
            </div>

            {material?.history && material.history.length > 0 ? (
              <div className="space-y-2.5 mt-4">
                {material.history.map((h, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">Version {h.version}</span>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(h.replacedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate max-w-[210px]">
                        {h.fileName}
                      </p>
                      {h.note && (
                        <p className="text-[10px] text-zinc-500 mt-0.5 italic">{h.note}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={h.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded text-zinc-400 hover:text-white"
                        title="Download / Preview file"
                      >
                        <Eye size={14} />
                      </a>
                      <button
                        onClick={() => setRollbackVersion(h.version)}
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
                No previous file revisions recorded yet. When you replace the rank file, the previous version will be preserved here for safe rollback.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: File Replacement Form */}
        <div className="lg:col-span-7">
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 pb-4 border-b border-white/10">
              <Upload size={18} className="text-blue-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Replace Rank File &amp; Update Content</h3>
                <p className="text-xs text-zinc-400">
                  Upload a replacement document or rank file. Changes reflect instantly on the Structured Study Materials section.
                </p>
              </div>
            </div>

            <form onSubmit={handleTriggerReplace} className="mt-5 space-y-4">
              {/* File Upload Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Replacement File (PDF / Document) <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <Upload size={12} /> Upload From Computer
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  placeholder="/uploads/documents/... or https://..."
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-xs font-mono"
                />
              </div>

              {/* File Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g. Zenith_Academy_Rank_File_2026.pdf"
                    className="glass-input w-full rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    File Format
                  </label>
                  <input
                    type="text"
                    value={newFileFormat}
                    onChange={(e) => setNewFileFormat(e.target.value)}
                    placeholder="pdf"
                    className="glass-input w-full rounded-xl px-4 py-2.5 text-xs uppercase"
                  />
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Study Material Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Zenith Academy Rank File 2026"
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Display Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Prepared by experienced faculty and aligned with the latest PSC and JHI syllabus..."
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-xs"
                />
              </div>

              {/* Cover Graphic Image */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-400">
                    Book Cover Graphic Image URL (Shown on the left of Structured Study Materials)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCoverUploadOpen(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    + Upload Cover
                  </button>
                </div>
                <input
                  type="text"
                  value={newCoverImageUrl}
                  onChange={(e) => setNewCoverImageUrl(e.target.value)}
                  placeholder="https://... or /uploads/images/book_cover.png"
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-xs font-mono"
                />
              </div>

              {/* Change Note */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Audit / Version Change Note (Optional)
                </label>
                <input
                  type="text"
                  value={replacementNote}
                  onChange={(e) => setReplacementNote(e.target.value)}
                  placeholder="e.g. Updated with 2026 latest question patterns"
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-xs"
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-white/10">
                <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <Info size={13} />
                  <span>Confirmation dialog will appear before saving</span>
                </div>

                <button
                  type="submit"
                  disabled={isReplacing}
                  className="glass-button-primary rounded-xl px-6 py-2.5 text-xs font-medium flex items-center gap-2"
                >
                  <CheckCircle size={15} />
                  <span>Replace &amp; Publish File</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      {isUploadModalOpen && (
        <FileUploadModal
          isOpen={isUploadModalOpen}
          title="Upload Replacement Rank File"
          category="documents"
          maxSizeMB={40}
          onSuccess={(meta) => {
            setNewFileUrl(meta.url);
            setNewFileName(meta.fileName);
            setNewFileFormat(meta.fileFormat);
            setNewFileSize(meta.fileSize);
            setIsUploadModalOpen(false);
            success(`Uploaded ${meta.fileName}`);
          }}
          onCancel={() => setIsUploadModalOpen(false)}
        />
      )}

      {/* Cover Image Upload Modal */}
      {isCoverUploadOpen && (
        <FileUploadModal
          isOpen={isCoverUploadOpen}
          title="Upload Rank File Book Cover Image"
          category="images"
          maxSizeMB={15}
          onSuccess={(meta) => {
            setNewCoverImageUrl(meta.url);
            setIsCoverUploadOpen(false);
            success(`Uploaded cover image`);
          }}
          onCancel={() => setIsCoverUploadOpen(false)}
        />
      )}

      {/* Confirmation Dialog before Replacing */}
      <ConfirmDialog
        isOpen={isConfirmReplaceOpen}
        title="Confirm Rank File Replacement"
        description={`You are about to replace the live Rank File with "${newFileName}". The current file will be safely archived to version ${material?.version || 1} in the rollback history. Do you want to proceed?`}
        confirmLabel="Yes, Replace & Publish"
        variant="warning"
        isLoading={isReplacing}
        onConfirm={handleExecuteReplace}
        onCancel={() => setIsConfirmReplaceOpen(false)}
      />

      {/* Rollback Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(rollbackVersion)}
        title="Restore Previous Rank File"
        description={`Are you sure you want to rollback to file version ${rollbackVersion}? This will immediately restore the previous file for website visitors.`}
        confirmLabel="Yes, Restore Version"
        variant="warning"
        isLoading={isRollbacking}
        onConfirm={handleRollbackConfirm}
        onCancel={() => setRollbackVersion(null)}
      />
    </div>
  );
}
