"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  ArrowUpDown,
  Upload,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import FileUploadModal from "@/components/uploads/FileUploadModal";

interface Banner {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function HappeningNowView() {
  const { success, error } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Create state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Delete state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/happening-now");
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners);
      }
    } catch {
      error("Failed to load Happening Now banners");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenCreate = () => {
    setEditingBanner({
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "https://wa.me/919400266949",
      order: banners.length + 1,
      isActive: true,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner({ ...banner });
    setIsEditModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.imageUrl) {
      error("Banner image URL or uploaded file is required");
      return;
    }

    try {
      const isNew = !editingBanner._id;
      const url = isNew ? "/api/happening-now" : `/api/happening-now/${editingBanner._id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBanner),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save banner");
      }

      success(isNew ? "Banner added to Happening Now!" : "Banner updated successfully!");
      setIsEditModalOpen(false);
      setEditingBanner(null);
      fetchBanners();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to save banner");
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/happening-now/${banner._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        success(
          banner.isActive
            ? "Banner disabled from website display"
            : "Banner enabled on website display"
        );
        fetchBanners();
      }
    } catch {
      error("Failed to toggle status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/happening-now/${deleteTargetId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete");
      }

      success("Banner deleted successfully");
      setDeleteTargetId(null);
      fetchBanners();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (bannerId: string, direction: "up" | "down") => {
    const currentIndex = banners.findIndex((b) => b._id === bannerId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const reordered = [...banners];
    const temp = reordered[currentIndex];
    reordered[currentIndex] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const items = reordered.map((item, index) => ({
      id: item._id,
      order: index + 1,
    }));

    setBanners(reordered);

    try {
      await fetch("/api/happening-now", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      success("Banner order updated");
    } catch {
      fetchBanners();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Happening Now Banners</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage promotional banners and clickable destination links shown in the auto-scroll banner carousel
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="glass-button-primary rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Banner</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="mt-3 text-xs">Loading banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="py-16 glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-6 border border-white/5">
          <Megaphone size={36} className="text-zinc-600 mb-3" />
          <h3 className="text-sm font-medium text-zinc-300">No banners found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            Upload your first banner image and configure its link to appear in the Happening Now section.
          </p>
          <button
            onClick={handleOpenCreate}
            className="glass-button-primary mt-4 rounded-xl px-4 py-2 text-xs font-medium flex items-center gap-2"
          >
            <Plus size={14} />
            <span>Create First Banner</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className="glass-panel glass-panel-hover rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between"
            >
              {/* Image preview */}
              <div className="relative h-44 bg-black/60 overflow-hidden group">
                <img
                  src={banner.imageUrl}
                  alt={banner.title || "Banner"}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Status Badge */}
                <button
                  onClick={() => handleToggleActive(banner)}
                  className={`absolute top-3 right-3 rounded-lg px-2 py-1 text-[11px] font-medium backdrop-blur-md transition ${
                    banner.isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
                  }`}
                >
                  {banner.isActive ? "Active (Displayed)" : "Inactive (Hidden)"}
                </button>

                <div className="absolute bottom-3 left-3 text-[11px] text-white font-mono bg-black/60 px-2 py-0.5 rounded">
                  Order #{banner.order}
                </div>

                <button
                  onClick={() => setPreviewImageUrl(banner.imageUrl)}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 bg-black/40"
                >
                  <div className="h-9 w-9 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow">
                    <Eye size={15} />
                  </div>
                </button>
              </div>

              {/* Banner Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-white truncate">
                    {banner.title || "Happening Now Banner"}
                  </h3>
                  {banner.description && (
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                      {banner.description}
                    </p>
                  )}

                  {/* Destination Link */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/5 border border-blue-500/10 rounded-xl px-2.5 py-1.5 overflow-hidden">
                    <LinkIcon size={13} className="shrink-0" />
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:underline text-[11px]"
                    >
                      {banner.linkUrl || "No link attached"}
                    </a>
                    {banner.linkUrl && <ExternalLink size={11} className="shrink-0 ml-auto" />}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleReorder(banner._id, "up")}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-white/10 hover:text-white disabled:opacity-30"
                      title="Move earlier in carousel"
                    >
                      &uarr;
                    </button>
                    <button
                      onClick={() => handleReorder(banner._id, "down")}
                      disabled={index === banners.length - 1}
                      className="p-1 rounded hover:bg-white/10 hover:text-white disabled:opacity-30"
                      title="Move later in carousel"
                    >
                      &darr;
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(banner)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition flex items-center gap-1 text-[11px]"
                    >
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(banner._id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                      title="Delete Banner"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Banner Modal */}
      {isEditModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">
                {editingBanner._id ? "Edit Banner & Link" : "Add Happening Now Banner"}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Banner Title / Label
                </label>
                <input
                  type="text"
                  value={editingBanner.title || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  placeholder="e.g. New Batch Admissions Open"
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Banner Description (Optional)
                </label>
                <input
                  type="text"
                  value={editingBanner.description || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                  placeholder="e.g. Limited seats available for JHI 2026 coaching"
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-xs"
                />
              </div>

              {/* Banner Image URL / Upload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Banner Graphic Image <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    + Upload New Image
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={editingBanner.imageUrl || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                  placeholder="/uploads/images/... or https://domain.com/banner.jpg"
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-xs font-mono"
                />

                {editingBanner.imageUrl && (
                  <div className="mt-2 relative h-32 rounded-xl overflow-hidden bg-black/40 border border-white/5">
                    <img
                      src={editingBanner.imageUrl}
                      alt="Banner Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Clickable Destination Link */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Click Destination URL (WhatsApp, registration, or external link)
                </label>
                <input
                  type="url"
                  value={editingBanner.linkUrl || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, linkUrl: e.target.value })}
                  placeholder="https://wa.me/919400266949 or https://..."
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-xs font-mono"
                />
                <p className="mt-1 text-[11px] text-zinc-500">
                  When a user clicks on this banner on the website, it will navigate to this link in a safe new tab.
                </p>
              </div>

              {/* Order and Active state */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Carousel Order</label>
                  <input
                    type="number"
                    value={editingBanner.order ?? 1}
                    onChange={(e) => setEditingBanner({ ...editingBanner, order: parseInt(e.target.value) || 1 })}
                    className="glass-input w-full rounded-xl px-4 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Display Status</label>
                  <select
                    value={editingBanner.isActive ? "true" : "false"}
                    onChange={(e) => setEditingBanner({ ...editingBanner, isActive: e.target.value === "true" })}
                    className="glass-input w-full rounded-xl px-4 py-2 text-xs bg-zinc-900"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="glass-button-secondary rounded-xl px-4 py-2 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-button-primary rounded-xl px-5 py-2 text-xs font-medium"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Image Modal */}
      {isUploadModalOpen && (
        <FileUploadModal
          isOpen={isUploadModalOpen}
          title="Upload Happening Now Banner Image"
          category="images"
          maxSizeMB={15}
          onSuccess={(meta) => {
            if (editingBanner) {
              setEditingBanner({ ...editingBanner, imageUrl: meta.url });
            }
            setIsUploadModalOpen(false);
            success(`Uploaded ${meta.fileName}`);
          }}
          onCancel={() => setIsUploadModalOpen(false)}
        />
      )}

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-zinc-300"
            >
              Close &times;
            </button>
            <img
              src={previewImageUrl}
              alt="Banner preview"
              className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Happening Now Banner"
        description="Are you sure you want to remove this banner from the Happening Now carousel? It will no longer appear on the website."
        confirmLabel="Yes, Delete Banner"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
