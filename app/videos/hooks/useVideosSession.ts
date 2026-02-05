"use client"

import { useEffect, useState } from "react"
import type { PDFInfo, VideoClip } from "../lib/types"

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function useVideosSession(jobStatusText: string) {
  const [videos, setVideos] = useState<VideoClip[]>([])
  const [pdfInfo, setPdfInfo] = useState<PDFInfo>({
    title: "Additional Info",
    summary: "",
    keyTopics: [],
    chapters: [],
    metadata: [],
  })

  useEffect(() => {
    const storedVideos = sessionStorage.getItem("videos")
    if (storedVideos) {
      const parsed = safeJsonParse<VideoClip[]>(storedVideos)
      if (parsed) setVideos(parsed)
    }

    const storedPdfInfo = sessionStorage.getItem("pdfInfo")
    if (storedPdfInfo) {
      const parsed = safeJsonParse<PDFInfo>(storedPdfInfo)
      if (parsed) {
        setPdfInfo(parsed)
        return
      }
    }

    // fallback mock
    setPdfInfo({
      title: "Document Title",
      summary: jobStatusText || "Waiting for job updates...",
      keyTopics: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      chapters: [
        { title: "Introduction", page: 1 },
        { title: "Main Content", page: 5 },
        { title: "Conclusion", page: 15 },
      ],
      metadata: [
        { label: "Pages", value: "20" },
        { label: "Author", value: "Unknown" },
        { label: "Created", value: "2025-01-27" },
      ],
    })
  }, [jobStatusText])

  return { videos, setVideos, pdfInfo, setPdfInfo }
}