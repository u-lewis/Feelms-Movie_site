import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Save, X, Loader2, Tv2, ChevronLeft } from "lucide-react";

interface Episode {
  id: number;
  movieId: number;
  season: number;
  episodeNumber: number;
  title: string;
  description?: string | null;
  streamUrl?: string | null;
  downloadUrl?: string | null;
  thumbnail?: string | null;
  duration?: string | null;
  vipOnly: boolean;
}

const API = import.meta.env.VITE_API_URL ?? "";

const emptyEp = { season: 1, episodeNumber: 1, title: "", description: "", streamUrl: "", downloadUrl: "", thumbnail: "", duration: "", vipOnly: false };

export default function EpisodesPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id ?? "0", 10);
  const { token } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [movieTitle, setMovieTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyEp });
  const [saving, setSaving] = useState(false);
  const [activeSeason, setActiveSeason] = useState(1);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/api/movies/${movieId}`)
      .then(r => r.json())
      .then(d => setMovieTitle(d.title ?? ""));
    fetchEpisodes();
  }, [movieId]);

  async function fetchEpisodes() {
    setLoading(true);
    const r = await fetch(`${API}/api/movies/${movieId}/episodes`);
    const data = await r.json();
    setEpisodes(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  const seasons = [...new Set(episodes.map(e => e.season))].sort((a, b) => a - b);
  const filtered = episodes.filter(e => e.season === activeSeason).sort((a, b) => a.episodeNumber - b.episodeNumber);

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        ...form,
        season: Number(form.season),
        episodeNumber: Number(form.episodeNumber),
      };
      let r;
      if (editingId) {
        r = await fetch(`${API}/api/movies/${movieId}/episodes/${editingId}`, { method: "PATCH", headers, body: JSON.stringify(body) });
      } else {
        r = await fetch(`${API}/api/movies/${movieId}/episodes`, { method: "POST", headers, body: JSON.stringify(body) });
      }
      if (!r.ok) throw new Error("Failed to save");
      toast.success(editingId ? "Episode updated" : "Episode added");
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyEp });
      fetchEpisodes();
    } catch {
      toast.error("Failed to save episode");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(epId: number) {
    if (!confirm("Delete this episode?")) return;
    const r = await fetch(`${API}/api/movies/${movieId}/episodes/${epId}`, { method: "DELETE", headers });
    if (r.ok) { toast.success("Deleted"); fetchEpisodes(); }
    else toast.error("Failed to delete");
  }

  function startEdit(ep: Episode) {
    setForm({
      season: ep.season,
      episodeNumber: ep.episodeNumber,
      title: ep.title,
      description: ep.description ?? "",
      streamUrl: ep.streamUrl ?? "",
      downloadUrl: ep.downloadUrl ?? "",
      thumbnail: ep.thumbnail ?? "",
      duration: ep.duration ?? "",
      vipOnly: ep.vipOnly,
    });
    setEditingId(ep.id);
    setShowForm(true);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setLocation("/movies")} className="text-white/40 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <Tv2 className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-white">Episodes</h1>
          <p className="text-white/40 text-sm">{movieTitle}</p>
        </div>
        <button onClick={() => { setForm({ ...emptyEp }); setEditingId(null); setShowForm(true); }}
          className="ml-auto flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Episode
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">{editingId ? "Edit Episode" : "New Episode"}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Season</label>
              <input type="number" value={form.season} onChange={e => setForm(f => ({ ...f, season: Number(e.target.value) }))}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Episode #</label>
              <input type="number" value={form.episodeNumber} onChange={e => setForm(f => ({ ...f, episodeNumber: Number(e.target.value) }))}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div className="col-span-2">
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div className="col-span-2">
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" />
            </div>
            <div className="col-span-2">
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Stream URL</label>
              <input value={form.streamUrl} onChange={e => setForm(f => ({ ...f, streamUrl: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div className="col-span-2">
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Download URL</label>
              <input value={form.downloadUrl} onChange={e => setForm(f => ({ ...f, downloadUrl: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Duration</label>
              <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 45m"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Thumbnail URL</label>
              <input value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="vipOnly" checked={form.vipOnly} onChange={e => setForm(f => ({ ...f, vipOnly: e.target.checked }))}
                className="w-4 h-4 accent-primary" />
              <label htmlFor="vipOnly" className="text-white/70 text-sm">VIP Only</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Season tabs */}
      {seasons.length > 0 && (
        <div className="flex gap-2 mb-4">
          {seasons.map(s => (
            <button key={s} onClick={() => setActiveSeason(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeSeason === s ? "bg-primary text-primary-foreground" : "bg-white/5 text-white/50 hover:text-white"}`}>
              Season {s}
            </button>
          ))}
        </div>
      )}

      {/* Episodes list */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30">No episodes yet. Add your first episode above.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(ep => (
            <div key={ep.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:border-white/20 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-sm">E{ep.episodeNumber}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{ep.title}</p>
                <p className="text-white/30 text-xs">{ep.duration ?? "—"} {ep.vipOnly ? "· VIP" : ""}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => startEdit(ep)} className="p-2 text-white/30 hover:text-white transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(ep.id)} className="p-2 text-white/30 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
