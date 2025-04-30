import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
        // Text styles
        "text-sm text-foreground placeholder:text-muted-foreground",
        // Selection styles
        "selection:bg-primary/20",
        // Focus styles
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary",
        // Hover styles
        "hover:border-primary/50 hover:bg-background/80",
        // Transition
        "transition-all duration-200",
        // File input styles
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Disabled styles
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        // Invalid styles
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
