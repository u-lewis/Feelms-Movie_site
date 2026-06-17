import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Movie } from "@workspace/api-client-react";
import { MovieCard } from "./movie-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "wouter";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  viewMoreHref?: string;
}

export function MovieRow({ title, movies, viewMoreHref }: MovieRowProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [isRowHovered, setIsRowHovered] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!movies?.length) return null;

  return (
    <div
      className="py-2"
      onMouseEnter={() => setIsRowHovered(true)}
      onMouseLeave={() => setIsRowHovered(false)}
    >
      <div className="container mx-auto px-4 md:px-8 mb-4 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">{title}</h2>
        <div className={`flex gap-2 transition-opacity duration-200 ${isRowHovered ? "opacity-100" : "opacity-0"}`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex pl-4 md:pl-8 -ml-2">
          {movies.map((movie) => (
            <div key={movie.id} className="flex-[0_0_160px] md:flex-[0_0_200px] lg:flex-[0_0_240px] min-w-0 pl-2 pr-2">
              <MovieCard movie={movie} />
            </div>
          ))}

          {viewMoreHref && (
            <div className="flex-[0_0_160px] md:flex-[0_0_200px] lg:flex-[0_0_240px] min-w-0 pl-2 pr-4 md:pr-8">
              <Link href={viewMoreHref}>
                <div className="aspect-[2/3] rounded-xl bg-white/3 border border-dashed border-white/15 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 group">
                  <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center group-hover:bg-primary/30 group-hover:border-primary/50 transition-all duration-200">
                    <ChevronRight className="w-6 h-6 text-primary group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-center px-2">
                    <p className="text-[11px] font-bold text-primary/80 group-hover:text-primary tracking-widest uppercase transition-colors">Load More</p>
                    <p className="text-[10px] text-white/30 mt-0.5">See all →</p>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
