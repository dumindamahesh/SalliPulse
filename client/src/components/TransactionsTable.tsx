import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditTransactionDialog } from "./EditTransactionDialog";

export interface Transaction {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  source?: string;
  member?: string;
  isBusiness?: boolean;
  vehicleId?: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const deleteIncomeeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/income/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      toast({
        title: "Success",
        description: "Income deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete income",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (transaction: Transaction) => {
    if (transaction.type === "income") {
      deleteIncomeeMutation.mutate(transaction.id);
    } else {
      deleteExpenseMutation.mutate(transaction.id);
    }
    setDeleteConfirm(null);
  };

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden border-white/5 shadow-2xl animate-scale-in">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Date</TableHead>
              <TableHead className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Category</TableHead>
              <TableHead className="hidden md:table-cell text-slate-400 font-bold uppercase tracking-widest text-[10px]">Member</TableHead>
              <TableHead className="hidden md:table-cell text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                Description
              </TableHead>
              <TableHead className="text-right text-slate-400 font-bold uppercase tracking-widest text-[10px]">Amount</TableHead>
              <TableHead className="text-right text-slate-400 font-bold uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  data-testid={`row-transaction-${transaction.id}`}
                  className="hover:bg-white/5 transition-colors border-white/5 group"
                >
                  <TableCell className="font-bold text-slate-300">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] font-black uppercase tracking-widest">
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-slate-400 font-medium">
                    {transaction.member || "Other"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-slate-400 italic">
                    {transaction.description}
                  </TableCell>
                  <TableCell
                    className={`text-right font-black tabular-nums text-lg ${transaction.type === "income"
                        ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                        : "text-white"
                      }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(transaction.id)}
                        className="hover:bg-blue-500/20 hover:text-blue-400 text-slate-500 transition-all rounded-lg"
                        data-testid={`button-edit-${transaction.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirm(transaction.id)}
                        className="hover:bg-red-500/20 hover:text-red-400 text-slate-500 transition-all rounded-lg"
                        data-testid={`button-delete-${transaction.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editingId && (
        <EditTransactionDialog
          transactionId={editingId}
          onClose={() => setEditingId(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              deleteConfirm &&
              handleDelete(transactions.find((t) => t.id === deleteConfirm)!)
            }
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
