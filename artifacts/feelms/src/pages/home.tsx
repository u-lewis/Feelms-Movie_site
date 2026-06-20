import {
  useGetBanners, useGetTrendingMovies, useGetNewReleases, useGetVipExclusives,
  useGetSections, useGetMovies,
  getGetBannersQueryKey, getGetTrendingMoviesQueryKey, getGetNewReleasesQueryKey,
  getGetVipExclusivesQueryKey, getGetSectionsQueryKey,
} from "@workspace/api-client-react";
import { HeroBanner } from "@/components/hero-banner";
import { MovieRow } from "@/components/movie-row";
import { useMemo } from "react";
import type { Movie } from "@workspace/api-client-react";

const GENRE_ROWS: { title: string; genres: string[]; href: string }[] = [
  { title: "Action & Adventure",  genres: ["Action", "Adventure"],    href: "/movies?genre=Action" },
  { title: "Drama Picks",         genres: ["Drama"],                  href: "/movies?genre=Drama" },
  { title: "Sci-Fi Universe",     genres: ["Sci-Fi"],                 href: "/movies?genre=Sci-Fi" },
  { title: "Crime & Thriller",    genres: ["Crime", "Thriller"],      href: "/movies?genre=Crime" },
  { title: "Horror & Mystery",    genres: ["Horror", "Mystery"],      href: "/movies?genre=Horror" },
  { title: "Animated Worlds",     genres: ["Animation", "Anime"],     href: "/movies?genre=Animation" },
  { title: "Comedy Night",        genres: ["Comedy"],                 href: "/movies?genre=Comedy" },
];

function toArr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function useGenreMovies(allMovies: Movie[] | undefined, genres: string[]): Movie[] {
  return useMemo(() => {
    const list = toArr<Movie>(allMovies);
    return list.filter(m => (m.genres ?? []).some(g => genres.includes(g)));
  }, [allMovies, genres]);
}

function GenreRow({ title, genres, href, allMovies }: { title: string; genres: string[]; href: string; allMovies: unknown }) {
  const movies = useGenreMovies(toArr<Movie>(allMovies), genres);
  if (!movies.length) return null;
  return <MovieRow title={title} movies={movies.slice(0, 30)} viewMoreHref={href} />;
}

export default function Home() {
  const { data: bannersRaw }      = useGetBanners({ all: false }, { query: { queryKey: getGetBannersQueryKey({ all: false }) } });
  const { data: trendingRaw }     = useGetTrendingMovies({ query: { queryKey: getGetTrendingMoviesQueryKey() } });
  const { data: newReleasesRaw }  = useGetNewReleases({ query: { queryKey: getGetNewReleasesQueryKey() } });
  const { data: vipRaw }          = useGetVipExclusives({ query: { queryKey: getGetVipExclusivesQueryKey() } });
  const { data: sectionsRaw }     = useGetSections({ all: false }, { query: { queryKey: getGetSectionsQueryKey({ all: false }) } });
  const { data: allMoviesRaw }    = useGetMovies({});

  const banners      = toArr(bannersRaw);
  const trending     = toArr<Movie>(trendingRaw);
  const newReleases  = toArr<Movie>(newReleasesRaw);
  const vipExclusives = toArr<Movie>(vipRaw);
  const sections     = toArr<any>(sectionsRaw);
  const allMovies    = toArr<Movie>(allMoviesRaw);

  return (
    <div className="pb-20">
      <HeroBanner banners={banners as any} />

      <div className="relative z-10 space-y-4">
        {trending.length > 0 && (
          <MovieRow title="Trending Now" movies={trending.slice(0, 30)} viewMoreHref="/movies?sort=popular" />
        )}
        {newReleases.length > 0 && (
          <MovieRow title="New Releases" movies={newReleases.slice(0, 30)} viewMoreHref="/movies?sort=newest" />
        )}
        {vipExclusives.length > 0 && (
          <MovieRow title="Featured" movies={vipExclusives.slice(0, 30)} viewMoreHref="/movies" />
        )}

        {GENRE_ROWS.map(row => (
          <GenreRow key={row.title} title={row.title} genres={row.genres} href={row.href} allMovies={allMovies} />
        ))}

        {sections.map((section: any) =>
          section.movies && section.movies.length > 0 ? (
            <MovieRow
              key={section.id}
              title={section.title}
              movies={toArr<Movie>(section.movies).slice(0, 30)}
              viewMoreHref={`/movies?genre=${encodeURIComponent(section.title)}`}
            />
          ) : null
        )}
      </div>
    </div>
  );
}
