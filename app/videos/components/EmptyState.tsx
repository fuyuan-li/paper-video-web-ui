"use client"

import React from "react"
import Link from "next/link"
import { Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function EmptyState() {
  return (
    <Card className="border-2 border-border bg-card p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Video className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">No Videos Yet</h2>
        <p className="text-muted-foreground max-w-md">
          Upload a PDF to generate video clips. Your converted videos will appear here.
        </p>
        <Link href="/">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Upload PDF</Button>
        </Link>
      </div>
    </Card>
  )
}