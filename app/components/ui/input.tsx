import * as React from 'react'

import { cn } from '~/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  error?: string
  description?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, description, 'aria-describedby': ariaDescribedby, ...props }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = error ? `${inputId}-error` : undefined
    const descriptionId = description ? `${inputId}-description` : undefined
    
    const describedBy = [
      ariaDescribedby,
      errorId,
      descriptionId
    ].filter(Boolean).join(' ')

    return (
      <div className="form-accessible">
        <input
          id={inputId}
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={describedBy || undefined}
          ref={ref}
          {...props}
        />
        {description && (
          <div id={descriptionId} className="field-description">
            {description}
          </div>
        )}
        {error && (
          <div id={errorId} className="field-error" role="alert">
            {error}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
