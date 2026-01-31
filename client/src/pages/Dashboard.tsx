import { FinancialSummaryCard } from "@/components/FinancialSummaryCard";
import { TransactionsTable } from "@/components/TransactionsTable";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { ExcelImport } from "@/components/ExcelImport";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  subMonths,
} from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dashboardBg from "@assets/stock_images/professional_financi_c3c5ca8d.jpg";
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
} from "recharts";
import type { Income, Expense, Asset, Liability } from "@shared/schema";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(subMonths(new Date(), 5)),
    to: endOfMonth(new Date()),
  });

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

  const filteredIncome = useMemo(() => {
    return incomeData.filter((item) => {
      const itemDate = new Date(item.date);
      return isWithinInterval(itemDate, {
        start: dateRange.from,
        end: dateRange.to,
      });
    });
  }, [incomeData, dateRange]);

  const filteredExpenses = useMemo(() => {
    return expenseData.filter((item) => {
      const itemDate = new Date(item.date);
      return isWithinInterval(itemDate, {
        start: dateRange.from,
        end: dateRange.to,
      });
    });
  }, [expenseData, dateRange]);

  const totalIncome = filteredIncome.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0,
  );
  const totalExpenses = filteredExpenses.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0,
  );
  const totalAssets = assetData.reduce(
    (sum, item) => sum + parseFloat(item.currentValue),
    0,
  );
  const totalLiabilities = liabilityData.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0,
  );
  const netWorth = totalAssets - totalLiabilities;
  const savings = totalIncome - totalExpenses;

  const recentTransactions = [
    ...filteredIncome.map((t) => ({
      id: t.id,
      date: t.date.toString(),
      category: t.category,
      description: t.description || t.source,
      amount: parseFloat(t.amount),
      type: "income" as const,
      member: t.member,
    })),
    ...filteredExpenses.map((t) => ({
      id: t.id,
      date: t.date.toString(),
      category: t.category,
      description: t.description,
      amount: -parseFloat(t.amount),
      type: "expense" as const,
      member: t.member,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const getCategoryBreakdownByPercentage = () => {
    if (totalExpenses === 0) return [];
    const categoryMap = new Map<string, number>();
    filteredExpenses.forEach((item) => {
      const current = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, current + parseFloat(item.amount));
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value: Math.round((value / totalExpenses) * 100),
    }));
  };

  const getIncomeByPercentage = () => {
    if (totalIncome === 0) return [];
    const sourceMap = new Map<string, number>();
    filteredIncome.forEach((item) => {
      const current = sourceMap.get(item.source) || 0;
      sourceMap.set(item.source, current + parseFloat(item.amount));
    });
    return Array.from(sourceMap.entries()).map(([name, value]) => ({
      name,
      value: Math.round((value / totalIncome) * 100),
    }));
  };

  const getIncomeBySource = () => {
    const sourceMap = new Map<string, number>();
    filteredIncome.forEach((item) => {
      const current = sourceMap.get(item.source) || 0;
      sourceMap.set(item.source, current + parseFloat(item.amount));
    });
    return Array.from(sourceMap.entries()).map(([name, value], idx) => ({
      name,
      value,
      fill: COLORS[idx % COLORS.length],
    }));
  };

  const getExpenseByFamilyMember = () => {
    const familyMap = new Map<string, number>();
    filteredExpenses.forEach((item) => {
      const member = item.member || "Other";
      const current = familyMap.get(member) || 0;
      familyMap.set(member, current + parseFloat(item.amount));
    });
    return Array.from(familyMap.entries()).map(([name, value], idx) => ({
      name,
      value,
      fill: COLORS[idx % COLORS.length],
    }));
  };

  const getExpenseVariance = () => {
    const categoryMap = new Map<string, number>();
    filteredExpenses.forEach((item) => {
      const current = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, current + parseFloat(item.amount));
    });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getIncomeVsExpensesData = () => {
    const monthlyMap = new Map<
      string,
      { income: number; expenses: number; sortKey: string }
    >();

    filteredIncome.forEach((item) => {
      const date = new Date(item.date);
      const monthYear = format(date, "MMM yy'");
      const sortKey = format(date, "yyyy-MM");
      const current = monthlyMap.get(monthYear) || {
        income: 0,
        expenses: 0,
        sortKey,
      };
      current.income += parseFloat(item.amount);
      monthlyMap.set(monthYear, current);
    });

    filteredExpenses.forEach((item) => {
      const date = new Date(item.date);
      const monthYear = format(date, "MMM yy'");
      const sortKey = format(date, "yyyy-MM");
      const current = monthlyMap.get(monthYear) || {
        income: 0,
        expenses: 0,
        sortKey,
      };
      current.expenses += parseFloat(item.amount);
      monthlyMap.set(monthYear, current);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        sortKey: data.sortKey,
      }))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  };

  const getMonthlyExpenseData = () => {
    const monthlyMap = new Map<string, { [key: string]: any }>();
    filteredExpenses.forEach((item) => {
      const date = new Date(item.date);
      const monthYear = format(date, "MMM yy'");
      const sortKey = format(date, "yyyy-MM");
      const current = monthlyMap.get(monthYear) || { sortKey };
      const category = item.category;
      current[category] = (current[category] || 0) + parseFloat(item.amount);
      monthlyMap.set(monthYear, current);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        ...data,
      }))
      .sort((a, b) => (a as any).sortKey.localeCompare((b as any).sortKey));
  };

  const getMonthlyIncomeData = () => {
    const monthlyMap = new Map<string, { [key: string]: any }>();
    filteredIncome.forEach((item) => {
      const date = new Date(item.date);
      const monthYear = format(date, "MMM yy'");
      const sortKey = format(date, "yyyy-MM");
      const current = monthlyMap.get(monthYear) || { sortKey };
      const source = item.source;
      current[source] = (current[source] || 0) + parseFloat(item.amount);
      monthlyMap.set(monthYear, current);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        ...data,
      }))
      .sort((a, b) => (a as any).sortKey.localeCompare((b as any).sortKey));
  };

  const getMonthlyIncomeVariance = () => {
    const monthlyMap = new Map<string, { [key: string]: any }>();
    filteredIncome.forEach((item) => {
      const date = new Date(item.date);
      const monthYear = format(date, "MMM yy'");
      const sortKey = format(date, "yyyy-MM");
      const current = monthlyMap.get(monthYear) || { sortKey };
      const source = item.source;
      current[source] = (current[source] || 0) + parseFloat(item.amount);
      monthlyMap.set(monthYear, current);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        ...data,
      }))
      .sort((a, b) => (a as any).sortKey.localeCompare((b as any).sortKey));
  };

  const formatCurrency = (val: any) =>
    `Rs. ${Number(val).toLocaleString("en-US")}`;
  const axisStyle = { fontSize: "11px", fontWeight: 500 };

  const getTopCategories = () => {
    const categoryMap = new Map<string, number>();
    filteredExpenses.forEach((item) => {
      const current = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, current + parseFloat(item.amount));
    });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  const categoryColors = [
    "#fbbf24",
    "#f97316",
    "#ef4444",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
  ];

  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
  ];

  // Custom Gradient for Charts
  const renderGradient = (id: string, color: string) => (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={color} stopOpacity={0.8} />
      <stop offset="95%" stopColor={color} stopOpacity={0} />
    </linearGradient>
  );

  return (
    <div className="min-h-screen space-y-6 p-6 bg-slate-50/50">
      {" "}
      {/* Background image eka ain kara, light background ekak damma */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal bg-white",
                  !dateRange && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range: any) => range && setDateRange(range)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <ExcelImport />
          <AddTransactionDialog />
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Income",
            val: totalIncome,
            icon: TrendingUp,
            color: "bg-emerald-500",
            text: "text-emerald-600",
          },
          {
            title: "Total Expenses",
            val: totalExpenses,
            icon: TrendingDown,
            color: "bg-rose-500",
            text: "text-rose-600",
          },
          {
            title: "Net Worth",
            val: netWorth,
            icon: Wallet,
            color: "bg-blue-600",
            text: "text-blue-600",
          },
          {
            title: "Savings",
            val: savings,
            icon: PiggyBank,
            color: "bg-amber-500",
            text: "text-amber-600",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div
              className={`absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full ${stat.color} opacity-[0.03] transition-transform group-hover:scale-150`}
            />
            <div className="flex items-center gap-4">
              <div
                className={`rounded-2xl ${stat.color} p-3 text-white shadow-lg`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  {stat.title}
                </p>
                <h3 className={`text-2xl font-black ${stat.text}`}>
                  Rs. {stat.val.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Line 1: Top Expenses & Income vs Expenses */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Categories Sidebar */}
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-[#1B263B] p-8 text-white shadow-xl">
            <h2 className="text-lg font-bold mb-6 opacity-90 tracking-wide uppercase">
              Top Burners
            </h2>
            <div className="space-y-5">
              {getTopCategories().map((cat, idx) => (
                <div key={cat.name} className="group cursor-default">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-300">
                      {cat.name}
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      Rs. {cat.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: `${(cat.value / totalExpenses) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-4 shadow-sm lg:col-span-3">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Income vs Expenses
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={getIncomeVsExpensesData()}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.1}
              />
              <XAxis
                dataKey="month"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar
                dataKey="income"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
              <Bar
                dataKey="expenses"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Line 2: Total Income% & Total Expense% */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Total Income %
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            {totalIncome > 0 ? (
              <PieChart>
                <Pie
                  data={getIncomeByPercentage()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={60}
                  stroke="none"
                  dataKey="value"
                >
                  {getIncomeByPercentage().map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: "10px", paddingTop: "20px" }}
                />
              </PieChart>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Total Expense %
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            {totalExpenses > 0 ? (
              <PieChart>
                <Pie
                  data={getCategoryBreakdownByPercentage()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={60}
                  stroke="none"
                  dataKey="value"
                >
                  {getCategoryBreakdownByPercentage().map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: "10px", paddingTop: "20px" }}
                />
              </PieChart>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      {/* Line 3: Income Generation & Expense Generation (Family Member Wise) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Income Generation
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getIncomeBySource()}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.1}
              />
              <XAxis
                dataKey="name"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Expense Generation (Family Member Wise)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getExpenseByFamilyMember()}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.1}
              />
              <XAxis
                dataKey="name"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Line 4: Income Variance & Expense Variance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Income Variance
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={getMonthlyIncomeVariance()}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.1}
              />
              <XAxis
                dataKey="month"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: "10px" }}
              />
              {Array.from(new Set(filteredIncome.map((i) => i.source)))
                .slice(0, 8)
                .map((src, idx) => (
                  <Bar
                    key={src}
                    dataKey={src}
                    stackId="a"
                    fill={COLORS[idx % COLORS.length]}
                    radius={idx === 0 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Expense Variance
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart layout="vertical" data={getExpenseVariance()}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.1}
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                formatter={(value) => formatCurrency(value)}
              />
              <Bar
                dataKey="value"
                fill="#f59e0b"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Line 5: Income Monthly & Expense Monthly */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Income Monthly
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMonthlyIncomeData()}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.1}
              />
              <XAxis
                dataKey="month"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: "10px" }}
              />
              {Array.from(new Set(filteredIncome.map((i) => i.source)))
                .slice(0, 8)
                .map((src, idx) => (
                  <Bar
                    key={src}
                    dataKey={src}
                    stackId="a"
                    fill={COLORS[idx % COLORS.length]}
                    radius={idx === 0 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Expense Monthly
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMonthlyExpenseData()}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.1}
              />
              <XAxis
                dataKey="month"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: "10px" }}
              />
              {Array.from(new Set(filteredExpenses.map((e) => e.category)))
                .slice(0, 8)
                .map((cat, idx) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    stackId="a"
                    fill={COLORS[idx % COLORS.length]}
                    radius={idx === 0 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Recent Activity */}
            <div className="rounded-[2rem] border bg-white shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b bg-slate-50/50 flex justify-between items-center">
                <h2 className="font-bold text-[#1B263B]">Recent Ledger Entries</h2>
                <Button variant="link" className="text-[#00A86B] font-bold">
                  View All
                </Button>
              </div>
              <div className="p-4">
                <TransactionsTable transactions={recentTransactions} />
              </div>
            </div>
          </div>
        );
      }
