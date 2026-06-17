import { useState } from "react";
import { useGetAds, getGetAdsQueryKey, useCreateAd, useUpdateAd, useDeleteAd, AdInputType, AdInputTarget } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { RadioReceiver, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";

const adSchema = z.object({
  title: z.string().optional(),
  type: z.nativeEnum(AdInputType),
  mediaUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  duration: z.coerce.number().min(1, "Duration must be at least 1s"),
  active: z.boolean().default(true),
  target: z.nativeEnum(AdInputTarget).default(AdInputTarget.FREE_ONLY),
});

export default function AdminAds() {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  if (!isAdmin) {
    setLocation("/");
    return null;
  }

  const { data: ads, isLoading } = useGetAds({}, { query: { queryKey: getGetAdsQueryKey({}) } });
  
  const createMutation = useCreateAd();
  const updateMutation = useUpdateAd();
  const deleteMutation = useDeleteAd();

  const form = useForm<z.infer<typeof adSchema>>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      title: "", type: AdInputType.PREROLL, mediaUrl: "", imageUrl: "", duration: 15, active: true, target: AdInputTarget.FREE_ONLY
    }
  });

  const onSubmit = (data: z.infer<typeof adSchema>) => {
    const payload = {
      ...data,
      mediaUrl: data.mediaUrl || undefined,
      imageUrl: data.imageUrl || undefined,
    };
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          toast.success("Ad updated");
          setIsCreateOpen(false);
          setEditingId(null);
          queryClient.invalidateQueries({ queryKey: getGetAdsQueryKey({}) });
        }
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => {
          toast.success("Ad created");
          setIsCreateOpen(false);
          queryClient.invalidateQueries({ queryKey: getGetAdsQueryKey({}) });
        }
      });
    }
  };

  const handleEdit = (ad: any) => {
    setEditingId(ad.id);
    form.reset({
      ...ad,
      mediaUrl: ad.mediaUrl || "",
      imageUrl: ad.imageUrl || "",
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this ad?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast.success("Ad deleted");
          queryClient.invalidateQueries({ queryKey: getGetAdsQueryKey({}) });
        }
      });
    }
  };

  const toggleActive = (id: number, currentActive: boolean) => {
    updateMutation.mutate({ id, data: { active: !currentActive } }, {
      onSuccess: () => {
        toast.success(`Ad ${!currentActive ? 'activated' : 'deactivated'}`);
        queryClient.invalidateQueries({ queryKey: getGetAdsQueryKey({}) });
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
            <RadioReceiver className="w-8 h-8 text-primary" /> Ad Management
          </h1>
          <p className="text-muted-foreground">Manage preroll and overlay advertisements.</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="text-white/70">{ads?.length || 0} ads configured</div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingId(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> Create Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 text-white max-h-[90vh] overflow-y-auto max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Ad" : "Create New Ad"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Title/Name</FormLabel>
                    <FormControl><Input {...field} className="bg-black/40 border-white/10" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-black/40 border-white/10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={AdInputType.PREROLL}>Pre-roll (Before Movie)</SelectItem>
                          <SelectItem value={AdInputType.DOWNLOAD}>Download Interstitial</SelectItem>
                          <SelectItem value={AdInputType.TAB_RETURN}>Tab Return Welcome</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="duration" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (seconds)</FormLabel>
                      <FormControl><Input type="number" {...field} className="bg-black/40 border-white/10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl><Input {...field} className="bg-black/40 border-white/10" placeholder="https://..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="mediaUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL (Optional)</FormLabel>
                    <FormControl><Input {...field} className="bg-black/40 border-white/10" placeholder="https://..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex gap-6 mt-4">
                  <FormField control={form.control} name="active" render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel>Active</FormLabel>
                    </FormItem>
                  )} />
                </div>
                
                <Button type="submit" className="w-full mt-6" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Update Ad" : "Create Ad"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-white/60 bg-black/40 border-b border-white/5 uppercase">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Target</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : ads?.map((ad) => (
              <tr key={ad.id} className={`bg-card/50 hover:bg-card ${!ad.active ? 'opacity-50' : ''}`}>
                <td className="px-6 py-4 text-white font-medium">{ad.title || "Untitled Ad"}</td>
                <td className="px-6 py-4 text-white/70">{ad.type}</td>
                <td className="px-6 py-4 text-white/70">{ad.duration}s</td>
                <td className="px-6 py-4 text-white/70">{ad.target}</td>
                <td className="px-6 py-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleActive(ad.id, ad.active)}
                    className={ad.active ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-white"}
                  >
                    {ad.active ? "Active" : "Inactive"}
                  </Button>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(ad)} className="text-white/70 hover:text-white">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(ad.id)} className="text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {!ads?.length && !isLoading && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No ads configured</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
