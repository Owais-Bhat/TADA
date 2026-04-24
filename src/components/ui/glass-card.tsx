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
        "rounded-3xl border border-emerald-400/14 bg-[#0b1715]/84 p-6 shadow-lg shadow-black/25 backdrop-blur",
        hover && "transition-transform duration-200 hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  );
}
