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
    <div className="py-2 group">
      <div className="container mx-auto px-4 md:px-8 mb-3 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{title}</h2>
        <div className="flex gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="h-7 w-7 rounded bg-white/5 hover:bg-white/15 hover:text-white text-white/50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="h-7 w-7 rounded bg-white/5 hover:bg-white/15 hover:text-white text-white/50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex pl-4 md:pl-8 -ml-1">
          {movies.map((movie) => (
            <div key={movie.id} className="flex-[0_0_120px] sm:flex-[0_0_140px] md:flex-[0_0_170px] lg:flex-[0_0_200px] min-w-0 pl-1 pr-1">
              <MovieCard movie={movie} />
            </div>
          ))}

          {viewMoreHref && (
            <div className="flex-[0_0_120px] sm:flex-[0_0_140px] md:flex-[0_0_170px] lg:flex-[0_0_200px] min-w-0 pl-1 pr-4 md:pr-8">
              <Link href={viewMoreHref}>
                <div className="aspect-[2/3] rounded bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 group/more">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover/more:bg-primary/20 transition-all duration-200">
                    <ChevronRight className="w-5 h-5 text-white/60 group-hover/more:text-primary transition-colors" />
                  </div>
                  <div className="text-center px-2">
                    <p className="text-[10px] font-bold text-white/60 group-hover/more:text-white tracking-widest uppercase transition-colors">See All</p>
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