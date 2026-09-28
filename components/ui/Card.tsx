import { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ children, className, ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white rounded-[14px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-5 border-b border-slate-100", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold text-slate-800", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}
