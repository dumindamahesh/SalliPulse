import { TransactionsTable } from "@/components/TransactionsTable";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

//todo: remove mock functionality
const mockIncomeTransactions = [
  { id: '1', date: '2024-01-15', category: 'Salary', description: 'Monthly salary', amount: 5000, type: 'income' as const },
  { id: '2', date: '2024-01-10', category: 'Freelance', description: 'Website project', amount: 800, type: 'income' as const },
  { id: '3', date: '2024-01-05', category: 'Investment', description: 'Dividend payment', amount: 150, type: 'income' as const },
];

export default function Income() {
  const totalIncome = mockIncomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Income</h1>
          <p className="text-muted-foreground">Track all your income sources</p>
        </div>
        <AddTransactionDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Total Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tabular-nums text-chart-2">
              ${totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Income History</h2>
        <TransactionsTable transactions={mockIncomeTransactions} />
      </div>
    </div>
  );
}
