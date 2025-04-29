import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { 
    label?: string;
    description?: string;
  }
>(({ className, label, description, ...props }, ref) => {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="relative">
        <input
          type="checkbox"
          className="peer sr-only"
          ref={ref}
          {...props}
        />
        <span 
          className={cn(
            "block h-5 w-9 rounded-full bg-muted transition-colors",
            "peer-checked:bg-primary peer-focus-visible:ring-2",
            "peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            className
          )}
        />
        <span 
          className={cn(
            "absolute left-1 top-1 h-3 w-3 rounded-full bg-background transition-transform",
            "peer-checked:translate-x-4"
          )}
        />
      </span>
      {label && (
        <div className="grid gap-0.5">
          <span className="text-sm font-medium leading-none">{label}</span>
          {description && (
            <span className="text-sm text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </label>
  )
})

Switch.displayName = "Switch"

export { Switch }