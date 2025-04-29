import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const Accordion = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    type?: "single" | "multiple"
    collapsible?: boolean
    defaultValue?: string | string[]
    value?: string | string[]
    onValueChange?: (value: string | string[]) => void
  }
>(({ className, type = "single", collapsible = false, ...props }, ref) => {
  const [openItems, setOpenItems] = React.useState<string[]>(
    Array.isArray(props.defaultValue) 
      ? props.defaultValue 
      : props.defaultValue 
        ? [props.defaultValue]
        : []
  )

  const handleItemToggle = (itemValue: string) => {
    if (type === "single") {
      if (openItems.includes(itemValue) && collapsible) {
        setOpenItems([])
      } else {
        setOpenItems([itemValue])
      }
    } else {
      if (openItems.includes(itemValue)) {
        setOpenItems(openItems.filter(item => item !== itemValue))
      } else {
        setOpenItems([...openItems, itemValue])
      }
    }
    
    if (props.onValueChange) {
      props.onValueChange(type === "single" ? itemValue : [...openItems, itemValue])
    }
  }

  return (
    <div
      ref={ref}
      className={cn("space-y-1", className)}
      {...props}
    >
      {React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<AccordionItemProps>, {
            onToggle: handleItemToggle,
            isOpen: openItems.includes((child.props as AccordionItemProps).value)
          })
        }
        return child
      })}
    </div>
  )
})
Accordion.displayName = "Accordion"

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  isOpen?: boolean
  onToggle?: (value: string) => void
}

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  AccordionItemProps
>(({ className, value, isOpen, onToggle, children, ...props }, ref) => {
  const handleToggle = () => {
    onToggle?.(value)
  }

  return (
    <div
      ref={ref}
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "border rounded-md",
        isOpen && "border-border",
        !isOpen && "border-transparent",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === AccordionTrigger) {
            return React.cloneElement(child as React.ReactElement, {
              isOpen,
              onClick: handleToggle
            })
          }
          if (child.type === AccordionContent) {
            return React.cloneElement(child as React.ReactElement, {
              isOpen
            })
          }
        }
        return child
      })}
    </div>
  )
})
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isOpen?: boolean
  }
>(({ className, children, isOpen, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex w-full items-center justify-between px-4 py-2 font-medium text-left text-sm transition-all",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
          isOpen ? "rotate-180" : ""
        )}
      />
    </button>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen?: boolean
  }
>(({ className, children, isOpen, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden transition-all",
        isOpen ? "max-h-96" : "max-h-0",
        className
      )}
      {...props}
    >
      <div className="px-4 py-3 text-sm">{children}</div>
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
}
