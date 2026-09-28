import { cn } from "@/components/ui/Card";
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    
    const variants = {
      primary: "bg-[#BA478F] text-white hover:bg-[#9F3375] shadow-xs",
      secondary: "bg-[#FDF2F8] text-[#9F3375] hover:bg-[#FCE7F3] border border-[#FBCFE8]",
      danger: "bg-rose-50 text-rose-600 hover:text-rose-900 border border-transparent",
      ghost: "hover:bg-slate-100 text-slate-700",
    };

    const sizes = {
      default: "h-8 px-4 py-1.5",
      sm: "h-7 px-2.5 text-xs rounded-md",
      lg: "h-10 px-6 rounded-[10px]",
      icon: "h-8 w-8",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FDF2F8] disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
