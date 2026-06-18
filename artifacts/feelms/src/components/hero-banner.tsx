import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Banner } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, ThumbsUp, Plus } from "lucide-react";
import { Link } from "wouter";

interface HeroBannerProps {
  banners: Banner[];
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    if (thumbApi) thumbApi.scrollTo(index);
  }, [emblaApi, thumbApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    
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
      <div className="w-full h-[75vh] min-h-[600px] bg-black animate-pulse flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[75vh] min-h-[600px] overflow-hidden bg-black group">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {banners.map((banner, index) => {
            const isActive = selectedIndex === index;
            // Generate deterministic mock data based on banner.id
            const ratingScore = 80 + ((banner.id * 7) % 20);
            const year = 2020 + ((banner.id * 3) % 5);
            
            return (
              <div key={banner.id} className="relative flex-[0_0_100%] min-w-0 h-full">
                {banner.image && (
                  <div className="absolute inset-0">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent w-full md:w-3/4" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
                  </div>
                )}
                
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4 md:px-8">
                    <div className="max-w-[45%] min-w-[300px]">
                      
                      <div className="mb-4 flex"
                           style={{
                             transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                             opacity: isActive ? 1 : 0,
                             transition: 'all 0.5s cubic-bezier(0, 0, 0.2, 1) 0.1s'
                           }}
                      >
                        <div className="bg-primary text-black font-black flex flex-col items-center justify-center p-1.5 leading-none shadow-[0_0_15px_rgba(229,9,20,0.5)]">
                          <span className="text-[10px] tracking-widest">TOP</span>
                          <span className="text-lg">10</span>
                        </div>
                      </div>

                      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-bold text-white mb-4 drop-shadow-lg tracking-tighter leading-[0.9]"
                          style={{
                            transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                            opacity: isActive ? 1 : 0,
                            transition: 'all 0.5s cubic-bezier(0, 0, 0.2, 1) 0.2s'
                          }}
                      >
                        {banner.title}
                      </h1>
                      
                      <div className="flex items-center gap-3 text-white/80 text-xs font-bold tracking-widest uppercase mb-4"
                           style={{
                             transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                             opacity: isActive ? 1 : 0,
                             transition: 'all 0.5s cubic-bezier(0, 0, 0.2, 1) 0.3s'
                           }}
                      >
                        <span className="text-green-400 flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {ratingScore}% Match</span>
                        <span>{year}</span>
                        <span className="border border-white/20 px-1 py-0.5 rounded-sm">18+</span>
                        <span>Action</span>
                      </div>

                      {banner.subtitle && (
                        <p className="text-sm md:text-base text-white/60 mb-6 max-w-lg drop-shadow-md line-clamp-2"
                           style={{
                             transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                             opacity: isActive ? 1 : 0,
                             transition: 'all 0.5s cubic-bezier(0, 0, 0.2, 1) 0.4s'
                           }}
                        >
                          {banner.subtitle}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mb-8"
                           style={{
                             transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                             opacity: isActive ? 1 : 0,
                             transition: 'all 0.5s cubic-bezier(0, 0, 0.2, 1) 0.5s'
                           }}
                      >
                        <span className="text-xs text-white/40 font-bold tracking-widest uppercase">Starring:</span>
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-black flex items-center justify-center">
                              <span className="text-white/30 text-[10px]">{i}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3"
                           style={{
                             transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                             opacity: isActive ? 1 : 0,
                             transition: 'all 0.5s cubic-bezier(0, 0, 0.2, 1) 0.6s'
                           }}
                      >
                        {banner.ctaLink ? (
                          <Button asChild className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded">
                            <Link href={banner.ctaLink}>
                              <Play className="w-4 h-4 mr-2" fill="currentColor" />
                              Play Now
                            </Link>
                          </Button>
                        ) : (
                          <Button className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded">
                            <Play className="w-4 h-4 mr-2" fill="currentColor" />
                            Play Now
                          </Button>
                        )}
                        
                        <Button asChild variant="outline" className="h-10 px-6 bg-black/40 border-white/20 hover:bg-white/10 text-white rounded font-bold tracking-wide">
                          <Link href="/profile">
                            <Plus className="w-4 h-4 mr-2" />
                            My Wishlist
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
        onClick={scrollPrev}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
        onClick={scrollNext}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      <div className="absolute bottom-6 right-8 max-w-[50%] hidden md:block z-20">
        <div className="overflow-hidden" ref={thumbRef}>
          <div className="flex gap-3">
            {banners.map((banner, index) => (
              <div 
                key={banner.id} 
                className={`relative flex-[0_0_120px] aspect-video rounded cursor-pointer overflow-hidden border-2 transition-all duration-300 ${index === selectedIndex ? 'border-primary' : 'border-transparent opacity-50 hover:opacity-100'}`}
                onClick={() => emblaApi?.scrollTo(index)}
              >
                <img src={banner.image ?? undefined} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-end p-2">
                  <span className="text-[10px] text-white font-bold truncate">{banner.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 md:hidden">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === selectedIndex ? "w-4 bg-primary" : "bg-white/30"
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}