import { FinancialSummaryCard } from "@/components/FinancialSummaryCard";
import { TransactionsTable } from "@/components/TransactionsTable";
import { IncomeExpenseChart } from "@/components/IncomeExpenseChart";
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";

//todo: remove mock functionality
const mockTransactions = [
  { id: '1', date: '2024-01-15', category: 'Salary', description: 'Monthly salary', amount: 5000, type: 'income' as const },
  { id: '2', date: '2024-01-14', category: 'Food', description: 'Grocery shopping', amount: -120.50, type: 'expense' as const },
  { id: '3', date: '2024-01-12', category: 'Transportation', description: 'Gas', amount: -45.00, type: 'expense' as const },
  { id: '4', date: '2024-01-10', category: 'Freelance', description: 'Website project', amount: 800, type: 'income' as const },
  { id: '5', date: '2024-01-08', category: 'Utilities', description: 'Electric bill', amount: -150.00, type: 'expense' as const },
];

const mockChartData = [
  { month: 'Jan', income: 5800, expenses: 4200 },
  { month: 'Feb', income: 6200, expenses: 3800 },
  { month: 'Mar', income: 5900, expenses: 4500 },
  { month: 'Apr', income: 6500, expenses: 4100 },
  { month: 'May', income: 6100, expenses: 4400 },
  { month: 'Jun', income: 6800, expenses: 4300 },
];

const mockCategoryData = [
  { name: 'Food', value: 1200 },
  { name: 'Transportation', value: 800 },
  { name: 'Utilities', value: 600 },
  { name: 'Entertainment', value: 400 },
  { name: 'Other', value: 320 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
        <AddTransactionDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FinancialSummaryCard
          title="Total Income"
          value="$12,450"
          trend={8.2}
          icon={TrendingUp}
          iconColor="text-chart-2"
        />
        <FinancialSummaryCard
          title="Total Expenses"
          value="$8,320"
          trend={-3.1}
          icon={TrendingDown}
          iconColor="text-destructive"
        />
        <FinancialSummaryCard
          title="Net Worth"
          value="$510,680"
          trend={5.4}
          icon={Wallet}
          iconColor="text-chart-1"
        />
        <FinancialSummaryCard
          title="Savings"
          value="$4,130"
          trend={12.5}
          icon={PiggyBank}
          iconColor="text-chart-3"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <IncomeExpenseChart data={mockChartData} />
        <CategoryBreakdownChart data={mockCategoryData} title="Expense Breakdown" />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Recent Transactions</h2>
        <TransactionsTable transactions={mockTransactions} />
      </div>
    </div>
  );
}
