"use client"

import { useEffect, useRef } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { VideoClip } from "../lib/types"
import type { InfoBlock } from "../components/PdfInfoBlocks"
import type { PinnedMeta } from "../components/PdfInfoPanel"

export function useJobSubscriptions(args: {
  jobId: string | null
  setJobStatusText: (s: string) => void
  setVideos: (v: VideoClip[]) => void
  setSelectedVideo: (v: VideoClip | null) => void
  appendInfoBlock: (b: InfoBlock) => void
  setPinnedMeta: (updater: (p: PinnedMeta) => PinnedMeta) => void
}) {
  const {
    jobId,
    setJobStatusText,
    setVideos,
    setSelectedVideo,
    appendInfoBlock,
    setPinnedMeta,
  } = args

  // Steps already processed (for replay + deduplication)
  const seenStepsRef = useRef<Set<string>>(new Set())

  // Merged video deduplication
  const requestedMergedRef = useRef(false)
  const requestedMergedUriRef = useRef<string | null>(null)

  useEffect(() => {
    if (!jobId) return
    let isActive = true

    const unsub = onSnapshot(doc(db, "jobs", jobId), async (snap) => {
      if (!snap.exists()) return
      const j: any = snap.data()

      const dagStatus = j.status ?? ""
      const step = j.current_step ?? ""
      const stepStatus = j.current_step_status ?? ""
      const msg = j.message ?? ""

      setJobStatusText(
        [
          dagStatus && `Status: ${dagStatus}`,
          step && `Step: ${step}${stepStatus ? ` (${stepStatus})` : ""}`,
          msg,
        ]
          .filter(Boolean)
          .join(" | ")
      )

      // -------- replay completed steps --------
      const stepsDone: string[] = Array.isArray(j.steps_done) ? j.steps_done : []

      for (const s of stepsDone) {
        if (!s) continue
        if (seenStepsRef.current.has(s)) continue
        seenStepsRef.current.add(s)

        // Fetch step preview (replay or incremental)
        ;(async () => {
          try {
            const resp = await fetch(
              `/api/jobs/${encodeURIComponent(jobId)}/step-preview?step=${encodeURIComponent(s)}`,
              { method: "GET" }
            )
            if (!resp.ok) return

            const json = await resp.json()
            const data = json?.data ?? {}
            const uri = json?.uri
            if (!isActive) return

            if (s === "doc_ir") {
              const title = data?.title
              const pageCount = data?.page_count
              setPinnedMeta((p) => ({
                ...p,
                title: typeof title === "string" ? title : p.title,
                pageCount: typeof pageCount === "number" ? pageCount : p.pageCount,
              }))
            } else {
              appendInfoBlock({
                step: s,
                ts: Date.now(),
                data,
                uri,
              })
            }
          } catch (e) {
            console.error("step-preview fetch failed", s, e)
          }
        })()
      }

      // -------- merged video restore --------
      const mergeStatus = String(j.merge_status ?? "").toLowerCase()
      const key = j.output_gcs_path as string | undefined

      if (mergeStatus === "completed" && key) {
        if (
          !requestedMergedRef.current ||
          requestedMergedUriRef.current !== key
        ) {
          requestedMergedRef.current = true
          requestedMergedUriRef.current = key

          try {
            const su = await fetch(
              `/api/jobs/${encodeURIComponent(jobId)}/signed-url?key=${encodeURIComponent(key)}`
            )
            if (!su.ok) throw new Error(await su.text())
            const suJson = await su.json()
            const url = suJson.url
            if (!url) throw new Error("missing signed url")

            const mergedVideo: VideoClip = {
              id: "merged",
              title: "Merged Video",
              url,
            }
            setVideos([mergedVideo])
            setSelectedVideo(mergedVideo)
          } catch (e) {
            console.error("signed-url failed", e)
          }
        }
      }
    })

    return () => {
      isActive = false
      unsub()
      seenStepsRef.current.clear()
      requestedMergedRef.current = false
      requestedMergedUriRef.current = null
    }
  }, [
    jobId,
    setJobStatusText,
    setVideos,
    setSelectedVideo,
    appendInfoBlock,
    setPinnedMeta,
  ])
}