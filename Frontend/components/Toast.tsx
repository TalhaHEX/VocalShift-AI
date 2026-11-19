"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, description?: string) => addToast("success", title, description),
    [addToast]
  );
  const error = useCallback(
    (title: string, description?: string) => addToast("error", title, description),
    [addToast]
  );
  const info = useCallback(
    (title: string, description?: string) => addToast("info", title, description),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
              t.type === "success"
                ? "bg-white/95 border-emerald-200 text-slate-800 shadow-emerald-500/5"
                : t.type === "error"
                ? "bg-white/95 border-rose-200 text-slate-800 shadow-rose-500/5"
                : "bg-white/95 border-indigo-200 text-slate-800 shadow-indigo-500/5"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === "success" && (
                <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </div>
              )}
              {t.type === "error" && (
                <div className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shadow-xs">
                  <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                </div>
              )}
              {t.type === "info" && (
                <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Info className="w-3.5 h-3.5" strokeWidth={1.5} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 tracking-tight">
                {t.title}
              </div>
              {t.description && (
                <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed break-words font-sans">
                  {t.description}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 p-1 rounded-md hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
