"use client"

import { useMemo, useRef, useState } from "react"
import type { VideoClip } from "../lib/types"

export function useVideoPlayer(videos: VideoClip[]) {
  const [selectedVideo, setSelectedVideo] = useState<VideoClip | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const selectVideo = (video: VideoClip) => {
    setSelectedVideo(video)
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const togglePlay = () => {
    const el = videoRef.current
    if (!el) return
    if (isPlaying) el.pause()
    else el.play()
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const el = videoRef.current
    if (!el) return
    el.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimeUpdate = () => {
    const el = videoRef.current
    if (!el) return
    setCurrentTime(el.currentTime)
  }

  const handleLoadedMetadata = () => {
    const el = videoRef.current
    if (!el) return
    setDuration(el.duration)
  }

  const handleSeek = (time: number) => {
    const el = videoRef.current
    if (!el) return
    el.currentTime = time
    setCurrentTime(time)
  }

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen()
  }

  const skipBackward = () => {
    const el = videoRef.current
    if (!el) return
    el.currentTime = Math.max(0, el.currentTime - 10)
  }

  const skipForward = () => {
    const el = videoRef.current
    if (!el) return
    el.currentTime = Math.min(duration, el.currentTime + 10)
  }

  const playNextVideo = () => {
    if (!selectedVideo || videos.length === 0) return
    const i = videos.findIndex((v) => v.id === selectedVideo.id)
    const next = videos[(i + 1) % videos.length]
    selectVideo(next)
  }

  const playPreviousVideo = () => {
    if (!selectedVideo || videos.length === 0) return
    const i = videos.findIndex((v) => v.id === selectedVideo.id)
    const prev = videos[i === 0 ? videos.length - 1 : i - 1]
    selectVideo(prev)
  }

  const api = useMemo(
    () => ({
      selectedVideo,
      setSelectedVideo,
      isPlaying,
      setIsPlaying,
      isMuted,
      currentTime,
      duration,
      videoRef,
      selectVideo,
      togglePlay,
      toggleMute,
      handleTimeUpdate,
      handleLoadedMetadata,
      handleSeek,
      handleFullscreen,
      skipBackward,
      skipForward,
      playNextVideo,
      playPreviousVideo,
    }),
    [selectedVideo, isPlaying, isMuted, currentTime, duration, videos]
  )

  return api
}