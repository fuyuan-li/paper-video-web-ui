import { Sparkles } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 group cursor-pointer select-none">
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent shadow-lg shadow-primary/25 transition-transform group-hover:scale-105 duration-300">
        <Sparkles className="w-5 h-5 text-white" />
        <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <span className="text-xl font-bold font-display tracking-tight text-foreground">
        PDF<span className="text-primary">Motion</span>
      </span>
    </div>
  );
}
