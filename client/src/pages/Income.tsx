import { useState, useMemo } from "react";
import { TransactionsTable } from "@/components/TransactionsTable";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { FinancialSummaryCard } from "@/components/FinancialSummaryCard";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Income } from "@shared/schema";

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

export default function IncomePage() {
  const { data: incomeData = [], isLoading } = useQuery<Income[]>({
    queryKey: ["/api/income"],
  });

  const [sortBy, setSortBy] = useState<
    "date-desc" | "date-asc" | "amount-desc" | "amount-asc"
  >("date-desc");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMember, setFilterMember] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1)
      .toISOString()
      .split("T")[0],
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
  });

  const filteredData = useMemo(() => {
    return incomeData.filter((t) => {
      const tDate = t.date.toString().split("T")[0];
      return tDate >= dateRange.from && tDate <= dateRange.to;
    });
  }, [incomeData, dateRange]);

  const totalIncome = filteredData.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0,
  );

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((item) => {
      const current = map.get(item.category) || 0;
      map.set(item.category, current + parseFloat(item.amount));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const sourceBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach((item) => {
      const current = map.get(item.source) || 0;
      map.set(item.source, current + parseFloat(item.amount));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const formatCurrency = (val: any) =>
    `Rs. ${Number(val).toLocaleString("en-US")}`;
  const axisStyle = { fontSize: "11px", fontWeight: 500 };

  const incomeTransactions = useMemo(() => {
    let transactions = filteredData.map((t) => ({
      id: t.id,
      date: t.date.toString(),
      category: t.category,
      description: t.description || t.source,
      amount: parseFloat(t.amount),
      type: "income" as const,
      member: t.member,
    }));

    // Filter by category
    if (filterCategory !== "all") {
      transactions = transactions.filter((t) => t.category === filterCategory);
    }

    // Filter by member
    if (filterMember !== "all") {
      transactions = transactions.filter((t) => t.member === filterMember);
    }

    // Sort
    transactions.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return transactions;
  }, [filteredData, sortBy, filterCategory, filterMember]);

  const categories = Array.from(
    new Set(
      incomeData.map((t) => t.category).filter((c) => c && c.trim() !== ""),
    ),
  );
  const members = Array.from(
    new Set(
      incomeData
        .map((t) => (t.member && t.member.trim() !== "" ? t.member : "Other"))
        .filter((m) => m && m.trim() !== ""),
    ),
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Income</h1>
          <p className="text-muted-foreground">Track all your income sources with precision</p>
        </div>
        <AddTransactionDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <FinancialSummaryCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          iconColor="text-emerald-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl">
          <h2 className="mb-6 text-sm font-black text-purple-400 tracking-[0.2em] uppercase">
            Category Breakdown
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {categoryBreakdown.length > 0 ? (
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    innerRadius={75}
                    stroke="none"
                    dataKey="value"
                    paddingAngle={5}
                  >
                    {categoryBreakdown.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
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

        <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl">
          <h2 className="mb-6 text-sm font-black text-emerald-400 tracking-[0.2em] uppercase">
            Income by Source
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {sourceBreakdown.length > 0 ? (
                <BarChart data={sourceBreakdown}>
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
                  <Bar
                    dataKey="value"
                    fill="hsl(142, 71%, 45%)"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No data
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-black text-white tracking-widest uppercase">Income History</h2>

        <div className="glass-card p-6 rounded-2xl border-white/5 shadow-xl flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block">
              From
            </label>
            <input
              type="date"
              className="w-full rounded-xl border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block">
              To
            </label>
            <input
              type="date"
              className="w-full rounded-xl border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block">
              Sort By
            </label>
            <Select
              value={sortBy}
              onValueChange={(value: any) => setSortBy(value)}
            >
              <SelectTrigger className="rounded-xl border-white/10 bg-slate-900/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10">
                <SelectItem value="date-desc">Latest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="amount-desc">Highest Amount</SelectItem>
                <SelectItem value="amount-asc">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block">
              Filter by Category
            </label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="rounded-xl border-white/10 bg-slate-900/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block">
              Filter by Member
            </label>
            <Select value={filterMember} onValueChange={setFilterMember}>
              <SelectTrigger className="rounded-xl border-white/10 bg-slate-900/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10">
                <SelectItem value="all">All Members</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member} value={member}>
                    {member}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TransactionsTable transactions={incomeTransactions} />
      </div>
    </div>
  );
}
