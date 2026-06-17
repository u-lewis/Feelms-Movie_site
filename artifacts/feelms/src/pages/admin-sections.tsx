import { useState } from "react";
import { useGetSections, getGetSectionsQueryKey, useCreateSection, useUpdateSection, useDeleteSection, useGetMovies, getGetMoviesQueryKey } from "@workspace/api-client-react";
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
import { Layers, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const sectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  movieIds: z.array(z.number()),
  orderIndex: z.coerce.number().default(0),
  enabled: z.boolean().default(true),
  sectionType: z.string().optional(),
});

export default function AdminSections() {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedMovieIds, setSelectedMovieIds] = useState<number[]>([]);
  
  if (!isAdmin) {
    setLocation("/");
    return null;
  }

  const { data: sections, isLoading } = useGetSections({ all: true }, { query: { queryKey: getGetSectionsQueryKey({ all: true }) } });
  const { data: movies } = useGetMovies({}, { query: { queryKey: getGetMoviesQueryKey() } });
  
  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();
  const deleteMutation = useDeleteSection();

  const form = useForm<z.infer<typeof sectionSchema>>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: "", movieIds: [], orderIndex: 0, enabled: true, sectionType: "custom"
    }
  });

  const onSubmit = (data: z.infer<typeof sectionSchema>) => {
    const payload = { ...data, movieIds: selectedMovieIds };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          toast.success("Section updated");
          setIsCreateOpen(false);
          setEditingId(null);
          queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey({ all: true }) });
          queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey({ all: false }) });
        }
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => {
          toast.success("Section created");
          setIsCreateOpen(false);
          queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey({ all: true }) });
          queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey({ all: false }) });
        }
      });
    }
  };

  const handleEdit = (section: any) => {
    setEditingId(section.id);
    setSelectedMovieIds(section.movieIds || []);
    form.reset({
      ...section,
      movieIds: section.movieIds || [],
      sectionType: section.sectionType || "custom"
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this section?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast.success("Section deleted");
          queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey({ all: true }) });
          queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey({ all: false }) });
        }
      });
    }
  };

  const toggleEnabled = (id: number, currentEnabled: boolean) => {
    updateMutation.mutate({ id, data: { enabled: !currentEnabled } }, {
      onSuccess: () => {
        toast.success(`Section ${!currentEnabled ? 'enabled' : 'disabled'}`);
        queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey({ all: true }) });
        queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey({ all: false }) });
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
            <Layers className="w-8 h-8 text-primary" /> Sections Management
          </h1>
          <p className="text-muted-foreground">Manage homepage movie rows.</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="text-white/70">{sections?.length || 0} sections total</div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingId(null);
            setSelectedMovieIds([]);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Section" : "Add New Section"}</DialogTitle>
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
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="orderIndex" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Index</FormLabel>
                      <FormControl><Input type="number" {...field} className="bg-black/40 border-white/10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="sectionType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-black/40 border-white/10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="custom">Custom (Select Movies)</SelectItem>
                          <SelectItem value="trending">Trending (Auto)</SelectItem>
                          <SelectItem value="new">New Releases (Auto)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="enabled" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0 mt-4 mb-4">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel>Enabled (Show on homepage)</FormLabel>
                  </FormItem>
                )} />

                {form.watch("sectionType") === "custom" && (
                  <div className="border border-white/10 rounded-md p-4 bg-black/20">
                    <h3 className="text-sm font-medium mb-3">Select Movies for this Section</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2">
                      {movies?.map(movie => (
                        <div key={movie.id} className="flex items-center space-x-2 bg-card p-2 rounded border border-white/5">
                          <Checkbox 
                            id={`movie-${movie.id}`} 
                            checked={selectedMovieIds.includes(movie.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMovieIds([...selectedMovieIds, movie.id]);
                              } else {
                                setSelectedMovieIds(selectedMovieIds.filter(id => id !== movie.id));
                              }
                            }}
                          />
                          <label htmlFor={`movie-${movie.id}`} className="text-xs truncate cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {movie.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button type="submit" className="w-full mt-6" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Update Section" : "Create Section"}
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
              <th className="px-6 py-4">Movies Count</th>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : sections?.map((section) => (
              <tr key={section.id} className={`bg-card/50 hover:bg-card ${!section.enabled ? 'opacity-50' : ''}`}>
                <td className="px-6 py-4 text-white font-medium">{section.title}</td>
                <td className="px-6 py-4 text-white/70 capitalize">{section.sectionType || 'custom'}</td>
                <td className="px-6 py-4 text-white/70">{section.movieIds?.length || 0}</td>
                <td className="px-6 py-4 text-white/70">{section.orderIndex}</td>
                <td className="px-6 py-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleEnabled(section.id, section.enabled)}
                    className={section.enabled ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-white"}
                  >
                    {section.enabled ? "Enabled" : "Disabled"}
                  </Button>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(section)} className="text-white/70 hover:text-white">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(section.id)} className="text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {!sections?.length && !isLoading && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No sections found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
