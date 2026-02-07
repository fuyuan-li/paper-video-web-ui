"use client"

import React from "react"
import ReactMarkdown from "react-markdown"

export type InfoBlock = {
  step: string
  ts: number
  data: Record<string, any>
  uri?: string
}

export function BlockRenderer({ block }: { block: InfoBlock }) {
  const { step, data } = block

  // You mentioned there would only be 3-4 blocks: we'll use custom rendering here (totally fine)
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

    if (step === "world") {
    const worldName = String(data?.world_name ?? "").trim()
    const msg = String(data?.msg ?? "").trim()

    const why_fits: string[] = Array.isArray(data?.why_fits)
        ? data.why_fits.map((k: any) =>
            String(k)
        )
        : []

    const title = worldName
        ? `Analogy world: ${worldName}`
        : "Analogy world"

    return (
        <div className="space-y-2">
        {/* Title: same level as Abstract summary */}
        <div className="text-sm font-semibold text-foreground">
            {title}
        </div>

        {/* Main message */}
        {msg ? (
            <div className="text-sm text-muted-foreground leading-relaxed">
            <ReactMarkdown>{msg}</ReactMarkdown>
            </div>
        ) : (
            <p className="text-sm text-muted-foreground">(pending)</p>
        )}

        {/* why_fits bullets */}
        {why_fits.length ? (
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {why_fits.map((c, i) => (
                <li key={`${c}-${i}`}>{c}</li>
            ))}
            </ul>
        ) : null}
        </div>
    )
    }

  // Fallback: you can customize each one later
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-foreground">{step}</div>
      <pre className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(data ?? {}, null, 2)}
      </pre>
    </div>
  )
}