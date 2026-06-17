import { useState, useEffect } from "react";
import { useGetMovies, getGetMoviesQueryKey, useCreateMovie, useUpdateMovie, useDeleteMovie, useGetInterpreters } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Film, Plus, Edit, Trash2, ArrowLeft, Download, Crown, PlusCircle, X, Tv2, ListVideo, Save, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const QUALITIES = ["180p", "360p", "480p", "720p", "1080p", "4K", "8K"];

const vipLinkRowSchema = z.object({
  quality: z.string().min(1),
  mirrors: z.string(),
});

const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  poster: z.string().url("Must be a valid URL"),
  trailer: z.string().optional(),
  contentType: z.enum(["MOVIE", "SERIES"]).default("MOVIE"),
  vipOnly: z.boolean().default(false),
  featured: z.boolean().default(false),
  interpreted: z.boolean().default(false),
  interpreterRows: z.array(z.object({ name: z.string().min(1) })).default([]),
  genres: z.string().transform(str => str.split(",").map(s => s.trim()).filter(Boolean)),
  year: z.coerce.number().optional(),
  rating: z.coerce.number().optional(),
  duration: z.string().optional(),
  freeDownloadUrl: z.string().optional(),
  streamUrl: z.string().optional(),
  vipLinks: z.array(vipLinkRowSchema).default([]),
  subtitleRows: z.array(z.object({
    label: z.string().min(1),
    language: z.string().min(1),
    url: z.string().min(1),
  })).default([]),
});

type FormValues = z.infer<typeof movieSchema>;

interface SubtitleTrack { label: string; language: string; url: string }

interface Episode {
  id: number;
  season: number;
  episodeNumber: number;
  title: string;
  description?: string;
  streamUrl?: string;
  thumbnail?: string;
  duration?: string;
  vipOnly: boolean;
  subtitles?: SubtitleTrack[];
}

function EpisodesDialog({ movie, onClose }: { movie: any; onClose: () => void }) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEp, setEditingEp] = useState<Episode | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ season: 1, episodeNumber: 1, title: "", description: "", streamUrl: "", downloadUrl: "", thumbnail: "", duration: "", vipOnly: false });
  const [subtitleRows, setSubtitleRows] = useState<SubtitleTrack[]>([]);

  const token = localStorage.getItem("feelms_token");

  const loadEpisodes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/movies/${movie.id}/episodes`);
      const data = await res.json();
      setEpisodes(data);
    } catch { toast.error("Failed to load episodes"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadEpisodes(); }, []);

  const openAdd = () => {
    setEditingEp(null);
    const nextEp = episodes.length > 0 ? Math.max(...episodes.map(e => e.episodeNumber)) + 1 : 1;
    const curSeason = episodes.length > 0 ? episodes[episodes.length - 1].season : 1;
    setForm({ season: curSeason, episodeNumber: nextEp, title: "", description: "", streamUrl: "", downloadUrl: "", thumbnail: "", duration: "", vipOnly: false });
    setSubtitleRows([]);
    setShowForm(true);
  };

  const openEdit = (ep: Episode) => {
    setEditingEp(ep);
    setForm({ season: ep.season, episodeNumber: ep.episodeNumber, title: ep.title, description: ep.description || "", streamUrl: ep.streamUrl || "", downloadUrl: (ep as any).downloadUrl || "", thumbnail: ep.thumbnail || "", duration: ep.duration || "", vipOnly: ep.vipOnly });
    setSubtitleRows(ep.subtitles ?? []);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const url = editingEp ? `/api/movies/${movie.id}/episodes/${editingEp.id}` : `/api/movies/${movie.id}/episodes`;
      const method = editingEp ? "PATCH" : "POST";
      const body = { ...form, downloadUrl: form.downloadUrl || null, subtitles: subtitleRows };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Save failed");
      toast.success(editingEp ? "Episode updated" : "Episode added");
      setShowForm(false);
      loadEpisodes();
    } catch { toast.error("Failed to save episode"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (ep: Episode) => {
    if (!confirm(`Delete "${ep.title}"?`)) return;
    try {
      await fetch(`/api/movies/${movie.id}/episodes/${ep.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      toast.success("Episode deleted");
      loadEpisodes();
    } catch { toast.error("Delete failed"); }
  };

  const seasons = [...new Set(episodes.map(e => e.season))].sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">{movie.title}</h3>
          <p className="text-white/40 text-sm">{episodes.length} episodes</p>
        </div>
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-sm" onClick={openAdd}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Episode
        </Button>
      </div>

      {showForm && (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
          <h4 className="text-white text-sm font-semibold">{editingEp ? "Edit Episode" : "New Episode"}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-xs block mb-1">Season</label>
              <Input type="number" min={1} value={form.season} onChange={e => setForm(f => ({ ...f, season: +e.target.value }))} className="bg-black/40 border-white/10 h-9" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Episode #</label>
              <Input type="number" min={1} value={form.episodeNumber} onChange={e => setForm(f => ({ ...f, episodeNumber: +e.target.value }))} className="bg-black/40 border-white/10 h-9" />
            </div>
          </div>
          <div>
            <label className="text-white/50 text-xs block mb-1">Title *</label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-black/40 border-white/10 h-9" placeholder="Episode title" />
          </div>
          <div>
            <label className="text-white/50 text-xs block mb-1">Stream URL (YouTube, HLS, or direct video)</label>
            <Input value={form.streamUrl} onChange={e => setForm(f => ({ ...f, streamUrl: e.target.value }))} className="bg-black/40 border-white/10 h-9" placeholder="https://..." />
          </div>
          <div>
            <label className="text-white/50 text-xs block mb-1">Download URL (direct link for this episode)</label>
            <Input value={form.downloadUrl} onChange={e => setForm(f => ({ ...f, downloadUrl: e.target.value }))} className="bg-black/40 border-white/10 h-9" placeholder="https://mediafire.com/..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-xs block mb-1">Thumbnail URL</label>
              <Input value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} className="bg-black/40 border-white/10 h-9" placeholder="https://..." />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Duration</label>
              <Input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="bg-black/40 border-white/10 h-9" placeholder="42m" />
            </div>
          </div>
          <div>
            <label className="text-white/50 text-xs block mb-1">Description</label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-black/40 border-white/10 resize-none text-sm" rows={2} placeholder="Brief episode summary..." />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={form.vipOnly} onCheckedChange={v => setForm(f => ({ ...f, vipOnly: !!v }))} />
            <label className="text-white/70 text-sm">VIP Only</label>
          </div>

          {/* Subtitle Tracks */}
          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/60 text-xs font-semibold flex items-center gap-1.5">
                <span className="bg-white/10 text-white/60 font-mono text-[10px] px-1 rounded">CC</span>
                Subtitle Tracks
              </label>
              <button type="button" onClick={() => setSubtitleRows(r => [...r, { label: "English", language: "en", url: "" }])}
                className="text-primary hover:text-primary/80 text-xs flex items-center gap-1 transition-colors">
                <Plus className="w-3 h-3" /> Add Track
              </button>
            </div>
            {subtitleRows.length === 0 && (
              <p className="text-white/25 text-xs text-center py-2 border border-dashed border-white/10 rounded-lg">No subtitle tracks.</p>
            )}
            <div className="space-y-2">
              {subtitleRows.map((sub, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_1fr_auto] gap-2 items-end">
                  <div>
                    <label className="text-white/40 text-[10px] block mb-0.5">Label</label>
                    <Input value={sub.label} onChange={e => setSubtitleRows(r => r.map((s, j) => j === i ? { ...s, label: e.target.value } : s))} className="bg-black/40 border-white/10 h-8 text-xs" placeholder="English" />
                  </div>
                  <div>
                    <label className="text-white/40 text-[10px] block mb-0.5">Lang</label>
                    <Input value={sub.language} onChange={e => setSubtitleRows(r => r.map((s, j) => j === i ? { ...s, language: e.target.value } : s))} className="bg-black/40 border-white/10 h-8 text-xs" placeholder="en" />
                  </div>
                  <div>
                    <label className="text-white/40 text-[10px] block mb-0.5">VTT URL</label>
                    <Input value={sub.url} onChange={e => setSubtitleRows(r => r.map((s, j) => j === i ? { ...s, url: e.target.value } : s))} className="bg-black/40 border-white/10 h-8 text-xs" placeholder="https://.../subtitles.vtt" />
                  </div>
                  <button type="button" onClick={() => setSubtitleRows(r => r.filter((_, j) => j !== i))} className="text-white/30 hover:text-destructive mb-0.5 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="border-white/10" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Save
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8 text-white/40 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading episodes…
        </div>
      ) : episodes.length === 0 ? (
        <p className="text-center text-white/30 text-sm py-8 border border-dashed border-white/10 rounded-xl">
          No episodes yet. Click "Add Episode" to start.
        </p>
      ) : (
        <div className="space-y-3">
          {seasons.map(s => (
            <div key={s}>
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2 px-1">Season {s}</p>
              <div className="space-y-1">
                {episodes.filter(e => e.season === s).sort((a, b) => a.episodeNumber - b.episodeNumber).map(ep => (
                  <div key={ep.id} className="flex items-center gap-3 bg-black/20 border border-white/5 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors">
                    {ep.thumbnail ? (
                      <img src={ep.thumbnail} alt="" className="w-14 h-9 object-cover rounded shrink-0 bg-black" />
                    ) : (
                      <div className="w-14 h-9 bg-white/5 rounded shrink-0 flex items-center justify-center">
                        <Tv2 className="w-4 h-4 text-white/20" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">E{ep.episodeNumber} — {ep.title}</p>
                      <p className="text-white/40 text-xs">{ep.duration || "—"} {ep.vipOnly && "· VIP"}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit(ep)} className="text-white/40 hover:text-white p-1 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(ep)} className="text-destructive/50 hover:text-destructive p-1 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminMovies() {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [episodeMovie, setEpisodeMovie] = useState<any>(null);

  if (!isAdmin) { setLocation("/"); return null; }

  const { data: movies, isLoading } = useGetMovies({}, { query: { queryKey: getGetMoviesQueryKey() } });
  const createMutation = useCreateMovie();
  const updateMutation = useUpdateMovie();
  const deleteMutation = useDeleteMovie();

  const form = useForm<FormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: "", description: "", poster: "", trailer: "", streamUrl: "", contentType: "MOVIE",
      vipOnly: false, featured: false, genres: [], year: new Date().getFullYear(),
      rating: 0, duration: "", freeDownloadUrl: "", vipLinks: [], subtitleRows: [],
    },
  });

  const { fields: vipFields, append: appendVip, remove: removeVip } = useFieldArray({ control: form.control, name: "vipLinks" });
  const { fields: subFields, append: appendSub, remove: removeSub } = useFieldArray({ control: form.control, name: "subtitleRows" });
  const { fields: interpFields, append: appendInterp, remove: removeInterp } = useFieldArray({ control: form.control, name: "interpreterRows" });

  const { data: allInterpreters = [] } = useGetInterpreters();

  const onSubmit = (data: FormValues) => {
    const downloadLinks = data.freeDownloadUrl ? [data.freeDownloadUrl] : [];
    const vipDownloadLinks = data.vipLinks.length > 0
      ? JSON.stringify(data.vipLinks.map(row => ({ quality: row.quality, mirrors: row.mirrors.split("\n").map(s => s.trim()).filter(Boolean) })))
      : null;

    const subtitles = data.subtitleRows.map(r => ({ label: r.label, language: r.language, url: r.url }));
    const interpreters = data.interpreterRows.map(r => r.name);
    const payload: any = {
      title: data.title, description: data.description, poster: data.poster, trailer: data.trailer,
      streamUrl: data.streamUrl || null,
      contentType: data.contentType, vipOnly: data.vipOnly, featured: data.featured,
      interpreted: data.interpreted, interpreters,
      genres: data.genres, year: data.year, rating: data.rating, duration: data.duration,
      downloadLinks, vipDownloadLinks, subtitles,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload }, {
        onSuccess: () => { toast.success("Updated"); setIsCreateOpen(false); setEditingId(null); queryClient.invalidateQueries({ queryKey: getGetMoviesQueryKey() }); },
        onError: (err: any) => toast.error(err?.message || "Update failed"),
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => { toast.success("Created"); setIsCreateOpen(false); queryClient.invalidateQueries({ queryKey: getGetMoviesQueryKey() }); },
        onError: (err: any) => toast.error(err?.message || "Create failed"),
      });
    }
  };

  const handleEdit = (movie: any) => {
    setEditingId(movie.id);
    let vipLinks: { quality: string; mirrors: string }[] = [];
    if (movie.vipDownloadLinks) {
      try { vipLinks = JSON.parse(movie.vipDownloadLinks).map((r: any) => ({ quality: r.quality, mirrors: Array.isArray(r.mirrors) ? r.mirrors.join("\n") : "" })); } catch { }
    }
    let subtitleRows: { label: string; language: string; url: string }[] = [];
    if (movie.subtitles) {
      try { subtitleRows = Array.isArray(movie.subtitles) ? movie.subtitles : JSON.parse(movie.subtitles); } catch { }
    }
    const interpreterRows = Array.isArray(movie.interpreters) ? movie.interpreters.map((n: string) => ({ name: n })) : [];
    form.reset({ ...movie, contentType: movie.contentType || "MOVIE", genres: movie.genres?.join(", ") || "", freeDownloadUrl: movie.downloadLinks?.[0] || "", vipLinks, subtitleRows, interpreted: movie.interpreted ?? false, interpreterRows });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this movie? All episodes will also be deleted.")) {
      deleteMutation.mutate({ id }, { onSuccess: () => { toast.success("Deleted"); queryClient.invalidateQueries({ queryKey: getGetMoviesQueryKey() }); } });
    }
  };

  const handleClose = (open: boolean) => { setIsCreateOpen(open); if (!open) { setEditingId(null); form.reset(); } };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/admin"><ArrowLeft className="w-5 h-5" /></Link></Button>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2"><Film className="w-8 h-8 text-primary" /> Movie Management</h1>
          <p className="text-muted-foreground">Add, edit, or remove movies and series from the catalog.</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="text-white/70">{movies?.length || 0} titles total</div>
        <Dialog open={isCreateOpen} onOpenChange={handleClose}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Add Title</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 text-white max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader><DialogTitle>{editingId ? "Edit Title" : "Add New Title"}</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                {/* Type toggle */}
                <FormField control={form.control} name="contentType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <div className="flex gap-2">
                      {(["MOVIE", "SERIES"] as const).map(t => (
                        <button key={t} type="button" onClick={() => field.onChange(t)}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors flex items-center justify-center gap-2 ${field.value === t ? "bg-primary/20 border-primary text-primary" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                          {t === "MOVIE" ? <Film className="w-4 h-4" /> : <Tv2 className="w-4 h-4" />}
                          {t === "MOVIE" ? "Movie" : "Series"}
                        </button>
                      ))}
                    </div>
                  </FormItem>
                )} />

                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} className="bg-black/40 border-white/10" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} className="bg-black/40 border-white/10" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="poster" render={({ field }) => (
                  <FormItem><FormLabel>Poster URL</FormLabel><FormControl><Input {...field} className="bg-black/40 border-white/10" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="trailer" render={({ field }) => (
                    <FormItem><FormLabel>Trailer URL <span className="text-white/30 font-normal">(YouTube / any embed)</span></FormLabel><FormControl><Input {...field} value={field.value || ""} placeholder="https://youtube.com/watch?v=..." className="bg-black/40 border-white/10" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="streamUrl" render={({ field }) => (
                    <FormItem><FormLabel>Main Stream URL <span className="text-white/30 font-normal">(Vimeo · Mux · Cloudflare · Backblaze…)</span></FormLabel><FormControl><Input {...field} value={field.value || ""} placeholder="https://vimeo.com/…  or  .mp4 / .m3u8" className="bg-black/40 border-white/10" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="genres" render={({ field }) => (
                  <FormItem><FormLabel>Genres (comma separated)</FormLabel>
                    <FormControl><Input {...field} value={Array.isArray(field.value) ? field.value.join(", ") : field.value} className="bg-black/40 border-white/10" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="year" render={({ field }) => (
                    <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} className="bg-black/40 border-white/10" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="rating" render={({ field }) => (
                    <FormItem><FormLabel>Rating (0–10)</FormLabel><FormControl><Input type="number" step="0.1" {...field} className="bg-black/40 border-white/10" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="duration" render={({ field }) => (
                    <FormItem><FormLabel>Duration</FormLabel><FormControl><Input {...field} value={field.value || ""} placeholder="2h 15m" className="bg-black/40 border-white/10" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="flex gap-6">
                  <FormField control={form.control} name="vipOnly" render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>VIP Only</FormLabel></FormItem>
                  )} />
                  <FormField control={form.control} name="featured" render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Featured</FormLabel></FormItem>
                  )} />
                  <FormField control={form.control} name="interpreted" render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Interpreted</FormLabel></FormItem>
                  )} />
                </div>

                {/* Interpreter Names — shown only when Interpreted is checked */}
                {form.watch("interpreted") && (
                  <div className="border border-primary/20 bg-primary/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                        <span className="text-xs bg-primary/20 text-primary font-bold px-2 py-0.5 rounded">INT</span>
                        Interpreters
                      </h3>
                    </div>
                    {/* Dropdown to pick from registered interpreters */}
                    <Select
                      onValueChange={(name) => {
                        if (!interpFields.some((f: any) => f.name === name)) {
                          appendInterp({ name });
                        }
                      }}
                    >
                      <SelectTrigger className="bg-black/40 border-white/10 h-9 text-sm mb-3">
                        <SelectValue placeholder={
                          (allInterpreters as any[]).length === 0
                            ? "No interpreters registered yet — add in Admin > Interpreters"
                            : "Select an interpreter…"
                        } />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10">
                        {(allInterpreters as any[]).map((interp: any) => (
                          <SelectItem key={interp.id} value={interp.name} className="text-white hover:bg-white/10">
                            {interp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {interpFields.length === 0 && (
                      <p className="text-white/30 text-xs text-center py-2 border border-dashed border-white/10 rounded-lg">No interpreters selected yet.</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {interpFields.map((field, idx) => (
                        <div key={field.id} className="flex items-center gap-1.5 bg-primary/15 border border-primary/25 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                          <span>{(field as any).name}</span>
                          <button type="button" onClick={() => removeInterp(idx)} className="text-primary/60 hover:text-primary transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2 mb-3"><Download className="w-4 h-4 text-white/50" /> Free Download Link</h3>
                  <FormField control={form.control} name="freeDownloadUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/60 text-xs">Direct URL</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} placeholder="https://mediafire.com/..." className="bg-black/40 border-white/10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2"><Crown className="w-4 h-4 text-vip" /> VIP Quality Links</h3>
                    <Button type="button" size="sm" variant="ghost" className="text-primary hover:text-primary/80 h-8 text-xs" onClick={() => appendVip({ quality: "1080p", mirrors: "" })}>
                      <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add Quality
                    </Button>
                  </div>
                  {vipFields.length === 0 && (
                    <p className="text-white/30 text-xs text-center py-3 border border-dashed border-white/10 rounded-lg">No VIP quality links yet.</p>
                  )}
                  <div className="space-y-3">
                    {vipFields.map((field, idx) => (
                      <div key={field.id} className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <FormField control={form.control} name={`vipLinks.${idx}.quality`} render={({ field }) => (
                            <FormItem className="flex-1 mr-3">
                              <FormLabel className="text-xs text-white/50">Quality</FormLabel>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger className="bg-black/40 border-white/10 h-9 text-sm"><SelectValue placeholder="Select quality" /></SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-card border-white/10">
                                  {QUALITIES.map(q => <SelectItem key={q} value={q} className="text-white hover:bg-white/10">{q}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )} />
                          <button type="button" onClick={() => removeVip(idx)} className="text-white/30 hover:text-destructive mt-5 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <FormField control={form.control} name={`vipLinks.${idx}.mirrors`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-white/50">Mirror URLs (one per line)</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder={"https://mirror1.com/movie.mp4\nhttps://mirror2.com/movie.mp4"} className="bg-black/40 border-white/10 text-xs resize-none" rows={3} />
                            </FormControl>
                          </FormItem>
                        )} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtitle Tracks */}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                      <span className="bg-white/10 text-white/60 font-mono text-[10px] px-1.5 py-0.5 rounded">CC</span>
                      Subtitle Tracks
                    </h3>
                    <Button type="button" size="sm" variant="ghost" className="text-primary hover:text-primary/80 h-8 text-xs"
                      onClick={() => appendSub({ label: "English", language: "en", url: "" })}>
                      <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add Track
                    </Button>
                  </div>
                  {subFields.length === 0 && (
                    <p className="text-white/30 text-xs text-center py-3 border border-dashed border-white/10 rounded-lg">No subtitle tracks yet. Add VTT/WebVTT subtitle files for each language.</p>
                  )}
                  <div className="space-y-2">
                    {subFields.map((field, idx) => (
                      <div key={field.id} className="bg-black/30 border border-white/10 rounded-xl p-3">
                        <div className="grid grid-cols-[1fr_80px_auto] gap-2 items-end mb-2">
                          <FormField control={form.control} name={`subtitleRows.${idx}.label`} render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-white/50">Label</FormLabel>
                              <FormControl><Input {...field} placeholder="English" className="bg-black/40 border-white/10 h-8 text-xs" /></FormControl>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`subtitleRows.${idx}.language`} render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-white/50">Code</FormLabel>
                              <FormControl><Input {...field} placeholder="en" className="bg-black/40 border-white/10 h-8 text-xs" /></FormControl>
                            </FormItem>
                          )} />
                          <button type="button" onClick={() => removeSub(idx)} className="text-white/30 hover:text-destructive mt-5 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <FormField control={form.control} name={`subtitleRows.${idx}.url`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-white/50">VTT URL (WebVTT subtitle file)</FormLabel>
                            <FormControl><Input {...field} placeholder="https://example.com/subs/english.vtt" className="bg-black/40 border-white/10 h-8 text-xs" /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Update" : "Create"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Episodes Dialog */}
      <Dialog open={!!episodeMovie} onOpenChange={(open) => !open && setEpisodeMovie(null)}>
        <DialogContent className="bg-card border-white/10 text-white max-h-[85vh] overflow-y-auto max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ListVideo className="w-5 h-5 text-primary" /> Manage Episodes</DialogTitle></DialogHeader>
          {episodeMovie && <EpisodesDialog movie={episodeMovie} onClose={() => setEpisodeMovie(null)} />}
        </DialogContent>
      </Dialog>

      <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-white/60 bg-black/40 border-b border-white/5 uppercase">
            <tr>
              <th className="px-6 py-4">Poster</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-6 py-4">Downloads</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : movies?.map((movie: any) => (
              <tr key={movie.id} className="bg-card/50 hover:bg-card">
                <td className="px-6 py-4"><img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded" /></td>
                <td className="px-6 py-4 text-white font-medium">{movie.title}</td>
                <td className="px-4 py-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 w-fit ${movie.contentType === "SERIES" ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/60"}`}>
                    {movie.contentType === "SERIES" ? <Tv2 className="w-2.5 h-2.5" /> : <Film className="w-2.5 h-2.5" />}
                    {movie.contentType === "SERIES" ? "Series" : "Movie"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {movie.downloadLinks?.[0] && <span className="text-[10px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit"><Download className="w-2.5 h-2.5" /> Free</span>}
                    {movie.vipDownloadLinks && <span className="text-[10px] bg-vip/20 text-vip px-1.5 py-0.5 rounded flex items-center gap-1 w-fit"><Crown className="w-2.5 h-2.5" /> VIP</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {movie.vipOnly && <span className="bg-vip/20 text-vip px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">VIP</span>}
                    {movie.featured && <span className="bg-primary/20 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Featured</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {movie.contentType === "SERIES" && (
                      <Button variant="ghost" size="icon" onClick={() => setEpisodeMovie(movie)} className="text-blue-400/70 hover:text-blue-400 hover:bg-blue-400/10" title="Manage Episodes">
                        <ListVideo className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(movie)} className="text-white/70 hover:text-white">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(movie.id)} className="text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
