"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface RadioGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, disabled, children, ...props }, ref) => {
    return (
      <div
        className={cn("space-y-2", className)}
        ref={ref}
        {...props}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {
                groupValue: value,
                onGroupChange: onValueChange,
                disabled: disabled || child.props.disabled
              })
            : child
        )}
      </div>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

export interface RadioGroupItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  groupValue?: string
  onGroupChange?: (value: string) => void
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, groupValue, onGroupChange, ...props }, ref) => {
    return (
      <input
        type="radio"
        className={cn(
          "h-4 w-4 border border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2",
          className
        )}
        checked={value === groupValue}
        onChange={() => onGroupChange?.(value as string)}
        value={value}
        ref={ref}
        {...props}
      />
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }