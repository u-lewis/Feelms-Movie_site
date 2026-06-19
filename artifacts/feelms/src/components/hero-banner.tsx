import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Banner } from "@workspace/api-client-react";
import { Play, Info } from "lucide-react";
import { Link } from "wouter";

interface HeroBannerProps {
  banners: Banner[];
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const bannerList: Banner[] = Array.isArray(banners) ? banners : [];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    const interval = setInterval(() => emblaApi.scrollNext(), 8000);
    return () => {
      clearInterval(interval);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!bannerList.length) {
    return (
      <div className="w-full">
        <div className="w-full h-[88vh] min-h-[560px] bg-gradient-to-b from-black/20 to-background flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ── Carousel ── */}
      <div className="relative w-full h-[88vh] min-h-[560px] overflow-hidden">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {bannerList.map((banner, index) => (
              <div key={banner.id} className="relative flex-[0_0_100%] min-w-0 h-full">

                {/* Background image */}
                {banner.image && (
                  <div className="absolute inset-0">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover transition-transform duration-[8000ms] ease-out"
                      style={{ transform: selectedIndex === index ? "scale(1.04)" : "scale(1)" }}
                    />
                    {/* Cinematic gradients */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/52 to-black/10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-background to-transparent" />
                  </div>
                )}

                {/* Content */}
                <div className="absolute inset-0 flex items-end pb-16 md:pb-14">
                  <div className="w-full max-w-screen-xl mx-auto px-5 md:px-10">
                    <div className="max-w-xl">

                      {/* "Now Streaming" pill */}
                      <div
                        className="mb-4 inline-flex items-center gap-2"
                        style={{
                          opacity: selectedIndex === index ? 1 : 0,
                          transform: selectedIndex === index ? "translateY(0)" : "translateY(16px)",
                          transition: "all 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s",
                        }}
                      >
                        <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase text-primary/90">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          Now Streaming
                        </span>
                      </div>

                      {/* Title */}
                      <h1
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95] mb-4"
                        style={{
                          opacity: selectedIndex === index ? 1 : 0,
                          transform: selectedIndex === index ? "translateY(0)" : "translateY(24px)",
                          transition: "all 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s",
                        }}
                      >
                        {banner.title}
                      </h1>

                      {/* Subtitle */}
                      {banner.subtitle && (
                        <p
                          className="text-base md:text-lg text-white/60 mb-7 max-w-md leading-relaxed line-clamp-3"
                          style={{
                            opacity: selectedIndex === index ? 1 : 0,
                            transform: selectedIndex === index ? "translateY(0)" : "translateY(20px)",
                            transition: "all 0.6s cubic-bezier(0.22,1,0.36,1) 0.18s",
                          }}
                        >
                          {banner.subtitle}
                        </p>
                      )}

                      {/* CTA buttons */}
                      <div
                        className="flex items-center gap-3"
                        style={{
                          opacity: selectedIndex === index ? 1 : 0,
                          transform: selectedIndex === index ? "translateY(0)" : "translateY(20px)",
                          transition: "all 0.6s cubic-bezier(0.22,1,0.36,1) 0.26s",
                        }}
                      >
                        {banner.ctaLink && (
                          <Link href={banner.ctaLink}>
                            <button className="inline-flex items-center gap-2.5 h-11 px-7 bg-primary hover:bg-red-500 text-white font-semibold text-sm rounded-full transition-all duration-200 shadow-[0_4px_24px_hsl(0_84%_47%/0.35)] hover:shadow-[0_4px_32px_hsl(0_84%_47%/0.55)] hover:scale-[1.03] active:scale-95">
                              <Play className="w-4 h-4 fill-current" />
                              {banner.ctaText || "Watch Now"}
                            </button>
                          </Link>
                        )}

                        {banner.movieId && (
                          <Link href={`/movies/${banner.movieId}`}>
                            <button className="inline-flex items-center gap-2.5 h-11 px-6 bg-white/[0.1] hover:bg-white/[0.18] text-white font-medium text-sm rounded-full border border-white/[0.14] backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] active:scale-95">
                              <Info className="w-4 h-4" />
                              More Info
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Indicators — centered BELOW the carousel ── */}
      {bannerList.length > 1 && (
        <div className="flex items-center justify-center gap-2 py-4 relative z-10 bg-background">
          {bannerList.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Slide ${index + 1}`}
              className={`h-[3px] rounded-full transition-all duration-500 ease-out cursor-pointer ${
                index === selectedIndex
                  ? "w-8 bg-primary shadow-[0_0_8px_hsl(0_84%_47%/0.6)]"
                  : "w-5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
