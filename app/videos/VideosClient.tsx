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
import { PdfInfoPanel } from "./components/PdfInfoPanel"
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

  React.useEffect(() => {
    if (jobId) sessionStorage.setItem("last_job_id", jobId)
  }, [jobId])

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
    // Message when completion/near completion
    if (typeof pct === "number" && pct >= 99) return "Finalizing…"

    // If pct hasn't started yet, use a conservative default (you mentioned 5 mins)
    if (typeof pct !== "number" || pct <= 0 || !progressStartedAt) {
      return "Video will be ready in approx. 5 mins"
    }

    const elapsedMs = Date.now() - progressStartedAt
    const elapsedMin = elapsedMs / 60000

    // Estimate total time from progress: total ~= elapsed / (pct/100)
    // Then calculate remaining: remaining = total - elapsed
    const frac = Math.max(pct, 1) / 100
    const totalMin = elapsedMin / frac
    let remainingMin = totalMin - elapsedMin

    // Limit ETA to reasonable bounds to avoid huge ETA when pct is small early on
    remainingMin = Math.min(Math.max(remainingMin, 0.5), 30)

    const rounded = Math.round(remainingMin)

    // Use "< 1 min" for the first minute
    if (remainingMin < 1) return "Video will be ready in < 1 min"
    return `Video will be ready in approx. ${rounded} mins`
  }, [pct, progressStartedAt])

  // 5) Info panel (production): start empty, fill via Firestore + step-preview
  const [pinned, setPinned] = React.useState<{ title?: string; pageCount?: number }>({})
  const [blocks, setBlocks] = React.useState<
    { step: string; ts: number; data: Record<string, any>; uri?: string }[]
  >([])

  const appendInfoBlock = React.useCallback(
    (b: { step: string; ts: number; data: Record<string, any>; uri?: string }) => {
      setBlocks(prev => {
        const i = prev.findIndex(x => x.step === b.step)
        if (i === -1) return [...prev, b]                // First occurrence: append
        const next = prev.slice()
        next[i] = b                                      // Duplicate: replace (deduplicate)
        return next
      })
    },
    []
  )

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

      <div className="mx-auto max-w-6xl px-6 py-8">

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
              <PdfInfoPanel pinned={pinned} blocks={blocks} />
            </div>

          </div>
        )}
      </div>
    </main>
  )
}