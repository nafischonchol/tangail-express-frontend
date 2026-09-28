import React from "react";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 w-full mb-6 relative">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {action && (
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
