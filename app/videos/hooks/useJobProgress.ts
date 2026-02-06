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
  // 你现在 jobStatusText 用的是 current_step + status + message
  // 我们优先用 current_step；拿不到再 fallback 到 status
  const raw = String(j?.current_step ?? j?.status ?? "").trim().toLowerCase()
  if (!raw) return null

  // 兼容一些可能的变体
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

  // clip 增量：每个 clip +3%，但 video 之前最多到 97
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

  // 可选：让进度只增不减，避免重试/乱序造成回退（demo 体验更稳）
  const maxPctSeenRef = useRef<number>(0)

  useEffect(() => {
    if (!jobId) return

    // 1) subscribe job doc -> progressKey + message
    const unsubJob = onSnapshot(doc(db, "jobs", jobId), (snap) => {
      if (!snap.exists()) return
      const j: any = snap.data()

      // 这个 message 可选：用于 UI 小字显示
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
        // 和你旧逻辑一致：READY 视作 clip 完成
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
    // monotonic：只增不减（可关掉，如果你不想这样）
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
    key, // 当前阶段
    pct, // 0~100
    label, // 可展示的文字
    message, // 你原先 jobStatusText 的组合信息（可选展示）
    doneClips,
    totalClips,
  }
}