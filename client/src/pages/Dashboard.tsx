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
    `Rs. ${Number(val).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
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
    'hsl(221, 83%, 53%)', // Primary Blue
    'hsl(142, 71%, 45%)', // Green
    'hsl(12, 76%, 61%)',  // Orange
    'hsl(262, 83%, 58%)', // Purple
    'hsl(43, 96%, 64%)',  // Yellow
    'hsl(340, 75%, 55%)', // Pink
    'hsl(190, 90%, 50%)', // Cyan
    'hsl(280, 65%, 60%)'  // Violet
  ];

  // Custom Gradient for Charts
  const renderGradient = (id: string, color: string) => (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={color} stopOpacity={0.8} />
      <stop offset="95%" stopColor={color} stopOpacity={0} />
    </linearGradient>
  );

  return (
    <div className="min-h-screen space-y-6 p-6 animate-slide-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Income",
            val: totalIncome,
            icon: TrendingUp,
            gradient: "bg-gradient-green-emerald",
            accent: "emerald",
          },
          {
            title: "Total Expenses",
            val: totalExpenses,
            icon: TrendingDown,
            gradient: "bg-gradient-orange-red",
            accent: "red",
          },
          {
            title: "Savings",
            val: savings,
            icon: PiggyBank,
            gradient: "bg-gradient-blue-teal",
            accent: "blue",
          },
          {
            title: "Net Worth",
            val: netWorth,
            icon: Wallet,
            gradient: "bg-gradient-purple-cyan",
            accent: "purple",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-3xl p-[1px] ${stat.gradient} transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-${stat.accent}-500/20`}
          >
            <div className="glass-card h-full rounded-[1.4rem] p-6 dark:bg-slate-900/80">
              <div className="flex items-center gap-4">
                <div className={`rounded-2xl bg-${stat.accent}-500/20 p-3 text-${stat.accent}-400 ring-1 ring-${stat.accent}-500/30 transition-all duration-500 group-hover:scale-110 group-hover:bg-${stat.accent}-500/30`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400/80 mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-black text-white tabular-nums tracking-tight">
                    Rs. {stat.val.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Line 1: Top Expenses & Income vs Expenses */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Categories Sidebar */}
        <div className="space-y-6">
          <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-50" />
            <h2 className="text-sm font-black mb-6 text-emerald-400 tracking-[0.2em] uppercase">
              Top Burners
            </h2>
            <div className="space-y-5">
              {getTopCategories().map((cat, idx) => (
                <div key={cat.name} className="group cursor-default animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      {cat.name}
                    </span>
                    <span className="text-sm font-black text-white tabular-nums">
                      Rs. {cat.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden p-[1px] ring-1 ring-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      style={{ width: `${(cat.value / totalExpenses) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl lg:col-span-3">
          <h2 className="mb-6 text-sm font-black text-blue-400 tracking-[0.2em] uppercase">
            Income vs Expenses
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={getIncomeVsExpensesData()}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="month"
                tick={{ ...axisStyle, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ ...axisStyle, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)'
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold' }} />
              <Bar
                dataKey="income"
                fill="hsl(142, 71%, 45%)"
                radius={[6, 6, 0, 0]}
                barSize={30}
                className="animate-glow-pulse"
              />
              <Bar
                dataKey="expenses"
                fill="hsl(12, 76%, 61%)"
                radius={[6, 6, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Line 2: Total Income% & Total Expense% */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl">
          <h2 className="mb-6 text-sm font-black text-purple-400 tracking-[0.2em] uppercase">
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
                  outerRadius={100}
                  innerRadius={75}
                  stroke="none"
                  dataKey="value"
                  paddingAngle={5}
                >
                  {getIncomeByPercentage().map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="animate-glow-pulse"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)',
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "20px", fontWeight: 'bold' }}
                />
              </PieChart>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl">
          <h2 className="mb-6 text-sm font-black text-pink-400 tracking-[0.2em] uppercase">
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
                  outerRadius={100}
                  innerRadius={75}
                  stroke="none"
                  dataKey="value"
                  paddingAngle={5}
                >
                  {getCategoryBreakdownByPercentage().map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)',
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "20px", fontWeight: 'bold' }}
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
        <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl">
          <h2 className="mb-6 text-sm font-black text-emerald-400 tracking-[0.2em] uppercase">
            Income Generation
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getIncomeBySource()}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="name"
                tick={{ ...axisStyle, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ ...axisStyle, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40} className="fill-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl">
          <h2 className="mb-6 text-sm font-black text-purple-400 tracking-[0.2em] uppercase">
            Expense Generation (Family Member Wise)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getExpenseByFamilyMember()}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="name"
                tick={{ ...axisStyle, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ ...axisStyle, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40} className="fill-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Line 4: Income Variance & Expense Variance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl">
          <h2 className="mb-6 text-sm font-black text-blue-400 tracking-[0.2em] uppercase">
            Income Variance
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={getMonthlyIncomeVariance()}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="month"
                tick={{ ...axisStyle, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ ...axisStyle, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: "11px", paddingTop: '10px', fontWeight: 'bold' }}
              />
              {Array.from(new Set(filteredIncome.map((i) => i.source)))
                .slice(0, 8)
                .map((src, idx) => (
                  <Bar
                    key={src}
                    dataKey={src}
                    stackId="a"
                    fill={COLORS[idx % COLORS.length]}
                    radius={idx === 0 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl">
          <h2 className="mb-6 text-sm font-black text-amber-400 tracking-[0.2em] uppercase">
            Expense Variance
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart layout="vertical" data={getExpenseVariance()}>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{ ...axisStyle, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                }}
              />
              <Bar
                dataKey="value"
                fill="hsl(43, 96%, 64%)"
                radius={[0, 6, 6, 0]}
                barSize={20}
                className="shadow-[0_0_10px_rgba(245,158,11,0.3)]"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Line 5: Income Monthly & Expense Monthly */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl">
          <h2 className="mb-6 text-sm font-black text-teal-400 tracking-[0.2em] uppercase">
            Income Monthly
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMonthlyIncomeData()}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="month"
                tick={{ ...axisStyle, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ ...axisStyle, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: "11px", paddingTop: '10px', fontWeight: 'bold' }}
              />
              {Array.from(new Set(filteredIncome.map((i) => i.source)))
                .slice(0, 8)
                .map((src, idx) => (
                  <Bar
                    key={src}
                    dataKey={src}
                    stackId="a"
                    fill={COLORS[idx % COLORS.length]}
                    radius={idx === 0 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl">
          <h2 className="mb-6 text-sm font-black text-rose-400 tracking-[0.2em] uppercase">
            Expense Monthly
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMonthlyExpenseData()}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="month"
                tick={{ ...axisStyle, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ ...axisStyle, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: "11px", paddingTop: '10px', fontWeight: 'bold' }}
              />
              {Array.from(new Set(filteredExpenses.map((e) => e.category)))
                .slice(0, 8)
                .map((cat, idx) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    stackId="a"
                    fill={COLORS[idx % COLORS.length]}
                    radius={idx === 0 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
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
