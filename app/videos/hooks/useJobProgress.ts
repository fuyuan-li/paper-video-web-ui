"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { collection, doc, onSnapshot, query } from "firebase/firestore"
import { db } from "@/lib/firebase"

export type ProgressKey =
  | "doc_ir"
  | "sketch"
  | "world"
  | "glossary"
  | "claim"
  | "visual_assets"
  | "storyboard"
  | "video"
  | "merged_video"

const STATUS_PCT: Record<ProgressKey, number> = {
  doc_ir: 5,
  sketch: 10,
  world: 15,
  glossary: 20,
  claim: 30,
  visual_assets: 40,
  storyboard: 60,
  video: 98,
  merged_video: 100,
}

function toProgressKeyFromJob(j: any): ProgressKey | null {
  // Currently jobStatusText uses current_step + status + message
  // We prioritize current_step; fallback to status if not available
  const raw = String(j?.current_step ?? j?.status ?? "").trim().toLowerCase()
  if (!raw) return null

  // Support some possible variants
  if (raw.includes("doc_ir")) return "doc_ir"
  if (raw.includes("sketch")) return "sketch"
  if (raw.includes("world")) return "world"
  if (raw.includes("glossary")) return "glossary"
  if (raw.includes("claim")) return "claim"
  if (raw.includes("visual_assets") || raw.includes("visual")) return "visual_assets"
  if (raw.includes("storyboard")) return "storyboard"
  if (raw === "video" || raw.includes("video")) return "video"
  if (raw.includes("merged") || raw.includes("merge")) return "merged_video"

  return null
}

function labelForKey(k: ProgressKey): string {
  switch (k) {
    case "doc_ir":
      return "Parsing paper"
    case "sketch":
      return "Sketching"
    case "world":
      return "Building world"
    case "glossary":
      return "Extracting glossary"
    case "claim":
      return "Extracting claims"
    case "visual_assets":
      return "Generating visual assets"
    case "storyboard":
      return "Building storyboard"
    case "video":
      return "Generating video"
    case "merged_video":
      return "Finalizing"
  }
}

function computePct(args: { key: ProgressKey; doneClips: number }): number {
  const { key, doneClips } = args

  if (key === "merged_video") return 100
  if (key === "video") return 98

  const base = STATUS_PCT[key] ?? 0

  // Clip increment: each clip +3%, but max 97 before video
  const maxBeforeVideo = 97
  const maxClipAdd = Math.max(0, maxBeforeVideo - base)
  const clipAdd = Math.min(doneClips * 3, maxClipAdd)

  return Math.min(base + clipAdd, maxBeforeVideo)
}

export function useJobProgress(jobId: string | null) {
  const [progressKey, setProgressKey] = useState<ProgressKey | null>(null)
  const [message, setMessage] = useState<string>("")
  const [doneClips, setDoneClips] = useState<number>(0)
  const [totalClips, setTotalClips] = useState<number | null>(null)

  // Optional: make progress monotonic (only increase, never decrease) to avoid rollback from retries/reordering (better demo experience)
  const maxPctSeenRef = useRef<number>(0)

  useEffect(() => {
    if (!jobId) return

    // 1) subscribe job doc -> progressKey + message
    const unsubJob = onSnapshot(doc(db, "jobs", jobId), (snap) => {
      if (!snap.exists()) return
      const j: any = snap.data()

      // This message is optional: used for small text in UI
      const status = String(j?.status ?? "").toUpperCase()
      const step = j.current_step ?? ""
      const msg = j.message ?? ""

      if (status === "COMPLETED") {
        const k = toProgressKeyFromJob(j)
        if (k) setProgressKey(k)
      }
      setMessage([status && `Status: ${status}`, step && `Step: ${step}`, msg].filter(Boolean).join(" | "))
    })

    // 2) subscribe clips subcollection -> doneClips (+ optional totalClips)
    const clipsQ = query(collection(db, "jobs", jobId, "clips"))
    const unsubClips = onSnapshot(clipsQ, (snap) => {
      let done = 0
      let total = 0

      snap.forEach((d) => {
        const data: any = d.data()
        const st = String(data.status ?? "").toUpperCase()
        // Consistent with your old logic: READY counts as clip completed
        if (st === "READY") done += 1

        const t = Number(data.total)
        if (Number.isFinite(t)) total = Math.max(total, t)
      })

      setDoneClips(done)
      setTotalClips(total)
    })

    return () => {
      unsubJob()
      unsubClips()
    }
  }, [jobId])

  const key: ProgressKey = progressKey ?? "doc_ir"

  const pct = useMemo(() => {
    const rawPct = computePct({ key, doneClips })
    // Monotonic: only increase, never decrease (can be disabled if you don't want this)
    maxPctSeenRef.current = Math.max(maxPctSeenRef.current, rawPct)
    return maxPctSeenRef.current
  }, [key, doneClips])

  const label = useMemo(() => {
    const base = labelForKey(key)
    const clipInfo =
      key !== "video" && key !== "merged_video" && doneClips > 0
        ? ` • Clips ${doneClips}${typeof totalClips === "number" ? `/${totalClips}` : ""}`
        : ""
    return `${base}${clipInfo}`
  }, [key, doneClips, totalClips])

  return {
    key, // Current stage
    pct, // 0~100
    label, // Text to display
    message, // Combined info from original jobStatusText (optional to display)
    doneClips,
    totalClips,
  }
}