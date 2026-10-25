"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Film,
  Image as ImageIcon,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown,
  Search,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import FileUploadModal from "@/components/uploads/FileUploadModal";

interface Story {
  _id: string;
  title: string;
  studentName: string;
  type: "image" | "video";
  mediaUrl: string;
  thumbnailUrl?: string;
  description?: string;
  achievementDetails?: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function StoriesView() {
  const { success, error } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [search, setSearch] = useState("");

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Partial<Story> | null>(null);
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const [uploadTargetField, setUploadTargetField] = useState<"mediaUrl" | "thumbnailUrl">("mediaUrl");
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: "image" | "video" } | null>(null);

  // Delete confirm state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/stories", window.location.origin);
      if (filterType !== "all") url.searchParams.set("type", filterType);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setStories(data.stories);
      }
    } catch (e: unknown) {
      error(e instanceof Error ? e.message : "Failed to load stories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [filterType, search]);

  const handleOpenCreate = () => {
    setEditingStory({
      title: "",
      studentName: "",
      type: "video",
      mediaUrl: "",
      thumbnailUrl: "",
      description: "",
      achievementDetails: "",
      order: stories.length + 1,
      isPublished: true,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (story: Story) => {
    setEditingStory({ ...story });
    setIsEditModalOpen(true);
  };

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory?.mediaUrl) {
      error("Please upload or enter a media URL first");
      return;
    }

    try {
      const isNew = !editingStory._id;
      const url = isNew ? "/api/stories" : `/api/stories/${editingStory._id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStory),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save story");
      }

      success(isNew ? "Story created successfully" : "Story updated successfully");
      setIsEditModalOpen(false);
      setEditingStory(null);
      fetchStories();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to save story");
    }
  };

  const handleTogglePublish = async (story: Story) => {
    try {
      const res = await fetch(`/api/stories/${story._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !story.isPublished }),
      });
      const data = await res.json();
      if (data.success) {
        success(
          story.isPublished
            ? "Story unpublished (hidden from public view)"
            : "Story published to Zenith Academy live"
        );
        fetchStories();
      }
    } catch (e: unknown) {
      error("Failed to update status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/stories/${deleteTargetId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete");
      }

      success("Story deleted successfully");
      setDeleteTargetId(null);
      fetchStories();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to delete story");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (storyId: string, direction: "up" | "down") => {
    const currentIndex = stories.findIndex((s) => s._id === storyId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= stories.length) return;

    const reordered = [...stories];
    const temp = reordered[currentIndex];
    reordered[currentIndex] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Update orders
    const items = reordered.map((item, index) => ({
      id: item._id,
      order: index + 1,
    }));

    setStories(reordered);

    try {
      await fetch("/api/stories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      success("Stories reordered successfully");
    } catch {
      fetchStories();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Student Success Stories</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage image testimonials and short video clips displayed on the Zenith-Academy website
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="glass-button-primary rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Story</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border border-white/10">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterType("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              filterType === "all"
                ? "bg-white text-zinc-900 shadow"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            All Stories ({stories.length})
          </button>
          <button
            onClick={() => setFilterType("video")}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition ${
              filterType === "video"
                ? "bg-white text-zinc-900 shadow"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Film size={13} />
            <span>Videos</span>
          </button>
          <button
            onClick={() => setFilterType("image")}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition ${
              filterType === "image"
                ? "bg-white text-zinc-900 shadow"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ImageIcon size={13} />
            <span>Images</span>
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or exam..."
            className="glass-input w-full rounded-xl py-1.5 pl-9 pr-4 text-xs"
          />
        </div>
      </div>

      {/* Stories Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="mt-3 text-xs">Loading success stories...</p>
        </div>
      ) : stories.length === 0 ? (
        <div className="py-16 glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-6 border border-white/5">
          <Film size={36} className="text-zinc-600 mb-3" />
          <h3 className="text-sm font-medium text-zinc-300">No stories found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            Add a new student testimonial image or short video to display it on the Zenith website.
          </p>
          <button
            onClick={handleOpenCreate}
            className="glass-button-primary mt-4 rounded-xl px-4 py-2 text-xs font-medium flex items-center gap-2"
          >
            <Plus size={14} />
            <span>Create First Story</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story, index) => (
            <div
              key={story._id}
              className="glass-panel glass-panel-hover rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between"
            >
              {/* Media Preview Box */}
              <div className="relative h-48 bg-black/50 overflow-hidden group">
                {story.type === "video" ? (
                  <video
                    src={story.mediaUrl}
                    poster={story.thumbnailUrl}
                    className="h-full w-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={story.mediaUrl}
                    alt={story.title}
                    className="h-full w-full object-cover"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Badge for Type */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                  {story.type === "video" ? <Film size={12} /> : <ImageIcon size={12} />}
                  <span className="capitalize">{story.type}</span>
                </div>

                {/* Status Badge */}
                <button
                  onClick={() => handleTogglePublish(story)}
                  className={`absolute top-3 right-3 rounded-lg px-2 py-1 text-[11px] font-medium backdrop-blur-md transition ${
                    story.isPublished
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30"
                  }`}
                >
                  {story.isPublished ? "Published" : "Draft"}
                </button>

                {/* Center Quick Preview Button */}
                <button
                  onClick={() => setPreviewMedia({ url: story.mediaUrl, type: story.type })}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 bg-black/30"
                >
                  <div className="h-10 w-10 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow-lg">
                    {story.type === "video" ? <Play size={16} fill="currentColor" /> : <Eye size={16} />}
                  </div>
                </button>
              </div>

              {/* Story Content Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-sm text-white truncate">
                      {story.studentName || story.title || "Student Story"}
                    </h3>
                    <span className="font-mono text-[10px] text-zinc-500">#{story.order}</span>
                  </div>

                  {story.achievementDetails && (
                    <p className="mt-1 text-xs text-blue-400 font-medium">
                      {story.achievementDetails}
                    </p>
                  )}

                  {story.description && (
                    <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      &ldquo;{story.description}&rdquo;
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleReorder(story._id, "up")}
                      disabled={index === 0}
                      title="Move Up"
                      className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-30 transition"
                    >
                      &uarr;
                    </button>
                    <button
                      onClick={() => handleReorder(story._id, "down")}
                      disabled={index === stories.length - 1}
                      title="Move Down"
                      className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-30 transition"
                    >
                      &darr;
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(story)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition flex items-center gap-1 text-[11px]"
                    >
                      <Edit size={13} />
                      <span>Edit / Replace</span>
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(story._id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                      title="Delete Story"
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

      {/* Edit / Create Story Modal */}
      {isEditModalOpen && editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">
                {editingStory._id ? "Edit Student Success Story" : "Create Student Success Story"}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white transition"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveStory} className="mt-4 space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Story Media Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStory({ ...editingStory, type: "video" })}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium transition ${
                      editingStory.type === "video"
                        ? "bg-white text-zinc-900 shadow"
                        : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Film size={14} />
                    <span>Video Testimonial</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingStory({ ...editingStory, type: "image" })}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium transition ${
                      editingStory.type === "image"
                        ? "bg-white text-zinc-900 shadow"
                        : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <ImageIcon size={14} />
                    <span>Image Testimonial</span>
                  </button>
                </div>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Student Name</label>
                <input
                  type="text"
                  value={editingStory.studentName || ""}
                  onChange={(e) => setEditingStory({ ...editingStory, studentName: e.target.value })}
                  placeholder="e.g. Fathima Sana PT"
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-xs"
                />
              </div>

              {/* Story Title & Achievement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Headline / Title</label>
                  <input
                    type="text"
                    value={editingStory.title || ""}
                    onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                    placeholder="e.g. Rank 1 Holder PSC JHI"
                    className="glass-input w-full rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Achievement Details</label>
                  <input
                    type="text"
                    value={editingStory.achievementDetails || ""}
                    onChange={(e) => setEditingStory({ ...editingStory, achievementDetails: e.target.value })}
                    placeholder="e.g. Malappuram District Rank"
                    className="glass-input w-full rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Description / Quote */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Student Feedback / Description</label>
                <textarea
                  rows={3}
                  value={editingStory.description || ""}
                  onChange={(e) => setEditingStory({ ...editingStory, description: e.target.value })}
                  placeholder="Enter student experience quote or key highlights..."
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-xs"
                />
              </div>

              {/* Media URL / Upload Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-400">
                    {editingStory.type === "video" ? "Video File / URL" : "Image File / URL"}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadTargetField("mediaUrl");
                      setIsMediaUploadOpen(true);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    + Upload New File
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={editingStory.mediaUrl || ""}
                  onChange={(e) => setEditingStory({ ...editingStory, mediaUrl: e.target.value })}
                  placeholder={editingStory.type === "video" ? "/uploads/videos/... or https://..." : "/uploads/images/... or https://..."}
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-xs font-mono"
                />

                {editingStory.mediaUrl && (
                  <div className="mt-2 rounded-xl bg-black/40 p-2 border border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 truncate max-w-xs">{editingStory.mediaUrl}</span>
                    <button
                      type="button"
                      onClick={() => setPreviewMedia({ url: editingStory.mediaUrl!, type: editingStory.type || "image" })}
                      className="text-[11px] text-white hover:underline flex items-center gap-1 shrink-0 ml-2"
                    >
                      <Eye size={12} /> Preview
                    </button>
                  </div>
                )}
              </div>

              {/* Poster thumbnail for video */}
              {editingStory.type === "video" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-zinc-400">Optional Video Poster / Thumbnail</label>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadTargetField("thumbnailUrl");
                        setIsMediaUploadOpen(true);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      + Upload Thumbnail
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingStory.thumbnailUrl || ""}
                    onChange={(e) => setEditingStory({ ...editingStory, thumbnailUrl: e.target.value })}
                    placeholder="Optional image poster URL"
                    className="glass-input w-full rounded-xl px-4 py-2.5 text-xs font-mono"
                  />
                </div>
              )}

              {/* Status & Display Order */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={editingStory.order ?? 1}
                    onChange={(e) => setEditingStory({ ...editingStory, order: parseInt(e.target.value) || 1 })}
                    className="glass-input w-full rounded-xl px-4 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Publication Status</label>
                  <select
                    value={editingStory.isPublished ? "true" : "false"}
                    onChange={(e) => setEditingStory({ ...editingStory, isPublished: e.target.value === "true" })}
                    className="glass-input w-full rounded-xl px-4 py-2 text-xs bg-zinc-900"
                  >
                    <option value="true">Published (Live on Website)</option>
                    <option value="false">Draft (Saved privately)</option>
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
                  Save &amp; Apply Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {isMediaUploadOpen && (
        <FileUploadModal
          isOpen={isMediaUploadOpen}
          title={uploadTargetField === "thumbnailUrl" ? "Upload Video Poster Image" : editingStory?.type === "video" ? "Upload Success Story Video" : "Upload Success Story Image"}
          category={uploadTargetField === "thumbnailUrl" ? "images" : editingStory?.type === "video" ? "videos" : "images"}
          onSuccess={(meta) => {
            if (editingStory) {
              setEditingStory({
                ...editingStory,
                [uploadTargetField]: meta.url,
              });
            }
            setIsMediaUploadOpen(false);
            success(`Uploaded ${meta.fileName}`);
          }}
          onCancel={() => setIsMediaUploadOpen(false)}
        />
      )}

      {/* Media Quick Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute -top-10 right-0 text-white hover:text-zinc-300 p-1"
            >
              Close &times;
            </button>
            {previewMedia.type === "video" ? (
              <video
                src={previewMedia.url}
                controls
                autoPlay
                className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl"
              />
            ) : (
              <img
                src={previewMedia.url}
                alt="Story preview"
                className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
              />
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Success Story"
        description="Are you sure you want to permanently remove this student success story? This will immediately remove it from public display on the Zenith Academy website."
        confirmLabel="Yes, Delete Story"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
