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
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none select-none";

    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 shadow-sm",
      secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-slate-900 border border-slate-700",
      outline: "border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-900",
      ghost: "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60",
      destructive: "bg-red-600/90 text-white hover:bg-red-600 active:bg-red-700 shadow-sm",
      success: "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-sm",
    };

    const sizes = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-sm px-3.5 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
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
