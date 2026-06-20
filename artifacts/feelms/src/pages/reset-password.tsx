import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const [location, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!token) {
      toast.error("Reset token is missing");
      return;
    }
    setIsPending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Reset failed");
        return;
      }
      setDone(true);
    } catch {
      toast.error("Reset failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <Link href="/" className="text-4xl font-bold text-primary tracking-tighter inline-block mb-2">
            FEELMS
          </Link>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground mt-2">Choose a new secure password for your account</p>
        </div>

        <div className="bg-card/50 border border-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
          {done ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Password Reset!</h3>
                <p className="text-muted-foreground text-sm mt-1">Your password has been updated successfully.</p>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
                onClick={() => setLocation("/login")}
              >
                Sign In Now
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {!token && (
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-2">Reset Token</label>
                  <Input
                    placeholder="Paste your reset token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="bg-black/40 border-white/10 focus-visible:ring-primary h-12 font-mono text-xs"
                  />
                </div>
              )}
              <div>
                <label className="text-white/80 text-sm font-medium block mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-black/40 border-white/10 focus-visible:ring-primary h-12 pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-white/80 text-sm font-medium block mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-black/40 border-white/10 focus-visible:ring-primary h-12 pl-10"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isPending}
              >
                {isPending ? "Resetting…" : "Reset Password"}
              </Button>
            </form>
          )}
        </div>

        <div className="flex items-center justify-center mt-6">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-white">
            <Link href="/login">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Sign In
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
