import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Banner } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react";
import { Link } from "wouter";

interface HeroBannerProps {
  banners: Banner[];
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    
    // Autoplay
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 8000);
    
    return () => {
      clearInterval(interval);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!banners?.length) {
    return (
      <div className="w-full h-[60vh] bg-card/50 animate-pulse flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden group">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {banners.map((banner, index) => (
            <div key={banner.id} className="relative flex-[0_0_100%] min-w-0 h-full">
              {banner.image && (
                <div className="absolute inset-0">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                </div>
              )}
              
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4 md:px-8">
                  <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg tracking-tighter"
                        style={{
                          transform: selectedIndex === index ? 'translateY(0)' : 'translateY(20px)',
                          opacity: selectedIndex === index ? 1 : 0,
                          transition: 'all 0.5s cubic-bezier(0, 0, 0.2, 1) 0.1s'
                        }}
                    >
                      {banner.title}
                    </h1>
                    
                    {banner.subtitle && (
                      <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl drop-shadow-md"
                         style={{
                           transform: selectedIndex === index ? 'translateY(0)' : 'translateY(20px)',
                           opacity: selectedIndex === index ? 1 : 0,
                           transition: 'all 0.5s cubic-bezier(0, 0, 0.2, 1) 0.2s'
                         }}
                      >
                        {banner.subtitle}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4"
                         style={{
                           transform: selectedIndex === index ? 'translateY(0)' : 'translateY(20px)',
                           opacity: selectedIndex === index ? 1 : 0,
                           transition: 'all 0.5s cubic-bezier(0, 0, 0.2, 1) 0.3s'
                         }}
                    >
                      {banner.ctaLink ? (
                        <Button asChild size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md">
                          <Link href={banner.ctaLink}>
                            <Play className="w-5 h-5 mr-2" fill="currentColor" />
                            {banner.ctaText || "Watch Now"}
                          </Link>
                        </Button>
                      ) : null}
                      
                      {banner.movieId ? (
                        <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base bg-black/40 border-white/20 hover:bg-white/10 text-white rounded-md backdrop-blur-md">
                          <Link href={`/movies/${banner.movieId}`}>
                            <Info className="w-5 h-5 mr-2" />
                            More Info
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/10"
        onClick={scrollPrev}
      >
        <ChevronLeft className="w-8 h-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/10"
        onClick={scrollNext}
      >
        <ChevronRight className="w-8 h-8" />
      </Button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex ? "w-6 bg-primary" : "bg-white/30 hover:bg-white/50"
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
