"use client"

import { useEffect, useRef, useState } from "react"
import type { ChatMessage, VideoClip } from "../lib/types"

export function useChat(args: {
  selectedVideo: VideoClip | null
  currentTime: number
}) {
  const { selectedVideo, currentTime } = args

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          videoId: selectedVideo?.id,
          videoTitle: selectedVideo?.title,
          currentTime,
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

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  return {
    // ui state
    isChatOpen,
    setIsChatOpen,
    isChatMinimized,
    setIsChatMinimized,

    // messages
    messages,
    inputValue,
    setInputValue,
    isLoading,
    sendMessage,
    onInputKeyDown,

    // refs
    chatEndRef,
    inputRef,
  }
}