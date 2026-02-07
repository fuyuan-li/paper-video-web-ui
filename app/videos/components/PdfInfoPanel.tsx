"use client"

import React, { useEffect, useMemo, useRef } from "react"
import { FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { BlockRenderer, type InfoBlock } from "./PdfInfoBlocks"

export type PinnedMeta = {
  title?: string
  pageCount?: number
}

type Props = {
  pinned: PinnedMeta
  blocks: InfoBlock[]
}

export function PdfInfoPanel({ pinned, blocks }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll: scroll inside panel, not the page itself
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({top: el.scrollHeight, behavior: "smooth" })
  }, [blocks.length])

  const titleText = useMemo(() => pinned.title?.trim() || "", [pinned.title])
  const pagesText = useMemo(
    () => (typeof pinned.pageCount === "number" ? String(pinned.pageCount) : "—"),
    [pinned.pageCount]
  )

  return (
      <Card className="border-2 border-border bg-card w-full flex flex-col overflow-hidden h-full">
        {/* Pinned: Title + Pages only */}
        <div className="p-4 border-b-2 border-border bg-card">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 shrink-0">
              <FileText className="h-5 w-5 text-accent" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-foreground whitespace-pre-wrap break-words leading-snug">
                {titleText}
              </div>

              <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="uppercase tracking-wide text-xs">Pages</span>
                <span className="px-2 py-0.5 rounded-md bg-muted text-foreground font-semibold">{pagesText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll container: ref is placed here */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
          {blocks.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">Waiting for pipeline updates…</div>
          ) : (
            <div className="divide-y divide-border/60">
              {blocks.map((block, idx) => (
                <div key={`${block.step}-${block.ts}-${idx}`} className="py-4">
                  <BlockRenderer block={block} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
  )
}