import { useState } from "react";
import { useGetSections, getGetSectionsQueryKey, useCreateSection, useUpdateSection, useDeleteSection, useGetMovies, getGetMoviesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Layers, Plus, Edit, Trash2, Loader2, Search } from "lucide-react";

interface SectionForm {
  title: string; orderIndex: number; enabled: boolean; sectionType: string; movieIds: number[];
}

const EMPTY: SectionForm = { title: "", orderIndex: 0, enabled: true, sectionType: "custom", movieIds: [] };

export default function SectionsPage() {
  const queryClient = useQueryClient();
  const { data: sections, isLoading } = useGetSections({ all: true }, { query: { queryKey: getGetSectionsQueryKey({ all: true }) } });
  const { data: movies } = useGetMovies({}, { query: { queryKey: getGetMoviesQueryKey() } });
  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();
  const deleteMutation = useDeleteSection();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SectionForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [movieSearch, setMovieSearch] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey({ all: true }) });
    queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey({ all: false }) });
  };

  const openAdd = () => { setEditingId(null); setForm(EMPTY); setPanelOpen(true); };
  const openEdit = (s: any) => { setEditingId(s.id); setForm({ title: s.title, orderIndex: s.orderIndex || 0, enabled: s.enabled, sectionType: s.sectionType || "custom", movieIds: s.movieIds || [] }); setPanelOpen(true); };

  const handleSave = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: form });
        toast.success("Section updated");
      } else {
        await createMutation.mutateAsync({ data: form });
        toast.success("Section created");
      }
      invalidate(); setPanelOpen(false);
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this section?")) return;
    await deleteMutation.mutateAsync({ id });
    toast.success("Deleted"); invalidate();
  };

  const toggleEnabled = (id: number, enabled: boolean) => {
    updateMutation.mutate({ id, data: { enabled: !enabled } }, { onSuccess: () => { toast.success(enabled ? "Disabled" : "Enabled"); invalidate(); } });
  };

  const toggleMovie = (id: number) => {
    setForm(f => ({ ...f, movieIds: f.movieIds.includes(id) ? f.movieIds.filter(m => m !== id) : [...f.movieIds, id] }));
  };

  const inp = "w-full px-3 h-9 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
  const lbl = "text-white/50 text-xs block mb-1";

  const filteredMovies = (movies ?? []).filter(m => m.title.toLowerCase().includes(movieSearch.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2"><Layers className="w-6 h-6 text-primary" /> Sections</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage homepage movie rows</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>

      {panelOpen && (
        <div className="bg-card border border-white/10 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">{editingId ? "Edit Section" : "New Section"}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><label className={lbl}>Title *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inp} /></div>
            <div><label className={lbl}>Order Index</label><input type="number" value={form.orderIndex} onChange={e => setForm(f => ({ ...f, orderIndex: Number(e.target.value) }))} className={inp} /></div>
            <div><label className={lbl}>Type</label>
              <select value={form.sectionType} onChange={e => setForm(f => ({ ...f, sectionType: e.target.value }))} className={inp}>
                <option value="custom">Custom</option>
                <option value="trending">Trending (Auto)</option>
                <option value="new">New Releases (Auto)</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input type="checkbox" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} className="accent-primary w-4 h-4" />
            <span className="text-white/70 text-sm">Enabled on homepage</span>
          </label>
          {form.sectionType === "custom" && (
            <div className="mt-4 border border-white/10 rounded-xl p-4">
              <p className="text-white/60 text-xs font-semibold mb-3">Select Movies ({form.movieIds.length} selected)</p>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input value={movieSearch} onChange={e => setMovieSearch(e.target.value)} placeholder="Search movies…" className="w-full pl-9 h-8 rounded-lg bg-black/30 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {filteredMovies.map(m => (
                  <label key={m.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${form.movieIds.includes(m.id) ? "border-primary/40 bg-primary/10" : "border-white/5 bg-white/3 hover:border-white/15"}`}>
                    <input type="checkbox" checked={form.movieIds.includes(m.id)} onChange={() => toggleMovie(m.id)} className="accent-primary w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs text-white/80 truncate">{m.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-5">
            <button onClick={() => setPanelOpen(false)} className="flex-1 h-10 rounded-lg border border-white/10 text-white/70 hover:text-white text-sm transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {editingId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-white/50 bg-black/40 border-b border-white/5 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Title</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Movies</th>
              <th className="px-5 py-3.5">Order</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Loading…</td></tr>
            ) : (sections ?? []).map(s => (
              <tr key={s.id} className={`hover:bg-white/3 transition-colors ${!s.enabled ? "opacity-50" : ""}`}>
                <td className="px-5 py-3.5 text-white font-medium">{s.title}</td>
                <td className="px-5 py-3.5 text-white/60 capitalize">{s.sectionType || "custom"}</td>
                <td className="px-5 py-3.5 text-white/60">{s.movieIds?.length || 0}</td>
                <td className="px-5 py-3.5 text-white/60">{s.orderIndex}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => toggleEnabled(s.id, s.enabled)} className={`text-xs font-bold px-2 py-1 rounded transition-colors ${s.enabled ? "bg-primary/15 text-primary hover:bg-primary/25" : "bg-white/10 text-white/50 hover:bg-white/15"}`}>
                    {s.enabled ? "Enabled" : "Disabled"}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/8 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-destructive/50 hover:text-destructive rounded-lg hover:bg-destructive/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
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
