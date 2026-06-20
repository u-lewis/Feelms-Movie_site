import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, Lock, AlertTriangle, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const { setToken, isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      setLocation("/admin");
    }
  }, [isAuthenticated, user, setLocation]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsPending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login", {
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
        sessionStorage.setItem("feelms_2fa_temp_token", data.tempToken);
        if (data.devCode) sessionStorage.setItem("feelms_2fa_dev_code", data.devCode);
        toast.info("2FA required — check your email for the code");
        setLocation("/2fa");
        return;
      }

      const role = data.user?.role;
      if (role !== "ADMIN") {
        setErrorMsg("Access denied — admin privileges required for this portal.");
        return;
      }

      setToken(data.token);
      toast.success("Admin access granted");
      setLocation("/admin");
    } catch {
      setErrorMsg("Authentication failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(222,47%,3%)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />
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
          <div className="text-xs font-mono text-primary/60 tracking-[0.3em] uppercase mb-1">
            Feelms System
          </div>
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
              <label className="text-white/60 text-xs font-mono uppercase tracking-wider block mb-2">
                Admin Email
              </label>
              <Input
                type="email"
                placeholder="admin@feelms.tv"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                className={`bg-black/60 border-white/10 focus-visible:ring-primary h-11 font-mono text-sm ${errorMsg ? "border-red-500/50" : ""}`}
                required
              />
            </div>
            <div>
              <label className="text-white/60 text-xs font-mono uppercase tracking-wider block mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                  className={`bg-black/60 border-white/10 focus-visible:ring-primary h-11 font-mono pr-11 ${errorMsg ? "border-red-500/50" : ""}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-2 font-mono tracking-wide"
              disabled={isPending}
            >
              {isPending ? "Authenticating…" : <><Lock className="w-4 h-4 mr-2" /> Authenticate</>}
            </Button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          <Link href="/forgot-password" className="text-xs text-primary/50 hover:text-primary transition-colors">
            Forgot password?
          </Link>
          <span className="text-white/10">|</span>
          <Link href="/login" className="text-xs text-white/20 hover:text-white/50 transition-colors">
            Regular sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
