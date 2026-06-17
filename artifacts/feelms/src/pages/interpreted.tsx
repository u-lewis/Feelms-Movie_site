import { useGetMovies } from "@workspace/api-client-react";
import { MovieCard } from "@/components/movie-card";
import { Languages, Loader2 } from "lucide-react";

export default function Interpreted() {
  const { data: movies, isLoading } = useGetMovies({ interpreted: true } as any);

  const interpreted = (movies ?? []).filter((m: any) => m.interpreted);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Languages className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Interpreted</h1>
        </div>
        <p className="text-white/50 text-sm">
          Movies with sign-language or spoken interpretation — look for the{" "}
          <span className="inline-flex items-center gap-1 text-primary font-medium">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
            bookmark
          </span>{" "}
          icon on each card.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-white/40 gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading interpreted titles…
        </div>
      ) : interpreted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Languages className="w-14 h-14 text-white/15 mb-4" />
          <p className="text-white/50 text-lg font-semibold">No interpreted titles yet</p>
          <p className="text-white/30 text-sm mt-1">
            Ask an admin to mark movies as interpreted in the dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {interpreted.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
