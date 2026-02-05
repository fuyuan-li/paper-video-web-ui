"use client"

import React from "react"
import { Download, Maximize, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { VideoClip } from "../lib/types"
import { formatTime } from "../lib/format"

type Props = {
  videos: VideoClip[]
  selectedVideo: VideoClip | null
  videoRef: React.RefObject<HTMLVideoElement | null>

  isPlaying: boolean
  isMuted: boolean
  currentTime: number
  duration: number

  onTogglePlay: () => void
  onSetPlaying: (v: boolean) => void

  onTimeUpdate: () => void
  onLoadedMetadata: () => void
  onSeek: (time: number) => void

  onFullscreen: () => void
  onToggleMute: () => void

  onSkipBackward: () => void
  onSkipForward: () => void
  onPrevVideo: () => void
  onNextVideo: () => void

  onSelectVideo: (v: VideoClip) => void
}

export function VideoSection(props: Props) {
  const {
    videos,
    selectedVideo,
    videoRef,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    onTogglePlay,
    onSetPlaying,
    onTimeUpdate,
    onLoadedMetadata,
    onSeek,
    onFullscreen,
    onToggleMute,
    onSkipBackward,
    onSkipForward,
    onPrevVideo,
    onNextVideo,
    onSelectVideo,
  } = props

  return (
    <div className="lg:col-span-3 flex flex-col">
      <Card className="border-2 border-border bg-card overflow-hidden">
        {/* Video */}
        <div className="relative aspect-video bg-foreground flex-shrink-0">
          {selectedVideo && (
            <video
              ref={videoRef}
              src={selectedVideo.url}
              className="h-full w-full object-contain"
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={onLoadedMetadata}
              onEnded={() => onSetPlaying(false)}
              onClick={onTogglePlay}
            />
          )}

          {!isPlaying && (
            <button
              onClick={onTogglePlay}
              className="absolute inset-0 flex items-center justify-center bg-foreground/20 transition-opacity hover:bg-foreground/30"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Play className="h-8 w-8 ml-1" />
              </div>
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-12">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
            />
            <span className="text-sm text-muted-foreground w-12 text-right">{formatTime(duration)}</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onPrevVideo} className="text-foreground hover:text-accent hover:bg-muted">
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" onClick={onSkipBackward} className="text-foreground hover:text-accent hover:bg-muted">
                <span className="text-xs font-medium">-10</span>
              </Button>

              <Button onClick={onTogglePlay} className="h-12 w-12 rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>

              <Button variant="ghost" size="icon" onClick={onSkipForward} className="text-foreground hover:text-accent hover:bg-muted">
                <span className="text-xs font-medium">+10</span>
              </Button>

              <Button variant="ghost" size="icon" onClick={onNextVideo} className="text-foreground hover:text-accent hover:bg-muted">
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onToggleMute} className="text-foreground hover:text-accent hover:bg-muted">
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>

              <Button variant="ghost" size="icon" onClick={onFullscreen} className="text-foreground hover:text-accent hover:bg-muted">
                <Maximize className="h-5 w-5" />
              </Button>

              {selectedVideo && (
                <a href={selectedVideo.url} download>
                  <Button variant="ghost" size="icon" className="text-foreground hover:text-accent hover:bg-muted">
                    <Download className="h-5 w-5" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        {selectedVideo && (
          <div className="border-t-2 border-border p-4">
            <h2 className="text-lg font-semibold text-foreground">{selectedVideo.title}</h2>
            {selectedVideo.duration && <p className="text-sm text-muted-foreground">Duration: {selectedVideo.duration}</p>}
          </div>
        )}
      </Card>

      {/* Clips strip */}
      <Card className="border-2 border-border bg-card p-3 mt-3 flex-shrink-0">
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Clips ({videos.length})</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-muted
            [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted
            [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-accent/50 hover:[&::-webkit-scrollbar-thumb]:bg-accent">
            {videos.map((v, index) => (
              <button
                key={v.id}
                onClick={() => onSelectVideo(v)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  selectedVideo?.id === v.id ? "border-accent bg-accent/5" : "border-border bg-card hover:border-accent/50"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground">
                  <Play className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground text-xs truncate max-w-[100px]">{v.title}</p>
                  <p className="text-xs text-muted-foreground">Clip {index + 1}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}