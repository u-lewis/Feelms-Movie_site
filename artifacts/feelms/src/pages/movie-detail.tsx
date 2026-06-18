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
    return undefined;
  }, [isLoading, movie]);

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
        <Button asChild size="sm" className="rounded font-bold"><Link href="/movies">Back to Movies</Link></Button>
      </div>
    );
  }

  const trailerEmbed = movie.trailer ? toEmbedUrl(movie.trailer) : null;
  const movieStreamUrl: string | null = (movie as any).streamUrl ?? null;
  const movieSubs: SubtitleTrack[] = (movie as any).subtitles ?? [];

  const playerContent = (() => {
    if (!isPlaying) return null;

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
    <div className="relative min-h-screen pb-16">
      <div className="absolute inset-0 h-[60vh] w-full z-0 overflow-hidden pointer-events-none">
        {movie.poster && (
          <>
            <img src={movie.poster} alt="" className="w-full h-full object-cover blur-3xl scale-110 opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-background/90 to-background" />
          </>
        )}
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 max-w-5xl pt-4">
          <Button variant="ghost" size="sm" asChild className="text-white/60 hover:text-white hover:bg-white/10 mb-2 px-2 -ml-2">
            <Link href="/movies"><ArrowLeft className="w-4 h-4 mr-1.5" /> Back</Link>
          </Button>
        </div>

        {/* ── VIDEO PLAYER ── */}
        <div className="container mx-auto px-4 max-w-5xl mb-4">
          <div className="relative w-full aspect-video rounded border border-white/5 bg-black shadow-2xl overflow-hidden">
            {playerContent ?? (
              <>
                {movie.poster && (
                  <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover opacity-60" style={{ objectPosition: "center 20%" }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center gap-4">
                  <>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => isSeries && activeEpisode ? handlePlay(activeEpisode) : handlePlay()}
                      className="flex flex-col items-center gap-2 group" aria-label="Play now">
                      <div className="w-16 h-16 rounded bg-primary/90 hover:bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.5)] transition-colors">
                        <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                      </div>
                      <span className="text-white/80 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                        {isSeries && activeEpisode ? `S${activeEpisode.season} E${activeEpisode.episodeNumber}` : "Play"}
                      </span>
                    </motion.button>
                    {!isSeries && movie.trailer && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handlePlay(undefined, 'trailer')} className="flex flex-col items-center gap-2 group" aria-label="Play trailer">
                        <div className="w-12 h-12 rounded bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center backdrop-blur-sm transition-colors">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                        <span className="text-white/60 text-xs font-bold uppercase tracking-widest group-hover:text-white/80 transition-colors">Trailer</span>
                      </motion.button>
                    )}
                  </>
                </div>
                <div className="absolute bottom-4 left-6 right-6 hidden sm:block">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-white font-black text-xl tracking-tight line-clamp-1">
                        {isSeries && activeEpisode ? `${movie.title} — S${activeEpisode.season} E${activeEpisode.episodeNumber}: ${activeEpisode.title}` : movie.title}
                      </h2>
                      <div className="flex items-center gap-3 text-white/60 text-[11px] font-bold tracking-widest uppercase mt-1">
                        {movie.year && <span>{movie.year}</span>}
                        {(activeEpisode?.duration || movie.duration) && <span>{activeEpisode?.duration || movie.duration}</span>}
                        {movie.rating && (
                          <span className="flex items-center gap-1 text-primary">
                            <Star className="w-3.5 h-3.5" fill="currentColor" /> {movie.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    {!isSeries && (
                      <Button size="sm" variant="ghost" onClick={handleDownload} className="bg-white/10 hover:bg-white/20 text-white rounded font-bold text-xs uppercase tracking-widest border border-white/10 backdrop-blur-sm gap-2">
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── SERIES EPISODE PANEL ── */}
        {isSeries && (
          <div className="container mx-auto px-4 max-w-5xl mb-6">
            <div className="bg-card border border-white/5 rounded">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Tv2 className="w-4 h-4 text-primary" />
                  <span className="text-white font-bold text-sm tracking-wide">EPISODES</span>
                  {!episodesLoading && <span className="text-white/30 text-xs font-mono">({episodes.length})</span>}
                </div>
                {seasons.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setSeasonOpen(!seasonOpen)}
                      className="flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded px-3 py-1.5 transition-colors uppercase tracking-widest"
                    >
                      Season {activeSeason}
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </button>
                    {seasonOpen && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setSeasonOpen(false)} />
                        <div className="absolute right-0 top-full mt-1.5 z-30 bg-card border border-white/10 rounded shadow-2xl p-1 w-36">
                          {seasons.map(s => (
                            <button key={s} onClick={() => { setActiveSeason(s); setSeasonOpen(false); }}
                              className={`w-full text-left px-3 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors ${activeSeason === s ? "bg-primary text-black" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                              Season {s}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                {episodesLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-white/40">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs uppercase tracking-widest font-bold">Loading...</span>
                  </div>
                ) : seasonEpisodes.length === 0 ? (
                  <p className="text-center text-white/30 py-8 text-xs uppercase tracking-widest font-bold">No episodes</p>
                ) : (
                  seasonEpisodes.map(ep => {
                    const isActive = activeEpisode?.id === ep.id;
                    return (
                      <div
                        key={ep.id}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5 ${isActive ? "bg-primary/10 border-l-2 border-primary" : ""}`}
                      >
                        <button
                          onClick={() => handleEpisodeSelect(ep)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          {ep.thumbnail ? (
                            <img src={ep.thumbnail} alt="" className="w-16 h-10 object-cover rounded bg-black border border-white/5 shrink-0" />
                          ) : (
                            <div className="w-16 h-10 rounded shrink-0 bg-white/5 border border-white/5 flex items-center justify-center">
                              {isActive && isPlaying ? (
                                <div className="flex gap-0.5 items-end h-4">
                                  {[3, 6, 4].map((h, i) => (
                                    <motion.div key={i} className="w-1 bg-primary rounded-full" animate={{ height: [h, 12, h] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} style={{ height: h }} />
                                  ))}
                                </div>
                              ) : (
                                <Play className="w-3 h-3 text-white/20" />
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">E{ep.episodeNumber}</span>
                              {isActive && isPlaying && <CheckCircle2 className="w-3 h-3 text-primary" />}
                            </div>
                            <p className={`text-sm font-bold truncate tracking-tight ${isActive ? "text-white" : "text-white/80"}`}>{ep.title}</p>
                          </div>
                        </button>
                        {ep.downloadUrl && (
                          <a
                            href={ep.downloadUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="p-2 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Download className="w-4 h-4" />
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

        <div className="container mx-auto px-4 max-w-5xl mb-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter">{movie.title}</h1>
              <div className="flex items-center gap-3 text-xs text-white/60 mb-4 font-bold uppercase tracking-widest">
                {movie.year && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {movie.year}</span>}
                {movie.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {movie.duration}</span>}
                {movie.rating && <span className="flex items-center gap-1 text-primary"><Star className="w-3.5 h-3.5" fill="currentColor" /> {movie.rating.toFixed(1)}</span>}
                {(movie as any).interpreted && <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/30">Interpreted</span>}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {movie.genres?.map(g => (
                  <span key={g} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-white/80 font-bold uppercase tracking-widest">{g}</span>
                ))}
              </div>
              <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
                {movie.description || "No synopsis available."}
              </p>
            </div>
          </div>
        </div>

        {finalSuggested.length > 0 && (
          <div className="container mx-auto px-4 max-w-5xl">
            <h3 className="text-lg font-bold text-white mb-4 tracking-tight">MORE LIKE THIS</h3>
            <div className="grid gap-3" ref={gridRef} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
              {finalSuggested.slice(0, visibleCount).map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
            {visibleCount < finalSuggested.length && (
              <div ref={sentinelRef} className="h-10 mt-4 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-white/20" />
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
        <DialogContent className="bg-card border-white/10 max-w-md w-[90vw] p-6 rounded">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" /> DOWNLOAD OPTIONS
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {vipLinks.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Select Quality</p>
                <div className="flex flex-wrap gap-2">
                  {vipLinks.map(link => (
                    <Button
                      key={link.quality}
                      variant={selectedQuality === link.quality ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedQuality(link.quality)}
                      className={`rounded font-bold text-xs ${selectedQuality === link.quality ? "bg-primary text-black" : "border-white/20 text-white/70 hover:text-white"}`}
                    >
                      {link.quality}
                    </Button>
                  ))}
                </div>
                {currentMirrors.length > 0 && (
                  <div className="pt-4 space-y-2">
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Download Links</p>
                    {currentMirrors.map((mirror, idx) => (
                      <Button key={idx} variant="outline" size="sm" asChild className="w-full justify-start rounded border-white/10 bg-white/5 hover:bg-white/10 font-mono text-xs">
                        <a href={mirror} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-2 text-primary" /> Mirror {idx + 1}
                        </a>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : freeDownloadUrl ? (
              <Button asChild className="w-full rounded bg-primary text-black font-bold uppercase tracking-widest">
                <a href={freeDownloadUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" /> Download
                </a>
              </Button>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-white/50 font-bold">No download links available.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}