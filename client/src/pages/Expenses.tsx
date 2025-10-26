import { TransactionsTable } from "@/components/TransactionsTable";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";

//todo: remove mock functionality
const mockExpenseTransactions = [
  { id: '1', date: '2024-01-14', category: 'Food', description: 'Grocery shopping', amount: -120.50, type: 'expense' as const },
  { id: '2', date: '2024-01-12', category: 'Transportation', description: 'Gas', amount: -45.00, type: 'expense' as const },
  { id: '3', date: '2024-01-08', category: 'Utilities', description: 'Electric bill', amount: -150.00, type: 'expense' as const },
  { id: '4', date: '2024-01-06', category: 'Entertainment', description: 'Movie tickets', amount: -30.00, type: 'expense' as const },
];

export default function Expenses() {
  const totalExpenses = Math.abs(mockExpenseTransactions.reduce((sum, t) => sum + t.amount, 0));

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
              ${totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Expense History</h2>
        <TransactionsTable transactions={mockExpenseTransactions} />
      </div>
    </div>
  );
}
