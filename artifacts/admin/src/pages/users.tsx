import { useGetUsers, getGetUsersQueryKey, useUpdateUserRole, RoleUpdateRole } from "@workspace/api-client-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Users, Shield } from "lucide-react";

export default function UsersPage() {
  const { user: currentUser } = useAdminAuth();
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useGetUsers({ query: { queryKey: getGetUsersQueryKey() } });
  const updateRoleMutation = useUpdateUserRole();

  const handleRoleChange = (userId: number, newRole: RoleUpdateRole) => {
    if (userId === currentUser?.id) { toast.error("You cannot change your own role."); return; }
    updateRoleMutation.mutate({ id: userId, data: { role: newRole } }, {
      onSuccess: () => { toast.success("User role updated"); queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() }); },
      onError: () => toast.error("Failed to update role"),
    });
  };

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      ADMIN: "bg-red-500/15 text-red-400",
      VIP: "bg-yellow-500/15 text-yellow-400",
      FREE: "bg-white/10 text-white/60",
    };
    return map[role] ?? "bg-white/10 text-white/60";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Users</h1>
        <p className="text-muted-foreground text-sm mt-1">{users?.length || 0} registered accounts</p>
      </div>

      <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-white/50 bg-black/40 border-b border-white/5 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Joined</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Loading users…</td></tr>
            ) : (users ?? []).map((user) => (
              <tr key={user.id} className="hover:bg-white/3 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="text-primary text-xs font-bold">{user.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <span className="text-white font-medium">
                      {user.name} {user.id === currentUser?.id && <span className="text-white/30 text-xs">(You)</span>}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-white/60">{user.email}</td>
                <td className="px-5 py-3.5 text-white/60">{format(new Date(user.createdAt), "MMM d, yyyy")}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${roleBadge(user.role)}`}>{user.role}</span>
                </td>
                <td className="px-5 py-3.5">
                  <select
                    disabled={user.id === currentUser?.id || updateRoleMutation.isPending}
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as RoleUpdateRole)}
                    className="h-8 px-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-40"
                  >
                    <option value={RoleUpdateRole.FREE}>FREE</option>
                    <option value={RoleUpdateRole.VIP}>VIP</option>
                    <option value={RoleUpdateRole.ADMIN}>ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
