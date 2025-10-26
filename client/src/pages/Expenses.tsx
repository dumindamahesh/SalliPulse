import { TransactionsTable } from "@/components/TransactionsTable";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Expense } from "@shared/schema";

export default function ExpensesPage() {
  const { data: expenseData = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const totalExpenses = expenseData.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  const expenseTransactions = expenseData.map(t => ({
    id: t.id,
    date: t.date.toString(),
    category: t.category,
    description: t.description,
    amount: -parseFloat(t.amount),
    type: 'expense' as const,
  }));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Monitor your spending</p>
        </div>
        <AddTransactionDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tabular-nums">
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Expense History</h2>
        <TransactionsTable transactions={expenseTransactions} />
      </div>
    </div>
  );
}
