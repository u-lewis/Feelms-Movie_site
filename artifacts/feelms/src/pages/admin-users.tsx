import { useGetUsers, getGetUsersQueryKey, useUpdateUserRole, RoleUpdateRole } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, Shield } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminUsers() {
  const { isAdmin, user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  if (!isAdmin) {
    setLocation("/");
    return null;
  }

  const { data: users, isLoading } = useGetUsers({ query: { queryKey: getGetUsersQueryKey() } });
  const updateRoleMutation = useUpdateUserRole();

  const handleRoleChange = (userId: number, newRole: RoleUpdateRole) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot change your own role here.");
      return;
    }
    
    updateRoleMutation.mutate({ id: userId, data: { role: newRole } }, {
      onSuccess: () => {
        toast.success("User role updated");
        queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() });
      },
      onError: () => {
        toast.error("Failed to update role");
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" /> User Management
          </h1>
          <p className="text-muted-foreground">Manage user roles and permissions.</p>
        </div>
      </div>

      <div className="bg-card border border-white/5 rounded-xl overflow-hidden mt-8">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-white/60 bg-black/40 border-b border-white/5 uppercase">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading users...</td></tr>
            ) : users?.map((user) => (
              <tr key={user.id} className="bg-card/50 hover:bg-card">
                <td className="px-6 py-4 text-white font-medium">{user.name} {user.id === currentUser?.id && "(You)"}</td>
                <td className="px-6 py-4 text-white/70">{user.email}</td>
                <td className="px-6 py-4 text-white/70">{format(new Date(user.createdAt), "MMM d, yyyy")}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'ADMIN' ? 'bg-destructive/20 text-destructive' : 
                    user.role === 'VIP' ? 'bg-vip/20 text-vip' : 
                    'bg-white/10 text-white/70'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Select 
                    disabled={user.id === currentUser?.id || updateRoleMutation.isPending}
                    value={user.role as RoleUpdateRole} 
                    onValueChange={(val) => handleRoleChange(user.id, val as RoleUpdateRole)}
                  >
                    <SelectTrigger className="w-[130px] h-8 bg-black/40 border-white/10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={RoleUpdateRole.FREE}>FREE</SelectItem>
                      <SelectItem value={RoleUpdateRole.VIP}>VIP</SelectItem>
                      <SelectItem value={RoleUpdateRole.ADMIN}>ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
