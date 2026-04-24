import * as React from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-2xl border border-emerald-400/18 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-colors",
        "placeholder:text-white/38 focus:border-emerald-300/35 focus:ring-2 focus:ring-emerald-400/12",
        className,
      )}
      {...props}
    />
  );
}
