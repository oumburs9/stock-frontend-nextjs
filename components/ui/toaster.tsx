'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  const getToastIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-700 dark:text-green-400 flex-shrink-0" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-700 dark:text-red-400 flex-shrink-0" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-700 dark:text-yellow-400 flex-shrink-0" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-700 dark:text-blue-400 flex-shrink-0" />
      default:
        return null
    }
  }

  const getToastVariant = (intent?: string) => {
    switch (intent) {
      case 'success':
        return 'success'
      case 'error':
        return 'destructive'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, intent, ...props }) {
        return (
          <Toast key={id} variant={getToastVariant(intent)} {...props}>
            <div className="flex gap-3 flex-1">
              {getToastIcon(intent)}
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
