import * as React from "react"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"

const ToastContext = React.createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  type?: "default" | "success" | "info" | "warning" | "error"
  duration?: number
}

const ToastProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 11)
    setToasts((prev) => [...prev, { id, ...toast }])

    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

const ToastViewport = () => {
  const { toasts, removeToast } = React.useContext(ToastContext)

  return (
    <div className="fixed right-0 top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

interface ToastProps extends Toast {
  onClose: () => void
}

const Toast = ({
  id,
  title,
  description,
  action,
  type = "default",
  onClose,
}: ToastProps) => {
  const typeClasses = {
    default: "bg-background border",
    success: "bg-green-100 text-green-900 dark:bg-green-800 dark:text-green-100 border-green-200 dark:border-green-700",
    info: "bg-blue-100 text-blue-900 dark:bg-blue-800 dark:text-blue-100 border-blue-200 dark:border-blue-700",
    warning: "bg-yellow-100 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100 border-yellow-200 dark:border-yellow-700",
    error: "bg-red-100 text-red-900 dark:bg-red-800 dark:text-red-100 border-red-200 dark:border-red-700",
  }

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all",
        typeClasses[type]
      )}
    >
      <div className="flex flex-1 items-start gap-2">
        <div className="grid gap-1">
          {title && (
            <div className="text-sm font-semibold">
              {title}
            </div>
          )}
          {description && (
            <div className="text-sm opacity-90">
              {description}
            </div>
          )}
        </div>
      </div>
      {action}
      <button
        onClick={onClose}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:text-foreground hover:opacity-100"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export { ToastProvider, Toast }