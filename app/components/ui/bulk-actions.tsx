import * as React from "react"
import { useState } from "react"
import { Button } from "./button"
import { Badge } from "./badge"
import { Card, CardContent } from "./card"
import { 
  Trash2,
  Archive,
  CheckCircle,
  Clock,
  FileText,
  Check,
  X
} from "lucide-react"
import { cn } from "~/lib/utils"

export interface BulkAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  requiresConfirmation?: boolean
  confirmationMessage?: string
}

export interface BulkActionsProps<T> {
  selectedItems: T[]
  onClearSelection: () => void
  onSelectAll?: () => void
  onDeselectAll?: () => void
  totalItems?: number
  className?: string
  actions?: BulkAction[]
  onAction: (actionId: string, items: T[]) => Promise<void> | void
  isLoading?: boolean
  disabled?: boolean
}

const DEFAULT_ACTIONS: BulkAction[] = [
  {
    id: 'publish',
    label: 'Publish',
    icon: CheckCircle,
    variant: 'default',
  },
  {
    id: 'draft',
    label: 'Set to Draft',
    icon: FileText,
    variant: 'outline',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: Clock,
    variant: 'outline',
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    variant: 'secondary',
    requiresConfirmation: true,
    confirmationMessage: 'Are you sure you want to archive these items?',
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive',
    requiresConfirmation: true,
    confirmationMessage: 'Are you sure you want to delete these items? This action cannot be undone.',
  },
]

export function BulkActions<T>({
  selectedItems,
  onClearSelection,
  onSelectAll,
  onDeselectAll,
  totalItems = 0,
  className,
  actions = DEFAULT_ACTIONS,
  onAction,
  isLoading = false,
  disabled = false,
}: BulkActionsProps<T>) {
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState<BulkAction | null>(null)

  const selectedCount = selectedItems.length
  const isAllSelected = totalItems > 0 && selectedCount === totalItems

  const handleAction = async (action: BulkAction) => {
    if (selectedCount === 0) return

    if (action.requiresConfirmation) {
      setShowConfirmation(action)
      return
    }

    await executeAction(action)
  }

  const executeAction = async (action: BulkAction) => {
    try {
      setPendingAction(action.id)
      await onAction(action.id, selectedItems)
      onClearSelection()
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setPendingAction(null)
      setShowConfirmation(null)
    }
  }

  const handleConfirm = () => {
    if (showConfirmation) {
      executeAction(showConfirmation)
    }
  }

  const handleCancel = () => {
    setShowConfirmation(null)
  }

  if (selectedCount === 0 && !isLoading) {
    return null
  }

  return (
    <>
      <Card className={cn("border-dashed border-2 border-primary/20 bg-primary/5", className)}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="font-medium">
                  {selectedCount} selected
                </Badge>
                
                {totalItems > 0 && (
                  <div className="flex items-center space-x-1">
                    {isAllSelected ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDeselectAll}
                        disabled={disabled || isLoading}
                        className="text-xs"
                      >
                        Deselect all
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSelectAll}
                        disabled={disabled || isLoading}
                        className="text-xs"
                      >
                        Select all ({totalItems})
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                disabled={disabled || isLoading}
                className="text-xs"
              >
                Clear selection
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              {actions.map((action) => {
                const Icon = action.icon
                const isActionLoading = pendingAction === action.id

                return (
                  <Button
                    key={action.id}
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={() => handleAction(action)}
                    disabled={disabled || isLoading || isActionLoading || selectedCount === 0}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {action.label}
                    {isActionLoading && (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                    )}
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <showConfirmation.icon className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Confirm {showConfirmation.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {showConfirmation.confirmationMessage}
                    </p>
                    <p className="text-sm font-medium mt-2">
                      This will affect {selectedCount} item{selectedCount !== 1 ? 's' : ''}.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirm}
                    disabled={isLoading}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirm {showConfirmation.label}
                    {isLoading && (
                      <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}