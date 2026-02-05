"use client"

import { useEffect, useRef } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { VideoClip } from "../lib/types"

export function useJobSubscriptions(args: {
  jobId: string | null
  setJobStatusText: (s: string) => void
  setVideos: (v: VideoClip[]) => void
  setSelectedVideo: (v: VideoClip | null) => void
}) {
  const { jobId, setJobStatusText, setVideos, setSelectedVideo } = args

  const requestedMergedRef = useRef(false)
  const requestedMergedUriRef = useRef<string | null>(null)

  useEffect(() => {
    if (!jobId) return

    const unsubJob = onSnapshot(doc(db, "jobs", jobId), (snap) => {
      if (!snap.exists()) return
      const j: any = snap.data()
      const status = j.status ?? ""
      const step = j.current_step ?? ""
      const msg = j.message ?? ""
      setJobStatusText([status && `Status: ${status}`, step && `Step: ${step}`, msg].filter(Boolean).join(" | "))
    })

    const unsubMerged = onSnapshot(doc(db, "jobs", jobId), async (snap) => {
      if (!snap.exists()) return
      const data: any = snap.data()

      const mergeStatus = String(data.merge_status ?? "").toLowerCase()
      const key = data.output_gcs_path as string | undefined

      if (mergeStatus !== "completed" || !key) return

      if (requestedMergedRef.current && requestedMergedUriRef.current === key) return
      requestedMergedRef.current = true
      requestedMergedUriRef.current = key

      try {
        const su = await fetch(
          `/api/jobs/${encodeURIComponent(jobId)}/signed-url?key=${encodeURIComponent(key)}`
        )
        if (!su.ok) throw new Error(await su.text())

        const suJson = await su.json()
        const url = suJson.url
        if (!url) throw new Error(`missing url: ${JSON.stringify(suJson)}`)

        const mergedVideo: VideoClip = { id: "merged", title: "Merged Video", url }
        setVideos([mergedVideo])
        setSelectedVideo(mergedVideo)
      } catch (e) {
        console.error("signed-url failed for merged video", e)
      }
    })

    return () => {
      unsubJob()
      unsubMerged()
    }
  }, [jobId, setJobStatusText, setVideos, setSelectedVideo])
}