import { useParams } from "wouter";
import { useGetMovies } from "@workspace/api-client-react";
import { MovieCard } from "@/components/movie-card";
import { useEffect, useMemo } from "react";
import { Link } from "wouter";
import {
  Swords, Rocket, BookOpen, Ghost, Laugh, Sparkles, Heart, Flame, Zap,
  Film, Globe, Skull, Users, ChevronRight,
} from "lucide-react";

const GENRE_META: Record<string, { label: string; description: string; icon: React.ElementType; color: string }> = {
  action:    { label: "Action",    description: "Heart-pounding action films packed with thrills and stunts.",   icon: Swords,   color: "text-red-400" },
  adventure: { label: "Adventure", description: "Epic journeys and exploration across incredible worlds.",         icon: Globe,    color: "text-green-400" },
  animation: { label: "Animation", description: "Animated features for all ages from around the globe.",          icon: Sparkles, color: "text-pink-400" },
  anime:     { label: "Anime",     description: "Japanese animation spanning every genre and style.",             icon: Zap,      color: "text-yellow-400" },
  comedy:    { label: "Comedy",    description: "Laugh out loud with the best comedies on Feelms.",              icon: Laugh,    color: "text-amber-400" },
  crime:     { label: "Crime",     description: "Dark and gripping crime dramas and heist films.",               icon: Skull,    color: "text-orange-400" },
  drama:     { label: "Drama",     description: "Powerful stories of the human experience.",                     icon: BookOpen, color: "text-blue-400" },
  fantasy:   { label: "Fantasy",   description: "Magical worlds, mythical creatures and epic quests.",           icon: Sparkles, color: "text-violet-400" },
  horror:    { label: "Horror",    description: "Terrifying horror films that will keep you up at night.",       icon: Ghost,    color: "text-purple-400" },
  mystery:   { label: "Mystery",   description: "Whodunits and psychological thrillers to keep you guessing.",  icon: Ghost,    color: "text-indigo-400" },
  romance:   { label: "Romance",   description: "Love stories that will warm your heart.",                       icon: Heart,    color: "text-rose-400" },
  "sci-fi":  { label: "Sci-Fi",   description: "Science fiction visions of the future and beyond.",             icon: Rocket,   color: "text-cyan-400" },
  thriller:  { label: "Thriller",  description: "Edge-of-your-seat suspense and psychological thrills.",        icon: Flame,    color: "text-orange-400" },
  family:    { label: "Family",    description: "Wholesome films the whole family can enjoy together.",          icon: Users,    color: "text-green-400" },
};

function capitalizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function slugToGenre(slug: string): string {
  const meta = GENRE_META[slug.toLowerCase()];
  if (meta) return meta.label;
  return capitalizeSlug(slug);
}

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const genre = slugToGenre(slug ?? "");
  const meta = GENRE_META[slug?.toLowerCase() ?? ""];
  const Icon = meta?.icon ?? Film;

  const { data: allMovies, isLoading } = useGetMovies({});

  const movies = useMemo(() => {
    if (!allMovies) return [];
    return allMovies.filter((m) =>
      (m.genres ?? []).some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }, [allMovies, genre]);

  useEffect(() => {
    document.title = `${genre} Movies — Feelms`;
  }, [genre]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-xl">
      <nav className="flex items-center gap-2 text-sm text-white/40 mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/movies" className="hover:text-white transition-colors">Browse</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white/80">{genre}</span>
      </nav>

      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${meta?.color ?? "text-primary"}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{genre}</h1>
            {meta?.description && (
              <p className="text-white/50 text-sm mt-0.5">{meta.description}</p>
            )}
          </div>
        </div>
        <p className="text-white/40 text-sm">
          {isLoading ? "Loading…" : `${movies.length} title${movies.length !== 1 ? "s" : ""} in this category`}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-24">
          <Icon className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white/60 mb-2">No {genre} movies yet</h2>
          <p className="text-white/30 text-sm mb-6">Check back soon — we're constantly adding new titles.</p>
          <Link href="/movies" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Browse all movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
