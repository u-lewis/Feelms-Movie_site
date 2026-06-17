import { useState } from "react";
import {
  useGetInterpreters, getGetInterpretersQueryKey,
  useCreateInterpreter, useUpdateInterpreter, useDeleteInterpreter,
  useGetMovies,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Languages, Plus, Edit, Trash2, Film, User, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface FormState { name: string; bio: string; photo: string }
const EMPTY: FormState = { name: "", bio: "", photo: "" };

export default function AdminInterpreters() {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  if (!isAdmin) { setLocation("/"); return null; }

  const { data: interpreters = [], isLoading } = useGetInterpreters();
  const { data: movies = [] } = useGetMovies({});
  const createMut = useCreateInterpreter();
  const updateMut = useUpdateInterpreter();
  const deleteMut = useDeleteInterpreter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  const movieCountFor = (name: string) =>
    (movies as any[]).filter((m) => m.interpreted && Array.isArray(m.interpreters) && m.interpreters.includes(name)).length;

  const openAdd = () => { setEditingId(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (interp: any) => {
    setEditingId(interp.id);
    setForm({ name: interp.name, bio: interp.bio ?? "", photo: interp.photo ?? "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), bio: form.bio || undefined, photo: form.photo || undefined };
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, data: payload });
        toast.success("Interpreter updated");
      } else {
        await createMut.mutateAsync({ data: payload });
        toast.success("Interpreter added");
      }
      queryClient.invalidateQueries({ queryKey: getGetInterpretersQueryKey() });
      setDialogOpen(false);
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete interpreter "${name}"?`)) return;
    try {
      await deleteMut.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetInterpretersQueryKey() });
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Languages className="w-8 h-8 text-primary" /> Interpreters
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage sign-language and spoken interpreters across the catalog.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-white/40 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading…
        </div>
      ) : (interpreters as any[]).length === 0 ? (
        <div className="bg-card border border-white/5 rounded-xl p-14 text-center">
          <Languages className="w-12 h-12 text-white/15 mx-auto mb-4" />
          <p className="text-white/50 text-lg font-semibold mb-1">No interpreters yet</p>
          <p className="text-white/30 text-sm">Click <strong>+ Add</strong> to register the first interpreter.</p>
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
              {(interpreters as any[]).map((interp, idx) => {
                const count = movieCountFor(interp.name);
                return (
                  <tr key={interp.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4 text-white/30 font-mono text-xs">{idx + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {interp.photo ? (
                          <img src={interp.photo} alt={interp.name} className="w-9 h-9 rounded-full object-cover shrink-0 bg-white/10 ring-1 ring-white/10" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                            <User className="w-4 h-4 text-primary/70" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{interp.name}</p>
                          {interp.bio && <p className="text-white/35 text-xs truncate max-w-[200px]">{interp.bio}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-white/60">
                        <Film className="w-3.5 h-3.5 text-white/25" />
                        {count} {count === 1 ? "movie" : "movies"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(interp)} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/8 transition-all" title="Edit">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(interp.id, interp.name)} className="text-destructive/50 hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-all" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) { setEditingId(null); setForm(EMPTY); } }}>
        <DialogContent className="bg-card border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-primary" />
              {editingId ? "Edit Interpreter" : "Add Interpreter"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Profile picture preview */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 ring-1 ring-white/10 flex items-center justify-center shrink-0">
                {form.photo ? (
                  <img src={form.photo} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <User className="w-7 h-7 text-white/20" />
                )}
              </div>
              <div className="flex-1">
                <label className="text-white/50 text-xs block mb-1">Profile Picture URL</label>
                <Input
                  value={form.photo}
                  onChange={(e) => setForm((f) => ({ ...f, photo: e.target.value }))}
                  placeholder="https://example.com/photo.jpg"
                  className="bg-black/40 border-white/10 h-9 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-white/50 text-xs block mb-1">Full Name <span className="text-destructive">*</span></label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Jean Baptiste"
                className="bg-black/40 border-white/10"
                autoFocus
              />
            </div>

            <div>
              <label className="text-white/50 text-xs block mb-1">Bio <span className="text-white/25 font-normal">(optional)</span></label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Short bio about this interpreter…"
                className="bg-black/40 border-white/10 resize-none text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 border-white/10" onClick={() => setDialogOpen(false)}>
                <X className="w-4 h-4 mr-1.5" /> Cancel
              </Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                {editingId ? "Save Changes" : "Add Interpreter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
