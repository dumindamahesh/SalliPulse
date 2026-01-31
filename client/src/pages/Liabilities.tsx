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
import { insertLiabilitySchema, type Liability } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, CreditCard, Trash2, Edit2 } from "lucide-react";

export default function LiabilitiesPage() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: liabilityData = [], isLoading } = useQuery<Liability[]>({
    queryKey: ["/api/liabilities"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/liabilities", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/liabilities"] });
      toast({ title: "Success", description: "Liability added successfully!" });
      setEditingId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ([id, data]: [string, any]) => apiRequest("PATCH", `/api/liabilities/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/liabilities"] });
      toast({ title: "Success", description: "Liability updated successfully!" });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/liabilities/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/liabilities"] });
      toast({ title: "Success", description: "Liability deleted successfully!" });
    },
  });

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const totalLiabilities = liabilityData.reduce((sum, liability) => sum + parseFloat(liability.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Liabilities</h1>
          <p className="text-muted-foreground">Manage your debts and obligations</p>
        </div>
        <Dialog open={editingId === 'create'} onOpenChange={(val) => setEditingId(val ? 'create' : null)}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-liability">
              <Plus className="mr-2 h-4 w-4" />
              Add Liability
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Liability</DialogTitle>
            </DialogHeader>
            <LiabilityForm onSubmit={(data) => createMutation.mutate(data)} isLoading={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Total Liabilities</CardTitle>
            <div className="text-2xl font-bold tabular-nums text-destructive" data-testid="text-total-liabilities">
              {formatCurrency(totalLiabilities)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : liabilityData.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No liabilities added yet</div>
          ) : (
            <div className="space-y-4">
              {liabilityData.map((liability) => (
                <div key={liability.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-md bg-muted p-2">
                      <CreditCard className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <div className="font-semibold">{liability.name}</div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {liability.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold tabular-nums text-destructive">
                        {formatCurrency(parseFloat(liability.amount))}
                      </div>
                      {liability.description && <div className="text-xs text-muted-foreground">{liability.description}</div>}
                    </div>
                    <Dialog open={editingId === liability.id} onOpenChange={(val) => setEditingId(val ? liability.id : null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" data-testid={`button-edit-liability-${liability.id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Liability</DialogTitle>
                        </DialogHeader>
                        <LiabilityForm
                          defaultValues={liability}
                          onSubmit={(data) => updateMutation.mutate([liability.id, data])}
                          isLoading={updateMutation.isPending}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(liability.id)}
                      data-testid={`button-delete-liability-${liability.id}`}
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

function LiabilityForm({
  onSubmit,
  isLoading,
  defaultValues,
}: {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  defaultValues?: Liability;
}) {
  const form = useForm({
    resolver: zodResolver(insertLiabilitySchema),
    defaultValues: {
      name: defaultValues?.name || "",
      category: defaultValues?.category || "Loan",
      amount: defaultValues?.amount || "0",
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
              <FormLabel>Liability Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Home Loan, Car Loan, Credit Card" {...field} />
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
                  <SelectItem value="Loan">Loan</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Mortgage">Mortgage</SelectItem>
                  <SelectItem value="Other Debt">Other Debt</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (Rs.)</FormLabel>
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
          {isLoading ? "Saving..." : "Save Liability"}
        </Button>
      </form>
    </Form>
  );
}
