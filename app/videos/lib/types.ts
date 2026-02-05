export interface VideoClip {
  id: string
  title: string
  url: string
  thumbnail?: string
  duration?: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface PDFInfo {
  title?: string
  summary?: string
  keyTopics?: string[]
  chapters?: { title: string; page: number }[]
  metadata?: { label: string; value: string }[]
}