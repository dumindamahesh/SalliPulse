import { useState, useMemo } from "react";
import { TransactionsTable } from "@/components/TransactionsTable";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
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
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
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
  }, [incomeData, sortBy, filterCategory, filterMember]);

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
              Rs.{" "}
              {totalIncome.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {categoryBreakdown.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={60}
                      stroke="none"
                      dataKey="value"
                    >
                      {categoryBreakdown.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Income by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {sourceBreakdown.length > 0 ? (
                  <BarChart data={sourceBreakdown}>
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
                    <Bar
                      dataKey="value"
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
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
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Income History</h2>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              From
            </label>
            <input
              type="date"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
            />
          </div>

          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              To
            </label>
            <input
              type="date"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
            />
          </div>

          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Sort By
            </label>
            <Select
              value={sortBy}
              onValueChange={(value: any) => setSortBy(value)}
            >
              <SelectTrigger data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Latest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="amount-desc">Highest Amount</SelectItem>
                <SelectItem value="amount-asc">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Filter by Category
            </label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger data-testid="select-category-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Filter by Member
            </label>
            <Select value={filterMember} onValueChange={setFilterMember}>
              <SelectTrigger data-testid="select-member-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
