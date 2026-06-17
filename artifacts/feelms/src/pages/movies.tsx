import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useGetMovies } from "@workspace/api-client-react";
import { MovieCard } from "@/components/movie-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  TrendingUp,
  Clock,
  Calendar,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";

const GENRES = [
  "All",
  "Action",
  "Comedy",
  "Drama",
  "Sci-Fi",
  "Horror",
  "Romance",
  "Thriller",
  "Documentary",
  "Animation",
  "Adventure",
  "Fantasy",
  "Superhero",
  "Anime",
  "Crime",
  "Family",
  "History",
  "Music",
  "Mystery",
  "War",
];

type SortKey =
  | "newest"
  | "oldest"
  | "rating"
  | "popular"
  | "az"
  | "za"
  | "duration_asc"
  | "duration_desc";
type DurationFilter = "all" | "short" | "medium" | "long";

const PAGE_SIZE = 20;

function parseDurationMinutes(d: string | null | undefined): number {
  if (!d) return 0;
  const hMatch = d.match(/(\d+)\s*h/i);
  const mMatch = d.match(/(\d+)\s*m/i);
  return (
    (hMatch ? parseInt(hMatch[1]) : 0) * 60 + (mMatch ? parseInt(mMatch[1]) : 0)
  );
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
  { value: "duration_asc", label: "Shortest First" },
  { value: "duration_desc", label: "Longest First" },
];

type ContentType = "all" | "MOVIE" | "SERIES";

export default function Movies() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const urlGenre = urlParams.get("genre") || "All";
  const urlType = urlParams.get("type");
  const initContentType: ContentType =
    urlType === "series" ? "SERIES" : urlType === "movie" ? "MOVIE" : "all";

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState(urlGenre);
  const [contentType, setContentType] = useState<ContentType>(initContentType);
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [selectedInterpreter, setSelectedInterpreter] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const { data: allMovies, isLoading } = useGetMovies({});

  const allInterpreters = useMemo(() => {
    const set = new Set<string>();
    (allMovies ?? []).forEach((m: any) => {
      if (m.interpreted && Array.isArray(m.interpreters)) {
        m.interpreters.forEach((n: string) => { if (n) set.add(n); });
      }
    });
    return Array.from(set).sort();
  }, [allMovies]);

  const activeFilterCount = [
    genre !== "All",
    contentType !== "all",
    durationFilter !== "all",
    minRating > 0,
    selectedInterpreter !== null,
  ].filter(Boolean).length;

  const results = useMemo(() => {
    let list = allMovies ?? [];

    if (contentType !== "all") {
      list = list.filter((m) => (m as any).contentType === contentType);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.genres?.some((g) => g.toLowerCase().includes(q)),
      );
    }
    if (genre !== "All") list = list.filter((m) => m.genres?.includes(genre));
    if (minRating > 0) list = list.filter((m) => (m.rating ?? 0) >= minRating);
    if (selectedInterpreter) {
      list = list.filter((m: any) => m.interpreted && Array.isArray(m.interpreters) && m.interpreters.includes(selectedInterpreter));
    }
    if (durationFilter !== "all") {
      list = list.filter((m) => {
        const mins = parseDurationMinutes(m.duration);
        if (durationFilter === "short") return mins > 0 && mins < 90;
        if (durationFilter === "medium") return mins >= 90 && mins <= 140;
        if (durationFilter === "long") return mins > 140;
        return true;
      });
    }
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0);
        case "popular":
          return (b.watchCount ?? 0) - (a.watchCount ?? 0);
        case "az":
          return a.title.localeCompare(b.title);
        case "za":
          return b.title.localeCompare(a.title);
        case "duration_asc":
          return (
            parseDurationMinutes(a.duration) - parseDurationMinutes(b.duration)
          );
        case "duration_desc":
          return (
            parseDurationMinutes(b.duration) - parseDurationMinutes(a.duration)
          );
        default:
          return 0;
      }
    });
    return list;
  }, [allMovies, search, genre, contentType, sortBy, durationFilter, minRating, selectedInterpreter]);

  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [results]);

  const loadMore = useCallback(() => {
    setDisplayCount((c) => Math.min(c + PAGE_SIZE, results.length));
  }, [results.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const clearFilters = () => {
    setGenre("All");
    setContentType("all");
    setDurationFilter("all");
    setMinRating(0);
    setSortBy("newest");
    setSelectedInterpreter(null);
  };

  const visibleMovies = results.slice(0, displayCount);
  const hasMore = displayCount < results.length;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="mt-4 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          {contentType === "SERIES" ? "Browse Series" : contentType === "MOVIE" ? "Browse Movies" : "Browse"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isLoading
            ? "Loading…"
            : `${results.length} title${results.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {/* ── CONTENT TYPE TABS ── */}
      <div className="flex gap-1.5 mb-4">
        {(["all", "MOVIE", "SERIES"] as ContentType[]).map((ct) => {
          const labels: Record<ContentType, string> = { all: "All", MOVIE: "Movies", SERIES: "Series" };
          const isActive = contentType === ct;
          return (
            <button
              key={ct}
              onClick={() => { setContentType(ct); setDisplayCount(PAGE_SIZE); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                isActive
                  ? "bg-primary border-primary text-primary-foreground shadow"
                  : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {labels[ct]}
            </button>
          );
        })}
      </div>

      {/* ── SEARCH + TOOLBAR ── */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, genres…"
            className="pl-9 bg-card/50 border-white/10 focus-visible:ring-primary h-10"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort button */}
        <div className="relative shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOpen(!sortOpen)}
            className="bg-card/50 border-white/10 hover:bg-white/10 text-white/80 gap-1.5 h-10 px-3 min-w-0"
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline text-sm truncate max-w-[100px]">
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
          </Button>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 z-40 bg-card border border-white/10 rounded-xl shadow-2xl p-1 w-48 max-w-[calc(100vw-32px)] animate-in fade-in slide-in-from-top-2 duration-150">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${sortBy === opt.value ? "bg-primary text-primary-foreground font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                  >
                    {sortBy === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Filters button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`shrink-0 bg-card/50 border-white/10 hover:bg-white/10 text-white/80 gap-1.5 h-10 px-3 ${showFilters ? "border-primary/60 text-primary" : ""}`}
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline text-sm">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* ── FILTERS PANEL ── */}
      {showFilters && (
        <div className="bg-card/40 border border-white/8 rounded-2xl p-5 mb-5 space-y-5">
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2.5">
              Genre
            </p>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${genre === g ? "bg-primary border-primary text-primary-foreground font-medium" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Duration
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "Any Length" },
                { value: "short", label: "Short (< 1h 30m)" },
                { value: "medium", label: "Medium (1h 30m – 2h 20m)" },
                { value: "long", label: "Long (> 2h 20m)" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDurationFilter(opt.value as DurationFilter)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${durationFilter === opt.value ? "bg-primary border-primary text-primary-foreground font-medium" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> Minimum Rating
            </p>
            <div className="flex flex-wrap gap-2">
              {[0, 6, 7, 7.5, 8, 9].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${minRating === r ? "bg-primary border-primary text-primary-foreground font-medium" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"}`}
                >
                  {r === 0 ? "Any" : `${r}+`}
                </button>
              ))}
            </div>
          </div>
          {allInterpreters.length > 0 && (
            <div className="border-t border-white/5 pt-4">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2.5">
                Interpreter
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedInterpreter(null)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedInterpreter === null ? "bg-primary border-primary text-primary-foreground font-medium" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"}`}
                >
                  All
                </button>
                {allInterpreters.map((name) => (
                  <button
                    key={name}
                    onClick={() => setSelectedInterpreter(selectedInterpreter === name ? null : name)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedInterpreter === name ? "bg-primary border-primary text-primary-foreground font-medium" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeFilterCount > 0 && (
            <div className="pt-1">
              <button
                onClick={clearFilters}
                className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── GENRE QUICK TABS ── */}
      {!showFilters && (
        <div
          className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition-colors ${genre === g ? "bg-primary border-primary text-primary-foreground font-medium" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"}`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* ── ACTIVE FILTER CHIPS ── */}
      {(activeFilterCount > 0 || sortBy !== "newest") && (
        <div className="flex flex-wrap gap-2 mb-5">
          {sortBy !== "newest" && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70">
              <TrendingUp className="w-3 h-3" />
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
              <button
                onClick={() => setSortBy("newest")}
                className="ml-0.5 text-white/40 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {genre !== "All" && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70">
              {genre}
              <button
                onClick={() => setGenre("All")}
                className="ml-0.5 text-white/40 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {durationFilter !== "all" && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70">
              <Clock className="w-3 h-3" />
              {durationFilter === "short"
                ? "Short"
                : durationFilter === "medium"
                  ? "Medium"
                  : "Long"}
              <button
                onClick={() => setDurationFilter("all")}
                className="ml-0.5 text-white/40 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {minRating > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70">
              <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />{" "}
              {minRating}+
              <button
                onClick={() => setMinRating(0)}
                className="ml-0.5 text-white/40 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* ── RESULTS GRID ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-card/50 rounded-md animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {visibleMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* ── INFINITE SCROLL SENTINEL ── */}
          <div ref={sentinelRef} className="flex justify-center py-8">
            {hasMore ? (
              <div className="flex items-center gap-2 text-white/30 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading more…
              </div>
            ) : (
              <p className="text-white/20 text-sm">
                All {results.length} title{results.length !== 1 ? "s" : ""}{" "}
                loaded
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-card/30 border border-white/5 rounded-xl">
          <Search className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No movies found
          </h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or filters.
          </p>
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="border-white/10 text-white/60 hover:text-white"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
