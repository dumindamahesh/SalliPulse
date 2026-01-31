import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInvestmentSchema, type Investment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, LineChart, Trash2, Edit2, TrendingUp } from "lucide-react";
import { FinancialSummaryCard } from "@/components/FinancialSummaryCard";

export default function InvestmentsPage() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: investmentData = [], isLoading } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/investments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      toast({ title: "Success", description: "Investment added successfully!" });
      setEditingId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ([id, data]: [string, any]) => apiRequest("PATCH", `/api/investments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      toast({ title: "Success", description: "Investment updated successfully!" });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/investments/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      toast({ title: "Success", description: "Investment deleted successfully!" });
    },
  });

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const totalValue = investmentData.reduce((sum, inv) => sum + parseFloat(inv.currentValue), 0);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Investments</h1>
          <p className="text-muted-foreground">Track your investment portfolio with precision</p>
        </div>
        <Dialog open={editingId === 'create'} onOpenChange={(val) => setEditingId(val ? 'create' : null)}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-investment" className="bg-gradient-blue-teal hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] border-none transition-all duration-300 rounded-xl px-6 h-11 font-bold">
              <Plus className="mr-2 h-5 w-5" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 text-white rounded-3xl sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">Add Investment</DialogTitle>
            </DialogHeader>
            <InvestmentForm onSubmit={(data) => createMutation.mutate(data)} isLoading={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <FinancialSummaryCard
          title="Total Portfolio Value"
          value={formatCurrency(totalValue)}
          icon={TrendingUp}
          iconColor="text-cyan-400"
        />
      </div>

      <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />
        <h2 className="mb-6 text-sm font-black text-cyan-400 tracking-[0.2em] uppercase flex items-center gap-2">
          Portfolio Items
          <div className="h-px flex-1 bg-white/5" />
        </h2>

        {isLoading ? (
          <div className="text-slate-400 font-medium">Loading investments...</div>
        ) : investmentData.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium bg-white/5 rounded-2xl border border-dashed border-white/10">
            No investments added yet
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {investmentData.map((investment) => (
              <div key={investment.id} className="group relative glass rounded-2xl p-6 border-white/5 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02] overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-transparent opacity-50" />

                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-cyan-500/10 p-2.5 ring-1 ring-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                        <LineChart className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <div className="font-black text-white tracking-tight">{investment.name}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] font-black uppercase tracking-widest">
                            {investment.category}
                          </Badge>
                          <span className="text-[10px] font-black text-slate-500 uppercase">Qty: {investment.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-2xl font-black text-white tabular-nums tracking-tighter">
                      {formatCurrency(parseFloat(investment.currentValue))}
                    </div>
                    {investment.description && (
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
                        {investment.description}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-auto">
                    <Dialog open={editingId === investment.id} onOpenChange={(val) => setEditingId(val ? investment.id : null)}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 rounded-lg transition-all"
                          data-testid={`button-edit-investment-${investment.id}`}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card border-white/10 text-white rounded-3xl sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black tracking-tight text-white">Edit Investment</DialogTitle>
                        </DialogHeader>
                        <InvestmentForm
                          defaultValues={investment}
                          onSubmit={(data) => updateMutation.mutate([investment.id, data])}
                          isLoading={updateMutation.isPending}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(investment.id)}
                      className="flex-1 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                      data-testid={`button-delete-investment-${investment.id}`}
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

function InvestmentForm({
  onSubmit,
  isLoading,
  defaultValues,
}: {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  defaultValues?: Investment;
}) {
  const form = useForm({
    resolver: zodResolver(insertInvestmentSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      category: defaultValues?.category || "Stocks",
      quantity: defaultValues?.quantity || "0",
      currentValue: defaultValues?.currentValue || "0",
      description: defaultValues?.description || "",
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
              <FormLabel>Investment Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Apple Stock, Gold ETF, Mutual Fund" {...field} />
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
                  <SelectItem value="Stocks">Stocks</SelectItem>
                  <SelectItem value="Bonds">Bonds</SelectItem>
                  <SelectItem value="Mutual Funds">Mutual Funds</SelectItem>
                  <SelectItem value="ETFs">ETFs</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 10 shares, 1 gram" {...field} />
              </FormControl>
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
          {isLoading ? "Saving..." : "Save Investment"}
        </Button>
      </form>
    </Form>
  );
}
