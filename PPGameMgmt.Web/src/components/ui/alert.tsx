import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border/50",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive [&>svg]:text-destructive *:data-[slot=alert-description]:text-destructive/90",
        success:
          "border-green-500/30 bg-green-500/10 text-green-600 [&>svg]:text-green-600 *:data-[slot=alert-description]:text-green-600/90",
        warning:
          "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 [&>svg]:text-yellow-700 *:data-[slot=alert-description]:text-yellow-700/90",
        info:
          "border-blue-500/30 bg-blue-500/10 text-blue-600 [&>svg]:text-blue-600 *:data-[slot=alert-description]:text-blue-600/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        "animate-fadeIn",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
