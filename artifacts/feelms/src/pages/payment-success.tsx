import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Crown, Check, Sparkles, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const { isVip, user } = useAuth();
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setLocation("/movies");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [setLocation]);

  const perks = [
    "Unlimited VIP exclusive movies",
    "100% ad-free experience",
    "4K quality streaming",
    "Offline downloads",
    "Early access to new releases",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-vip/5 via-background to-background" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vip/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Crown animation */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-vip/10 border-2 border-vip/40 mb-6 shadow-2xl shadow-vip/20"
        >
          <Crown className="w-12 h-12 text-vip" fill="currentColor" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-vip" />
            <span className="text-xs font-mono text-vip/80 tracking-widest uppercase">Payment Confirmed</span>
            <Sparkles className="w-4 h-4 text-vip" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Welcome to VIP,{" "}
            <span className="text-vip">{user?.username || "Member"}</span>!
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Your subscription is now active. Enjoy the full Feelms experience.
          </p>
        </motion.div>

        {/* Perks list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card/40 border border-vip/20 rounded-2xl p-6 mb-8 text-left backdrop-blur-sm"
        >
          <ul className="space-y-3">
            {perks.map((perk, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="flex items-center gap-3 text-white/80"
              >
                <div className="w-5 h-5 rounded-full bg-vip/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-vip" />
                </div>
                {perk}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            asChild
            size="lg"
            className="bg-vip hover:bg-vip/90 text-vip-foreground font-semibold px-8"
          >
            <Link href="/movies">
              Browse VIP Movies <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
          >
            <Link href="/profile">My Profile</Link>
          </Button>
        </motion.div>

        <p className="text-xs text-white/20 mt-6">
          Auto-redirecting to browse in {countdown}s…
        </p>
      </div>
    </div>
  );
}
