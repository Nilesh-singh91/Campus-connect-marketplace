"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

type ToastListener = (toast: ToastItem) => void;
const toastListeners = new Set<ToastListener>();

/**
 * Global helper function to trigger a toast from anywhere (React components, event handlers, API callbacks)
 */
export function showToast(message: string, type: ToastType = "info", duration = 3000) {
  if (typeof window === "undefined") return;
  const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  toastListeners.forEach((listener) => listener({ id, message, type, duration }));
}

/**
 * Convenience object with typed helper methods
 */
export const toast = {
  success: (message: string, duration?: number) => showToast(message, "success", duration),
  error: (message: string, duration?: number) => showToast(message, "error", duration),
  info: (message: string, duration?: number) => showToast(message, "info", duration),
};

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  removeToast: () => {},
});

export const useToast = () => useContext(ToastContext);

const ToastItemComponent: React.FC<{
  item: ToastItem;
  onRemove: (id: string) => void;
}> = ({ item, onRemove }) => {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsDismissing(true);
    setTimeout(() => {
      onRemove(item.id);
    }, 200);
  }, [item.id, onRemove]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, item.duration || 3000);
    return () => clearTimeout(timer);
  }, [item.duration, handleDismiss]);

  const typeConfig: Record<
    ToastType,
    { icon: React.ReactNode; border: string; iconBg: string }
  > = {
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
      border: "border-emerald-200/90 shadow-emerald-500/5",
      iconBg: "bg-emerald-50 text-emerald-700",
    },
    error: {
      icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
      border: "border-rose-200/90 shadow-rose-500/5",
      iconBg: "bg-rose-50 text-rose-700",
    },
    info: {
      icon: <Info className="w-4 h-4 text-indigo-600 shrink-0" />,
      border: "border-zinc-200/90 shadow-zinc-500/5",
      iconBg: "bg-indigo-50 text-indigo-700",
    },
  };

  const config = typeConfig[item.type] || typeConfig.info;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto flex items-start gap-2.5 p-3 sm:py-3 sm:px-3.5 rounded-xl border bg-white/95 backdrop-blur-md shadow-md text-zinc-900 transition-all duration-200 ${
        config.border
      } ${
        isDismissing
          ? "opacity-0 -translate-y-1.5 scale-95"
          : "opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-top-2"
      }`}
    >
      <div className="pt-0.5">{config.icon}</div>
      <p className="flex-1 text-xs sm:text-sm font-medium leading-snug break-words text-zinc-800">
        {item.message}
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="text-zinc-400 hover:text-zinc-600 p-0.5 rounded-md hover:bg-zinc-100 transition-colors ml-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((newItem: ToastItem) => {
    setToasts((prev) => [...prev.slice(-4), newItem]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    toastListeners.add(addToast);
    return () => {
      toastListeners.delete(addToast);
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast container: top-right on desktop, responsive max width on mobile */}
      <div
        aria-atomic="false"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-[92vw] sm:max-w-sm w-full pointer-events-none"
      >
        {toasts.map((item) => (
          <ToastItemComponent key={item.id} item={item} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
