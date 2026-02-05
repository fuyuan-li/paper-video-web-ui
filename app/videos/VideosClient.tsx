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

export default function VideosClient() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get("job_id")

  // 1) start pipeline once (and expose status text)
  const { jobStatusText, setJobStatusText } = useRunPipeline(jobId)

  // 2) session storage load: videos + pdfInfo
  const { videos, setVideos, pdfInfo } = useVideosSession(jobStatusText)

  // 3) player state
  const player = useVideoPlayer(videos)

  // 4) run progress bar
  const { pct, label, message } = useJobProgress(jobId)

  // 5) Info panel pinned + blocks (MVP interactive mock)
  const [pinned, setPinned] = React.useState({ 
    title: "",
    pageCount: 0,
  })

  const [blocks, setBlocks] = React.useState([
    { step: "doc_ir", ts: Date.now() - 5000, data: { title: "Demo Paper", page_count: 20 } },
    { step: "sketch", ts: Date.now() - 2000, data: { abstract_summary: "This paper shows..." } },
  ])

  const appendBlock = (step: string, data: Record<string, any>) => {
    setBlocks((prev) => [...prev, { step, ts: Date.now(), data }])
  }

  const appendShort = () => {
    appendBlock("sketch", {
      abstract_summary: "New block appended ✅ (short)",
    })
  }

  const appendLong = () => {
    appendBlock("sketch", {
      abstract_summary:
        "Long block appended ✅\n\n" +
        "This paper shows... ".repeat(40) +
        "\n\n(End of long text)",
    })
  }

  const updatePinned = () => {
    setPinned((p) => ({
      title:
        (p.title?.includes("UPDATED")
          ? "All you need is attention and copula based performance efficient matrix decomposition"
          : "UPDATED TITLE (long) — " + "very long title ".repeat(12)).trim(),
      pageCount: typeof p.pageCount === "number" ? p.pageCount + 1 : 1,
    }))
  }

  const resetBlocks = () => {
    setPinned({ title: "Demo Paper", pageCount: 20 })
    setBlocks([
      { step: "doc_ir", ts: Date.now() - 3000, data: { title: "Demo Paper", page_count: 20 } },
      { step: "sketch", ts: Date.now() - 1500, data: { abstract_summary: "This paper shows..." } },
    ])
  }
  // Step 5 end

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
  })

  // 5) chat state
  const chat = useChat({ selectedVideo: player.selectedVideo, currentTime: player.currentTime })

  // 6) pdf panel collapse
  const [isInfoExpanded, setIsInfoExpanded] = React.useState(true)

  return (
    <main className="min-h-screen bg-background">
      <VideosHeader />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Upload
        </Link>

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
              progressPct={pct}
              progressLabel={label}
              progressMessage={message}
            />

            <div className="lg:col-span-2 flex flex-col gap-3">
              {/* Debug controls: remove later */}
              <div className="flex flex-wrap gap-2">
                <button
                  className="px-3 py-1.5 rounded-md text-sm border border-border hover:bg-muted transition-colors"
                  onClick={appendShort}
                  type="button"
                >
                  Append short block
                </button>
                <button
                  className="px-3 py-1.5 rounded-md text-sm border border-border hover:bg-muted transition-colors"
                  onClick={appendLong}
                  type="button"
                >
                  Append long block
                </button>
                <button
                  className="px-3 py-1.5 rounded-md text-sm border border-border hover:bg-muted transition-colors"
                  onClick={updatePinned}
                  type="button"
                >
                  Update title/pages
                </button>
                <button
                  className="px-3 py-1.5 rounded-md text-sm border border-border hover:bg-muted transition-colors"
                  onClick={resetBlocks}
                  type="button"
                >
                  Reset
                </button>
              </div>

              <PdfInfoPanel pinned={pinned} blocks={blocks} />
            </div>

          </div>
        )}
      </div>

      <ChatWidget
        isOpen={chat.isChatOpen}
        isMinimized={chat.isChatMinimized}
        onOpen={() => chat.setIsChatOpen(true)}
        onClose={() => chat.setIsChatOpen(false)}
        onToggleMinimize={() => chat.setIsChatMinimized((v) => !v)}
        messages={chat.messages}
        isLoading={chat.isLoading}
        inputValue={chat.inputValue}
        onInputChange={chat.setInputValue}
        onInputKeyDown={chat.onInputKeyDown}
        onSend={chat.sendMessage}
        chatEndRef={chat.chatEndRef}
        inputRef={chat.inputRef}
      />
    </main>
  )
}