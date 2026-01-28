import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mic, Send, Volume2, Loader2 } from "lucide-react";
import { type Message } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: [api.chat.list.path],
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(api.chat.send.method, api.chat.send.path, {
        role: "user",
        content,
      });
    },
    onSuccess: () => {
      setInput("");
      queryClient.invalidateQueries({ queryKey: [api.chat.list.path] });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return;
    sendMutation.mutate(input);
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(console.error);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-muted/50">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">AI Assistant</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className={msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                  {msg.role === "user" ? "U" : "AI"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div
                  className={cn(
                    "p-3 rounded-2xl text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted rounded-tl-none"
                  )}
                >
                  {msg.content}
                </div>
                {msg.audioUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => playAudio(msg.audioUrl!)}
                  >
                    <Volume2 className="w-3 h-3" />
                    Listen
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="shrink-0 rounded-full">
            <Mic className="w-4 h-4" />
          </Button>
          <Input
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="rounded-full"
          />
          <Button size="icon" onClick={handleSend} disabled={sendMutation.isPending || !input.trim()} className="shrink-0 rounded-full">
            {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
