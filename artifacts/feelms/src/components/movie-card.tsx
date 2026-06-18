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
        className={`group/card relative rounded-md overflow-hidden bg-card border border-white/5 aspect-[2/3] cursor-pointer shadow-lg isolate transition-all duration-300 ease-out hover:scale-[1.03] hover:z-10 hover:shadow-2xl ${className}`}
        data-testid={`movie-card-${movie.id}`}
      >
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover transition-all duration-300 group-hover/card:opacity-60"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}

        <div className={`absolute inset-0 flex items-center justify-center bg-card/80 p-4 text-center ${movie.poster ? "hidden" : ""}`}>
          <span className="font-bold text-white/80">{movie.title}</span>
        </div>

        {/* Interpreted badge — always visible pill with interpreter name */}
        {(movie as any).interpreted && (
          <div className="absolute top-0 left-0 z-20 pointer-events-none">
            <span className="flex items-center gap-1 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-br-md shadow-lg whitespace-nowrap">
              <Bookmark className="w-2.5 h-2.5 shrink-0" fill="currentColor" />
              {interpreterLabel}
            </span>
          </div>
        )}

        {/* Hover overlay — scoped to this card only via group/card */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover/card:opacity-100 transition-all duration-300 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none group-hover/card:pointer-events-auto">
          <div className="transform translate-y-3 group-hover/card:translate-y-0 transition-all duration-300">
            <h3 className="text-white font-bold text-sm truncate leading-tight">{movie.title}</h3>
            <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
              {movie.year && <span>{movie.year}</span>}
              {movie.rating && (
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                  {movie.rating.toFixed(1)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-1 flex-wrap">
                {movie.genres?.slice(0, 2).map((g) => (
                  <span key={g} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded-sm text-white/70">
                    {g}
                  </span>
                ))}
              </div>
              {/* Download button */}
              <button
                onClick={handleDownload}
                className="ml-1 p-1.5 rounded-full bg-white/10 hover:bg-primary/80 text-white/80 hover:text-white transition-colors shrink-0"
                title="Download"
                aria-label="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
