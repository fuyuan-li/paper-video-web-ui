"use client"

import React from "react"
import { Video } from "lucide-react"

export function VideosHeader() {
  return (
    <header className="border-b-2 border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Video className="h-6 w-6 text-accent" />
          <span className="text-xl font-bold text-foreground">The PaperBook — Research, a video story for everyone</span>
        </div>
        <nav className="flex items-center gap-6">
          <a href="/" className="font-medium text-muted-foreground hover:text-accent transition-colors">
            Upload
          </a>
        </nav>
      </div>
    </header>
  )
}