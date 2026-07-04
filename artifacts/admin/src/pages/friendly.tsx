import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Save, X, Loader2, Globe, GripVertical } from "lucide-react";

interface FriendlySite {
  id: number;
  name: string;
  image: string;
  url: string;
  order: number;
}

const API = import.meta.env.VITE_API_URL ?? "";
const empty = { name: "", image: "", url: "", order: 0 };

export default function FriendlyPage() {
  const { token } = useAdminAuth();
  const [sites, setSites] = useState<FriendlySite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => { fetchSites(); }, []);

  async function fetchSites() {
    setLoading(true);
    const r = await fetch(`${API}/api/friendly`);
    const data = await r.json();
    setSites(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      let r;
      if (editingId) {
        r = await fetch(`${API}/api/friendly/${editingId}`, { method: "PATCH", headers, body: JSON.stringify(form) });
      } else {
        r = await fetch(`${API}/api/friendly`, { method: "POST", headers, body: JSON.stringify(form) });
      }
      if (!r.ok) throw new Error("Failed");
      toast.success(editingId ? "Site updated" : "Site added");
      setShowForm(false);
      setEditingId(null);
      setForm({ ...empty });
      fetchSites();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this site?")) return;
    const r = await fetch(`${API}/api/friendly/${id}`, { method: "DELETE", headers });
    if (r.ok) { toast.success("Deleted"); fetchSites(); }
    else toast.error("Failed to delete");
  }

  function startEdit(site: FriendlySite) {
    setForm({ name: site.name, image: site.image, url: site.url, order: site.order });
    setEditingId(site.id);
    setShowForm(true);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-white">Friendly Sites</h1>
            <p className="text-white/40 text-sm">External streaming partners shown on the homepage</p>
          </div>
        </div>
        <button onClick={() => { setForm({ ...empty }); setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Site
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">{editingId ? "Edit Site" : "Add New Site"}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Site Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Crunchyroll"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Order</label>
              <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div className="col-span-2">
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Image URL</label>
              <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                placeholder="https://..."
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div className="col-span-2">
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Site URL</label>
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50" />
            </div>
            {/* Image preview */}
            {form.image && (
              <div className="col-span-2">
                <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Preview</label>
                <div className="relative w-48 h-28 rounded-xl overflow-hidden border border-white/10">
                  <img src={form.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                    <span className="text-white font-bold text-sm">{form.name}</span>
                  </div>
                </div>
              </div>
            )}
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

      {/* Sites grid */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : sites.length === 0 ? (
        <div className="text-center py-12 text-white/30">No friendly sites yet. Add your first one above.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sites.map(site => (
            <div key={site.id} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video">
              <img src={site.image} alt={site.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                <span className="text-white font-bold text-sm">{site.name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(site)} className="p-1.5 bg-black/60 rounded-lg text-white/70 hover:text-white">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(site.id)} className="p-1.5 bg-black/60 rounded-lg text-red-400 hover:text-red-300">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-black/60 rounded px-1.5 py-0.5 text-white/50 text-xs">
                #{site.order}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
