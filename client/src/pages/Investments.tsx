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
import { Plus, LineChart, Trash2, Edit2 } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Investments</h1>
          <p className="text-muted-foreground">Track your investment portfolio</p>
        </div>
        <Dialog open={editingId === 'create'} onOpenChange={(val) => setEditingId(val ? 'create' : null)}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-investment">
              <Plus className="mr-2 h-4 w-4" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Investment</DialogTitle>
            </DialogHeader>
            <InvestmentForm onSubmit={(data) => createMutation.mutate(data)} isLoading={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Total Portfolio Value</CardTitle>
            <div className="text-2xl font-bold tabular-nums text-chart-2" data-testid="text-total-investments">
              {formatCurrency(totalValue)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : investmentData.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No investments added yet</div>
          ) : (
            <div className="space-y-4">
              {investmentData.map((investment) => (
                <div key={investment.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-md bg-muted p-2">
                      <LineChart className="h-5 w-5 text-chart-1" />
                    </div>
                    <div>
                      <div className="font-semibold">{investment.name}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {investment.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">Qty: {investment.quantity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold tabular-nums">
                        {formatCurrency(parseFloat(investment.currentValue))}
                      </div>
                      {investment.description && <div className="text-xs text-muted-foreground">{investment.description}</div>}
                    </div>
                    <Dialog open={editingId === investment.id} onOpenChange={(val) => setEditingId(val ? investment.id : null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" data-testid={`button-edit-investment-${investment.id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Investment</DialogTitle>
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
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(investment.id)}
                      data-testid={`button-delete-investment-${investment.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
