"use client"

import * as React from "react"
import { TooltipProps } from "recharts"

export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ReactNode
}

export function ChartContainer({ config, children, ...props }: ChartContainerProps) {
  return (
    <div
      {...props}
      style={{
        ...props.style,
        "--color-desktop": config.desktop?.color,
        "--color-mobile": config.mobile?.color,
        "--color-amount": config.amount?.color,
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

interface ChartTooltipProps extends TooltipProps<any, any> {
  children?: React.ReactNode
}

export function ChartTooltip({ children, ...props }: ChartTooltipProps) {
  return children
}

interface ChartTooltipContentProps {
  hideLabel?: boolean
  active?: boolean
  payload?: any[]
}

export function ChartTooltipContent({ active, payload, hideLabel }: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          {!hideLabel && (
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
          )}
          <span className="text-sm font-medium">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
} 