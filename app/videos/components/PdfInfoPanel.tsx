"use client"

import React from "react"
import { BookOpen, ChevronDown, ChevronUp, FileText, List, Tags } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { PDFInfo } from "../lib/types"

type Props = {
  pdfInfo: PDFInfo | null
  jobStatusText: string
  isExpanded: boolean
  onToggleExpanded: () => void
}

export function PdfInfoPanel({ pdfInfo, jobStatusText, isExpanded, onToggleExpanded }: Props) {
  if (!pdfInfo) return null

  return (
    <div className="lg:col-span-2 flex">
      <Card className="border-2 border-border bg-card w-full flex flex-col">
        {/* Header */}
        <button
          onClick={onToggleExpanded}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <FileText className="h-5 w-5 text-accent" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground">Additional Info</h3>
              <p className="text-xs text-muted-foreground">From your PDF</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {/* Body */}
        {isExpanded && (
          <div className="border-t-2 border-border p-4 space-y-5 flex-1 overflow-y-auto">
            {(pdfInfo.title || pdfInfo.summary) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>Summary</span>
                </div>
                {pdfInfo.title && <h4 className="text-base font-semibold text-foreground">{pdfInfo.title}</h4>}
                {pdfInfo.summary && <p className="text-sm text-muted-foreground leading-relaxed">{pdfInfo.summary}</p>}

                {jobStatusText ? (
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    <span className="font-medium text-foreground">Live status:</span> {jobStatusText}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">Waiting for pipeline updates...</p>
                )}
              </div>
            )}

            {pdfInfo.keyTopics?.length ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tags className="h-4 w-4" />
                  <span>Key Topics</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pdfInfo.keyTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-accent/10 text-accent font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {pdfInfo.chapters?.length ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <List className="h-4 w-4" />
                  <span>Chapters</span>
                </div>
                <div className="space-y-1">
                  {pdfInfo.chapters.map((chapter, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-foreground">{chapter.title}</span>
                      <span className="text-xs text-muted-foreground">p.{chapter.page}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {pdfInfo.metadata?.length ? (
              <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-3 gap-3">
                  {pdfInfo.metadata.map((item, i) => (
                    <div key={i} className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center italic">Connect your backend to populate with actual PDF data.</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}