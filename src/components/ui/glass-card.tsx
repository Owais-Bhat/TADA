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
        "rounded-3xl border border-black/10 bg-white/80 p-6 shadow-lg shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5",
        hover && "transition-transform duration-200 hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  );
}
