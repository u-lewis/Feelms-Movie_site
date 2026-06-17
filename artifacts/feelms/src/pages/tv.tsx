import { useState, useEffect, useRef, useMemo } from "react";
import Hls from "hls.js";
import {
  Tv, Search, X, Globe, Radio, Loader2, AlertCircle,
  ChevronDown, ChevronUp, RefreshCw, Copy, Check, ExternalLink, Wifi,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Channel {
  name: string;
  url: string;
  logo: string;
  country: string;
  group: string;
}

interface GeoInfo { country_name: string; country_code: string; }

// ── Geo cache (24-hour localStorage) ──────────────────────────────────────────
const GEO_KEY = "feelms_geo_v1";
const GEO_TTL = 24 * 60 * 60 * 1000;

function getCachedGeo(): GeoInfo | null {
  try {
    const raw = localStorage.getItem(GEO_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > GEO_TTL) { localStorage.removeItem(GEO_KEY); return null; }
    return data as GeoInfo;
  } catch { return null; }
}

function setCachedGeo(data: GeoInfo) {
  try { localStorage.setItem(GEO_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

async function fetchGeo(timeoutMs = 3000): Promise<GeoInfo | null> {
  const cached = getCachedGeo();
  if (cached) return cached;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch("https://ipapi.co/json/", { signal: ctrl.signal });
    const d = await r.json();
    clearTimeout(t);
    const geo: GeoInfo = { country_name: d.country_name || "", country_code: (d.country_code || "").toLowerCase() };
    setCachedGeo(geo);
    return geo;
  } catch {
    clearTimeout(t);
    return null;
  }
}

// ── M3U parser ────────────────────────────────────────────────────────────────
function parseM3U(text: string): Channel[] {
  const lines = text.split("\n");
  const channels: Channel[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("#EXTINF")) continue;
    const url = lines[i + 1]?.trim();
    if (!url || url.startsWith("#") || !url.startsWith("http")) continue;
    const nameMatch = line.match(/,(.+)$/);
    const logoMatch = line.match(/tvg-logo="([^"]*)"/);
    const groupMatch = line.match(/group-title="([^"]*)"/);
    const countryMatch = line.match(/tvg-country="([^"]*)"/);
    const country = (countryMatch?.[1] || groupMatch?.[1] || "International").trim();
    channels.push({
      name: nameMatch?.[1]?.trim() || "Unknown",
      url,
      logo: logoMatch?.[1] || "",
      country,
      group: groupMatch?.[1]?.trim() || country,
    });
  }
  return channels;
}

function proxyUrl(streamUrl: string) {
  return `/api/tv/proxy?url=${encodeURIComponent(streamUrl)}`;
}

// ── HLS Player ───────────────────────────────────────────────────────────────
function HLSPlayer({ src, channelName, onError }: { src: string; channelName: string; onError: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const rawUrl = useMemo(() => {
    try { return decodeURIComponent(new URL(src, window.location.href).searchParams.get("url") || src); }
    catch { return src; }
  }, [src]);

  const copyUrl = () => {
    navigator.clipboard.writeText(rawUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    setFailed(false);
    setLoading(true);

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
        lowLatencyMode: true,
        maxBufferLength: 8,
        maxMaxBufferLength: 16,
        backBufferLength: 4,
        fragLoadingTimeOut: 12000,
        manifestLoadingTimeOut: 12000,
        levelLoadingTimeOut: 12000,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { setLoading(false); video.play().catch(() => {}); });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) { setFailed(true); setLoading(false); onError(); }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", () => { setLoading(false); video.play().catch(() => {}); }, { once: true });
      video.addEventListener("error", () => { setFailed(true); setLoading(false); onError(); }, { once: true });
    } else {
      setFailed(true); setLoading(false); onError();
    }

    return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
  }, [src]);

  if (failed) {
    return (
      <div className="w-full aspect-video bg-black/80 rounded-xl flex flex-col items-center justify-center gap-4 border border-white/10 px-6 text-center">
        <Wifi className="w-9 h-9 text-orange-400/80" />
        <div>
          <p className="text-white/70 text-sm font-medium mb-0.5">This channel is geo-restricted or offline</p>
          <p className="text-white/30 text-xs">Try the next channel, or open the stream in VLC</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <Button size="sm" variant="outline" className="border-white/10 text-white/60 hover:text-white text-xs gap-1.5 h-8" onClick={copyUrl}>
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy URL for VLC"}
          </Button>
          <a href={rawUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="border-white/10 text-white/60 hover:text-white text-xs gap-1.5 h-8">
              <ExternalLink className="w-3.5 h-3.5" /> Open in player
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-black/80">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-white/50 text-xs">Tuning into {channelName}…</p>
        </div>
      )}
      <video ref={videoRef} className="w-full h-full" controls playsInline />
    </div>
  );
}

// ── Country section ──────────────────────────────────────────────────────────
function CountrySection({ country, channels, onSelect, activeUrl }: {
  country: string; channels: Channel[]; onSelect: (ch: Channel) => void; activeUrl: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-1.5">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/8 transition-colors text-sm font-semibold text-white/80">
        <span className="flex items-center gap-2 min-w-0">
          <Globe className="w-3.5 h-3.5 text-primary/70 shrink-0" />
          <span className="truncate">{country}</span>
          <span className="text-white/30 font-normal text-xs shrink-0">({channels.length})</span>
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-white/40 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-white/40 shrink-0" />}
      </button>
      {open && (
        <div className="mt-0.5 space-y-px">
          {channels.map((ch, i) => (
            <button key={i} onClick={() => onSelect(ch)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                activeUrl === ch.url ? "bg-primary/20 text-white border border-primary/30" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}>
              {ch.logo
                ? <img src={ch.logo} alt="" className="w-6 h-6 object-contain rounded shrink-0 bg-black" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                : <Radio className="w-5 h-5 text-white/30 shrink-0" />}
              <span className="truncate">{ch.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Playlist URLs ─────────────────────────────────────────────────────────────
const COUNTRY_PLAYLIST = (code: string) => `https://iptv-org.github.io/iptv/countries/${code.toLowerCase()}.m3u`;
const GLOBAL_PLAYLIST = "https://iptv-org.github.io/iptv/index.m3u";
const GLOBAL_LIMIT = 2500;

async function fetchPlaylist(url: string, limit?: number): Promise<Channel[]> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status}`);
  const text = await r.text();
  const parsed = parseM3U(text);
  return limit ? parsed.slice(0, limit) : parsed;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TVChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Channel | null>(null);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const [geo, setGeo] = useState<GeoInfo | null>(null);
  const [loadedGlobal, setLoadedGlobal] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Step 1 — geo (instant from cache or 3s max)
  useEffect(() => {
    fetchGeo(3000).then(setGeo);
  }, []);

  // Step 2 — load playlist once geo is known (or after 3s timeout)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    const run = async () => {
      try {
        let loaded: Channel[] = [];
        if (geo?.country_code) {
          try { loaded = await fetchPlaylist(COUNTRY_PLAYLIST(geo.country_code)); } catch {}
        }
        if (loaded.length === 0) {
          loaded = await fetchPlaylist(GLOBAL_PLAYLIST, GLOBAL_LIMIT);
          if (!cancelled) setLoadedGlobal(true);
        }
        if (!cancelled) setChannels(loaded);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [geo]);

  // Trigger playlist load even if geo never resolves (3s timeout)
  useEffect(() => {
    const t = setTimeout(() => {
      if (geo === null) setGeo({ country_name: "", country_code: "" });
    }, 3500);
    return () => clearTimeout(t);
  }, [geo]);

  const loadMore = async () => {
    if (loadedGlobal || loadingMore) return;
    setLoadingMore(true);
    try {
      const global = await fetchPlaylist(GLOBAL_PLAYLIST, GLOBAL_LIMIT);
      setChannels(prev => {
        const existing = new Set(prev.map(c => c.url));
        return [...prev, ...global.filter(c => !existing.has(c.url))];
      });
      setLoadedGlobal(true);
    } catch {} finally { setLoadingMore(false); }
  };

  const handleSelect = (ch: Channel) => {
    setActive(ch);
    setFailedUrls(f => { const s = new Set(f); s.delete(ch.url); return s; });
  };

  const handleStreamError = () => {
    if (active) setFailedUrls(f => new Set([...f, active.url]));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? channels.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)) : channels;
  }, [channels, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Channel[]>();
    for (const ch of filtered) {
      const key = ch.country || "International";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ch);
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === geo?.country_name) return -1;
      if (b === geo?.country_name) return 1;
      return a.localeCompare(b);
    });
  }, [filtered, geo]);

  const activePxUrl = active ? proxyUrl(active.url) : "";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Tv className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Live TV</h1>
            <p className="text-muted-foreground text-sm">
              {loading
                ? geo?.country_name ? `Loading ${geo.country_name} channels…` : "Loading channels…"
                : `${channels.length.toLocaleString()} channels${geo?.country_name ? ` · ${geo.country_name} first` : ""}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-155px)]">
          {/* ── Sidebar ── */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-2.5 order-2 lg:order-1 h-[55vw] max-h-[360px] sm:max-h-[420px] lg:max-h-none lg:h-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search channels or country…"
                className="pl-9 bg-card/50 border-white/10 focus-visible:ring-primary h-9" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-12 text-white/40">
                  <Loader2 className="w-7 h-7 animate-spin text-primary" />
                  <p className="text-sm">{geo?.country_name ? `Loading ${geo.country_name}…` : "Fetching channels…"}</p>
                </div>
              ) : loadError ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <p className="text-white/40 text-sm text-center">Couldn't load channels.</p>
                  <Button size="sm" variant="outline" className="border-white/10 text-white/60 gap-1.5"
                    onClick={() => window.location.reload()}>
                    <RefreshCw className="w-3.5 h-3.5" /> Retry
                  </Button>
                </div>
              ) : grouped.length === 0 ? (
                <p className="text-center text-white/40 py-8 text-sm">No channels match.</p>
              ) : (
                <>
                  {grouped.map(([country, chs]) => (
                    <CountrySection key={country} country={country} channels={chs}
                      onSelect={handleSelect} activeUrl={active?.url ?? ""} />
                  ))}
                  {!loadedGlobal && (
                    <button onClick={loadMore} disabled={loadingMore}
                      className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-white/15 text-white/40 hover:border-white/30 hover:text-white/70 transition-colors text-sm flex items-center justify-center gap-2">
                      {loadingMore
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading all countries…</>
                        : <><Globe className="w-3.5 h-3.5" /> Load all countries</>}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Player ── */}
          <div className="flex-1 flex flex-col gap-3 order-1 lg:order-2 min-w-0">
            {active ? (
              <>
                <HLSPlayer key={active.url} src={activePxUrl} channelName={active.name} onError={handleStreamError} />
                <div className="flex items-center gap-3 px-1">
                  {active.logo && (
                    <img src={active.logo} alt="" className="w-10 h-10 object-contain rounded bg-black border border-white/10 p-1 shrink-0"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-white font-semibold text-lg leading-tight truncate">{active.name}</h2>
                    <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{active.country}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono font-semibold shrink-0">
                    <span className={`w-2 h-2 rounded-full ${failedUrls.has(active.url) ? "bg-orange-400" : "bg-red-400 animate-pulse"}`} />
                    {failedUrls.has(active.url) ? "OFFLINE" : "LIVE"}
                  </div>
                </div>
                <p className="text-white/20 text-xs px-1">
                  Streams are proxied through Feelms servers. Some channels may be geo-restricted or require an external player (VLC).
                </p>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-card/30 border border-white/5 rounded-2xl text-center px-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Tv className="w-10 h-10 text-primary/60" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-xl mb-1">Select a Channel</h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    {geo?.country_name ? `${geo.country_name} channels are shown first.` : "Browse by country on the left."}
                    {" "}Click any channel to start streaming.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
