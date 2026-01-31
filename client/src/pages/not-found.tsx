import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-transparent animate-slide-up">
      <div className="glass-card rounded-[2.5rem] p-12 border-white/10 shadow-3xl max-w-lg mx-4 text-center relative overflow-hidden backdrop-blur-2xl">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="flex flex-col items-center gap-6">
          <div className="rounded-2xl bg-rose-500/10 p-4 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
            <AlertCircle className="h-12 w-12 text-rose-500" />
          </div>

          <div>
            <h1 className="text-5xl font-black tracking-tighter text-gradient mb-4">404</h1>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Page Not Found</h2>
            <p className="text-slate-400 font-medium">
              We couldn't find the page you're looking for. It might have been moved or doesn't exist.
            </p>
          </div>

          <Link href="/">
            <Button className="mt-4 bg-gradient-purple-cyan hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] border-none transition-all duration-300 rounded-xl px-8 h-12 font-bold flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
