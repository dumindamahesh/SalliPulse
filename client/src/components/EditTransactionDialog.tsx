import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Income, Expense } from "@shared/schema";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  date: z.string(),
  category: z.string(),
  amount: z.string(),
  description: z.string().optional(),
  source: z.string().optional(),
  isBusiness: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const incomeCategories = ["Salary", "Freelance", "Investment", "Gift", "Rental Income", "Other"];
const expenseCategories = ["Food", "Transportation", "Utilities", "Entertainment", "Shopping", "Healthcare", "Maintenance", "Other"];

interface EditTransactionDialogProps {
  transactionId: string;
  onClose: () => void;
}

export function EditTransactionDialog({ transactionId, onClose }: EditTransactionDialogProps) {
  const { toast } = useToast();
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");

  // Fetch transaction data
  const incomeQuery = useQuery<Income>({
    queryKey: ["/api/income", transactionId],
    enabled: transactionType === "income",
  });

  const expenseQuery = useQuery<Expense>({
    queryKey: ["/api/expenses", transactionId],
    enabled: transactionType === "expense",
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      category: "",
      amount: "",
      description: "",
      source: "",
      isBusiness: false,
    },
  });

  // Determine transaction type and fetch
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        let transaction: Income | Expense | null = null;
        
        // Try to fetch as income first
        const incomeResponse = await fetch(`/api/income/${transactionId}`);
        if (incomeResponse.ok) {
          transaction = await incomeResponse.json();
          setTransactionType("income");
        } else {
          // Try as expense
          const expenseResponse = await fetch(`/api/expenses/${transactionId}`);
          if (expenseResponse.ok) {
            transaction = await expenseResponse.json();
            setTransactionType("expense");
          }
        }

        if (transaction) {
          const date = new Date(transaction.date);
          form.reset({
            type: "source" in transaction ? "income" : "expense",
            date: date.toISOString().split("T")[0],
            category: transaction.category,
            amount: transaction.amount,
            description: transaction.description || "",
            source: "source" in transaction ? transaction.source : "",
            isBusiness: transaction.isBusiness || false,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load transaction",
          variant: "destructive",
        });
        onClose();
      }
    };

    fetchTransaction();
  }, [transactionId]);

  const type = form.watch("type");
  const categories = type === "income" ? incomeCategories : expenseCategories;

  const updateIncomeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", `/api/income/${transactionId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      toast({
        title: "Success",
        description: "Income updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update income",
        variant: "destructive",
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", `/api/expenses/${transactionId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    const { type, source, ...rest } = data;
    const transactionData = {
      ...rest,
      date: new Date(data.date).toISOString(),
      amount: data.amount,
      isBusiness: data.isBusiness,
    };

    if (type === "income") {
      updateIncomeMutation.mutate({
        ...transactionData,
        source: source || "Other",
      });
    } else {
      updateExpenseMutation.mutate(transactionData);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-transaction-type">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} data-testid="input-transaction-date" />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {type === "income" && (
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Employer name"
                        {...field}
                        data-testid="input-source"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      data-testid="input-amount"
                      className="tabular-nums"
                    />
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
                  <FormLabel>Description {type === "expense" ? "" : "(Optional)"}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes..."
                      {...field}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isBusiness"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-business"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Business Transaction</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Mark this as a business expense or income
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateIncomeMutation.isPending || updateExpenseMutation.isPending}
                data-testid="button-save"
              >
                Update Transaction
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
