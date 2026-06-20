import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMovies, getGetMoviesQueryKey, useCreateMovie, useUpdateMovie, useDeleteMovie, useGetInterpreters } from "@workspace/api-client-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Film, Plus, Edit, Trash2, Download, Crown, PlusCircle, X, Tv2, Save, Loader2, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const QUALITIES = ["180p", "360p", "480p", "720p", "1080p", "4K", "8K"];

const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  poster: z.string().url("Must be a valid URL"),
  trailer: z.string().optional(),
  streamUrl: z.string().optional(),
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
  vipLinks: z.array(z.object({ quality: z.string().min(1), mirrors: z.string() })).default([]),
  subtitleRows: z.array(z.object({ label: z.string().min(1), language: z.string().min(1), url: z.string().min(1) })).default([]),
});

type FormValues = z.infer<typeof movieSchema>;

function MovieForm({ editingId, defaultValues, onSuccess, onCancel }: {
  editingId: number | null;
  defaultValues: Partial<FormValues>;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const createMutation = useCreateMovie();
  const updateMutation = useUpdateMovie();
  const { data: allInterpreters = [] } = useGetInterpreters();

  const form = useForm<FormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: "", description: "", poster: "", trailer: "", streamUrl: "",
      contentType: "MOVIE", vipOnly: false, featured: false, interpreted: false,
      interpreterRows: [], genres: [], year: new Date().getFullYear(),
      rating: 0, duration: "", freeDownloadUrl: "", vipLinks: [], subtitleRows: [],
      ...defaultValues,
    },
  });

  const { fields: vipFields, append: appendVip, remove: removeVip } = useFieldArray({ control: form.control, name: "vipLinks" });
  const { fields: subFields, append: appendSub, remove: removeSub } = useFieldArray({ control: form.control, name: "subtitleRows" });
  const { fields: interpFields, append: appendInterp, remove: removeInterp } = useFieldArray({ control: form.control, name: "interpreterRows" });

  const onSubmit = (data: FormValues) => {
    const downloadLinks = data.freeDownloadUrl ? [data.freeDownloadUrl] : [];
    const vipDownloadLinks = data.vipLinks.length > 0
      ? JSON.stringify(data.vipLinks.map(r => ({ quality: r.quality, mirrors: r.mirrors.split("\n").map(s => s.trim()).filter(Boolean) })))
      : null;
    const subtitles = data.subtitleRows.map(r => ({ label: r.label, language: r.language, url: r.url }));
    const interpreters = data.interpreterRows.map(r => r.name);

    const payload: any = {
      title: data.title, description: data.description, poster: data.poster, trailer: data.trailer,
      streamUrl: data.streamUrl || null, contentType: data.contentType, vipOnly: data.vipOnly,
      featured: data.featured, interpreted: data.interpreted, interpreters,
      genres: data.genres, year: data.year, rating: data.rating, duration: data.duration,
      downloadLinks, vipDownloadLinks, subtitles,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload }, {
        onSuccess: () => { toast.success("Updated"); queryClient.invalidateQueries({ queryKey: getGetMoviesQueryKey() }); onSuccess(); },
        onError: (err: any) => toast.error(err?.message || "Update failed"),
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => { toast.success("Created"); queryClient.invalidateQueries({ queryKey: getGetMoviesQueryKey() }); onSuccess(); },
        onError: (err: any) => toast.error(err?.message || "Create failed"),
      });
    }
  };

  const field = form.register;
  const errors = form.formState.errors;
  const ct = form.watch("contentType");

  const inp = "w-full px-3 h-9 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
  const label = "text-white/50 text-xs block mb-1";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex gap-2">
        {(["MOVIE", "SERIES"] as const).map(t => (
          <button key={t} type="button" onClick={() => form.setValue("contentType", t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors flex items-center justify-center gap-2 ${ct === t ? "bg-primary/20 border-primary text-primary" : "border-white/10 text-white/50 hover:border-white/30"}`}>
            {t === "MOVIE" ? <Film className="w-4 h-4" /> : <Tv2 className="w-4 h-4" />} {t === "MOVIE" ? "Movie" : "Series"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><label className={label}>Title *</label><input {...field("title")} className={inp} />{errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}</div>
        <div><label className={label}>Poster URL *</label><input {...field("poster")} className={inp} />{errors.poster && <p className="text-red-400 text-xs mt-1">{errors.poster.message}</p>}</div>
      </div>
      <div><label className={label}>Description *</label><textarea {...field("description")} rows={2} className={`${inp} h-auto py-2 resize-none`} />{errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}</div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={label}>Trailer URL</label><input {...field("trailer")} placeholder="https://youtube.com/..." className={inp} /></div>
        <div><label className={label}>Main Stream URL</label><input {...field("streamUrl")} placeholder="https://vimeo.com/..." className={inp} /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={label}>Genres (comma sep.)</label><input {...field("genres")} className={inp} /></div>
        <div><label className={label}>Year</label><input type="number" {...field("year")} className={inp} /></div>
        <div><label className={label}>Rating (0–10)</label><input type="number" step="0.1" {...field("rating")} className={inp} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={label}>Duration</label><input {...field("duration")} placeholder="2h 15m" className={inp} /></div>
        <div><label className={label}>Free Download URL</label><input {...field("freeDownloadUrl")} placeholder="https://..." className={inp} /></div>
      </div>

      <div className="flex gap-4">
        {[["vipOnly", "VIP Only"], ["featured", "Featured"], ["interpreted", "Interpreted"]].map(([k, l]) => (
          <label key={k} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...field(k as any)} className="accent-primary w-4 h-4" />
            <span className="text-white/70 text-sm">{l}</span>
          </label>
        ))}
      </div>

      {form.watch("interpreted") && (
        <div className="border border-white/10 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white/60 text-xs font-semibold">Interpreters</label>
            <button type="button" onClick={() => appendInterp({ name: "" })} className="text-primary text-xs flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {interpFields.map((f, i) => (
            <div key={f.id} className="flex gap-2">
              <input {...field(`interpreterRows.${i}.name`)} list="interp-list" placeholder="Interpreter name" className={`${inp} flex-1`} />
              <button type="button" onClick={() => removeInterp(i)} className="text-white/30 hover:text-destructive"><X className="w-4 h-4" /></button>
            </div>
          ))}
          <datalist id="interp-list">{(allInterpreters as any[]).map(a => <option key={a.id} value={a.name} />)}</datalist>
        </div>
      )}

      <div className="border border-white/10 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <label className="text-white/60 text-xs font-semibold flex items-center gap-1.5"><Crown className="w-3.5 h-3.5 text-yellow-400" /> VIP Download Links</label>
          <button type="button" onClick={() => appendVip({ quality: "1080p", mirrors: "" })} className="text-primary text-xs flex items-center gap-1"><PlusCircle className="w-3.5 h-3.5" /> Add Quality</button>
        </div>
        {vipFields.map((f, i) => (
          <div key={f.id} className="grid grid-cols-[120px_1fr_auto] gap-2 items-start">
            <select {...field(`vipLinks.${i}.quality`)} className={inp}>
              {QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
            <textarea {...field(`vipLinks.${i}.mirrors`)} rows={2} placeholder="One mirror URL per line" className={`${inp} h-auto py-2 resize-none text-xs`} />
            <button type="button" onClick={() => removeVip(i)} className="text-white/30 hover:text-destructive mt-1"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <div className="border border-white/10 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <label className="text-white/60 text-xs font-semibold">Subtitle Tracks</label>
          <button type="button" onClick={() => appendSub({ label: "English", language: "en", url: "" })} className="text-primary text-xs flex items-center gap-1"><Plus className="w-3 h-3" /> Add Track</button>
        </div>
        {subFields.map((f, i) => (
          <div key={f.id} className="grid grid-cols-[1fr_70px_1fr_auto] gap-2 items-end">
            <div><label className="text-white/40 text-[10px] block mb-0.5">Label</label><input {...field(`subtitleRows.${i}.label`)} className={inp} placeholder="English" /></div>
            <div><label className="text-white/40 text-[10px] block mb-0.5">Lang</label><input {...field(`subtitleRows.${i}.language`)} className={inp} placeholder="en" /></div>
            <div><label className="text-white/40 text-[10px] block mb-0.5">VTT URL</label><input {...field(`subtitleRows.${i}.url`)} className={inp} placeholder="https://..." /></div>
            <button type="button" onClick={() => removeSub(i)} className="text-white/30 hover:text-destructive mb-0.5"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 h-10 rounded-lg border border-white/10 text-white/70 hover:text-white text-sm transition-colors">Cancel</button>
        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
          className="flex-1 h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
          {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {editingId ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}

export default function MoviesPage() {
  const queryClient = useQueryClient();
  const { data: movies, isLoading } = useGetMovies({}, { query: { queryKey: getGetMoviesQueryKey() } });
  const deleteMutation = useDeleteMovie();
  const [, setLocation] = useLocation();
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<FormValues>>({});
  const [search, setSearch] = useState("");

  const filtered = (movies ?? []).filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (movie: any) => {
    setEditingId(movie.id);
    let vipLinks: any[] = [];
    try { if (movie.vipDownloadLinks) vipLinks = JSON.parse(movie.vipDownloadLinks).map((r: any) => ({ quality: r.quality, mirrors: Array.isArray(r.mirrors) ? r.mirrors.join("\n") : "" })); } catch { }
    let subtitleRows: any[] = [];
    try { if (movie.subtitles) subtitleRows = Array.isArray(movie.subtitles) ? movie.subtitles : JSON.parse(movie.subtitles); } catch { }
    const interpreterRows = Array.isArray(movie.interpreters) ? movie.interpreters.map((n: string) => ({ name: n })) : [];
    setEditingData({ ...movie, contentType: movie.contentType || "MOVIE", genres: movie.genres?.join(", ") || "", freeDownloadUrl: movie.downloadLinks?.[0] || "", vipLinks, subtitleRows, interpreted: movie.interpreted ?? false, interpreterRows });
    setPanelOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this title? All episodes will also be removed.")) {
      deleteMutation.mutate({ id }, { onSuccess: () => { toast.success("Deleted"); queryClient.invalidateQueries({ queryKey: getGetMoviesQueryKey() }); } });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2"><Film className="w-6 h-6 text-primary" /> Movies & Series</h1>
          <p className="text-muted-foreground text-sm mt-1">{movies?.length || 0} titles in the library</p>
        </div>
        <button onClick={() => { setEditingId(null); setEditingData({}); setPanelOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Title
        </button>
      </div>

      {panelOpen && (
        <div className="bg-card border border-white/10 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">{editingId ? "Edit Title" : "Add New Title"}</h2>
          <MovieForm editingId={editingId} defaultValues={editingData} onSuccess={() => { setPanelOpen(false); setEditingId(null); }} onCancel={() => { setPanelOpen(false); setEditingId(null); }} />
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search movies…"
          className="w-full pl-10 pr-4 h-10 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-white/50 bg-black/40 border-b border-white/5 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Title</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Genres</th>
              <th className="px-5 py-3.5">Year</th>
              <th className="px-5 py-3.5">Flags</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-white/30">No titles found</td></tr>
            ) : filtered.map((movie) => (
              <tr key={movie.id} className="hover:bg-white/3 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <img src={movie.poster} alt={movie.title} className="w-8 h-11 object-cover rounded shrink-0 bg-white/5" />
                    <span className="text-white font-medium truncate max-w-[180px]">{movie.title}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${(movie as any).contentType === "SERIES" ? "bg-blue-500/15 text-blue-400" : "bg-white/10 text-white/60"}`}>
                    {(movie as any).contentType || "MOVIE"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-white/60 text-xs max-w-[160px] truncate">{movie.genres?.join(", ")}</td>
                <td className="px-5 py-3.5 text-white/60">{(movie as any).year || "—"}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1 flex-wrap">
                    {movie.vipOnly && <span className="text-[10px] bg-yellow-500/15 text-yellow-400 px-1.5 py-0.5 rounded font-bold">VIP</span>}
                    {movie.featured && <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-bold">Featured</span>}
                    {(movie as any).interpreted && <span className="text-[10px] bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded font-bold">SL</span>}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(movie)} className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/8 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                    {movie.contentType === "SERIES" && <button onClick={() => setLocation(`/movies/${movie.id}/episodes`)} className="p-1.5 text-white/40 hover:text-primary rounded-lg hover:bg-white/8 transition-all" title="Manage Episodes"><Tv2 className="w-3.5 h-3.5" /></button>}
                    <button onClick={() => handleDelete(movie.id)} className="p-1.5 text-destructive/50 hover:text-destructive rounded-lg hover:bg-destructive/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
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
