import * as React from "react";
import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-2xl border border-emerald-400/18 bg-white/6 px-4 py-2 text-sm text-white outline-none transition-colors",
        "focus:border-emerald-300/35 focus:ring-2 focus:ring-emerald-400/12",
        className,
      )}
      {...props}
    />
  );
}
