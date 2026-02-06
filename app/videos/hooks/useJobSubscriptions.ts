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

  // ✅ new: info panel updates
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

  const requestedMergedRef = useRef(false)
  const requestedMergedUriRef = useRef<string | null>(null)

  // ✅ new: prevent spamming same step-preview call
  const lastRequestedStepRef = useRef<string | null>(null)

  useEffect(() => {
    if (!jobId) return

    let isActive = true

    const unsubJob = onSnapshot(doc(db, "jobs", jobId), (snap) => {
      if (!snap.exists()) return
      const j: any = snap.data()

      const status = j.status ?? ""
      const step = j.current_step ?? ""
      const msg = j.message ?? ""

      setJobStatusText(
        [status && `Status: ${status}`, step && `Step: ${step}`, msg]
          .filter(Boolean)
          .join(" | ")
      )

      // ✅ MVP trigger: whenever current_step changes, try fetching step preview
      // (If backend not ready yet, it may return 404; we just ignore.)
      if (!step) return
      // 只在 step 成功时响应
      if (status !== "COMPLETED") return
      if (lastRequestedStepRef.current === step) return
      lastRequestedStepRef.current = step

      ;(async () => {
        try {
          const resp = await fetch(
            `/api/jobs/${encodeURIComponent(jobId)}/step-preview?step=${encodeURIComponent(step)}`,
            { method: "GET" }
          )
          if (!resp.ok) {
            // Common case: step-preview not available yet, ignore quietly
            // You can console.log if you want visibility:
            // console.log("step-preview not ready", step, resp.status)
            return
          }
          const json = await resp.json()
          const data = json?.data ?? {}
          const uri = json?.uri

          if (!isActive) return
          
          // update pinned meta for doc_ir
          if (step === "doc_ir") {
            const title = data?.title
            const pageCount = data?.page_count
            setPinnedMeta((p) => ({
              ...p,
              title: typeof title === "string" ? title : p.title,
              pageCount: typeof pageCount === "number" ? pageCount : p.pageCount,
            }))
          } else {
            // append block (for the scrolling info panel)
            appendInfoBlock({
              step,
              ts: Date.now(),
              data,
              uri,
            })
          }
        } catch (e) {
          console.error("step-preview fetch failed", step, e)
        }
      })()
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
      isActive = false
      unsubJob()
      unsubMerged()
      lastRequestedStepRef.current = null
    }
  }, [jobId, setJobStatusText, setVideos, setSelectedVideo, appendInfoBlock, setPinnedMeta])
}