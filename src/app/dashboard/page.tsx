"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Film,
  Megaphone,
  BookOpen,
  FolderOpen,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import OverviewView from "@/components/dashboard/OverviewView";
import StoriesView from "@/components/dashboard/StoriesView";
import HomepageVideoView from "@/components/dashboard/HomepageVideoView";
import HappeningNowView from "@/components/dashboard/HappeningNowView";
import StudyMaterialsView from "@/components/dashboard/StudyMaterialsView";
import MediaLibraryView from "@/components/dashboard/MediaLibraryView";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "stories" | "video" | "banners" | "study" | "media"
  >("overview");

  const navItems = [
    {
      id: "overview" as const,
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "video" as const,
      label: "Homepage Video",
      icon: Film,
      badge: "Live",
    },
    {
      id: "stories" as const,
      label: "Success Stories",
      icon: Users,
      badge: "Video & Img",
    },
    {
      id: "banners" as const,
      label: "Happening Now",
      icon: Megaphone,
      badge: "Links",
    },
    {
      id: "study" as const,
      label: "Study Materials",
      icon: BookOpen,
      badge: "Rank File",
    },
    {
      id: "media" as const,
      label: "Media Library",
      icon: FolderOpen,
    },
  ];

  return (
    <div className="flex flex-1 w-full min-h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar Navigation */}
      <aside className="w-64 shrink-0 border-r border-white/10 bg-[#09090b]/40 backdrop-blur-md hidden lg:flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Content Navigation
            </p>
            <nav className="mt-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                      isActive
                        ? "bg-white text-zinc-900 shadow-md font-semibold"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                          isActive
                            ? "bg-zinc-200 text-zinc-900"
                            : "bg-white/5 text-zinc-400"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

        </div>

        <div className="pt-4 border-t border-white/5 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Zenith-Tool 2026</span>
          <span className="font-mono text-[10px]">Next.js 16</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Mobile Navigation Pills */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-4 mb-4 border-b border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-white text-zinc-900 shadow"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Switcher */}
        {activeTab === "overview" && <OverviewView onNavigate={(t) => setActiveTab(t as any)} />}
        {activeTab === "stories" && <StoriesView />}
        {activeTab === "video" && <HomepageVideoView />}
        {activeTab === "banners" && <HappeningNowView />}
        {activeTab === "study" && <StudyMaterialsView />}
        {activeTab === "media" && <MediaLibraryView />}
      </main>
    </div>
  );
}
