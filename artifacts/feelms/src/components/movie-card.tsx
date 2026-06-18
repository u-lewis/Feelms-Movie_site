import { Link } from "wouter";
import { Movie } from "@workspace/api-client-react";
import { Star, Bookmark } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export function MovieCard({ movie, className = "" }: MovieCardProps) {
  const interpreterNames = (movie as any).interpreters as string[] | undefined;
  const interpreterLabel = interpreterNames && interpreterNames.length > 0
    ? interpreterNames.join(", ")
    : "Interpreted";

  return (
    <Link href={`/movies/${movie.id}`}>
      <div
        className={`group/card relative rounded overflow-hidden bg-card border border-white/5 aspect-[2/3] cursor-pointer isolate transition-all duration-300 ease-out hover:scale-[1.04] hover:z-10 hover:shadow-[0_10px_30px_rgba(229,9,20,0.15)] ${className}`}
        data-testid={`movie-card-${movie.id}`}
      >
        {movie.poster && (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover transition-all duration-300 group-hover/card:brightness-75"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        )}

        <div className={`absolute inset-0 flex items-center justify-center bg-card/80 p-4 text-center ${movie.poster ? "hidden" : ""}`}>
          <span className="font-bold text-white/80">{movie.title}</span>
        </div>

        {(movie as any).interpreted && (
          <div className="absolute top-0 left-0 z-20 pointer-events-none">
            <span className="flex items-center gap-1 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-br shadow-lg whitespace-nowrap tracking-wide">
              <Bookmark className="w-2.5 h-2.5 shrink-0" fill="currentColor" />
              {interpreterLabel}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-3 opacity-0 group-hover/card:opacity-100 transition-all duration-300 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none group-hover/card:pointer-events-auto transform translate-y-2 group-hover/card:translate-y-0">
          <h3 className="text-white font-bold text-sm truncate leading-tight tracking-tight">{movie.title}</h3>
          
          <div className="flex items-center gap-2 text-[11px] text-white/60 mt-1 font-medium">
            {movie.year && <span>{movie.year}</span>}
            {movie.rating && (
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-primary" fill="currentColor" />
                {movie.rating.toFixed(1)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {movie.genres?.slice(0, 2).map((g) => (
              <span key={g} className="text-[9px] font-bold px-1.5 py-0.5 bg-white/10 rounded-sm text-white/80 uppercase tracking-widest">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}