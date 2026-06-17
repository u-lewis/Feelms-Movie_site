import { useState } from "react";
import { useGetInterpreters, getGetInterpretersQueryKey, useCreateInterpreter, useUpdateInterpreter, useDeleteInterpreter, useGetMovies } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Languages, Plus, Edit, Trash2, User, Film, Loader2, X } from "lucide-react";

interface Form { name: string; bio: string; photo: string; }
const EMPTY: Form = { name: "", bio: "", photo: "" };

export default function InterpretersPage() {
  const queryClient = useQueryClient();
  const { data: interpreters = [], isLoading } = useGetInterpreters();
  const { data: movies = [] } = useGetMovies({});
  const createMut = useCreateInterpreter();
  const updateMut = useUpdateInterpreter();
  const deleteMut = useDeleteInterpreter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetInterpretersQueryKey() });
  const movieCount = (name: string) => (movies as any[]).filter(m => m.interpreted && Array.isArray(m.interpreters) && m.interpreters.includes(name)).length;

  const openAdd = () => { setEditingId(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (i: any) => { setEditingId(i.id); setForm({ name: i.name, bio: i.bio ?? "", photo: i.photo ?? "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), bio: form.bio || undefined, photo: form.photo || undefined };
      if (editingId) { await updateMut.mutateAsync({ id: editingId, data: payload }); toast.success("Updated"); }
      else { await createMut.mutateAsync({ data: payload }); toast.success("Added"); }
      invalidate(); setDialogOpen(false);
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await deleteMut.mutateAsync({ id }); invalidate(); toast.success("Deleted");
  };

  const inp = "w-full px-3 h-9 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2"><Languages className="w-6 h-6 text-primary" /> Interpreters</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage sign-language interpreters across the catalog</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white flex items-center gap-2"><Languages className="w-4 h-4 text-primary" /> {editingId ? "Edit Interpreter" : "Add Interpreter"}</h2>
              <button onClick={() => setDialogOpen(false)} className="text-white/30 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 ring-1 ring-white/10 flex items-center justify-center shrink-0">
                  {form.photo ? <img src={form.photo} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    : <User className="w-7 h-7 text-white/20" />}
                </div>
                <div className="flex-1">
                  <label className="text-white/50 text-xs block mb-1">Profile Picture URL</label>
                  <input value={form.photo} onChange={e => setForm(f => ({ ...f, photo: e.target.value }))} placeholder="https://example.com/photo.jpg" className={inp} />
                </div>
              </div>
              <div><label className="text-white/50 text-xs block mb-1">Full Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jean Baptiste" className={inp} autoFocus /></div>
              <div><label className="text-white/50 text-xs block mb-1">Bio (optional)</label><textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} placeholder="Short bio…" className={`${inp} h-auto py-2 resize-none`} /></div>
              <div className="flex gap-2">
                <button onClick={() => setDialogOpen(false)} className="flex-1 h-10 rounded-lg border border-white/10 text-white/70 hover:text-white text-sm transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {editingId ? "Save Changes" : "Add Interpreter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-white/40 gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading…</div>
      ) : (interpreters as any[]).length === 0 ? (
        <div className="bg-card border border-white/5 rounded-xl p-14 text-center">
          <Languages className="w-12 h-12 text-white/15 mx-auto mb-4" />
          <p className="text-white/50 text-lg font-semibold mb-1">No interpreters yet</p>
          <p className="text-white/30 text-sm">Click + Add to register the first interpreter.</p>
        </div>
      ) : (
        <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-white/50 bg-black/40 border-b border-white/5 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-10">No</th>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Interpreted Movies</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(interpreters as any[]).map((interp, idx) => (
                <tr key={interp.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4 text-white/30 font-mono text-xs">{idx + 1}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {interp.photo ? <img src={interp.photo} alt={interp.name} className="w-9 h-9 rounded-full object-cover shrink-0 bg-white/10 ring-1 ring-white/10" />
                        : <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20"><User className="w-4 h-4 text-primary/70" /></div>}
                      <div>
                        <p className="text-white font-medium">{interp.name}</p>
                        {interp.bio && <p className="text-white/35 text-xs truncate max-w-[200px]">{interp.bio}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-white/60"><Film className="w-3.5 h-3.5 text-white/25" /> {movieCount(interp.name)} movies</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(interp)} className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/8 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(interp.id, interp.name)} className="p-1.5 text-destructive/50 hover:text-destructive rounded-lg hover:bg-destructive/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
