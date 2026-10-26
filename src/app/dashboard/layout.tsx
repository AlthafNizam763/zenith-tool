"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Film,
  Megaphone,
  BookOpen,
  FolderOpen,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { ToastProvider } from "@/components/ui/Toast";
import ZenithToolLogo from "@/components/ui/ZenithToolLogo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="flex items-center gap-3">
                <ZenithToolLogo className="h-9 w-auto text-white" />
                <div className="h-5 w-px bg-white/10 hidden sm:block" />
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-300 hidden sm:inline-block">
                  CMS Hub
                </span>
              </div>
            </div>

            {/* Right Header Navigation */}
            <div className="flex items-center gap-3">
              <a
                href="https://zenithacademy.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition"
              >
                <span>Live Website</span>
                <ExternalLink size={13} />
              </a>

              <div className="h-4 w-px bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-medium">
                  A
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-medium text-white leading-tight">Administrator</p>
                  <p className="text-[10px] text-zinc-400">Zenith Master Access</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 hover:text-red-400 transition"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
