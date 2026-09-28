import * as React from "react"
import { cn } from "@/components/ui/Card"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full px-4 py-2.5 border border-slate-200 rounded-[10px] bg-white text-sm shadow-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
