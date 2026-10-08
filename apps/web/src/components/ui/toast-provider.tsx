import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "warning" | "info" | "error";

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastMessage extends ToastInput {
  id: number;
}

interface ToastContextValue {
  showToast: (toast: ToastInput) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);
const TOAST_DURATION_MS = 4500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
  const timers = React.useRef(new Map<number, number>());
  const nextId = React.useRef(0);

  const dismissToast = (id: number) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const showToast = (toast: ToastInput) => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { ...toast, id }]);
    timers.current.set(id, window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS));
  };

  React.useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions text"
        className="fixed right-4 top-20 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((toast) => {
          const isError = toast.variant === "error";
          const Icon = toast.variant === "success" ? CheckCircle2 : isError || toast.variant === "warning" ? AlertTriangle : Info;
          return (
            <div
              key={toast.id}
              role={isError ? "alert" : "status"}
              className={cn(
                "flex items-start gap-3 rounded-lg border bg-slate-900 p-4 text-slate-100 shadow-xl page-enter",
                toast.variant === "success" && "border-emerald-700/70",
                toast.variant === "warning" && "border-amber-700/70",
                toast.variant === "error" && "border-red-700/70",
                (!toast.variant || toast.variant === "info") && "border-cyan-700/70"
              )}
            >
              <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-slate-200" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && <p className="mt-1 text-sm text-slate-300">{toast.description}</p>}
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                title="Dismiss notification"
                onClick={() => dismissToast(toast.id)}
                className="rounded p-1 text-slate-400 hover:text-slate-100"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}