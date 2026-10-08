import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, disabled, children, type = "button", ...props }, ref) => {
    const baseStyles = "inline-flex min-h-11 items-center justify-center font-semibold rounded-md transition-[transform,background-color,color,border-color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]";

    const variants = {
      primary: "bg-brand-primary text-[var(--color-text-on-brand)] hover:brightness-110 shadow-sm",
      secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-slate-900 border border-slate-700",
      outline: "border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-900",
      ghost: "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60",
      destructive: "bg-red-600/90 text-white hover:bg-red-600 active:bg-red-700 shadow-sm",
      success: "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-sm",
    };

    const sizes = {
      sm: "text-xs px-3 py-2 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-5 py-3 gap-2.5",
      icon: "h-11 w-11 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
