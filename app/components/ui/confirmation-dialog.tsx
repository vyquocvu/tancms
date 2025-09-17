import React from 'react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { AlertTriangle, Trash2, X, Check } from 'lucide-react'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
  children?: React.ReactNode
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  children
}: ConfirmationDialogProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 className="h-6 w-6 text-destructive" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      case 'info':
        return <Check className="h-6 w-6 text-blue-500" />
      default:
        return <AlertTriangle className="h-6 w-6 text-muted-foreground" />
    }
  }

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'destructive'
      case 'warning':
        return 'default'
      case 'info':
        return 'default'
      default:
        return 'destructive'
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {getIcon()}
            </div>
            <div className="flex-1">
              <CardTitle id="dialog-title" className="text-lg">
                {title}
              </CardTitle>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p id="dialog-description" className="text-muted-foreground">
            {description}
          </p>
          
          {children}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              {cancelLabel}
            </Button>
            <Button
              variant={getConfirmButtonVariant()}
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </div>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface DeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string
  itemType: string
  isLoading?: boolean
  additionalInfo?: string
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  isLoading = false,
  additionalInfo
}: DeleteConfirmationProps) {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete ${itemType}`}
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmLabel="Delete"
      variant="danger"
      isLoading={isLoading}
    >
      {additionalInfo && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">{additionalInfo}</p>
        </div>
      )}
    </ConfirmationDialog>
  )
}

interface UnsavedChangesDialogProps {
  isOpen: boolean
  onClose: () => void
  onDiscard: () => void
  onSave?: () => void
  isLoading?: boolean
}

export function UnsavedChangesDialog({
  isOpen,
  onClose,
  onDiscard,
  onSave,
  isLoading = false
}: UnsavedChangesDialogProps) {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onDiscard}
      title="Unsaved Changes"
      description="You have unsaved changes. What would you like to do?"
      confirmLabel="Discard Changes"
      cancelLabel="Keep Editing"
      variant="warning"
      isLoading={isLoading}
    >
      {onSave && (
        <Button
          onClick={onSave}
          disabled={isLoading}
          className="w-full mb-2"
        >
          Save Changes
        </Button>
      )}
    </ConfirmationDialog>
  )
}