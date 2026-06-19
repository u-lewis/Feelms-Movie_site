import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Movie } from "@workspace/api-client-react";
import { MovieCard } from "./movie-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  viewMoreHref?: string;
}

export function MovieRow({ title, movies, viewMoreHref }: MovieRowProps) {
  const movieList: Movie[] = Array.isArray(movies) ? movies : [];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

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

  if (!movieList.length) return null;

  return (
    <div
      className="py-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section header */}
      <div className="max-w-screen-xl mx-auto px-5 md:px-10 mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Red accent bar */}
          <div className="w-[3px] h-5 bg-primary rounded-full shrink-0" />
          <h2 className="text-base md:text-lg font-bold text-white tracking-tight">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Arrow controls — appear on hover */}
          <div
            className="flex items-center gap-1 transition-all duration-200"
            style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? "translateX(0)" : "translateX(6px)" }}
          >
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* See all link */}
          {viewMoreHref && (
            <Link
              href={viewMoreHref}
              className="text-xs font-medium text-white/35 hover:text-primary transition-colors duration-200 ml-1"
            >
              See all →
            </Link>
          )}
        </div>
      </div>

      {/* Scroll strip with edge fades */}
      <div className="relative">
        {/* Left edge fade */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        {/* Right edge fade */}
        <div className="absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex pl-5 md:pl-10 gap-0">
            {movieList.map((movie) => (
              <div
                key={movie.id}
                className="flex-[0_0_140px] sm:flex-[0_0_158px] md:flex-[0_0_175px] lg:flex-[0_0_192px] min-w-0 pr-3"
              >
                <MovieCard movie={movie} />
              </div>
            ))}

            {/* End spacer */}
            <div className="flex-[0_0_20px] md:flex-[0_0_30px] shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
