import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Users, Film, PlayCircle, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAdmin) {
    setLocation("/");
    return null;
  }

  const { data: stats, isLoading } = useGetDashboardStats({
    query: {
      queryKey: getGetDashboardStatsQueryKey()
    }
  });

  if (isLoading) {
    return <div className="p-8 animate-pulse text-white">Loading dashboard...</div>;
  }

  if (!stats) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/users" className="bg-card hover:bg-white/10 text-white px-4 py-2 rounded-md text-sm font-medium border border-white/10 transition-colors">Users</Link>
          <Link href="/admin/movies" className="bg-card hover:bg-white/10 text-white px-4 py-2 rounded-md text-sm font-medium border border-white/10 transition-colors">Manage Movies</Link>
          <Link href="/admin/banners" className="bg-card hover:bg-white/10 text-white px-4 py-2 rounded-md text-sm font-medium border border-white/10 transition-colors">Hero Banners</Link>
          <Link href="/admin/sections" className="bg-card hover:bg-white/10 text-white px-4 py-2 rounded-md text-sm font-medium border border-white/10 transition-colors">Sections</Link>
          <Link href="/admin/interpreters" className="bg-card hover:bg-white/10 text-white px-4 py-2 rounded-md text-sm font-medium border border-white/10 transition-colors">Interpreters</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Movies</CardTitle>
            <Film className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalMovies.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">In the library</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Watches</CardTitle>
            <PlayCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalWatches.toLocaleString()}</div>
            <p className="text-xs text-primary mt-1">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Healthy</div>
            <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Top Movies */}
        <Card className="bg-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Top Performing Movies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topMovies.map((movie, index) => (
                <div key={movie.id} className="flex items-center gap-4">
                  <div className="font-bold text-muted-foreground w-4">{index + 1}</div>
                  <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{movie.genres?.join(", ")}</p>
                  </div>
                  <div className="text-sm font-medium text-white">
                    {movie.watchCount?.toLocaleString()} plays
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
