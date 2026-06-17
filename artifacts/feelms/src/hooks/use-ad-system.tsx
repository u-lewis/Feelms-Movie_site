import { useEffect, useState, useCallback } from "react";
import { useRecordAdImpression, useGetAds, getGetAdsQueryKey } from "@workspace/api-client-react";
import { AdInputType } from "@workspace/api-client-react";

export function useAdSystem() {
  const [activeAd, setActiveAd] = useState<{ type: string; movieId?: number } | null>(null);
  const [lastTabReturnAdTime, setLastTabReturnAdTime] = useState<number>(0);
  
  const recordImpression = useRecordAdImpression();

  const showPrerollAd = useCallback((movieId: number) => {
    setActiveAd({ type: AdInputType.PREROLL, movieId });
  }, []);

  const showDownloadAd = useCallback((movieId: number) => {
    setActiveAd({ type: AdInputType.DOWNLOAD, movieId });
  }, []);

  const checkTabReturnAd = useCallback(() => {
    const now = Date.now();
    if (now - lastTabReturnAdTime > 90 * 1000) {
      setActiveAd({ type: AdInputType.TAB_RETURN });
      setLastTabReturnAdTime(now);
    }
  }, [lastTabReturnAdTime]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkTabReturnAd();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [checkTabReturnAd]);

  const closeAd = useCallback(() => {
    setActiveAd(null);
  }, []);

  return {
    activeAd,
    showPrerollAd,
    showDownloadAd,
    checkTabReturnAd,
    closeAd
  };
}
