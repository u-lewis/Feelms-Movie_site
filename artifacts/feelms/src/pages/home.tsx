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

export default function Home() {
  const { data: banners }       = useGetBanners({ all: false }, { query: { queryKey: getGetBannersQueryKey({ all: false }) } });
  const { data: trending }      = useGetTrendingMovies({ query: { queryKey: getGetTrendingMoviesQueryKey() } });
  const { data: newReleases }   = useGetNewReleases({ query: { queryKey: getGetNewReleasesQueryKey() } });
  const { data: vipExclusives } = useGetVipExclusives({ query: { queryKey: getGetVipExclusivesQueryKey() } });
  const { data: sections }      = useGetSections({ all: false }, { query: { queryKey: getGetSectionsQueryKey({ all: false }) } });
  const { data: allMovies }     = useGetMovies({});

  return (
    <div className="pb-20">
      <HeroBanner banners={banners || []} />

      <div className="mt-[-80px] relative z-10 space-y-4">
        {trending && (
          <MovieRow title="Trending Now" movies={trending.slice(0, 30)} viewMoreHref="/movies?sort=popular" />
        )}
        {newReleases && (
          <MovieRow title="New Releases" movies={newReleases.slice(0, 30)} viewMoreHref="/movies?sort=newest" />
        )}

        {vipExclusives && vipExclusives.length > 0 && (
          <MovieRow title="Featured" movies={vipExclusives.slice(0, 30)} viewMoreHref="/movies" />
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
