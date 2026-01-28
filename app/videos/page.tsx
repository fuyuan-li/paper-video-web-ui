"use client"

import React from "react"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import {
  Video,
  Play,
  Pause,
  ArrowLeft,
  Download,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  FileText,
  BookOpen,
  List,
  Tags,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface VideoClip {
  id: string
  title: string
  url: string
  thumbnail?: string
  duration?: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface PDFInfo {
  title?: string
  summary?: string
  keyTopics?: string[]
  chapters?: { title: string; page: number }[]
  metadata?: { label: string; value: string }[]
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoClip[]>([])
  const [selectedVideo, setSelectedVideo] = useState<VideoClip | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isChatMinimized, setIsChatMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. Ask me anything about the videos or the original PDF content. I can help explain concepts, summarize sections, or answer specific questions.",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // PDF Info state
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null)
  const [isInfoExpanded, setIsInfoExpanded] = useState(true)

  useEffect(() => {
    // Get videos from sessionStorage
    const storedVideos = sessionStorage.getItem("videos")
    if (storedVideos) {
      const parsedVideos = JSON.parse(storedVideos)
      setVideos(parsedVideos)
      if (parsedVideos.length > 0) {
        setSelectedVideo(parsedVideos[0])
      }
    }

    // Get PDF info from sessionStorage (populated by backend)
    const storedPdfInfo = sessionStorage.getItem("pdfInfo")
    if (storedPdfInfo) {
      setPdfInfo(JSON.parse(storedPdfInfo))
    } else {
      // Mock data for demo - replace with actual backend data
      setPdfInfo({
        title: "Document Title",
        summary:
          "This is a placeholder summary of your PDF document. Connect your backend to populate this section with actual extracted content from the uploaded PDF.",
        keyTopics: ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
        chapters: [
          { title: "Introduction", page: 1 },
          { title: "Main Content", page: 5 },
          { title: "Conclusion", page: 15 },
        ],
        metadata: [
          { label: "Pages", value: "20" },
          { label: "Author", value: "Unknown" },
          { label: "Created", value: "2025-01-27" },
        ],
      })
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen()
    }
  }

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
    }
  }

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const selectVideo = (video: VideoClip) => {
    setSelectedVideo(video)
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const playNextVideo = () => {
    if (selectedVideo && videos.length > 0) {
      const currentIndex = videos.findIndex((v) => v.id === selectedVideo.id)
      const nextIndex = (currentIndex + 1) % videos.length
      selectVideo(videos[nextIndex])
    }
  }

  const playPreviousVideo = () => {
    if (selectedVideo && videos.length > 0) {
      const currentIndex = videos.findIndex((v) => v.id === selectedVideo.id)
      const prevIndex = currentIndex === 0 ? videos.length - 1 : currentIndex - 1
      selectVideo(videos[prevIndex])
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // TODO: Replace with actual backend endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          videoId: selectedVideo?.id,
          videoTitle: selectedVideo?.title,
          currentTime: currentTime,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      // Fallback mock response for demo
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you're asking about "${userMessage.content}". This is a placeholder response - connect the backend API at /api/chat to enable real AI responses about your PDF and videos.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Video className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold text-foreground">PDF2Video</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/" className="font-medium text-muted-foreground hover:text-accent transition-colors">
              Upload
            </a>
            <a href="/videos" className="font-medium text-foreground hover:text-accent transition-colors">
              My Videos
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Upload
        </Link>

        {videos.length === 0 ? (
          <Card className="border-2 border-border bg-card p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">No Videos Yet</h2>
              <p className="text-muted-foreground max-w-md">
                Upload a PDF to generate video clips. Your converted videos will appear here.
              </p>
              <Link href="/">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Upload PDF</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left Column: Video Player + Video Clips */}
            <div className="lg:col-span-3 flex flex-col">
              {/* Video Player - Takes most of the space */}
              <Card className="border-2 border-border bg-card overflow-hidden">
                {/* Video Element */}
                <div className="relative aspect-video bg-foreground flex-shrink-0">
                  {selectedVideo && (
                    <video
                      ref={videoRef}
                      src={selectedVideo.url}
                      className="h-full w-full object-contain"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      onClick={togglePlay}
                    />
                  )}
                  {/* Play Overlay */}
                  {!isPlaying && (
                    <button
                      onClick={togglePlay}
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
                  {/* Progress Bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-12">{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
                    />
                    <span className="text-sm text-muted-foreground w-12 text-right">{formatTime(duration)}</span>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={playPreviousVideo}
                        className="text-foreground hover:text-accent hover:bg-muted"
                      >
                        <SkipBack className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={skipBackward}
                        className="text-foreground hover:text-accent hover:bg-muted"
                      >
                        <span className="text-xs font-medium">-10</span>
                      </Button>
                      <Button
                        onClick={togglePlay}
                        className="h-12 w-12 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={skipForward}
                        className="text-foreground hover:text-accent hover:bg-muted"
                      >
                        <span className="text-xs font-medium">+10</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={playNextVideo}
                        className="text-foreground hover:text-accent hover:bg-muted"
                      >
                        <SkipForward className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        className="text-foreground hover:text-accent hover:bg-muted"
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleFullscreen}
                        className="text-foreground hover:text-accent hover:bg-muted"
                      >
                        <Maximize className="h-5 w-5" />
                      </Button>
                      {selectedVideo && (
                        <a href={selectedVideo.url} download>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-foreground hover:text-accent hover:bg-muted"
                          >
                            <Download className="h-5 w-5" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                {selectedVideo && (
                  <div className="border-t-2 border-border p-4">
                    <h2 className="text-lg font-semibold text-foreground">{selectedVideo.title}</h2>
                    {selectedVideo.duration && (
                      <p className="text-sm text-muted-foreground">Duration: {selectedVideo.duration}</p>
                    )}
                  </div>
                )}
              </Card>

              {/* Video Clips List - Compact horizontal strip below player */}
              <Card className="border-2 border-border bg-card p-3 mt-3 flex-shrink-0">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Clips ({videos.length})
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-muted [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-accent/50 hover:[&::-webkit-scrollbar-thumb]:bg-accent">
                    {videos.map((video, index) => (
                      <button
                        key={video.id}
                        onClick={() => selectVideo(video)}
                        className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                          selectedVideo?.id === video.id
                            ? "border-accent bg-accent/5"
                            : "border-border bg-card hover:border-accent/50"
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground">
                          <Play className="h-3.5 w-3.5" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-foreground text-xs truncate max-w-[100px]">{video.title}</p>
                          <p className="text-xs text-muted-foreground">Clip {index + 1}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Additional Information */}
            <div className="lg:col-span-2 flex">
              {pdfInfo && (
                <Card className="border-2 border-border bg-card w-full flex flex-col">
                  {/* Collapsible Header */}
                  <button
                    onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <FileText className="h-5 w-5 text-accent" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-foreground">Additional Info</h3>
                        <p className="text-xs text-muted-foreground">From your PDF</p>
                      </div>
                    </div>
                    {isInfoExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  {/* Expandable Content */}
                  {isInfoExpanded && (
                    <div className="border-t-2 border-border p-4 space-y-5 flex-1 overflow-y-auto">
                      {/* Document Title & Summary */}
                      {(pdfInfo.title || pdfInfo.summary) && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span>Summary</span>
                          </div>
                          {pdfInfo.title && (
                            <h4 className="text-base font-semibold text-foreground">{pdfInfo.title}</h4>
                          )}
                          {pdfInfo.summary && (
                            <p className="text-sm text-muted-foreground leading-relaxed">{pdfInfo.summary}</p>
                          )}
                        </div>
                      )}

                      {/* Key Topics */}
                      {pdfInfo.keyTopics && pdfInfo.keyTopics.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Tags className="h-4 w-4" />
                            <span>Key Topics</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {pdfInfo.keyTopics.map((topic, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-accent/10 text-accent font-medium"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Chapters / Sections */}
                      {pdfInfo.chapters && pdfInfo.chapters.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <List className="h-4 w-4" />
                            <span>Chapters</span>
                          </div>
                          <div className="space-y-1">
                            {pdfInfo.chapters.map((chapter, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <span className="text-sm text-foreground">{chapter.title}</span>
                                <span className="text-xs text-muted-foreground">p.{chapter.page}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      {pdfInfo.metadata && pdfInfo.metadata.length > 0 && (
                        <div className="pt-4 border-t border-border">
                          <div className="grid grid-cols-3 gap-3">
                            {pdfInfo.metadata.map((item, index) => (
                              <div key={index} className="text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</p>
                                <p className="text-sm font-semibold text-foreground mt-1">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Placeholder Note */}
                      <div className="pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground text-center italic">
                          Connect your backend to populate with actual PDF data.
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-all hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div
          className={`fixed right-6 bottom-6 z-50 flex flex-col bg-card border-2 border-border rounded-xl shadow-2xl transition-all ${
            isChatMinimized ? "w-80 h-14" : "w-96 h-[500px]"
          }`}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-border bg-muted/50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">AI Assistant</p>
                {!isChatMinimized && <p className="text-xs text-muted-foreground">Ask about your content</p>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatMinimized(!isChatMinimized)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Body */}
          {!isChatMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        message.role === "user" ? "bg-foreground text-background" : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        message.role === "user"
                          ? "bg-foreground text-background rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t-2 border-border">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about the video or PDF..."
                    className="flex-1 resize-none rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none min-h-[44px] max-h-[120px]"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="h-11 w-11 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </main>
  )
}
