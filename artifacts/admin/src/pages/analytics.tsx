import { useState } from "react";
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { BarChart3, Users, Crown, Film, Eye, Download, Wifi, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["hsl(169,77%,48%)", "hsl(46,65%,52%)", "hsl(210,40%,98%)", "hsl(280,65%,60%)"];

function getColor(count: number, max: number): string {
  if (count === 0) return "bg-white/5";
  const intensity = Math.ceil((count / max) * 4);
  const shades = [
    "bg-green-900/40",
    "bg-green-700/60",
    "bg-green-500/70",
    "bg-green-400",
  ];
  return shades[Math.min(intensity - 1, 3)];
}

function HeatMap({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);

  // Build a map of date -> count
  const map: Record<string, number> = {};
  data.forEach(d => { map[d.date] = d.count; });

  // Generate last 365 days
  const days: { date: string; count: number; day: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({ date: dateStr, count: map[dateStr] ?? 0, day: d.getDay() });
  }

  // Split into weeks
  const weeks: typeof days[] = [];
  let week: typeof days = [];
  days.forEach((d, i) => {
    if (i === 0) {
      // Pad first week
      for (let p = 0; p < d.day; p++) week.push({ date: "", count: 0, day: p });
    }
    week.push(d);
    if (d.day === 6 || i === days.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dayLabels = ["Mon","Wed","Fri"];

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">Daily Visitors Activity</h2>
        <div className="flex items-center gap-1.5 text-xs text-white/30">
          <span>Less</span>
          {["bg-white/5","bg-green-900/40","bg-green-700/60","bg-green-500/70","bg-green-400"].map((c,i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1 shrink-0">
          <div className="h-4" />
          {["Mon","","Wed","","Fri","",""].map((l,i) => (
            <div key={i} className="h-3 text-[9px] text-white/20 leading-3">{l}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 shrink-0">
            {/* Month label */}
            <div className="h-4 text-[9px] text-white/30 leading-4">
              {week[0]?.date && new Date(week[0].date).getDate() <= 7
                ? months[new Date(week[0].date).getMonth()]
                : ""}
            </div>
            {Array.from({ length: 7 }).map((_, di) => {
              const day = week[di];
              if (!day?.date) return <div key={di} className="w-3 h-3" />;
              return (
                <div key={di} title={`${day.date}: ${day.count} visitors`}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-opacity hover:opacity-80 ${getColor(day.count, max)}`} />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() },
  });
  const API = import.meta.env.VITE_API_URL ?? "";
  const token = localStorage.getItem("feelms_admin_token");

  async function handleExport() {
    const r = await fetch(`${API}/api/stats/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await r.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feelms-analytics-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-8 w-48 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const s = stats as any;
  const movieData = stats.topMovies.map((m) => ({
    name: m.title.length > 14 ? m.title.slice(0, 14) + "…" : m.title,
    watches: (m as any).watchCount ?? 0,
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Analytics
          </h1>
          <p className="text-white/40 text-sm mt-1">Platform performance overview</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Download className="w-4 h-4" /> Export JSON
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
          { label: "Total Movies", value: stats.totalMovies, icon: Film, color: "text-primary" },
          { label: "Unique Visitors", value: stats.totalWatches, icon: Wifi, color: "text-green-400" },
          { label: "Today's Visitors", value: s.todayUniqueIPs ?? 0, icon: Eye, color: "text-amber-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <p className="text-xs text-white/40">{label}</p>
            </div>
            <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <HeatMap data={s.dailyVisits ?? []} />

      {/* Top movies + Frequent visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Most Watched Movies</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={movieData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(222,47%,8%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="watches" fill="hsl(169,77%,48%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Frequent Visitors</h2>
          {(s.frequentVisitors ?? []).length === 0 ? (
            <div className="text-center py-8 text-white/20 text-sm">No visitor data yet</div>
          ) : (
            <div className="space-y-2">
              {(s.frequentVisitors ?? []).map((v: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white/20 text-xs w-4">{i + 1}</span>
                    <span className="text-white/60 text-xs font-mono">{v.ip}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/30 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {v.lastSeen ? new Date(v.lastSeen).toLocaleDateString() : "—"}
                    </span>
                    <span className="text-primary font-bold text-sm">{v.visits} movies</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
