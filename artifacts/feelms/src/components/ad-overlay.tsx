import { useEffect, useState, useRef } from "react";
import { useAdSystem } from "@/hooks/use-ad-system";
import { useGetAds, getGetAdsQueryKey, useRecordAdImpression, AdInputType } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { X, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AdOverlay() {
  const { activeAd, closeAd } = useAdSystem();
  const [countdown, setCountdown] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const recordImpression = useRecordAdImpression();
  const recordedRef = useRef(false);

  // Default to 15 seconds if ad doesn't specify
  const duration = 15;

  // In a real app we'd fetch the specific ad type
  const { data: ads } = useGetAds(
    { type: activeAd?.type },
    { 
      query: { 
        enabled: !!activeAd,
        queryKey: getGetAdsQueryKey({ type: activeAd?.type })
      } 
    }
  );

  const currentAd = ads?.[0]; // Just take first matching ad

  useEffect(() => {
    if (activeAd) {
      setCountdown(currentAd?.duration || duration);
      setCanSkip(false);
      recordedRef.current = false;
    }
  }, [activeAd, currentAd?.duration, duration]);

  useEffect(() => {
    if (!activeAd || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        // Allow skipping after 5 seconds of the ad (when countdown has gone down by 5)
        const totalDuration = currentAd?.duration || duration;
        if (totalDuration - next >= 5) {
          setCanSkip(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAd, countdown, currentAd?.duration, duration]);

  useEffect(() => {
    if (activeAd && currentAd && !recordedRef.current) {
      recordedRef.current = true;
      let context = "movie_play";
      if (activeAd.type === AdInputType.DOWNLOAD) context = "download";
      if (activeAd.type === AdInputType.TAB_RETURN) context = "tab_return";

      recordImpression.mutate({
        data: {
          adId: currentAd.id,
          context: context as any
        }
      });
    }
  }, [activeAd, currentAd, recordImpression]);

  useEffect(() => {
    if (countdown === 0 && activeAd) {
      closeAd();
    }
  }, [countdown, activeAd, closeAd]);

  if (!activeAd) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4"
        data-testid="ad-overlay"
      >
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <div className="text-sm font-medium text-muted-foreground bg-black/50 px-3 py-1.5 rounded-full border border-white/10">
            Ad · {countdown}s
          </div>
          {canSkip ? (
            <Button
              variant="outline"
              size="sm"
              onClick={closeAd}
              className="bg-black/50 border-white/20 hover:bg-white/10 text-white"
              data-testid="button-skip-ad"
            >
              Skip Ad <X className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="bg-black/50 border-white/10 text-white/50"
            >
              Skip in {Math.max(0, 5 - ((currentAd?.duration || duration) - countdown))}s
            </Button>
          )}
        </div>

        <div className="w-full max-w-3xl aspect-video bg-card border border-white/5 rounded-xl overflow-hidden relative flex flex-col items-center justify-center">
          {currentAd?.imageUrl ? (
            <img src={currentAd.imageUrl} alt={currentAd.title || "Advertisement"} className="absolute inset-0 w-full h-full object-cover" />
          ) : currentAd?.mediaUrl ? (
            <video src={currentAd.mediaUrl} autoPlay muted className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-4 p-8 text-center relative z-10">
              <PlayCircle className="w-16 h-16 text-primary opacity-50" />
              <h3 className="text-2xl font-bold text-white">{currentAd?.title || "Advertisement"}</h3>
              <p className="text-muted-foreground">Please wait while your content loads.</p>
            </div>
          )}
          
          {/* Gradient overlay to ensure text is readable if image is present */}
          {(currentAd?.imageUrl || currentAd?.mediaUrl) && currentAd?.title && (
            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-2xl font-bold text-white">{currentAd.title}</h3>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
