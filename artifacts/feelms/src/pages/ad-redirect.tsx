import { useEffect, useState, useRef } from "react";
import { Download, Shield } from "lucide-react";

export default function AdRedirect() {
  const [countdown, setCountdown] = useState(3);
  const adsInitialized = useRef(false);
  const done = useRef(false);

  const params = new URLSearchParams(window.location.search);
  const url = params.get("url") ?? "";
  const title = params.get("title") ?? "your file";
  const returnUrl = params.get("return") ?? "/";

  useEffect(() => {
    if (countdown === 0 && !done.current) {
      done.current = true;
      window.open(url, "_blank");
      setTimeout(() => { window.location.href = returnUrl; }, 300);
      return undefined;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (adsInitialized.current) return;
    adsInitialized.current = true;
    try {
      const ads = (window as any).adsbygoogle ?? [];
      ads.push({});
      ads.push({});
    } catch (e) {}
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-white">
      {/* Top ad */}
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

        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (countdown / 3)}`}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold">{countdown}</span>
        </div>
        <p className="text-white/30 text-xs mb-6">Download starts in {countdown}s...</p>

        <div className="flex items-center justify-center gap-1.5 text-white/20 text-xs">
          <Shield className="w-3 h-3" />
          <span>Safe & verified download</span>
        </div>
      </div>

      {/* Bottom ad */}
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
