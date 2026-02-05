"use client"

import React from "react"

export type InfoBlock = {
  step: string
  ts: number
  data: Record<string, any>
  uri?: string
}

export function BlockRenderer({ block }: { block: InfoBlock }) {
  const { step, data } = block

  // 你说只会有 3-4 个 blocks：这里就手写定制渲染（很 OK）
  if (step === "doc_ir") {
    const title = data?.title
    const pages = data?.page_count
    return (
      <div className="space-y-1">
        <div className="text-sm font-semibold text-foreground">Document parsed</div>
        {title ? <div className="text-sm text-muted-foreground">Title: {title}</div> : null}
        {typeof pages === "number" ? <div className="text-sm text-muted-foreground">Pages: {pages}</div> : null}
      </div>
    )
  }

  if (step === "sketch") {
    const abs = data?.abstract_summary
    return (
      <div className="space-y-1">
        <div className="text-sm font-semibold text-foreground">Abstract summary</div>
        {abs ? (
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{abs}</p>
        ) : (
          <p className="text-sm text-muted-foreground">(pending)</p>
        )}
      </div>
    )
  }

  // fallback：你后续再逐个美化
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-foreground">{step}</div>
      <pre className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(data ?? {}, null, 2)}
      </pre>
    </div>
  )
}