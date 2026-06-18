import { useParams, Link, useLocation } from "wouter";
import { useGetMovie, getGetMovieQueryKey, useRecordWatch, useGetMovies } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Play, Download, Star, Clock, Calendar, ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Tv2, ChevronDown, CheckCircle2, Loader2, Share2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MovieCard } from "@/components/movie-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SubtitleTrack { label: string; language: string; url: string }

interface Episode {
  id: number;
  season: number;
  episodeNumber: number;
  title: string;
  description?: string | null;
  streamUrl?: string | null;
  downloadUrl?: string | null;
  thumbnail?: string | null;
  duration?: string | null;
  vipOnly: boolean;
  subtitles?: SubtitleTrack[] | null;
}

function SplashScreen({ title, poster }: { title: string; poster?: string }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const steps = [
      { target: 30, delay: 80 },
      { target: 60, delay: 120 },
      { target: 85, delay: 180 },
      { target: 100, delay: 80 },
    ];
    let current = 0;
    let timeout: ReturnType<typeof setTimeout>;
    function advance() {
      if (current >= steps.length) return;
      const { target, delay } = steps[current++];
      timeout = setTimeout(() => { setProgress(target); advance(); }, delay);
    }
    advance();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center overflow-hidden"
    >
      {poster && (
        <div className="absolute inset-0">
          <img src={poster} alt="" className="w-full h-full object-cover blur-2xl scale-110 opacity-10" />
          <div className="absolute inset-0 bg-background/80" />
        </div>
      )}
      <div className="relative z-10 text-center px-8 max-w-md">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
          {poster && (
            <div className="w-24 h-36 mx-auto mb-6 rounded-lg overflow-hidden border border-white/10 shadow-2xl">
              <img src={poster} alt={title} className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-xs font-mono text-primary/60 tracking-widest uppercase mb-2">Now Loading</p>
          <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">{title}</h2>
        </motion.div>
        <div className="w-64 mx-auto">
          <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} transition={{ duration: 0.3, ease: "easeOut" }} />
          </div>
          <p className="text-[10px] text-white/20 font-mono mt-2">{progress}%</p>
        </div>
      </div>
    </motion.div>
  );
}

function genreMatchScore(movieGenres: string[], targetGenres: string[]): number {
  if (!targetGenres.length) return 0;
  const shared = movieGenres.filter((g) => targetGenres.includes(g)).length;
  return shared / targetGenres.length;
}

function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
    return url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/") + "?autoplay=1&rel=0&modestbranding=1";
  }
  return null;
}

interface VipQualityRow { quality: string; mirrors: string[] }

function extractIdFromParam(param: string | undefined): number {
  if (!param) return 0;
  const parts = param.split("-");
  const last = parseInt(parts[parts.length - 1], 10);
  if (!isNaN(last)) return last;
  return parseInt(param, 10);
}

export default function MovieDetail() {
  const params = useParams<{ id?: string; slug?: string }>();
  const movieId = extractIdFromParam(params.id ?? params.slug);

  const { data: movie, isLoading } = useGetMovie(movieId, { query: { enabled: !!movieId, queryKey: getGetMovieQueryKey(movieId) } });
  const { data: allMovies } = useGetMovies({});
  const recordWatch = useRecordWatch();
  const [, setLocation] = useLocation();

  const [playMode, setPlayMode] = useState<'movie' | 'trailer' | null>(null);
  const isPlaying = playMode !== null;
  const [showSplash, setShowSplash] = useState(true);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Series / episodes state
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [activeSeason, setActiveSeason] = useState<number>(1);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [seasonOpen, setSeasonOpen] = useState(false);

  const rowRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const [gridCols, setGridCols] = useState(4);

  const isSeries = (movie as any)?.contentType === "SERIES";

  useEffect(() => {
    if (!isLoading && movie) {
      const t = setTimeout(() => setShowSplash(false), 800);
      return () => clearTimeout(t);
    }
  }, [isLoading, movie]);

  // Fetch episodes for series
  useEffect(() => {
    if (!movie || !isSeries) return;
    setEpisodesLoading(true);
    fetch(`/api/movies/${movieId}/episodes`)
      .then(r => r.json())
      .then((data: Episode[]) => {
        setEpisodes(data);
        if (data.length > 0) {
          setActiveSeason(data[0].season);
          setActiveEpisode(data[0]);
        }
      })
      .catch(() => toast.error("Failed to load episodes"))
      .finally(() => setEpisodesLoading(false));
  }, [movie, movieId, isSeries]);

  const seasons = [...new Set(episodes.map(e => e.season))].sort((a, b) => a - b);
  const seasonEpisodes = episodes.filter(e => e.season === activeSeason).sort((a, b) => a.episodeNumber - b.episodeNumber);

  const vipLinks: VipQualityRow[] = (() => {
    try { return JSON.parse((movie as any)?.vipDownloadLinks || "[]"); } catch { return []; }
  })();
  const freeDownloadUrl = movie?.downloadLinks?.[0] ?? null;

  const handlePlay = (ep?: Episode, mode: 'movie' | 'trailer' = 'movie') => {
    if (mode === 'trailer') {
      setPlayMode('trailer');
      return;
    }
    recordWatch.mutate({ id: movieId });
    if (ep) setActiveEpisode(ep);
    setPlayMode('movie');
  };

  const handleEpisodeSelect = (ep: Episode) => {
    if (playMode !== null) {
      setActiveEpisode(ep);
      setPlayMode('movie');
    } else {
      handlePlay(ep);
    }
  };

  const handleDownload = () => {
    setDownloadOpen(true);
    setSelectedQuality(vipLinks[0]?.quality ?? null);
  };

  const scroll = (dir: "left" | "right") => {
    rowRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  useEffect(() => {
    setVisibleCount(8);
  }, [movieId]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const measure = () => {
      const firstChild = grid.firstElementChild as HTMLElement | null;
      if (!firstChild) return;
      const gap = 16;
      const cols = Math.round((grid.offsetWidth + gap) / (firstChild.offsetWidth + gap));
      setGridCols(Math.max(1, cols));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    measure();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 8);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [movieId]);

  if (isLoading || showSplash) {
    return (
      <AnimatePresence>
        <SplashScreen title={movie?.title ?? "Loading…"} poster={movie?.poster} />
      </AnimatePresence>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Movie not found</h2>
        <Button asChild><Link href="/movies">Back to Movies</Link></Button>
      </div>
    );
  }

  const trailerEmbed = movie.trailer ? toEmbedUrl(movie.trailer) : null;
  const movieStreamUrl: string | null = (movie as any).streamUrl ?? null;
  const movieSubs: SubtitleTrack[] = (movie as any).subtitles ?? [];

  // What to show in the player
  const playerContent = (() => {
    if (!isPlaying) return null;

    // ── SERIES: always play the episode stream ──────────────────────────
    if (isSeries && activeEpisode?.streamUrl) {
      const embed = toEmbedUrl(activeEpisode.streamUrl);
      if (embed) {
        return <iframe src={embed} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
      }
      const epSubs = activeEpisode.subtitles ?? [];
      return (
        <video key={activeEpisode.id} src={activeEpisode.streamUrl} className="w-full h-full" controls autoPlay playsInline>
          {epSubs.map((sub, i) => (
            <track key={sub.language} kind="subtitles" label={sub.label} srcLang={sub.language} src={sub.url} default={i === 0} />
          ))}
        </video>
      );
    }

    // ── TRAILER mode ────────────────────────────────────────────────────
    if (playMode === 'trailer') {
      if (trailerEmbed) {
        return <iframe src={trailerEmbed} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
      }
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <p className="text-white/40 text-sm">No trailer available</p>
        </div>
      );
    }

    // ── MOVIE mode — main stream URL (Vimeo, Mux, Cloudflare, mp4…) ────
    if (movieStreamUrl) {
      const embed = toEmbedUrl(movieStreamUrl);
      if (embed) {
        return <iframe src={embed} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
      }
      return (
        <video src={movieStreamUrl} className="w-full h-full" controls autoPlay playsInline>
          {movieSubs.map((sub, i) => (
            <track key={sub.language} kind="subtitles" label={sub.label} srcLang={sub.language} src={sub.url} default={i === 0} />
          ))}
        </video>
      );
    }

    // ── Fallback: trailer when no main stream set ───────────────────────
    if (trailerEmbed) {
      return <iframe src={trailerEmbed} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center text-white/40">
          <Play className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No stream configured for {movie.title}</p>
        </div>
      </div>
    );
  })();

  const suggestedMovies = (allMovies ?? [])
    .filter((m) => m.id !== movie.id)
    .map((m) => ({ movie: m, score: genreMatchScore(m.genres ?? [], movie.genres ?? []) }))
    .filter(({ score }) => score >= 0.6 || (movie.genres?.length === 1 && score > 0))
    .sort((a, b) => b.score - a.score)
    .map(({ movie }) => movie);

  const fallbackSuggested = suggestedMovies.length < 4
    ? (allMovies ?? []).filter((m) => m.id !== movie.id && !suggestedMovies.find((s) => s.id === m.id)).sort((a, b) => (b.watchCount ?? 0) - (a.watchCount ?? 0))
    : [];
  const finalSuggested = [...suggestedMovies, ...fallbackSuggested];

  const currentMirrors = selectedQuality ? vipLinks.find(r => r.quality === selectedQuality)?.mirrors ?? [] : [];

  return (
    <div className="relative min-h-screen pb-20">
      <div className="absolute inset-0 h-[60vh] w-full z-0 overflow-hidden pointer-events-none">
        {movie.poster && (
          <>
            <img src={movie.poster} alt="" className="w-full h-full object-cover blur-2xl scale-110 opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-background/70 to-background" />
          </>
        )}
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 pt-6">
          <Button variant="ghost" asChild className="text-white/60 hover:text-white hover:bg-white/10 mb-4">
            <Link href="/movies"><ArrowLeft className="w-4 h-4 mr-2" /> Back to browse</Link>
          </Button>
        </div>

        {/* ── VIDEO PLAYER ── */}
        <div className="container mx-auto px-4 mb-4">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl shadow-black/60">
            {playerContent ?? (
              <>
                {movie.poster && (
                  <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover opacity-60" style={{ objectPosition: "center 20%" }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center gap-4">
                  <>
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                      onClick={() => isSeries && activeEpisode ? handlePlay(activeEpisode) : handlePlay()}
                      className="flex flex-col items-center gap-2 group" aria-label="Play now">
                      <div className="w-20 h-20 rounded-full bg-primary/90 hover:bg-primary border-2 border-primary/50 flex items-center justify-center shadow-2xl shadow-primary/40 transition-colors">
                        <Play className="w-9 h-9 text-primary-foreground ml-1" fill="currentColor" />
                      </div>
                      <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                        {isSeries && activeEpisode ? `S${activeEpisode.season}E${activeEpisode.episodeNumber}` : "Play Now"}
                      </span>
                    </motion.button>
                    {!isSeries && movie.trailer && (
                      <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} onClick={() => handlePlay(undefined, 'trailer')} className="flex flex-col items-center gap-2 group" aria-label="Play trailer">
                        <div className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center backdrop-blur-sm transition-colors">
                          <Play className="w-6 h-6 text-white ml-0.5" />
                        </div>
                        <span className="text-white/60 text-xs font-medium group-hover:text-white/80 transition-colors">Trailer</span>
                      </motion.button>
                    )}
                  </>
                </div>
                <div className="absolute bottom-4 left-6 right-6 hidden sm:block">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-white font-bold text-xl drop-shadow-lg line-clamp-1">
                        {isSeries && activeEpisode ? `${movie.title} — S${activeEpisode.season}E${activeEpisode.episodeNumber}: ${activeEpisode.title}` : movie.title}
                      </h2>
                      <div className="flex items-center gap-3 text-white/60 text-sm mt-0.5">
                        {movie.year && <span>{movie.year}</span>}
                        {(activeEpisode?.duration || movie.duration) && <span>{activeEpisode?.duration || movie.duration}</span>}
                        {movie.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" /> {movie.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    {!isSeries && (
                      <Button size="sm" variant="ghost" onClick={handleDownload} className="bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-sm gap-1.5 text-xs">
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── SERIES EPISODE PANEL (below player) ── */}
        {isSeries && (
          <div className="container mx-auto px-4 mb-8">
            <div className="bg-card/60 border border-white/8 rounded-2xl overflow-hidden backdrop-blur-sm">
              {/* Season selector header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Tv2 className="w-4 h-4 text-primary" />
                  <span className="text-white font-semibold text-sm">Episodes</span>
                  {!episodesLoading && <span className="text-white/30 text-xs">({episodes.length} total)</span>}
                </div>
                {seasons.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setSeasonOpen(!seasonOpen)}
                      className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      Season {activeSeason}
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </button>
                    {seasonOpen && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setSeasonOpen(false)} />
                        <div className="absolute right-0 top-full mt-1.5 z-30 bg-card border border-white/10 rounded-xl shadow-2xl p-1 w-36">
                          {seasons.map(s => (
                            <button key={s} onClick={() => { setActiveSeason(s); setSeasonOpen(false); }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSeason === s ? "bg-primary text-primary-foreground font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                              Season {s}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Episode list */}
              <div className="max-h-72 overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                {episodesLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-white/40">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm">Loading episodes…</span>
                  </div>
                ) : seasonEpisodes.length === 0 ? (
                  <p className="text-center text-white/30 py-8 text-sm">No episodes in this season.</p>
                ) : (
                  seasonEpisodes.map(ep => {
                    const isActive = activeEpisode?.id === ep.id;
                    return (
                      <div
                        key={ep.id}
                        className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/5 ${isActive ? "bg-primary/10 border-l-2 border-primary" : ""}`}
                      >
                        {/* Clickable area (thumbnail + info) */}
                        <button
                          onClick={() => handleEpisodeSelect(ep)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          {ep.thumbnail ? (
                            <img src={ep.thumbnail} alt="" className="w-20 h-12 object-cover rounded-md shrink-0 bg-black border border-white/5" />
                          ) : (
                            <div className="w-20 h-12 rounded-md shrink-0 bg-white/5 border border-white/5 flex items-center justify-center">
                              {isActive && isPlaying ? (
                                <div className="flex gap-0.5 items-end h-5">
                                  {[4, 7, 5].map((h, i) => (
                                    <motion.div key={i} className="w-1 bg-primary rounded-full" animate={{ height: [h, 14, h] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} style={{ height: h }} />
                                  ))}
                                </div>
                              ) : (
                                <Play className="w-4 h-4 text-white/20" />
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs text-white/40 font-mono">E{ep.episodeNumber}</span>
                              {isActive && isPlaying && <CheckCircle2 className="w-3 h-3 text-primary" />}
                            </div>
                            <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-white/80"}`}>{ep.title}</p>
                            {(ep.description || ep.duration) && (
                              <p className="text-xs text-white/40 truncate mt-0.5">{ep.duration && `${ep.duration} · `}{ep.description}</p>
                            )}
                          </div>
                        </button>

                        {/* Per-episode download button */}
                        {ep.downloadUrl && (
                          <a
                            href={ep.downloadUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            title="Download episode"
                            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/6 hover:bg-primary/20 hover:text-primary border border-white/8 hover:border-primary/30 text-white/40 hover:text-primary transition-all text-xs font-medium"
                          >
                            <Download className="w-3.5 h-3.5 shrink-0" />
                            <span className="hidden sm:inline">DL</span>
                          </a>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MOVIE INFO ── */}
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            <div className="hidden md:block w-[180px] shrink-0">
              <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl relative aspect-[2/3] bg-card">
                {movie.poster && <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />}
              </div>
            </div>

            <div className="flex-1">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                {isSeries && <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><Tv2 className="w-3 h-3" /> Series</span>}
                {movie.year && <span className="text-white/60 text-sm flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {movie.year}</span>}
                {movie.duration && !isSeries && <span className="text-white/60 text-sm flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {movie.duration}</span>}
                {isSeries && <span className="text-white/60 text-sm flex items-center gap-1"><Tv2 className="w-3.5 h-3.5" /> {episodes.length} ep{episodes.length !== 1 ? "s" : ""}</span>}
                {movie.rating && <span className="text-white/60 text-sm flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" /> {movie.rating.toFixed(1)}</span>}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">{movie.title}</h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres?.map((g) => (
                  <span key={g} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white/70">{g}</span>
                ))}
              </div>

              <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-5 max-w-3xl">{movie.description}</p>

              {/* ── MOBILE YouTube-style icon action bar (phones only) ── */}
              <motion.div
                className="flex sm:hidden items-center border-t border-b border-white/8 py-3 mb-4 -mx-4 px-2 gap-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <motion.button
                    onClick={() => isSeries && activeEpisode ? handlePlay(activeEpisode) : handlePlay()}
                    className="flex-1 flex flex-col items-center gap-1.5 py-1"
                    whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.06 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center ring-1 ring-primary/30">
                      <Play className="w-5 h-5 text-primary" fill="currentColor" />
                    </div>
                    <span className="text-[10px] text-white/70 font-medium">
                      {playMode === 'trailer' ? "Play" : playMode === 'movie' ? "Restart" : isSeries ? "Watch" : "Play"}
                    </span>
                  </motion.button>

                {!isSeries && (
                  <motion.button
                    onClick={handleDownload}
                    className="flex-1 flex flex-col items-center gap-1.5 py-1"
                    whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.06 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center">
                      <Download className="w-5 h-5 text-white/80" />
                    </div>
                    <span className="text-[10px] text-white/60 font-medium">Save</span>
                  </motion.button>
                )}

                {movie.rating && (
                  <div className="flex-1 flex flex-col items-center gap-1.5 py-1 select-none">
                    <motion.div
                      className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center"
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                    </motion.div>
                    <span className="text-[10px] text-yellow-400 font-semibold">{movie.rating.toFixed(1)}</span>
                  </div>
                )}

                <motion.button
                  onClick={() => setShowShare(true)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-1"
                  whileTap={{ scale: 0.88, rotate: -12 }} whileHover={{ scale: 1.06 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white/80" />
                  </div>
                  <span className="text-[10px] text-white/60 font-medium">Share</span>
                </motion.button>
              </motion.div>

              {/* ── DESKTOP action buttons (sm+) ── */}
              <div className="hidden sm:flex flex-wrap justify-start gap-2 mb-6">
                <Button size="sm"
                  onClick={() => isSeries && activeEpisode ? handlePlay(activeEpisode) : handlePlay()}
                  className="h-9 px-4 sm:h-12 sm:px-7 text-sm sm:text-base bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all hover:scale-105">
                  <Play className="w-4 h-4 mr-1.5" fill="currentColor" />
                  {playMode === 'trailer' ? (isSeries ? "Watch Series" : "Play Movie") : playMode === 'movie' ? (isSeries ? `Playing E${activeEpisode?.episodeNumber}` : "Restart") : (isSeries ? "Watch Series" : "Play Now")}
                </Button>
                {!isSeries && (
                  <Button size="sm" variant="outline" onClick={handleDownload} className="h-9 px-4 sm:h-12 sm:px-7 text-sm sm:text-base bg-white/5 border-white/10 hover:bg-white/10 text-white font-medium">
                    <Download className="w-4 h-4 mr-1.5" /> Download
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setShowShare(true)} className="h-9 px-4 sm:h-12 sm:px-7 text-sm sm:text-base bg-white/5 border-white/10 hover:bg-white/10 text-white font-medium">
                  <Share2 className="w-4 h-4 mr-1.5" /> Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── SUGGESTED MOVIES ── */}
        {finalSuggested.length > 0 && (
          <div className="container mx-auto px-4 mt-14 pb-16">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white tracking-tight">You Might Also Like</h2>
              <p className="text-sm text-white/40 mt-0.5">Based on {movie.genres?.join(", ") || "similar genres"}</p>
            </div>
            <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {finalSuggested.slice(0, visibleCount >= finalSuggested.length
                ? finalSuggested.length
                : Math.floor(visibleCount / gridCols) * gridCols
              ).map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
            {visibleCount < finalSuggested.length && (
              <div ref={sentinelRef} className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── DOWNLOAD DIALOG ── */}
      <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
        <DialogContent className="bg-card border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" /> Download — {movie.title}
            </DialogTitle>
          </DialogHeader>

          {vipLinks.length > 0 ? (
            <div className="space-y-4 mt-2">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Select Quality</p>
                <div className="grid grid-cols-3 gap-2">
                  {vipLinks.map((row) => (
                    <button key={row.quality} onClick={() => setSelectedQuality(row.quality)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-semibold border transition-all ${selectedQuality === row.quality ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-black/30 text-white/70 border-white/10 hover:border-white/30 hover:text-white"}`}>
                      {row.quality}
                      <div className="text-[10px] font-normal opacity-60 mt-0.5">{row.mirrors.length} mirror{row.mirrors.length !== 1 ? "s" : ""}</div>
                    </button>
                  ))}
                </div>
              </div>
              {selectedQuality && currentMirrors.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">{selectedQuality} Mirrors</p>
                  <div className="space-y-2">
                    {currentMirrors.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between bg-black/40 border border-white/10 hover:border-primary/40 hover:bg-primary/5 rounded-lg px-4 py-3 transition-all group">
                        <span className="text-sm text-white/80 group-hover:text-white">Mirror {i + 1}</span>
                        <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-primary" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : freeDownloadUrl ? (
            <div className="mt-3">
              <a href={freeDownloadUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-primary hover:bg-primary/90"><Download className="w-4 h-4 mr-2" /> Download Now <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-60" /></Button>
              </a>
            </div>
          ) : (
            <p className="text-white/40 text-sm text-center py-6">No download links available yet.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* ── SHARE POPUP ── */}
      <AnimatePresence>
        {showShare && movie && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowShare(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-sm bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2.5">
                  <Share2 className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-white">Share</span>
                </div>
                <button onClick={() => setShowShare(false)} className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Movie title */}
              <div className="px-5 pb-4 flex items-center gap-3">
                {movie.poster && <img src={movie.poster} alt="" className="w-10 h-14 object-cover rounded-lg border border-white/10 shrink-0" />}
                <p className="text-sm text-white/70 line-clamp-2 leading-snug">{movie.title}</p>
              </div>

              {/* Copy link */}
              <div className="px-5 pb-4">
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5">
                  <span className="flex-1 text-xs text-white/40 truncate font-mono">{window.location.href}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                        .then(() => {
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        })
                        .catch(() => toast.error("Copy failed"));
                    }}
                    className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${linkCopied ? "bg-emerald-500 text-white scale-95" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
                  >
                    {linkCopied ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5"><path d="M20 6L9 17l-5-5"/></svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social share buttons */}
              <div className="px-5 pb-5">
                <p className="text-[10px] uppercase tracking-widest text-white/25 mb-3 font-semibold">Share to</p>
                <div className="grid grid-cols-4 gap-2">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(movie.title + " — Watch on Feelms: " + window.location.href)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-[#25D366]/15 border border-white/8 hover:border-[#25D366]/30 transition-all group"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white/50 group-hover:text-[#25D366] transition-colors">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="text-[9px] text-white/40 group-hover:text-white/70 transition-colors">WhatsApp</span>
                  </a>

                  {/* X / Twitter */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(movie.title)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 transition-all group"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white/50 group-hover:text-white transition-colors">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                    </svg>
                    <span className="text-[9px] text-white/40 group-hover:text-white/70 transition-colors">X / Twitter</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-[#1877F2]/15 border border-white/8 hover:border-[#1877F2]/30 transition-all group"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white/50 group-hover:text-[#1877F2] transition-colors">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="text-[9px] text-white/40 group-hover:text-white/70 transition-colors">Facebook</span>
                  </a>

                  {/* Telegram */}
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(movie.title + " — Watch on Feelms")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-[#2AABEE]/15 border border-white/8 hover:border-[#2AABEE]/30 transition-all group"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white/50 group-hover:text-[#2AABEE] transition-colors">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span className="text-[9px] text-white/40 group-hover:text-white/70 transition-colors">Telegram</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
