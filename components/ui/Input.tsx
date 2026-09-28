import { cn } from "@/components/ui/Card";
import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full px-4 py-1.5 border border-slate-200 rounded-[10px] bg-white text-sm shadow-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900",
          type === "number" && "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
