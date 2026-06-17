import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle, Copy } from "lucide-react";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsPending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to request reset");
        return;
      }
      if (data.resetToken) {
        setResetToken(data.resetToken);
      } else {
        toast.success("If that email exists, a reset link has been sent.");
        setTimeout(() => setLocation("/login"), 2000);
      }
    } catch {
      toast.error("Request failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const copyToken = () => {
    if (!resetToken) return;
    navigator.clipboard.writeText(resetToken).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <Link href="/" className="text-4xl font-bold text-primary tracking-tighter inline-block mb-2">
            FEELMS
          </Link>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Account Recovery</h1>
          <p className="text-muted-foreground mt-2">Enter your email to receive a password reset link</p>
        </div>

        <div className="bg-card/50 border border-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
          {resetToken ? (
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Reset Token Generated</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    In production this would be emailed. For now, copy the token below.
                  </p>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40 font-mono uppercase tracking-wider">Reset Token</span>
                  <button
                    onClick={copyToken}
                    className="text-primary/60 hover:text-primary text-xs flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-xs font-mono text-white/70 break-all leading-relaxed">{resetToken}</p>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setLocation(`/reset-password?token=${resetToken}`)}
              >
                Continue to Reset Password
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-white/80 text-sm font-medium block mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                {isPending ? "Sending…" : "Send Reset Link"}
              </Button>
            </form>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
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
