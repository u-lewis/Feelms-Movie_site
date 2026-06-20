import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Shield, KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function TwoFAPage() {
  const [, setLocation] = useLocation();
  const { setToken } = useAdminAuth();
  const [code, setCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const devCode = sessionStorage.getItem("admin_2fa_dev_code") ?? "";

  useEffect(() => {
    if (!sessionStorage.getItem("admin_2fa_temp_token")) {
      setLocation("/login");
    }
  }, [setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { toast.error("Please enter the 6-digit code"); return; }

    setIsPending(true);
    try {
      const tempToken = sessionStorage.getItem("admin_2fa_temp_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/2fa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tempToken}` },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) { toast.error(data.error || "Verification failed"); return; }

      sessionStorage.removeItem("admin_2fa_temp_token");
      sessionStorage.removeItem("admin_2fa_dev_code");
      setToken(data.token);
      toast.success("Identity verified — welcome, Admin");
      setLocation("/");
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(222,47%,3%)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="text-xs font-mono text-primary/60 tracking-[0.3em] uppercase mb-1">Step 2 of 2</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Two-Factor Verification</h1>
          <p className="text-sm text-white/40 mt-1">Enter the 6-digit code sent to your email</p>
        </div>

        <div className="bg-[hsl(222,47%,6%)] border border-primary/10 p-8 rounded-2xl shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/60 text-xs font-mono uppercase tracking-wider block mb-2">Verification Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full h-14 rounded-lg bg-black/60 border border-white/10 text-white text-2xl text-center font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
            </div>

            {devCode && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400/70 font-mono uppercase tracking-wider">Dev hint — your code:</span>
                  <button type="button" onClick={() => setShowHint(!showHint)} className="text-amber-400/50 hover:text-amber-400 transition-colors">
                    {showHint ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {showHint && (
                  <p className="text-amber-300 font-mono text-lg font-bold tracking-[0.4em] mt-1 cursor-pointer" onClick={() => setCode(devCode)}>
                    {devCode}
                  </p>
                )}
              </div>
            )}

            <button type="submit" disabled={isPending || code.length !== 6}
              className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold font-mono tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
              {isPending ? "Verifying…" : <><KeyRound className="w-4 h-4" /> Verify Identity</>}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-white/20">
          Code expires in 10 minutes.{" "}
          <button className="text-primary/60 hover:text-primary transition-colors"
            onClick={() => { sessionStorage.removeItem("admin_2fa_temp_token"); sessionStorage.removeItem("admin_2fa_dev_code"); setLocation("/login"); }}>
            Start over
          </button>
        </p>
      </div>
    </div>
  );
}
