"use client"

import React from "react"

export function JobProgressBar(props: {
  pct: number
  label: string
  message?: string
}) {
  const { pct, label, message } = props
  const clamped = Math.max(0, Math.min(100, Math.round(pct)))
  const showMessage = message && clamped < 100

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{label}</div>
          <div className="min-h-[1.20rem]">
            {showMessage ? (
              <div className="text-xs text-muted-foreground truncate mt-0.5">{message}</div>
            ) : " "}
          </div>
        </div>

        <div className="text-sm font-semibold text-foreground tabular-nums">{clamped}%</div>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}