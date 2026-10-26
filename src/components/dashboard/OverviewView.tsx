"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Film,
  Megaphone,
  BookOpen,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface OverviewStats {
  stories: {
    total: number;
    images: number;
    videos: number;
    published: number;
    drafts: number;
  };
  homepageVideo: {
    title: string;
    version: number;
    isPublished: boolean;
    updatedAt: string;
    videoUrl: string;
  };
  banners: {
    total: number;
    active: number;
  };
  studyMaterial: {
    title: string;
    fileName: string;
    version: number;
    fileSize: number;
    updatedAt: string;
    isPublished: boolean;
  };
  database: {
    connected: boolean;
    provider: string;
    databaseName: string;
  };
}

interface OverviewViewProps {
  onNavigate: (tab: string) => void;
}

export default function OverviewView({ onNavigate }: OverviewViewProps) {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/overview");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error("Failed to load overview stats:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 border border-white/10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Zenith Live Hub</span>
            </div>
            <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-white">
              Zenith-Academy Content Control Hub
            </h2>
            <p className="mt-1 text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Manage your live homepage background video, student success story videos &amp; images, Happening Now promo banners, and structured rank file downloads in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="glass-button-secondary rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2 text-zinc-300"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              <span>Refresh Stats</span>
            </button>

            <a
              href="https://zenithacademy.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button-primary rounded-xl px-5 py-2.5 text-xs font-medium flex items-center gap-2"
            >
              <span>View Main Website</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stories Card */}
        <div
          onClick={() => onNavigate("stories")}
          className="glass-panel glass-panel-hover rounded-2xl p-6 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Success Stories</span>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {stats?.stories.total ?? "—"}
            </span>
            <span className="text-xs text-zinc-400">stories total</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
            <span className="text-emerald-400 font-medium">{stats?.stories.videos ?? 0} videos</span>
            <span>&bull;</span>
            <span>{stats?.stories.images ?? 0} images</span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 group-hover:text-white transition">
            <span>Manage stories</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

        {/* Homepage Video Card */}
        <div
          onClick={() => onNavigate("video")}
          className="glass-panel glass-panel-hover rounded-2xl p-6 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Homepage Video</span>
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Film size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              v{stats?.homepageVideo.version ?? 1}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              {stats?.homepageVideo.isPublished ? "Live & Published" : "Draft"}
            </span>
          </div>
          <div className="mt-3 text-xs text-zinc-400 truncate">
            {stats?.homepageVideo.title || "Header Video Active"}
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 group-hover:text-white transition">
            <span>Replace / configure video</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

        {/* Happening Now Card */}
        <div
          onClick={() => onNavigate("banners")}
          className="glass-panel glass-panel-hover rounded-2xl p-6 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Happening Now</span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Megaphone size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {stats?.banners.active ?? "—"}
            </span>
            <span className="text-xs text-zinc-400">active banners</span>
          </div>
          <div className="mt-3 text-xs text-zinc-400">
            Auto-scrolling carousel on landing page
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 group-hover:text-white transition">
            <span>Manage banners &amp; links</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

        {/* Study Materials Card */}
        <div
          onClick={() => onNavigate("study")}
          className="glass-panel glass-panel-hover rounded-2xl p-6 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Rank File / Materials</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              v{stats?.studyMaterial.version ?? 1}
            </span>
            <span className="text-xs text-zinc-400">
              {stats?.studyMaterial.fileSize
                ? `${(stats.studyMaterial.fileSize / (1024 * 1024)).toFixed(1)} MB`
                : "PDF configured"}
            </span>
          </div>
          <div className="mt-3 text-xs text-zinc-400 truncate">
            {stats?.studyMaterial.fileName || "rank_file.pdf"}
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 group-hover:text-white transition">
            <span>Replace Rank File</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>
      </div>

      {/* Quick Management Actions */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Quick Management Actions</h3>
          <span className="text-[11px] text-zinc-500">Zenith Academy Content Engine</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate("stories")}
            className="w-full text-left rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] p-4 text-xs text-zinc-200 transition flex items-center justify-between group"
          >
            <span>Upload New Story</span>
            <ArrowUpRight size={14} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </button>

          <button
            onClick={() => onNavigate("video")}
            className="w-full text-left rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] p-4 text-xs text-zinc-200 transition flex items-center justify-between group"
          >
            <span>Change Header Video</span>
            <ArrowUpRight size={14} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </button>

          <button
            onClick={() => onNavigate("banners")}
            className="w-full text-left rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] p-4 text-xs text-zinc-200 transition flex items-center justify-between group"
          >
            <span>Add Happening Banner</span>
            <ArrowUpRight size={14} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </button>

          <button
            onClick={() => onNavigate("study")}
            className="w-full text-left rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] p-4 text-xs text-zinc-200 transition flex items-center justify-between group"
          >
            <span>Replace Rank File PDF</span>
            <ArrowUpRight size={14} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </button>
        </div>
      </div>
    </div>
  );
}
