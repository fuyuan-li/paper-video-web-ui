"use client"

import React from "react"
import { Bot, MessageCircle, Minimize2, Send, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ChatMessage } from "../lib/types"

type Props = {
  isOpen: boolean
  isMinimized: boolean
  onOpen: () => void
  onClose: () => void
  onToggleMinimize: () => void

  messages: ChatMessage[]
  isLoading: boolean

  inputValue: string
  onInputChange: (v: string) => void
  onInputKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onSend: () => void

  chatEndRef: React.RefObject<HTMLDivElement | null>
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}

export function ChatWidget(props: Props) {
  const {
    isOpen,
    isMinimized,
    onOpen,
    onClose,
    onToggleMinimize,
    messages,
    isLoading,
    inputValue,
    onInputChange,
    onInputKeyDown,
    onSend,
    chatEndRef,
    inputRef,
  } = props

  return (
    <>
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-all hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed right-6 bottom-6 z-50 flex flex-col bg-card border-2 border-border rounded-xl shadow-2xl transition-all ${
            isMinimized ? "w-80 h-14" : "w-96 h-[500px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-border bg-muted/50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">AI Assistant</p>
                {!isMinimized && <p className="text-xs text-muted-foreground">Ask about your content</p>}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMinimize}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        m.role === "user" ? "bg-foreground text-background" : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>

                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        m.role === "user"
                          ? "bg-foreground text-background rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{m.content}</p>
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

              <div className="p-4 border-t-2 border-border">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={onInputKeyDown}
                    placeholder="Ask about the video or PDF..."
                    className="flex-1 resize-none rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none min-h-[44px] max-h-[120px]"
                    rows={1}
                  />
                  <Button
                    onClick={onSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="h-11 w-11 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}