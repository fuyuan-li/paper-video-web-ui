"use client"

import { useEffect, useMemo, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

const STEP_WEIGHTS: Record<string, number> = {
  doc_ir: 1,
  sketch: 4,
  world: 5,
  glossary: 5,
  claim: 16,
  visual_assets: 5,
  storyboard: 12,
  // video handled specially (up to 50)
  // merge handled by SUCCEEDED => 100
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

export function useJobProgress(jobId: string | null) {
  const [pct, setPct] = useState<number>(0)
  const [label, setLabel] = useState<string>("")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    if (!jobId) return

    const unsub = onSnapshot(doc(db, "jobs", jobId), (snap) => {
      if (!snap.exists()) return
      const j: any = snap.data()

      const status = String(j.status ?? "").toUpperCase()
      const step = String(j.current_step ?? "")
      const msg = String(j.message ?? "")
      const videoDone = typeof j.video_done === "number" ? j.video_done : 0
      const videoTotal = typeof j.video_total === "number" ? j.video_total : null

      const clipLine =
        videoDone != null && videoTotal != null && videoTotal > 1
          ? `Clips Ready ${videoDone}/${videoTotal}`
          : ""

      setMessage(clipLine ? (msg ? `${msg} • ${clipLine}` : clipLine) : msg)

      // ✅ SUCCEEDED forces 100%
      if (status === "SUCCEEDED") {
        setPct(100)
        setLabel(step ? `SUCCEEDED • ${step}` : "SUCCEEDED")
        return
      }

      // Base label
      setLabel(step ? `${status || "RUNNING"} • ${step}` : (status || "RUNNING"))

      const stepsDone: string[] = Array.isArray(j.steps_done) ? j.steps_done : []
      const doneSet = new Set(stepsDone)

      // 1) Accumulate weights of non-video steps
      let progress = 0
      for (const [s, w] of Object.entries(STEP_WEIGHTS)) {
        if (doneSet.has(s)) progress += w
      }

      // 2) Special handling for video step (max 50%)
      const videoWeight = 50

      if (videoDone != null && videoTotal != null && videoTotal > 0) {
        progress += videoWeight * clamp(videoDone / videoTotal, 0, 1)
      } else {
        // No granular clip progress, use "video step completion" as 0/50
        if (doneSet.has("video")) progress += videoWeight
      }

      // 3) Don't exceed 99 (unless SUCCEEDED)
      progress = Math.floor(clamp(progress, 0, 99))
      setPct(progress)
    })

    return () => unsub()
  }, [jobId])

  return { pct, label, message }
}