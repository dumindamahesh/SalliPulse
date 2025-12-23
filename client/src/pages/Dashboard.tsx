import { FinancialSummaryCard } from "@/components/FinancialSummaryCard";
import { TransactionsTable } from "@/components/TransactionsTable";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { ExcelImport } from "@/components/ExcelImport";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
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

  // Category breakdown for pie charts
  const getCategoryBreakdownByPercentage = () => {
    const categoryMap = new Map<string, number>();
    expenseData.forEach(item => {
      const current = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, current + parseFloat(item.amount));
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value: Math.round((value / totalExpenses) * 100),
    }));
  };

  const getIncomeByPercentage = () => {
    const sourceMap = new Map<string, number>();
    incomeData.forEach(item => {
      const current = sourceMap.get(item.source) || 0;
      sourceMap.set(item.source, current + parseFloat(item.amount));
    });
    return Array.from(sourceMap.entries()).map(([name, value]) => ({
      name,
      value: Math.round((value / totalIncome) * 100),
    }));
  };

  // Business vs Personal expenses
  const getBusinessVsPersonal = () => {
    const personalIncome = incomeData.filter(i => !i.isBusiness).reduce((sum, i) => sum + parseFloat(i.amount), 0);
    const businessIncome = incomeData.filter(i => i.isBusiness).reduce((sum, i) => sum + parseFloat(i.amount), 0);
    const personalExpense = expenseData.filter(e => !e.isBusiness).reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const businessExpense = expenseData.filter(e => e.isBusiness).reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return [
      { name: 'Car Rental Income', value: businessIncome },
      { name: 'Car Rental Expenses', value: businessExpense },
    ];
  };

  // Income generation by source
  const getIncomeBySource = () => {
    const sourceMap = new Map<string, number>();
    incomeData.forEach(item => {
      const current = sourceMap.get(item.source) || 0;
      sourceMap.set(item.source, current + parseFloat(item.amount));
    });
    return Array.from(sourceMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // Expense variance
  const getExpenseVariance = () => {
    const categoryMap = new Map<string, number>();
    expenseData.forEach(item => {
      const current = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, current + parseFloat(item.amount));
    });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Expense distribution
  const getExpenseDistribution = () => {
    const categoryMap = new Map<string, number>();
    expenseData.forEach(item => {
      const current = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, current + parseFloat(item.amount));
    });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Monthly data for stacked charts
  const getMonthlyExpenseData = () => {
    const monthlyMap = new Map<string, { [key: string]: number }>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach(month => {
      monthlyMap.set(month, {});
    });

    expenseData.forEach(item => {
      const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short' });
      const current = monthlyMap.get(month) || {};
      const category = item.category;
      current[category] = (current[category] || 0) + parseFloat(item.amount);
      monthlyMap.set(month, current);
    });

    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  const getMonthlyIncomeData = () => {
    const monthlyMap = new Map<string, { [key: string]: number }>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach(month => {
      monthlyMap.set(month, {});
    });

    incomeData.forEach(item => {
      const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short' });
      const current = monthlyMap.get(month) || {};
      const source = item.source;
      current[source] = (current[source] || 0) + parseFloat(item.amount);
      monthlyMap.set(month, current);
    });

    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  const getMonthlyIncomeVariance = () => {
    const monthlyMap = new Map<string, { [key: string]: number }>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach(month => {
      monthlyMap.set(month, {});
    });

    incomeData.forEach(item => {
      const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short' });
      const current = monthlyMap.get(month) || {};
      const source = item.source;
      current[source] = (current[source] || 0) + parseFloat(item.amount);
      monthlyMap.set(month, current);
    });

    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  // Get top categories for sidebar cards
  const getTopCategories = () => {
    const categoryMap = new Map<string, number>();
    expenseData.forEach(item => {
      const current = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, current + parseFloat(item.amount));
    });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  const categoryColors = [
    '#fbbf24', '#f97316', '#ef4444', '#06b6d4', '#3b82f6', '#8b5cf6',
  ];

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

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

      {/* Top section with categories sidebar and top charts */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Category Cards Sidebar */}
        <div className="space-y-2">
          {getTopCategories().map((cat, idx) => (
            <div key={cat.name} className="rounded-lg p-3 text-white font-semibold" style={{ backgroundColor: categoryColors[idx % categoryColors.length] }}>
              <div className="text-sm opacity-90">{cat.name}</div>
              <div className="text-lg">${cat.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            </div>
          ))}
        </div>

        {/* Total Expense % and Total Income % */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-lg font-semibold">Total Expense %</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={getCategoryBreakdownByPercentage()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getCategoryBreakdownByPercentage().map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-lg font-semibold">Total Income %</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={getIncomeByPercentage()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getIncomeByPercentage().map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Business Income vs Expenses */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-lg font-semibold">Business Incomes vs Expenses</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart layout="vertical" data={getBusinessVsPersonal()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(0)}`} />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income Generation Chart */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-4 text-lg font-semibold">Income Generation</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getIncomeBySource()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `$${Number(value).toFixed(0)}`} />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Variance and Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-lg font-semibold">Expense Variance</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart layout="vertical" data={getExpenseVariance()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(0)}`} />
              <Bar dataKey="value" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-lg font-semibold">Expense Distribution</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart layout="vertical" data={getExpenseDistribution()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(0)}`} />
              <Bar dataKey="value" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-lg font-semibold">Income vs Expenses</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={getMonthlyIncomeData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(0)}`} />
              <Bar dataKey="income" fill="#10b981" stackId="a" />
              <Bar dataKey="expenses" fill="#ef4444" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-lg font-semibold">Expense Monthly</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMonthlyExpenseData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(0)}`} />
              {Array.from(new Set(expenseData.map(e => e.category))).slice(0, 8).map((cat, idx) => (
                <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-lg font-semibold">Income Monthly</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMonthlyIncomeData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(0)}`} />
              {Array.from(new Set(incomeData.map(i => i.source))).slice(0, 8).map((src, idx) => (
                <Bar key={src} dataKey={src} stackId="a" fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-lg font-semibold">Income Variance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMonthlyIncomeVariance()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(0)}`} />
              {Array.from(new Set(incomeData.map(i => i.source))).slice(0, 8).map((src, idx) => (
                <Bar key={src} dataKey={src} stackId="a" fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Recent Transactions</h2>
        <TransactionsTable transactions={recentTransactions} />
      </div>
    </div>
  );
}
