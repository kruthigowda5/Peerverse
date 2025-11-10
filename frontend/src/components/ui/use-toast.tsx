"use client";
import React from "react";

export type Toast = { id: number; title?: string; description?: string; variant?: "default" | "destructive" };

const ToastCtx = React.createContext<{
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: number) => void;
} | null>(null);

export function Toaster() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {ctx.toasts.map((t) => (
        <div key={t.id} className={`rounded-md shadow px-4 py-3 text-sm ${t.variant === "destructive" ? "bg-red-600 text-white" : "bg-gray-900 text-white"}`}>
          {t.title && <p className="font-medium">{t.title}</p>}
          {t.description && <p className="opacity-90">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3500);
  }, []);
  const remove = React.useCallback((id: number) => setToasts((p) => p.filter((x) => x.id !== id)), []);
  const value = React.useMemo(() => ({ toasts, push, remove }), [toasts, push, remove]);
  return <ToastCtx.Provider value={value}>{children}</ToastCtx.Provider>;
}

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) {
    // fallback noop to avoid crashes if provider missing
    return {
      toast: (opts: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
        if (typeof window !== "undefined") console.warn("ToastProvider not mounted");
      },
    };
  }
  return {
    toast: (opts: { title?: string; description?: string; variant?: "default" | "destructive" }) => ctx.push(opts),
  };
}
