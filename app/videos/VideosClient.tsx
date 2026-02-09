"use client"

import React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { useRunPipeline } from "./hooks/useRunPipeline"
import { useVideosSession } from "./hooks/useVideosSession"
import { useVideoPlayer } from "./hooks/useVideoPlayer"
import { useJobSubscriptions } from "./hooks/useJobSubscriptions"
import { useChat } from "./hooks/useChat"
import { useJobProgress } from "./hooks/useJobProgress" 

import { VideosHeader } from "./components/VideosHeader"
import { EmptyState } from "./components/EmptyState"
import { VideoSection } from "./components/VideoSection"
import { PinnedMeta, PdfInfoPanel } from "./components/PdfInfoPanel"
import { ChatWidget } from "./components/ChatWidget"
import { Card } from "@/components/ui/card"
import { JobProgressBar } from "./components/JobProgressBar"

export default function VideosClient() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get("job_id")
  if (!jobId) {
    return (
      <main className="min-h-screen bg-background">
        <VideosHeader />
        <div className="mx-auto max-w-6xl px-6 py-8">
          <EmptyState />
        </div>
      </main>
    )
  }

  React.useEffect(() => {
    if (jobId) sessionStorage.setItem("last_job_id", jobId)
  }, [jobId])

  // 1) start pipeline once (and expose status text)
  const { jobStatusText, setJobStatusText } = useRunPipeline(jobId)

  // 2) session storage load: videos + pdfInfo
  const { videos, setVideos, pdfInfo } = useVideosSession(jobStatusText)

  // 3) player state
  const player = useVideoPlayer(videos)

  // 4) run progress bar
  const { pct, label, message } = useJobProgress(jobId)

  // ---- ETA (approx) for progress section ----
  const [progressStartedAt, setProgressStartedAt] = React.useState<number | null>(null)
  // ---- ETA smoothing + cap ----
  const etaEmaRef = React.useRef<number | null>(null)      // minutes
  const etaLastUpdateRef = React.useRef<number>(0)         // ms timestamp

  React.useEffect(() => {
    if (!jobId) {
      setProgressStartedAt(null)
      return
    }
    // When we first get a valid pct, consider progress timing started
    if (typeof pct === "number" && pct > 0 && progressStartedAt == null) {
      setProgressStartedAt(Date.now())
    }
    // If job restarts (pct goes back to 0), reset timing
    if (typeof pct === "number" && pct === 0) {
      setProgressStartedAt(Date.now())
    }
  }, [jobId, pct, progressStartedAt])

  const etaText = React.useMemo(() => {
    if (typeof pct === "number" && pct >= 100) return "Video Ready!"
    if (typeof pct === "number" && pct >= 99) return "Finalizing…"

    // Fixed ETA 5min
    if (typeof pct !== "number" || pct <= 0 || !progressStartedAt) {
      return "Video will be ready in approx. 5 mins"
    }

    const elapsedMin = (Date.now() - progressStartedAt) / 60000

    // remaining = elapsed * (100/pct - 1)
    const frac = Math.max(pct, 1) / 100
    const totalMin = elapsedMin / frac
    let remainingMin = totalMin - elapsedMin

    // cap at 5min, floor at 0.5
    remainingMin = Math.min(Math.max(remainingMin, 0.5), 5)

    if (remainingMin < 1) return "Video will be ready in < 1 min"
    return `Video will be ready in approx. ${Math.ceil(remainingMin)} mins`
  }, [pct, progressStartedAt])

  // 5) Info panel (production): start empty, fill via Firestore + step-preview
  type UiInfoBlock = {
    id?: string
    step: string
    ts: number
    data: Record<string, any>
    uri?: string
  }
  const [pinned, setPinned] = React.useState<PinnedMeta>({})
  const [blocks, setBlocks] = React.useState<UiInfoBlock[]>([])
  const pendingBlocksRef = React.useRef<UiInfoBlock[]>([])
  const hydratedRef = React.useRef(false)

  // Push block directly to UI (skip deferred queue)
  const pushBlockImmediate = React.useCallback((b: UiInfoBlock) => {
    setBlocks(prev => {
      // If has id use id dedup; no id use step dedup (your current logic)
      if (b.id) {
        const i = prev.findIndex(x => x.id === b.id)
        if (i === -1) return [...prev, b]
        const copy = prev.slice()
        copy[i] = b
        return copy
      } else {
        const i = prev.findIndex(x => x.step === b.step)
        if (i === -1) return [...prev, b]
        const copy = prev.slice()
        copy[i] = b
        return copy
      }
    })
  }, [])


  const appendInfoBlock = React.useCallback(
    (b: UiInfoBlock) => {
      // ✅ First page entry "initialization phase": show directly, no deferred queue
      if (!hydratedRef.current) {
        // glossary expand same logic: expand directly and immediate push
        if (b.step === "glossary") {
          const title = String(b.data?.title ?? "Glossary").trim()
          const intro = String(b.data?.intro ?? "").trim()
          const outro = String(b.data?.outro ?? "").trim()
          const items: any[] = Array.isArray(b.data?.items) ? b.data.items : []
          const base = `glossary:${b.ts}`
          let seq = 0

          if (intro) {
            pushBlockImmediate({ id: `${base}:${seq++}:intro`, step: "glossary", ts: b.ts + seq, data: { kind: "intro", title, text: intro } })
          }
          items.forEach((it, idx) => {
            pushBlockImmediate({ id: `${base}:${seq++}:item:${idx}`, step: "glossary", ts: b.ts + seq, data: { kind: "item", item: it } })
          })
          if (outro) {
            pushBlockImmediate({ id: `${base}:${seq++}:outro`, step: "glossary", ts: b.ts + seq, data: { kind: "outro", text: outro } })
          }
          return
        }

        pushBlockImmediate(b)
        return
      }

      // --- Special: expand glossary into multiple queued chunks ---
      if (b.step === "glossary") {
        const title = String(b.data?.title ?? "Glossary").trim()
        const intro = String(b.data?.intro ?? "").trim()
        const outro = String(b.data?.outro ?? "").trim()
        const items: any[] = Array.isArray(b.data?.items) ? b.data.items : []

        const chunks: any[] = []
        const base = `glossary:${b.ts}` // Use this glossary's timestamp as version prefix

        let seq = 0
        if (intro) {
          chunks.push({
            id: `${base}:${seq++}:intro`,
            step: "glossary",
            ts: b.ts + seq,
            data: { kind: "intro", title, text: intro },
          })
        }

        items.forEach((it, idx) => {
          chunks.push({
            id: `${base}:${seq++}:item:${idx}`,
            step: "glossary",
            ts: b.ts + seq,
            data: { kind: "item", item: it },
          })
        })

        if (outro) {
          chunks.push({
            id: `${base}:${seq++}:outro`,
            step: "glossary",
            ts: b.ts + seq,
            data: { kind: "outro", text: outro },
          })
        }

        // ✅ Directly append to pending queue, maintain order
        pendingBlocksRef.current = [...pendingBlocksRef.current, ...chunks]
        return
      }

      // --- Default: other steps keep "latest-only per step" in pending ---
      const q = pendingBlocksRef.current
      pendingBlocksRef.current = [...q.filter(x => x.step !== b.step), b]
    },
    [pushBlockImmediate]
  )
  // Every x-second give 1 block to UI
  React.useEffect(() => {
    const id = window.setInterval(() => {
      const q = pendingBlocksRef.current
      if (q.length === 0) return

      const next = q[0]
      pendingBlocksRef.current = q.slice(1)

      // de-dup blocks
      setBlocks(prev => {
        // ✅ If has id: deduplicate by id (replace same id), else deduplicate by step (replace same step)
        if (next.id) {
          const i = prev.findIndex(x => x.id === next.id)
          if (i === -1) return [...prev, next]   // append
          const copy = prev.slice()
          copy[i] = next
          return copy
        } else {
          const i = prev.findIndex(x => x.step === next.step)
          if (i === -1) return [...prev, next]
          const copy = prev.slice()
          copy[i] = next
          return copy
        }
      })
    }, 3000) // x=300(ms) - speed of refresh

    return () => window.clearInterval(id)
  }, [])

  const setPinnedMeta = React.useCallback(
    (updater: (p: { title?: string; pageCount?: number }) => { title?: string; pageCount?: number }) => {
      setPinned((prev) => updater(prev))
    },
    []
  )

  // optional: when jobId changes, reset the panel (good hygiene)
  React.useEffect(() => {
    setPinned({})
    setBlocks([])
    pendingBlocksRef.current = []
  }, [jobId])

  // ✅ Control hydration window: "first entry vs subsequent increments"
  React.useEffect(() => {
    hydratedRef.current = false

    // Give initial snapshot a window: blocks during this time are shown directly
    const t = window.setTimeout(() => {
      hydratedRef.current = true
    }, 10000) //10s

    return () => window.clearTimeout(t)
  }, [jobId])

  // Auto-select first video once videos loaded (avoid using `player` object as dependency)
  React.useEffect(() => {
    if (!player.selectedVideo && videos.length > 0) {
      player.setSelectedVideo(videos[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos, player.selectedVideo, player.setSelectedVideo])

  // 4) firestore subscriptions (job status + merged video signed url)
  useJobSubscriptions({
    jobId,
    setJobStatusText,
    setVideos,
    setSelectedVideo: player.setSelectedVideo,
    appendInfoBlock,
    setPinnedMeta,
  })

  // 5) chat state
  const chat = useChat({ selectedVideo: player.selectedVideo, currentTime: player.currentTime })

  // 6) pdf panel collapse
  const [isInfoExpanded, setIsInfoExpanded] = React.useState(true)

  return (
    <main className="min-h-screen bg-background">
      <VideosHeader />

      <div className="mx-auto max-w-7xl px-6 py-8">

        {videos.length === -1 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            <VideoSection
              videos={videos}
              selectedVideo={player.selectedVideo}
              videoRef={player.videoRef}
              isPlaying={player.isPlaying}
              isMuted={player.isMuted}
              currentTime={player.currentTime}
              duration={player.duration}
              onTogglePlay={player.togglePlay}
              onSetPlaying={player.setIsPlaying}
              onTimeUpdate={player.handleTimeUpdate}
              onLoadedMetadata={player.handleLoadedMetadata}
              onSeek={player.handleSeek}
              onFullscreen={player.handleFullscreen}
              onToggleMute={player.toggleMute}
              onSkipBackward={player.skipBackward}
              onSkipForward={player.skipForward}
              onPrevVideo={player.playPreviousVideo}
              onNextVideo={player.playNextVideo}
              onSelectVideo={player.selectVideo}
            />

            <div className="lg:col-span-2 flex flex-col gap-3">
              <Card className="border-2 border-border bg-card p-3">
                {typeof pct === "number" && label ? (
                  <div className="space-y-2">
                    <JobProgressBar pct={pct} label={label} message={message} />
                    <p className="text-xs text-muted-foreground">{etaText}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Video will be ready in approx. 5 mins</p>
                )}
              </Card>
              <div className="h-[473px] overflow-auto">
                <PdfInfoPanel pinned={pinned} blocks={blocks} />
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  )
}