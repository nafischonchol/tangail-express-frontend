import { cn } from "@/components/ui/Card";
import React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("text-[14px] font-medium text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";
