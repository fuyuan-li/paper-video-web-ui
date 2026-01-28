import { useJob } from "@/hooks/use-jobs";
import { useRoute, useLocation } from "wouter";
import { Loader2, AlertCircle, Download, Play, ArrowRight, FileText } from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";

export default function JobResult() {
  const [, params] = useRoute("/jobs/:id");
  const [, setLocation] = useLocation();
  const id = params ? parseInt(params.id) : 0;
  
  const { data: job, isLoading, error } = useJob(id);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    );
  }

  const isProcessing = job.status === "pending" || job.status === "processing";
  const isCompleted = job.status === "completed";

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="border-b bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div onClick={() => setLocation("/")} className="cursor-pointer">
            <Logo />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>New Upload</Button>
        </nav>

        <main className="p-8 max-w-5xl mx-auto w-full">
          <div className="mb-8 flex items-center gap-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold truncate max-w-md">{job.originalFilename}</h1>
              <p className="text-sm text-muted-foreground">Status: {job.status}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
                <h2 className="text-xl font-semibold">Generating Video Clips...</h2>
                <p className="text-muted-foreground">This usually takes about a minute.</p>
              </motion.div>
            )}

            {isCompleted && job.videoUrls && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
                  <video 
                    key={job.videoUrls[activeVideoIndex]}
                    src={job.videoUrls[activeVideoIndex]} 
                    controls 
                    className="w-full h-full"
                    autoPlay
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.videoUrls.map((url, idx) => (
                    <Button
                      key={idx}
                      variant={activeVideoIndex === idx ? "default" : "outline"}
                      className="h-auto p-4 justify-start gap-4 text-left rounded-2xl"
                      onClick={() => setActiveVideoIndex(idx)}
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", 
                        activeVideoIndex === idx ? "bg-primary-foreground/20" : "bg-primary/10")}>
                        <Play className="w-4 h-4" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-semibold">Clip #{idx + 1}</div>
                        <div className="text-xs opacity-70">Ready to watch</div>
                      </div>
                      <Download className="w-4 h-4 opacity-50" onClick={(e) => {
                        e.stopPropagation();
                        window.open(url, '_blank');
                      }} />
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <div className="w-[400px] border-l bg-card flex flex-col shrink-0">
        <ChatInterface />
      </div>
    </div>
  );
}
