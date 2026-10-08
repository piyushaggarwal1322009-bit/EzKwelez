import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const onCloseRef = React.useRef(onClose);
  const titleId = React.useId();
  const descriptionId = React.useId();
  onCloseRef.current = onClose;

  React.useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusableSelector =
      'a[href], button:not([disabled]):not([aria-label="Close dialog"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const frame = window.requestAnimationFrame(() => {
      const initialTarget =
        dialogRef.current?.querySelector<HTMLElement>("[data-dialog-initial-focus]") ||
        dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
      (initialTarget || dialogRef.current)?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="dialog-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "dialog-panel relative w-full max-w-lg rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 id={titleId} className="text-base font-semibold leading-snug">{title}</h2>
            {description && <p id={descriptionId} className="text-sm text-slate-400">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            title="Close dialog"
            onClick={() => onCloseRef.current()}
            className="min-h-11 min-w-11 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-1">{children}</div>
      </div>
    </div>
  );
}
