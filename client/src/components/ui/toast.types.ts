import * as React from "react"

export interface ToastProps {
  variant?: "default" | "destructive"
  className?: string
  duration?: number
  onOpenChange?: (open: boolean) => void
}

export type ToastActionElement = React.ReactElement
