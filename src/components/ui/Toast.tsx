"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", title?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message, title }]);
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title = "Success") => addToast(message, "success", title),
    [addToast]
  );

  const error = useCallback(
    (message: string, title = "Error") => addToast(message, "error", title),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
              t.type === "success"
                ? "border-emerald-500/20 bg-[#09090b]/90 text-zinc-100 shadow-emerald-950/20"
                : t.type === "error"
                ? "border-red-500/20 bg-[#09090b]/90 text-zinc-100 shadow-red-950/20"
                : "border-zinc-700/50 bg-[#09090b]/90 text-zinc-100"
            }`}
          >
            {t.type === "success" && (
              <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
            )}
            {t.type === "error" && (
              <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
            )}
            {t.type === "info" && (
              <Info size={18} className="text-blue-400 mt-0.5 shrink-0" />
            )}
            <div className="flex-1 text-sm">
              {t.title && <p className="font-semibold text-zinc-200">{t.title}</p>}
              <p className="text-zinc-300 text-xs mt-0.5">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
