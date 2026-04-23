import * as React from "react";

import { cn } from "@/lib/utils";

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

export function GlassCard({
  className,
  hover = true,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white/88 p-6 shadow-lg shadow-slate-900/5 backdrop-blur",
        hover && "transition-transform duration-200 hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  );
}
