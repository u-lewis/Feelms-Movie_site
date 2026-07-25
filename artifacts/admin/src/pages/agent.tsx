import { useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { toast } from "sonner";
import { Bot, Search, Plus, Loader2, Check, X, ExternalLink, Film, Tv2, AlertCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "";

interface ScrapedMovie {
  title: string;
  description: string;
  poster: string;
  genre: string;
  interpreter: string;
  contentType: "MOVIE" | "SERIES";
  parts: number;
  seasons?: number;
  episodes?: number;
  sourceUrl: string;
  downloadUrl: string;
  trailer: string;
  streamUrl: string;
  approved: boolean;
}

function parseOshakurPage(html: string, url: string): ScrapedMovie {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const getMeta = (prop: string) =>
    doc.querySelector(`meta[property="${prop}"]`)?.getAttribute("content") ??
    doc.querySelector(`meta[name="${prop}"]`)?.getAttribute("content") ?? "";

  const title = getMeta("og:title") || doc.querySelector("h1")?.textContent?.trim() ?? "";
  const description = getMeta("og:description");
  const poster = getMeta("og:image");

  // Genre
  const genre = doc.querySelector(".genre, [class*='genre']")?.textContent?.trim() ??
    doc.querySelector("h1 + *")?.textContent?.trim() ?? "Action";

  // Interpreter
  const interpreterEl = doc.querySelector("[href*='/abasobanuzi/']");
  const interpreter = interpreterEl?.textContent?.trim() ?? "";

  // Content type detection
  const bodyText = doc.body?.textContent ?? "";
  const isSeries = bodyText.includes("Season") || bodyText.includes("Episodes");
  const partsMatch = bodyText.match(/(\d+)\s*Parts?/i);
  const parts = partsMatch ? parseInt(partsMatch[1]) : 1;
  const episodesMatch = bodyText.match(/(\d+)\s*Episodes?/i);
  const episodes = episodesMatch ? parseInt(episodesMatch[1]) : undefined;
  const seasonsMatch = bodyText.match(/Season\s*(\d+)/i);
  const seasons = seasonsMatch ? parseInt(seasonsMatch[1]) : undefined;

  return {
    title,
    description,
    poster,
    genre,
    interpreter,
    contentType: isSeries ? "SERIES" : "MOVIE",
    parts,
    seasons,
    episodes,
    sourceUrl: url,
    downloadUrl: "",
    trailer: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " official trailer")}`,
    streamUrl: url,
    approved: false,
  };
}

export default function AgentPage() {
  const { token } = useAdminAuth();
  const [url, setUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<ScrapedMovie[]>([]);
  const [saving, setSaving] = useState<number | null>(null);
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  async function fetchPage(pageUrl: string): Promise<ScrapedMovie | null> {
    try {
      const r = await fetch(`${API}/api/tv/proxy?url=${encodeURIComponent(pageUrl)}`);
      if (!r.ok) throw new Error("Failed to fetch");
      const html = await r.text();
      return parseOshakurPage(html, pageUrl);
    } catch {
      return null;
    }
  }

  async function handleScrape() {
    if (mode === "single" && !url.trim()) return;
    if (mode === "bulk" && !bulkUrls.trim()) return;

    setLoading(true);
    setMovies([]);

    try {
      if (mode === "single") {
        const movie = await fetchPage(url.trim());
        if (movie) setMovies([movie]);
        else toast.error("Could not scrape that URL");
      } else {
        const urls = bulkUrls.split("\n").map(u => u.trim()).filter(Boolean);
        const results: ScrapedMovie[] = [];
        for (const u of urls) {
          const movie = await fetchPage(u);
          if (movie) results.push(movie);
          await new Promise(r => setTimeout(r, 500)); // rate limit
        }
        setMovies(results);
        toast.success(`Scraped ${results.length} of ${urls.length} movies`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(movie: ScrapedMovie, index: number) {
    setSaving(index);
    try {
      const payload = {
        title: movie.title,
        description: movie.description || "No description available.",
        poster: movie.poster,
        genres: [movie.genre].filter(Boolean),
        contentType: movie.contentType,
        interpreted: !!movie.interpreter,
        interpreters: movie.interpreter ? [movie.interpreter] : [],
        downloadLinks: movie.downloadUrl ? [movie.downloadUrl] : [],
        trailer: movie.trailer || null,
        streamUrl: movie.streamUrl || null,
        streamingLinks: [],
        vipOnly: false,
        featured: false,
      };

      const r = await fetch(`${API}/api/movies`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!r.ok) throw new Error("Failed to save");
      setSaved(prev => new Set([...prev, index]));
      toast.success(`${movie.title} added to Feelms!`);
    } catch {
      toast.error(`Failed to save ${movie.title}`);
    } finally {
      setSaving(null);
    }
  }

  async function handleSaveAll() {
    for (let i = 0; i < movies.length; i++) {
      if (!saved.has(i)) await handleSave(movies[i], i);
    }
  }

  function updateMovie(index: number, field: keyof ScrapedMovie, value: string) {
    setMovies(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bot className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-white">Movie Agent</h1>
          <p className="text-white/40 text-sm">Scrape movies from OSHAkur Films and add them to Feelms</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        {(["single", "bulk"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "bg-white/5 text-white/50 hover:text-white"}`}>
            {m === "single" ? "Single URL" : "Bulk URLs"}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
        {mode === "single" ? (
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">OSHAkur Film URL</label>
            <div className="flex gap-3">
              <input value={url} onChange={e => setUrl(e.target.value)}
                placeholder="https://www.oshakurfilms.com/watch/movie-name"
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50" />
              <button onClick={handleScrape} disabled={loading || !url.trim()}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Scrape
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">One URL per line</label>
            <textarea value={bulkUrls} onChange={e => setBulkUrls(e.target.value)} rows={6}
              placeholder={"https://www.oshakurfilms.com/watch/movie-1\nhttps://www.oshakurfilms.com/watch/movie-2"}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50 resize-none font-mono" />
            <div className="flex justify-end mt-3">
              <button onClick={handleScrape} disabled={loading || !bulkUrls.trim()}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Scrape All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {movies.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/50 text-sm">{movies.length} movie{movies.length !== 1 ? "s" : ""} found</p>
            <button onClick={handleSaveAll}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" /> Add All to Feelms
            </button>
          </div>

          <div className="space-y-4">
            {movies.map((movie, i) => (
              <div key={i} className={`bg-white/5 border rounded-xl overflow-hidden transition-colors ${saved.has(i) ? "border-green-500/40" : "border-white/10"}`}>
                <div className="flex gap-4 p-4">
                  {/* Poster */}
                  <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                    {movie.poster ? (
                      <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <Film className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${movie.contentType === "SERIES" ? "bg-blue-500/15 text-blue-400" : "bg-primary/15 text-primary"}`}>
                          {movie.contentType === "SERIES" ? <Tv2 className="w-3 h-3 inline mr-1" /> : <Film className="w-3 h-3 inline mr-1" />}
                          {movie.contentType}
                        </span>
                        {movie.parts > 1 && <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded">{movie.parts} Parts</span>}
                        {movie.episodes && <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded">{movie.episodes} Episodes</span>}
                        {movie.interpreter && <span className="text-xs bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded">🎙 {movie.interpreter}</span>}
                      </div>
                      <a href={movie.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="text-white/20 hover:text-white/60 transition-colors shrink-0">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Editable fields */}
                    <input value={movie.title} onChange={e => updateMovie(i, "title", e.target.value)}
                      className="w-full bg-transparent text-white font-bold text-base mb-1 focus:outline-none focus:bg-white/5 rounded px-1" />
                    <textarea value={movie.description} onChange={e => updateMovie(i, "description", e.target.value)}
                      rows={2} className="w-full bg-transparent text-white/50 text-xs resize-none focus:outline-none focus:bg-white/5 rounded px-1" />
                  </div>
                </div>

                {/* Action bar */}
                <div className="border-t border-white/5 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input value={movie.genre} onChange={e => updateMovie(i, "genre", e.target.value)}
                      placeholder="Genre"
                      className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white/60 text-xs w-28 focus:outline-none focus:border-primary/40" />
                    <input value={movie.poster} onChange={e => updateMovie(i, "poster", e.target.value)}
                      placeholder="Poster URL"
                      className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white/60 text-xs flex-1 focus:outline-none focus:border-primary/40" />
                    <input value={movie.downloadUrl} onChange={e => updateMovie(i, "downloadUrl", e.target.value)}
                      placeholder="MediaFire download URL"
                      className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white/60 text-xs flex-1 focus:outline-none focus:border-primary/40" />
                    <input value={movie.trailer} onChange={e => updateMovie(i, "trailer", e.target.value)}
                      placeholder="YouTube trailer URL"
                      className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white/60 text-xs flex-1 focus:outline-none focus:border-primary/40" />
                    <input value={movie.streamUrl} onChange={e => updateMovie(i, "streamUrl", e.target.value)}
                      placeholder="Stream URL"
                      className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white/60 text-xs flex-1 focus:outline-none focus:border-primary/40" />
                  </div>
                  {saved.has(i) ? (
                    <span className="flex items-center gap-1.5 text-green-400 text-sm font-semibold">
                      <Check className="w-4 h-4" /> Added
                    </span>
                  ) : (
                    <button onClick={() => handleSave(movie, i)} disabled={saving === i}
                      className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
                      {saving === i ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Add to Feelms
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && movies.length === 0 && (
        <div className="text-center py-16 text-white/20">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Paste an OSHAkur Films URL above to get started</p>
          <p className="text-xs mt-1">e.g. https://www.oshakurfilms.com/watch/hidden-strike</p>
        </div>
      )}
    </div>
  );
}
