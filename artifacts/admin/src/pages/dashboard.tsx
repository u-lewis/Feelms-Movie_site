import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Users, Film, PlayCircle, Activity, TrendingUp, Crown } from "lucide-react";

function StatCard({ title, value, sub, icon: Icon, highlight }: { title: string; value: string | number; sub: string; icon: React.ElementType; highlight?: boolean }) {
  return (
    <div className="bg-card border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highlight ? "bg-primary/15" : "bg-white/5"}`}>
          <Icon className={`w-4 h-4 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
        </div>
      </div>
      <div className={`text-2xl font-bold ${highlight ? "text-primary" : "text-white"}`}>{typeof value === "number" ? value.toLocaleString() : value}</div>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back. Here's what's happening on Feelms.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} sub="Registered accounts" icon={Users} />
        <StatCard title="VIP Subscribers" value={stats.vipUsers} sub={`${stats.freeUsers} free users`} icon={Crown} highlight />
        <StatCard title="Total Movies" value={stats.totalMovies} sub={`${stats.vipMovies} VIP-only`} icon={Film} />
        <StatCard title="Total Watches" value={stats.totalWatches} sub="All-time views" icon={PlayCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-white">Top Performing Movies</h2>
          </div>
          <div className="space-y-3">
            {stats.topMovies.map((movie, i) => (
              <div key={movie.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                <img src={movie.poster} alt={movie.title} className="w-9 h-12 object-cover rounded shrink-0 bg-white/5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{(movie as any).genres?.join(", ")}</p>
                </div>
                <span className="text-xs text-white/60 shrink-0">{(movie as any).watchCount?.toLocaleString()} plays</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-white">Recent Payments</h2>
          </div>
          <div className="space-y-3">
            {stats.recentPayments.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-6">No payments yet</p>
            ) : (
              stats.recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-white font-medium">#{p.id}</p>
                    <p className="text-xs text-muted-foreground">{p.provider} · {p.plan}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{p.amount.toLocaleString()} RWF</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${p.status === "SUCCESS" ? "bg-green-500/15 text-green-400" : "bg-amber-500/15 text-amber-400"}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
