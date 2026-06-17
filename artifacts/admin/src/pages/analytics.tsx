import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { BarChart3, Users, Crown, Film, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(169,77%,48%)", "hsl(46,65%,52%)", "hsl(210,40%,98%)", "hsl(280,65%,60%)"];

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const userDistribution = [
    { name: "Free", value: stats.freeUsers },
    { name: "VIP", value: stats.vipUsers },
    { name: "Admin", value: stats.totalUsers - stats.freeUsers - stats.vipUsers },
  ];

  const movieData = stats.topMovies.map((m) => ({
    name: m.title.length > 12 ? m.title.slice(0, 12) + "…" : m.title,
    watches: (m as any).watchCount ?? 0,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Platform performance overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users },
          { label: "VIP Users", value: stats.vipUsers, icon: Crown },
          { label: "Total Movies", value: stats.totalMovies, icon: Film },
          { label: "Total Watches", value: stats.totalWatches, icon: Eye },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
            <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-white/5 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-5">Top Movies by Watch Count</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={movieData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(222,47%,8%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="watches" fill="hsl(169,77%,48%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-5">User Distribution</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={userDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {userDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(222,47%,8%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5">
              {userDistribution.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-white/70">{item.name}</span>
                  <span className="text-sm font-bold text-white ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
