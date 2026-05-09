import { X } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps extends Toast {
  onClose: (id: string) => void;
}

export function ToastItem({ id, message, type, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const bgColor =
    type === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
      : type === "error"
        ? "bg-red-50 border-red-200 text-red-900"
        : "bg-blue-50 border-blue-200 text-blue-900";

  const iconColor =
    type === "success"
      ? "text-emerald-600"
      : type === "error"
        ? "text-red-600"
        : "text-blue-600";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColor} shadow-sm animate-in fade-in slide-in-from-top-2 duration-200`}
    >
      <div
        className={`w-2 h-2 rounded-full shrink-0 ${
            type === "success"
            ? "bg-emerald-600"
            : type === "error"
              ? "bg-red-600"
              : "bg-blue-600"
        }`}
      />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
          onClick={() => onClose(id)}
        className={`shrink-0 ${iconColor} hover:opacity-70 transition`}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
