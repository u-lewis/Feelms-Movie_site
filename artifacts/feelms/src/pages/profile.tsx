import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetWatchHistory, getGetWatchHistoryQueryKey, useGetPaymentHistory, getGetPaymentHistoryQueryKey, getGetMeQueryKey } from "@workspace/api-client-react";
import { MovieCard } from "@/components/movie-card";
import { Calendar, Clock, CreditCard, User as UserIcon, LogOut, Edit2, Save, X, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: watchHistory } = useGetWatchHistory({ query: { enabled: !!user, queryKey: getGetWatchHistoryQueryKey() } });
  const { data: paymentHistory } = useGetPaymentHistory({ query: { enabled: !!user, queryKey: getGetPaymentHistoryQueryKey() } });

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCurPwd, setEditCurPwd] = useState("");
  const [editNewPwd, setEditNewPwd] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  if (!user) {
    setLocation("/login");
    return null;
  }

  const nextUpdateAt = (user as any).profileUpdatedAt
    ? new Date(new Date((user as any).profileUpdatedAt).getTime() + 7 * 24 * 60 * 60 * 1000)
    : null;
  const canEdit = !nextUpdateAt || new Date() > nextUpdateAt;
  const daysUntilEdit = nextUpdateAt ? Math.ceil((nextUpdateAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  const openEdit = () => {
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditCurPwd("");
    setEditNewPwd("");
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    setEditSaving(true);
    try {
      const token = localStorage.getItem("feelms_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editName || undefined,
          email: editEmail || undefined,
          currentPassword: editCurPwd || undefined,
          newPassword: editNewPwd || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429 && data.nextUpdateAt) {
          const days = Math.ceil((new Date(data.nextUpdateAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          toast.error(`Profile can only be updated once per week. Try again in ${days} day${days !== 1 ? "s" : ""}.`);
        } else {
          toast.error(data.error || "Failed to update profile");
        }
        return;
      }
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setEditOpen(false);
    } catch {
      toast.error("Update failed. Please try again.");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <div className="w-full md:w-80 shrink-0 space-y-6">
          <div className="bg-card border border-white/5 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
            <div className="w-24 h-24 mx-auto bg-black/40 rounded-full flex items-center justify-center border-2 border-white/10 mb-4 relative z-10">
              <UserIcon className="w-10 h-10 text-white/50" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1 relative z-10">{user.name}</h2>
            <p className="text-muted-foreground text-sm mb-6 relative z-10">{user.email}</p>

            <div className="bg-black/40 rounded-xl p-4 text-left border border-white/5 space-y-3 relative z-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Status</span>
                <span className="font-semibold text-white">{user.role}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Member since</span>
                <span className="text-white">{format(new Date(user.createdAt), "MMM yyyy")}</span>
              </div>
              {user.vipExpiry && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">VIP Expiry</span>
                  <span className="text-white">{format(new Date(user.vipExpiry), "MMM d, yyyy")}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-6 relative z-10">
              <Button
                variant="outline"
                className="w-full bg-black/40 border-white/10 hover:bg-white/5 hover:text-white"
                onClick={openEdit}
              >
                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
              <Button
                variant="outline"
                className="w-full bg-black/40 border-white/10 hover:bg-white/5 hover:text-white"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>

        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-12">
          {/* Continue Watching */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
            </div>
            {watchHistory?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {watchHistory.map((entry) => (
                  entry.movie && (
                    <div key={entry.id} className="relative group">
                      <MovieCard movie={entry.movie} />
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-black/50 overflow-hidden rounded-b-md z-20">
                        <div className="h-full bg-primary" style={{ width: `${Math.max(10, Math.random() * 90)}%` }} />
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="bg-card/30 border border-white/5 rounded-xl p-8 text-center">
                <p className="text-muted-foreground">You haven't watched any movies yet.</p>
                <Button asChild variant="link" className="text-primary mt-2">
                  <Link href="/movies">Browse Movies</Link>
                </Button>
              </div>
            )}
          </section>

          {/* Payment History */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-white">Payment History</h2>
            </div>
            {paymentHistory?.length ? (
              <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-white/60 bg-black/40 border-b border-white/5 uppercase">
                    <tr>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Plan</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id} className="bg-card/50 hover:bg-card">
                        <td className="px-6 py-4 text-white">{format(new Date(payment.createdAt), "MMM d, yyyy")}</td>
                        <td className="px-6 py-4 text-white/80 capitalize">{payment.plan || payment.provider}</td>
                        <td className="px-6 py-4 text-white">${payment.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            payment.status === "SUCCESS" ? "bg-primary/20 text-primary" :
                            payment.status === "PENDING" ? "bg-yellow-500/20 text-yellow-500" :
                            "bg-destructive/20 text-destructive"
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-card/30 border border-white/5 rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No payment history found.</p>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription className="text-white/50">
              {canEdit
                ? "Update your account details below."
                : `Profile updates are limited to once per week. You can update again in ${daysUntilEdit} day${daysUntilEdit !== 1 ? "s" : ""}.`}
            </DialogDescription>
          </DialogHeader>

          {!canEdit ? (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-2">
              <LucideLock className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-sm text-amber-300">
                Next update available on{" "}
                <strong>{nextUpdateAt ? format(nextUpdateAt, "MMM d, yyyy") : ""}</strong>.
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-white/70 text-sm block mb-1.5">Display Name</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-black/40 border-white/10"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm block mb-1.5">Email Address</label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="bg-black/40 border-white/10"
                  placeholder="you@example.com"
                />
              </div>
              <div className="border-t border-white/5 pt-4">
                <p className="text-white/40 text-xs mb-3 uppercase tracking-wider">Change Password (optional)</p>
                <div className="space-y-3">
                  <Input
                    type="password"
                    value={editCurPwd}
                    onChange={(e) => setEditCurPwd(e.target.value)}
                    className="bg-black/40 border-white/10"
                    placeholder="Current password"
                  />
                  <Input
                    type="password"
                    value={editNewPwd}
                    onChange={(e) => setEditNewPwd(e.target.value)}
                    className="bg-black/40 border-white/10"
                    placeholder="New password (min 6 chars)"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 border-white/10" onClick={() => setEditOpen(false)}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleSaveProfile} disabled={editSaving}>
                  <Save className="w-4 h-4 mr-2" /> {editSaving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
