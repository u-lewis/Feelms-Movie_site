import { Link, useLocation } from "wouter";
import { Movie } from "@workspace/api-client-react";
import { Star, Download, Bookmark } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export function MovieCard({ movie, className = "" }: MovieCardProps) {
  const [, setLocation] = useLocation();

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocation(`/movies/${movie.id}`);
  };

  const interpreterNames = (movie as any).interpreters as string[] | undefined;
  const interpreterLabel = interpreterNames && interpreterNames.length > 0
    ? interpreterNames.join(", ")
    : "Interpreted";

  return (
    <Link href={`/movies/${movie.id}`}>
      <div
        className={`group/card relative rounded-xl overflow-hidden bg-card aspect-[2/3] cursor-pointer isolate
          transition-all duration-300 ease-out
          hover:scale-[1.05] hover:z-10
          hover:shadow-[0_24px_60px_rgba(0,0,0,0.85)]
          hover:ring-1 hover:ring-primary/40
          ${className}`}
        data-testid={`movie-card-${movie.id}`}
      >
        {/* Poster */}
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover transition-all duration-500 group-hover/card:scale-[1.06] group-hover/card:brightness-75"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}

        {/* Fallback (no poster) */}
        <div className={`absolute inset-0 flex items-center justify-center bg-card/90 p-4 text-center ${movie.poster ? "hidden" : ""}`}>
          <span className="font-bold text-white/70 text-sm leading-tight">{movie.title}</span>
        </div>

        {/* Rating badge — always visible, top-right */}
        {movie.rating && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 bg-black/65 backdrop-blur-sm rounded-md px-1.5 py-0.5 pointer-events-none">
            <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-semibold text-white/90">{movie.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Interpreted badge — top-left */}
        {(movie as any).interpreted && (
          <div className="absolute top-0 left-0 z-10 pointer-events-none">
            <span className="flex items-center gap-1 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg shadow-lg whitespace-nowrap tracking-wide">
              <Bookmark className="w-2 h-2 shrink-0" fill="currentColor" />
              {interpreterLabel}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-250 bg-gradient-to-t from-black/98 via-black/60 to-transparent pointer-events-none group-hover/card:pointer-events-auto">
          <div
            className="transition-transform duration-300 translate-y-2 group-hover/card:translate-y-0"
          >
            {/* Title */}
            <h3 className="text-white font-bold text-sm leading-tight truncate mb-1">{movie.title}</h3>

            {/* Year + genres row */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                {movie.year && (
                  <span className="text-[11px] text-white/45 shrink-0">{movie.year}</span>
                )}
                {movie.genres && movie.genres.length > 0 && (
                  <>
                    <span className="text-white/20 text-[10px]">·</span>
                    <span className="text-[11px] text-white/45 truncate">
                      {movie.genres.slice(0, 2).join(", ")}
                    </span>
                  </>
                )}
              </div>

              {/* Download shortcut */}
              <button
                onClick={handleDownload}
                className="shrink-0 p-1.5 rounded-full bg-white/10 hover:bg-primary/80 text-white/60 hover:text-white transition-all duration-150"
                title="More info / Download"
                aria-label="Download"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
