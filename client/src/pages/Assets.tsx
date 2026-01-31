import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAssetSchema, type Asset } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Building2, TrendingUp } from "lucide-react";
import { FinancialSummaryCard } from "@/components/FinancialSummaryCard";

export default function AssetsPage() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: assetData = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/assets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({ title: "Success", description: "Asset added successfully!" });
      setEditingId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ([id, data]: [string, any]) => apiRequest("PATCH", `/api/assets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({ title: "Success", description: "Asset updated successfully!" });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/assets/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({ title: "Success", description: "Asset deleted successfully!" });
    },
  });

  const totalValue = assetData.reduce((sum, a) => sum + parseFloat(a.currentValue), 0);

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Assets</h1>
          <p className="text-muted-foreground">Track your valuable possessions and investments</p>
        </div>
        <Dialog open={editingId === 'create'} onOpenChange={(val) => setEditingId(val ? 'create' : null)}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-asset" className="bg-gradient-purple-cyan hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] border-none transition-all duration-300 rounded-xl px-6 h-11 font-bold">
              <Plus className="mr-2 h-5 w-5" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 text-white rounded-3xl sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">Add Asset</DialogTitle>
            </DialogHeader>
            <AssetForm onSubmit={(data) => createMutation.mutate(data)} isLoading={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <FinancialSummaryCard
          title="Total Assets"
          value={formatCurrency(totalValue)}
          icon={Building2}
          iconColor="text-blue-400"
        />
      </div>

      <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />
        <h2 className="mb-6 text-sm font-black text-blue-400 tracking-[0.2em] uppercase flex items-center gap-2">
          Asset List
          <div className="h-px flex-1 bg-white/5" />
        </h2>

        {isLoading ? (
          <div className="text-slate-400 font-medium">Loading assets...</div>
        ) : assetData.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium bg-white/5 rounded-2xl border border-dashed border-white/10">
            No assets added yet
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assetData.map((asset) => (
              <div key={asset.id} className="group relative glass rounded-2xl p-6 border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02] overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-transparent opacity-50" />

                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-blue-500/10 p-2.5 ring-1 ring-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                        <Building2 className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-black text-white tracking-tight">{asset.name}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-0.5">{asset.category}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-2xl font-black text-white tabular-nums tracking-tighter">
                      {formatCurrency(parseFloat(asset.currentValue))}
                    </div>
                    {asset.description && (
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
                        {asset.description}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-auto">
                    <Dialog open={editingId === asset.id} onOpenChange={(val) => setEditingId(val ? asset.id : null)}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 rounded-lg transition-all"
                          data-testid={`button-edit-asset-${asset.id}`}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card border-white/10 text-white rounded-3xl sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black tracking-tight text-white">Edit Asset</DialogTitle>
                        </DialogHeader>
                        <AssetForm
                          defaultValues={asset}
                          onSubmit={(data) => updateMutation.mutate([asset.id, data])}
                          isLoading={updateMutation.isPending}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(asset.id)}
                      className="flex-1 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                      data-testid={`button-delete-asset-${asset.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AssetForm({
  onSubmit,
  isLoading,
  defaultValues,
}: {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  defaultValues?: Asset;
}) {
  const form = useForm({
    resolver: zodResolver(insertAssetSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      category: defaultValues?.category || "Property",
      currentValue: defaultValues?.currentValue || "0",
      description: defaultValues?.description || "",
      isBusiness: defaultValues?.isBusiness || false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., House, Car, Jewelry" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Property">Property</SelectItem>
                  <SelectItem value="Vehicle">Vehicle</SelectItem>
                  <SelectItem value="Jewelry">Jewelry</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Collectibles">Collectibles</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currentValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Value (Rs.)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Optional description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : "Save Asset"}
        </Button>
      </form>
    </Form>
  );
}
