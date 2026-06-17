import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AppSplashProps {
  onDone: () => void;
}

export function AppSplash({ onDone }: AppSplashProps) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Animate progress bar
    const targets = [20, 55, 80, 100];
    const delays = [200, 350, 400, 300];
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;

    function step() {
      if (i >= targets.length) {
        // Hold briefly at 100% then exit
        timeout = setTimeout(() => {
          setLeaving(true);
          setTimeout(onDone, 600);
        }, 300);
        return;
      }
      timeout = setTimeout(() => {
        setProgress(targets[i++]);
        step();
      }, delays[i] ?? 300);
    }
    step();
    return () => clearTimeout(timeout);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!leaving ? (
        <motion.div
          key="app-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[hsl(222,47%,3%)] overflow-hidden"
        >
          {/* Ambient radial glow behind logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mb-12 drop-shadow-[0_0_40px_rgba(30,215,182,0.6)]"
          >
            <img
              src="/logo.png"
              alt="Feelms"
              className="w-36 h-36 object-contain"
            />
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative z-10 w-48"
          >
            <div className="h-[2px] bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full origin-left"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
