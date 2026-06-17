import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Clock, Play, Tv2, Film, ArrowLeft, Loader2, History } from "lucide-react";

interface HistoryEntry {
  id: number;
  movieId: number;
  episodeId: number | null;
  watchedAt: string;
  movie: {
    id: number;
    title: string;
    poster: string;
    contentType: string;
    genres: string[];
    year: number | null;
    rating: number | null;
    duration: string | null;
  };
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (diff < 7) return d.toLocaleDateString(undefined, { weekday: "long" });
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

export default function WatchHistoryPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) { setLocation("/login"); return null; }

  const { data: history, isLoading } = useQuery<HistoryEntry[]>({
    queryKey: ["watch-history"],
    queryFn: async () => {
      const token = localStorage.getItem("feelms_token");
      const res = await fetch("/api/watch-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30_000,
  });

  // Group by day label
  const grouped: { label: string; entries: HistoryEntry[] }[] = [];
  if (history) {
    for (const entry of history) {
      const label = dayLabel(entry.watchedAt);
      const existing = grouped.find(g => g.label === label);
      if (existing) {
        existing.entries.push(entry);
      } else {
        grouped.push({ label, entries: [entry] });
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="text-white/60 hover:text-white">
          <Link href="/"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-primary" /> Watch History
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            {history ? `${history.length} title${history.length !== 1 ? "s" : ""} watched` : "Your viewing history"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-white/40">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span>Loading history…</span>
        </div>
      ) : !history || history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-5">
            <Clock className="w-10 h-10 text-white/20" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No history yet</h3>
          <p className="text-white/40 text-sm mb-6 max-w-xs">Start watching movies and series — they'll appear here so you can easily pick up where you left off.</p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/movies"><Play className="w-4 h-4 mr-2" fill="currentColor" /> Browse Movies</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(group => (
            <div key={group.label}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3 px-1">{group.label}</h2>
              <div className="space-y-2">
                {group.entries.map(entry => (
                  <HistoryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const { movie } = entry;
  const isSeries = movie.contentType === "SERIES";

  return (
    <Link href={`/movies/${movie.id}`}>
      <div className="group flex items-center gap-4 p-3 rounded-2xl bg-card/50 hover:bg-card border border-white/5 hover:border-white/10 transition-all cursor-pointer">
        {/* Poster */}
        <div className="relative w-14 h-20 sm:w-16 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/8">
          {movie.poster
            ? <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
                {isSeries ? <Tv2 className="w-6 h-6 text-white/20" /> : <Film className="w-6 h-6 text-white/20" />}
              </div>
          }
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="w-5 h-5 text-white" fill="currentColor" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors">
            {movie.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {isSeries ? (
              <span className="text-xs text-blue-400/80 flex items-center gap-1">
                <Tv2 className="w-3 h-3" /> Series
              </span>
            ) : (
              <span className="text-xs text-white/40 flex items-center gap-1">
                <Film className="w-3 h-3" /> Movie
              </span>
            )}
            {movie.year && <span className="text-xs text-white/30">{movie.year}</span>}
            {movie.duration && <span className="text-xs text-white/30">{movie.duration}</span>}
          </div>
          <p className="text-xs text-white/30 mt-1.5 flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" /> {relativeTime(entry.watchedAt)}
          </p>
        </div>

        {/* Resume button */}
        <Button size="sm" variant="ghost"
          className="hidden sm:flex shrink-0 bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/8 text-white/60 gap-1.5 text-xs transition-all">
          <Play className="w-3.5 h-3.5" fill="currentColor" /> Resume
        </Button>
      </div>
    </Link>
  );
}
