"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import ZenithToolLogo from "@/components/ui/ZenithToolLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@zenithacademy.com");
  const [password, setPassword] = useState("ZenithAdmin2026!");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 py-12">
      {/* Subtle background glow effects */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="relative w-full max-w-md">
        {/* Header Branding */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="mb-4">
            <ZenithToolLogo className="h-14 w-auto text-white mx-auto" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Support &amp; Content Management Hub</span>
          </div>

          <p className="mt-3 text-sm text-zinc-400">
            Sign in to manage homepage media, videos, banners &amp; rank files
          </p>
        </div>

        {/* Glass Card */}
        <div className="glass-panel rounded-2xl p-7 shadow-2xl">
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Admin Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zenithacademy.com"
                  className="glass-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="glass-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="glass-button-primary mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium shadow-md transition disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
              ) : (
                <>
                  <span>Authenticate &amp; Enter Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential hint box */}
          <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 font-medium text-zinc-300">
              <Sparkles size={13} className="text-amber-400" />
              <span>Initial Administrator Credentials</span>
            </div>
            <div className="mt-1.5 flex flex-col gap-0.5 font-mono text-[11px] text-zinc-400">
              <div>Email: admin@zenithacademy.com</div>
              <div>Password: ZenithAdmin2026!</div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-zinc-600">
          MongoDB-backed centralized management tool &bull; Zenith Academy
        </div>
      </div>
    </div>
  );
}
