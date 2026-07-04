import { useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { toast } from "sonner";
import { Download, Database, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "";
const STORAGE_KEY = "feelms_backup_log";

interface BackupLog {
  date: string;
  size: string;
  movies: number;
  banners: number;
  sections: number;
  episodes: number;
}

export default function BackupPage() {
  const { token } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<BackupLog[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
  });

  async function handleExport() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/backup/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error("Export failed");

      const data = await r.json();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `feelms-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Save log
      const log: BackupLog = {
        date: new Date().toISOString(),
        size: `${(blob.size / 1024).toFixed(1)} KB`,
        movies: data.data.movies.length,
        banners: data.data.banners.length,
        sections: data.data.sections.length,
        episodes: data.data.episodes.length,
      };
      const newLogs = [log, ...logs].slice(0, 10);
      setLogs(newLogs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
      toast.success("Backup downloaded successfully");
    } catch {
      toast.error("Backup failed");
    } finally {
      setLoading(false);
    }
  }

  const lastBackup = logs[0];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-white">Backup</h1>
          <p className="text-white/40 text-sm">Export your site data as a JSON file</p>
        </div>
      </div>

      {/* Status card */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Last Backup</p>
            {lastBackup ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">
                  {new Date(lastBackup.date).toLocaleString()}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-white/50">No backup yet</span>
              </div>
            )}
            {lastBackup && (
              <p className="text-white/30 text-xs mt-1">
                {lastBackup.movies} movies · {lastBackup.episodes} episodes · {lastBackup.banners} banners · {lastBackup.size}
              </p>
            )}
          </div>
          <button onClick={handleExport} disabled={loading}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {loading ? "Exporting..." : "Export Now"}
          </button>
        </div>
      </div>

      {/* Backup log */}
      {logs.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Backup History
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {logs.map((log, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">{new Date(log.date).toLocaleString()}</p>
                  <p className="text-white/30 text-xs">
                    {log.movies} movies · {log.episodes} episodes · {log.banners} banners
                  </p>
                </div>
                <span className="text-white/30 text-xs">{log.size}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
