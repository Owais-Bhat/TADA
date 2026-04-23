import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm outline-none transition-colors",
        "placeholder:text-black/40 focus:border-black/20 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-white/40",
        className
      )}
      {...props}
    />
  );
}
