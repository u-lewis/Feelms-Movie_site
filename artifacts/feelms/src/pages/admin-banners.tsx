import { useState } from "react";
import { useGetBanners, getGetBannersQueryKey, useCreateBanner, useUpdateBanner, useDeleteBanner } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Image, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  movieId: z.coerce.number().optional().or(z.literal(0)),
  active: z.boolean().default(true),
  orderIndex: z.coerce.number().default(0),
});

export default function AdminBanners() {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  if (!isAdmin) {
    setLocation("/");
    return null;
  }

  const { data: banners, isLoading } = useGetBanners({ all: true }, { query: { queryKey: getGetBannersQueryKey({ all: true }) } });
  
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const form = useForm<z.infer<typeof bannerSchema>>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "", subtitle: "", image: "", videoUrl: "", ctaText: "", ctaLink: "", active: true, orderIndex: 0
    }
  });

  const onSubmit = (data: z.infer<typeof bannerSchema>) => {
    // Transform empty strings to undefined for API
    const cleanedData = {
      ...data,
      image: data.image || undefined,
      videoUrl: data.videoUrl || undefined,
      movieId: data.movieId || undefined
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: cleanedData }, {
        onSuccess: () => {
          toast.success("Banner updated");
          setIsCreateOpen(false);
          setEditingId(null);
          queryClient.invalidateQueries({ queryKey: getGetBannersQueryKey({ all: true }) });
          queryClient.invalidateQueries({ queryKey: getGetBannersQueryKey({ all: false }) });
        }
      });
    } else {
      createMutation.mutate({ data: cleanedData }, {
        onSuccess: () => {
          toast.success("Banner created");
          setIsCreateOpen(false);
          queryClient.invalidateQueries({ queryKey: getGetBannersQueryKey({ all: true }) });
          queryClient.invalidateQueries({ queryKey: getGetBannersQueryKey({ all: false }) });
        }
      });
    }
  };

  const handleEdit = (banner: any) => {
    setEditingId(banner.id);
    form.reset({
      ...banner,
      image: banner.image || "",
      videoUrl: banner.videoUrl || "",
      movieId: banner.movieId || 0
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast.success("Banner deleted");
          queryClient.invalidateQueries({ queryKey: getGetBannersQueryKey({ all: true }) });
          queryClient.invalidateQueries({ queryKey: getGetBannersQueryKey({ all: false }) });
        }
      });
    }
  };

  const toggleActive = (id: number, currentActive: boolean) => {
    updateMutation.mutate({ id, data: { active: !currentActive } }, {
      onSuccess: () => {
        toast.success(`Banner ${!currentActive ? 'activated' : 'deactivated'}`);
        queryClient.invalidateQueries({ queryKey: getGetBannersQueryKey({ all: true }) });
        queryClient.invalidateQueries({ queryKey: getGetBannersQueryKey({ all: false }) });
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
            <Image className="w-8 h-8 text-primary" /> Hero Banners
          </h1>
          <p className="text-muted-foreground">Manage the homepage hero carousel.</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="text-white/70">{banners?.length || 0} banners total</div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingId(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 text-white max-h-[90vh] overflow-y-auto max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Banner" : "Add New Banner"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input {...field} className="bg-black/40 border-white/10" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="subtitle" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl><Input {...field} className="bg-black/40 border-white/10" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="image" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl><Input {...field} className="bg-black/40 border-white/10" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="ctaText" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTA Text</FormLabel>
                      <FormControl><Input {...field} className="bg-black/40 border-white/10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ctaLink" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTA Link</FormLabel>
                      <FormControl><Input {...field} className="bg-black/40 border-white/10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="movieId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Movie ID (optional Info link)</FormLabel>
                      <FormControl><Input type="number" {...field} className="bg-black/40 border-white/10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="orderIndex" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Index</FormLabel>
                      <FormControl><Input type="number" {...field} className="bg-black/40 border-white/10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0 mt-4">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel>Active (Show on homepage)</FormLabel>
                  </FormItem>
                )} />
                
                <Button type="submit" className="w-full mt-6" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Update Banner" : "Create Banner"}
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
              <th className="px-6 py-4">Preview</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : banners?.map((banner) => (
              <tr key={banner.id} className={`bg-card/50 hover:bg-card ${!banner.active ? 'opacity-50' : ''}`}>
                <td className="px-6 py-4">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} className="w-24 h-12 object-cover rounded border border-white/10" />
                  ) : (
                    <div className="w-24 h-12 bg-white/10 rounded flex items-center justify-center text-xs">No image</div>
                  )}
                </td>
                <td className="px-6 py-4 text-white font-medium">{banner.title}</td>
                <td className="px-6 py-4 text-white/70">{banner.orderIndex}</td>
                <td className="px-6 py-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleActive(banner.id, banner.active)}
                    className={banner.active ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-white"}
                  >
                    {banner.active ? "Active" : "Inactive"}
                  </Button>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)} className="text-white/70 hover:text-white">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)} className="text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {!banners?.length && !isLoading && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No banners found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
