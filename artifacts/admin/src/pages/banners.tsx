import { useState } from "react";
import { useGetBanners, getGetBannersQueryKey, useCreateBanner, useUpdateBanner, useDeleteBanner } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Image, Plus, Edit, Trash2, Loader2 } from "lucide-react";

interface BannerForm {
  title: string; subtitle: string; image: string; videoUrl: string;
  ctaText: string; ctaLink: string; movieId: string; active: boolean; orderIndex: number;
}

const EMPTY: BannerForm = { title: "", subtitle: "", image: "", videoUrl: "", ctaText: "", ctaLink: "", movieId: "", active: true, orderIndex: 0 };

export default function BannersPage() {
  const queryClient = useQueryClient();
  const { data: banners, isLoading } = useGetBanners({ all: true }, { query: { queryKey: getGetBannersQueryKey({ all: true }) } });
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BannerForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetBannersQueryKey({ all: true }) });
    queryClient.invalidateQueries({ queryKey: getGetBannersQueryKey({ all: false }) });
  };

  const openAdd = () => { setEditingId(null); setForm(EMPTY); setPanelOpen(true); };
  const openEdit = (b: any) => {
    setEditingId(b.id);
    setForm({ title: b.title || "", subtitle: b.subtitle || "", image: b.image || "", videoUrl: b.videoUrl || "", ctaText: b.ctaText || "", ctaLink: b.ctaLink || "", movieId: b.movieId?.toString() || "", active: b.active, orderIndex: b.orderIndex || 0 });
    setPanelOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    setSaving(true);
    const payload: any = { ...form, image: form.image || undefined, videoUrl: form.videoUrl || undefined, movieId: form.movieId ? Number(form.movieId) : undefined };
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast.success("Banner updated");
      } else {
        await createMutation.mutateAsync({ data: payload });
        toast.success("Banner created");
      }
      invalidate(); setPanelOpen(false);
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this banner?")) return;
    await deleteMutation.mutateAsync({ id });
    toast.success("Deleted"); invalidate();
  };

  const toggleActive = (id: number, active: boolean) => {
    updateMutation.mutate({ id, data: { active: !active } }, { onSuccess: () => { toast.success(active ? "Deactivated" : "Activated"); invalidate(); } });
  };

  const inp = "w-full px-3 h-9 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
  const lbl = "text-white/50 text-xs block mb-1";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2"><Image className="w-6 h-6 text-primary" /> Hero Banners</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage the homepage hero carousel</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {panelOpen && (
        <div className="bg-card border border-white/10 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">{editingId ? "Edit Banner" : "New Banner"}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Title *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inp} /></div>
            <div><label className={lbl}>Subtitle</label><input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className={inp} /></div>
            <div><label className={lbl}>Image URL</label><input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." className={inp} /></div>
            <div><label className={lbl}>Video URL</label><input value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://..." className={inp} /></div>
            <div><label className={lbl}>CTA Text</label><input value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} placeholder="Watch Now" className={inp} /></div>
            <div><label className={lbl}>CTA Link</label><input value={form.ctaLink} onChange={e => setForm(f => ({ ...f, ctaLink: e.target.value }))} placeholder="/movies/123" className={inp} /></div>
            <div><label className={lbl}>Movie ID (optional)</label><input type="number" value={form.movieId} onChange={e => setForm(f => ({ ...f, movieId: e.target.value }))} className={inp} /></div>
            <div><label className={lbl}>Order Index</label><input type="number" value={form.orderIndex} onChange={e => setForm(f => ({ ...f, orderIndex: Number(e.target.value) }))} className={inp} /></div>
          </div>
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-primary w-4 h-4" />
            <span className="text-white/70 text-sm">Active (show on homepage)</span>
          </label>
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
              <th className="px-5 py-3.5">Preview</th>
              <th className="px-5 py-3.5">Title</th>
              <th className="px-5 py-3.5">Order</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Loading…</td></tr>
            ) : (banners ?? []).map((b) => (
              <tr key={b.id} className={`hover:bg-white/3 transition-colors ${!b.active ? "opacity-50" : ""}`}>
                <td className="px-5 py-3.5">
                  {b.image ? <img src={b.image} alt={b.title} className="w-20 h-11 object-cover rounded border border-white/10" />
                    : <div className="w-20 h-11 bg-white/10 rounded flex items-center justify-center text-xs text-white/30">No image</div>}
                </td>
                <td className="px-5 py-3.5 text-white font-medium">{b.title}</td>
                <td className="px-5 py-3.5 text-white/60">{b.orderIndex}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => toggleActive(b.id, b.active)} className={`text-xs font-bold px-2 py-1 rounded transition-colors ${b.active ? "bg-primary/15 text-primary hover:bg-primary/25" : "bg-white/10 text-white/50 hover:bg-white/15"}`}>
                    {b.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(b)} className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/8 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 text-destructive/50 hover:text-destructive rounded-lg hover:bg-destructive/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
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
