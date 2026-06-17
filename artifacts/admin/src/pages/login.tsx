import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Shield, Lock, AlertTriangle, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { setToken, isAuthenticated } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Invalid credentials. Access denied.");
        return;
      }

      if (data.requires2FA) {
        sessionStorage.setItem("admin_2fa_temp_token", data.tempToken);
        if (data.devCode) sessionStorage.setItem("admin_2fa_dev_code", data.devCode);
        setLocation("/2fa");
        return;
      }

      if (data.user?.role !== "ADMIN") {
        setErrorMsg("Access denied — admin privileges required.");
        return;
      }

      setToken(data.token);
      setLocation("/");
    } catch {
      setErrorMsg("Authentication failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(222,47%,3%)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/40" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/40" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/40" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/40" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="text-xs font-mono text-primary/60 tracking-[0.3em] uppercase mb-1">Feelms System</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-sm text-white/40 mt-1">Restricted access — authorised personnel only</p>
        </div>

        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2.5 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs text-amber-300/80">All access attempts are logged and monitored</span>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-3 bg-red-500/15 border border-red-500/40 rounded-xl px-4 py-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300 font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="bg-[hsl(222,47%,6%)] border border-primary/10 p-8 rounded-2xl shadow-2xl shadow-black/50">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-white/60 text-xs font-mono uppercase tracking-wider block mb-2">Admin Email</label>
              <input
                type="email"
                placeholder="admin@feelms.tv"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                className="w-full px-3 h-11 rounded-lg bg-black/60 border border-white/10 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                required
              />
            </div>
            <div>
              <label className="text-white/60 text-xs font-mono uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                  className="w-full px-3 pr-11 h-11 rounded-lg bg-black/60 border border-white/10 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isPending}
              className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold font-mono tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 transition-colors mt-2">
              {isPending ? "Authenticating…" : <><Lock className="w-4 h-4" /> Authenticate</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
