import {
  useGetBanners, useGetTrendingMovies, useGetNewReleases, useGetVipExclusives,
  useGetSections, useGetMovies,
  getGetBannersQueryKey, getGetTrendingMoviesQueryKey, getGetNewReleasesQueryKey,
  getGetVipExclusivesQueryKey, getGetSectionsQueryKey,
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { HeroBanner } from "@/components/hero-banner";
import { MovieRow } from "@/components/movie-row";
import { GenreBanner } from "@/components/genre-banner";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Play, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMemo } from "react";
import type { Movie } from "@workspace/api-client-react";

const GENRE_ROWS: { title: string; genres: string[]; href: string }[] = [
  { title: "Action & Adventure",  genres: ["Action", "Adventure"],       href: "/movies?genre=Action" },
  { title: "Drama Picks",         genres: ["Drama"],                     href: "/movies?genre=Drama" },
  { title: "Sci-Fi Universe",     genres: ["Sci-Fi"],                    href: "/movies?genre=Sci-Fi" },
  { title: "Crime & Thriller",    genres: ["Crime", "Thriller"],         href: "/movies?genre=Crime" },
  { title: "Horror & Mystery",    genres: ["Horror", "Mystery"],         href: "/movies?genre=Horror" },
  { title: "Animated Worlds",     genres: ["Animation", "Anime"],        href: "/movies?genre=Animation" },
  { title: "Comedy Night",        genres: ["Comedy"],                    href: "/movies?genre=Comedy" },
];

function useGenreMovies(allMovies: Movie[] | undefined, genres: string[]): Movie[] {
  return useMemo(() => {
    if (!allMovies) return [];
    return allMovies.filter(m => (m.genres ?? []).some(g => genres.includes(g)));
  }, [allMovies, genres]);
}

function GenreRow({ title, genres, href, allMovies }: { title: string; genres: string[]; href: string; allMovies: Movie[] | undefined }) {
  const movies = useGenreMovies(allMovies, genres);
  if (!movies.length) return null;
  return <MovieRow title={title} movies={movies.slice(0, 30)} viewMoreHref={href} />;
}

function ContinueWatchingRow({ token }: { token: string | null }) {
  const { data: history } = useQuery<any[]>({
    queryKey: ["watch-history"],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch("/api/watch-history", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60_000,
    enabled: !!token,
  });

  if (!history || history.length === 0) return null;

  const movies: Movie[] = history.map((h: any) => h.movie).filter(Boolean);
  if (movies.length === 0) return null;

  return (
    <div className="relative">
      <MovieRow
        title="Continue Watching"
        movies={movies.slice(0, 12)}
        viewMoreHref="/history"
      />
      <Link href="/history"
        className="absolute top-3 right-4 md:right-8 text-[10px] font-bold tracking-widest uppercase text-white/40 hover:text-white flex items-center gap-1 transition-colors">
        <Clock className="w-3 h-3" /> History
      </Link>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const token = isAuthenticated ? localStorage.getItem("feelms_token") : null;

  const { data: banners }       = useGetBanners({ all: false }, { query: { queryKey: getGetBannersQueryKey({ all: false }) } });
  const { data: trending }      = useGetTrendingMovies({ query: { queryKey: getGetTrendingMoviesQueryKey() } });
  const { data: newReleases }   = useGetNewReleases({ query: { queryKey: getGetNewReleasesQueryKey() } });
  const { data: vipExclusives } = useGetVipExclusives({ query: { queryKey: getGetVipExclusivesQueryKey() } });
  const { data: sections }      = useGetSections({ all: false }, { query: { queryKey: getGetSectionsQueryKey({ all: false }) } });
  const { data: allMovies }     = useGetMovies({});

  return (
    <div className="pb-20 bg-background">
      <HeroBanner banners={banners || []} />
      
      <div className="relative z-10">
        <GenreBanner />
      </div>

      <div className="space-y-6">
        {isAuthenticated && <ContinueWatchingRow token={token} />}

        {trending && (
          <MovieRow title="Trending Now" movies={trending.slice(0, 30)} viewMoreHref="/movies?sort=popular" />
        )}
        {newReleases && (
          <MovieRow title="New Releases" movies={newReleases.slice(0, 30)} viewMoreHref="/movies?sort=newest" />
        )}

        {vipExclusives && vipExclusives.length > 0 && (
          <MovieRow title="Featured VIP" movies={vipExclusives.slice(0, 30)} viewMoreHref="/vip" />
        )}

        {GENRE_ROWS.map(row => (
          <GenreRow key={row.title} title={row.title} genres={row.genres} href={row.href} allMovies={allMovies} />
        ))}

        {sections?.map(section =>
          section.movies && section.movies.length > 0 ? (
            <MovieRow
              key={section.id}
              title={section.title}
              movies={section.movies.slice(0, 30)}
              viewMoreHref={`/movies?genre=${encodeURIComponent(section.title)}`}
            />
          ) : null
        )}
      </div>
    </div>
  );
}