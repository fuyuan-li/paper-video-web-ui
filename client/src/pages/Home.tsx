import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChatInterface from "@/components/ChatInterface";
import { Logo } from "@/components/Logo";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: "PDF uploaded successfully!" });
      setLocation(`/jobs/${data.id}`);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upload PDF", variant: "destructive" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <div className="flex-1 flex flex-col p-8 overflow-y-auto items-center justify-center">
        <div className="max-w-2xl w-full space-y-12">
          <header className="text-center space-y-4">
            <div className="flex justify-center"><Logo /></div>
            <h1 className="text-5xl font-extrabold tracking-tight font-display">PDF to Video</h1>
            <p className="text-xl text-muted-foreground">Upload your PDF and chat with our AI assistant</p>
          </header>

          <Card className="border-dashed border-2 hover:border-primary/50 transition-all cursor-pointer bg-muted/30 rounded-3xl group" 
                onClick={() => fileInputRef.current?.click()}>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <p className="text-2xl font-bold mb-2">Click or drag PDF</p>
              <p className="text-muted-foreground">Get your video clips instantly</p>
              <Input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </CardContent>
          </Card>

          {uploadMutation.isPending && (
            <div className="flex items-center justify-center gap-3 text-primary font-medium animate-pulse">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              Processing your PDF...
            </div>
          )}
        </div>
      </div>

      <div className="w-[400px] border-l bg-card flex flex-col shrink-0">
        <ChatInterface />
      </div>
    </div>
  );
}
