import { FinancialSummaryCard } from "@/components/FinancialSummaryCard";
import { TransactionsTable } from "@/components/TransactionsTable";
import { IncomeExpenseChart } from "@/components/IncomeExpenseChart";
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { ExcelImport } from "@/components/ExcelImport";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Income, Expense, Asset, Liability } from "@shared/schema";

export default function Dashboard() {
  const { data: incomeData = [] } = useQuery<Income[]>({
    queryKey: ["/api/income"],
  });

  const { data: expenseData = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: assetData = [] } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  const { data: liabilityData = [] } = useQuery<Liability[]>({
    queryKey: ["/api/liabilities"],
  });

  // Calculate totals
  const totalIncome = incomeData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalExpenses = expenseData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalAssets = assetData.reduce((sum, item) => sum + parseFloat(item.currentValue), 0);
  const totalLiabilities = liabilityData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const netWorth = totalAssets - totalLiabilities;
  const savings = totalIncome - totalExpenses;

  // Combine transactions for the table
  const recentTransactions = [
    ...incomeData.map(t => ({
      id: t.id,
      date: t.date.toString(),
      category: t.category,
      description: t.description || t.source,
      amount: parseFloat(t.amount),
      type: 'income' as const,
    })),
    ...expenseData.map(t => ({
      id: t.id,
      date: t.date.toString(),
      category: t.category,
      description: t.description,
      amount: -parseFloat(t.amount),
      type: 'expense' as const,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Calculate monthly chart data
  const getMonthlyData = () => {
    const monthlyMap = new Map<string, { income: number; expenses: number }>();
    
    incomeData.forEach(item => {
      const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short' });
      const current = monthlyMap.get(month) || { income: 0, expenses: 0 };
      monthlyMap.set(month, { ...current, income: current.income + parseFloat(item.amount) });
    });

    expenseData.forEach(item => {
      const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short' });
      const current = monthlyMap.get(month) || { income: 0, expenses: 0 };
      monthlyMap.set(month, { ...current, expenses: current.expenses + parseFloat(item.amount) });
    });

    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      ...data,
    })).slice(-6);
  };

  // Calculate category breakdown
  const getCategoryBreakdown = () => {
    const categoryMap = new Map<string, number>();
    
    expenseData.forEach(item => {
      const current = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, current + parseFloat(item.amount));
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex gap-2">
          <ExcelImport />
          <AddTransactionDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FinancialSummaryCard
          title="Total Income"
          value={`$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
          iconColor="text-chart-2"
        />
        <FinancialSummaryCard
          title="Total Expenses"
          value={`$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingDown}
          iconColor="text-destructive"
        />
        <FinancialSummaryCard
          title="Net Worth"
          value={`$${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Wallet}
          iconColor="text-chart-1"
        />
        <FinancialSummaryCard
          title="Savings"
          value={`$${savings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={PiggyBank}
          iconColor="text-chart-3"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <IncomeExpenseChart data={getMonthlyData()} />
        <CategoryBreakdownChart data={getCategoryBreakdown()} title="Expense Breakdown" />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Recent Transactions</h2>
        <TransactionsTable transactions={recentTransactions} />
      </div>
    </div>
  );
}
