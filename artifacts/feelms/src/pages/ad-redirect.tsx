import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Download, Shield } from "lucide-react";

export default function AdRedirect() {
  const [countdown, setCountdown] = useState(5);
  const [, setLocation] = useLocation();
  
  const params = new URLSearchParams(window.location.search);
  const url = params.get("url");
  const title = params.get("title") ?? "your file";

  useEffect(() => {
    if (!url) { setLocation("/"); return; }
    if (countdown === 0) {
      window.location.href = url;
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, url]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-white">
      {/* Ad slot — top banner */}
      <div className="w-full max-w-2xl mb-8">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-1156637542202770"
          data-ad-slot="YOUR_BANNER_AD_SLOT"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
          <Download className="w-8 h-8 text-primary" />
        </div>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Preparing download</p>
        <h1 className="text-xl font-bold mb-6">{title}</h1>

        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (countdown / 5)}`}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold">{countdown}</span>
        </div>

        <p className="text-white/50 text-sm mb-4">Your download will start automatically</p>

        {countdown === 0 ? (
          <a href={url ?? "#"} className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-colors">
            <Download className="w-4 h-4" /> Download Now
          </a>
        ) : (
          <button disabled className="inline-flex items-center gap-2 bg-white/10 text-white/40 px-6 py-3 rounded-lg font-semibold cursor-not-allowed">
            Wait {countdown}s...
          </button>
        )}

        <div className="flex items-center justify-center gap-1.5 mt-6 text-white/20 text-xs">
          <Shield className="w-3 h-3" />
          <span>Safe & verified download</span>
        </div>
      </div>

      {/* Ad slot — bottom banner */}
      <div className="w-full max-w-2xl mt-8">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-1156637542202770"
          data-ad-slot="YOUR_BANNER_AD_SLOT"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
