import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Login() {
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
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
        setErrorMsg(data.error || "Invalid email or password. Please try again.");
        return;
      }

      if (data.requires2FA) {
        sessionStorage.setItem("feelms_2fa_temp_token", data.tempToken);
        if (data.devCode) sessionStorage.setItem("feelms_2fa_dev_code", data.devCode);
        toast.info("2FA verification required");
        setLocation("/2fa");
        return;
      }

      setToken(data.token);
      toast.success("Welcome back!");
      setLocation("/");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <Link href="/" className="text-4xl font-bold text-primary tracking-tighter inline-block mb-2">
            FEELMS
          </Link>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Sign In</h1>
          <p className="text-muted-foreground mt-2">Enter your credentials to access your account</p>
        </div>

        <div className="bg-card/50 border border-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
          {errorMsg && (
            <div className="flex items-start gap-3 bg-red-500/15 border border-red-500/40 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300 font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="text-white/80 text-sm font-medium block mb-2">Email</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                className={`bg-black/40 border-white/10 focus-visible:ring-primary h-12 ${errorMsg ? "border-red-500/50" : ""}`}
                data-testid="input-email"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-white/80 text-sm font-medium">Password</label>
                <Link href="/forgot-password" className="text-primary/80 hover:text-primary text-sm">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                  className={`bg-black/40 border-white/10 focus-visible:ring-primary h-12 pr-12 ${errorMsg ? "border-red-500/50" : ""}`}
                  data-testid="input-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isPending}
              data-testid="button-submit-login"
            >
              {isPending ? "Signing in…" : <><LogIn className="w-5 h-5 mr-2" /> Sign In</>}
            </Button>
          </form>
        </div>

        <p className="text-center mt-8 text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
