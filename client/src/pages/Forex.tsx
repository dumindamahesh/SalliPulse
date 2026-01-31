import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";
import { FinancialSummaryCard } from "@/components/FinancialSummaryCard";
import { useQuery } from "@tanstack/react-query";
import type { Forex, Income, Expense, TradingAccount } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { EditTransactionDialog } from "@/components/EditTransactionDialog";

import { TradingAccountDialog } from "@/components/TradingAccountDialog";

export default function BusinessPage() {
  const [editingTransaction, setEditingTransaction] = useState<{
    id: string;
    type: "income" | "expense";
  } | null>(null);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { data: forexTrades = [], isLoading: forexLoading } = useQuery<Forex[]>({
    queryKey: ["/api/forex"],
  });

  const { data: tradingAccounts = [], isLoading: accountsLoading } = useQuery<TradingAccount[]>({
    queryKey: ["/api/trading-accounts"],
  });

  const { data: incomeData = [] } = useQuery<Income[]>({
    queryKey: ["/api/income"],
  });

  const { data: expenseData = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const businessIncome = useMemo(
    () =>
      incomeData.filter(
        (t) =>
          t.category === "Forex" &&
          isWithinInterval(new Date(t.date), {
            start: dateRange.from,
            end: dateRange.to,
          }),
      ),
    [incomeData, dateRange],
  );

  const businessExpenses = useMemo(
    () =>
      expenseData.filter(
        (t) =>
          t.category === "Forex" &&
          isWithinInterval(new Date(t.date), {
            start: dateRange.from,
            end: dateRange.to,
          }),
      ),
    [expenseData, dateRange],
  );

  const totalBusinessIncome = businessIncome.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0,
  );
  const totalBusinessExpenses = businessExpenses.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0,
  );
  const businessProfit = totalBusinessIncome - totalBusinessExpenses;

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const totalForexProfit = forexTrades.reduce(
    (sum, trade) => sum + parseFloat(trade.profit),
    0,
  );

  if (forexLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">DMG FX</h1>
          <p className="text-muted-foreground">
            Manage your forex trading income with elite precision
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"ghost"}
                className={cn(
                  "w-[280px] justify-start text-left font-bold rounded-xl bg-slate-900/50 border border-white/5 hover:bg-slate-900/80 transition-all",
                  !dateRange && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-5 w-5 text-purple-400" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <span className="text-white">
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </span>
                  ) : (
                    <span className="text-white">{format(dateRange.from, "LLL dd, y")}</span>
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 glass-card border-white/10" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range: any) => range && setDateRange(range)}
                numberOfMonths={2}
                className="bg-slate-950 text-white"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FinancialSummaryCard
          title="Forex Trading Income"
          value={formatCurrency(totalBusinessIncome)}
          icon={TrendingUp}
          iconColor="text-emerald-400"
        />
        <FinancialSummaryCard
          title="Total Trading Profit"
          value={formatCurrency(totalForexProfit)}
          icon={TrendingUp}
          iconColor="text-cyan-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
          <h2 className="mb-6 text-sm font-black text-emerald-400 tracking-[0.2em] uppercase flex items-center gap-2">
            Income by Source
            <div className="h-px flex-1 bg-white/5" />
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={Array.from(new Set(businessIncome.map(i => i.source))).map(source => ({
                name: source,
                value: businessIncome
                  .filter(i => i.source === source)
                  .reduce((s, i) => s + parseFloat(i.amount), 0)
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                tickFormatter={(val) => `Rs.${val / 1000}k`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                }}
              />
              <Bar dataKey="value" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Tabs defaultValue="trades" className="space-y-6">
        <TabsList className="bg-slate-900/50 p-1 rounded-2xl border border-white/5 h-12">
          <TabsTrigger value="trades" data-testid="tab-trades" className="rounded-xl px-6 data-[state=active]:bg-gradient-purple-cyan data-[state=active]:text-white transition-all duration-300">
            Forex Trading Accounts
          </TabsTrigger>
          <TabsTrigger value="income" data-testid="tab-income" className="rounded-xl px-6 data-[state=active]:bg-gradient-purple-cyan data-[state=active]:text-white transition-all duration-300">
            Forex Trading Income
          </TabsTrigger>
          <TabsTrigger value="subscriptions" data-testid="tab-subscriptions" className="rounded-xl px-6 data-[state=active]:bg-gradient-purple-cyan data-[state=active]:text-white transition-all duration-300">
            Subscriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trades" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
              Forex Trading Accounts
              <div className="h-px w-32 bg-white/5" />
            </h2>
            <Button
              data-testid="button-add-account"
              onClick={() => setIsAccountDialogOpen(true)}
              className="bg-gradient-blue-teal hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] border-none transition-all duration-300 rounded-xl px-6 h-11 font-bold"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Account
            </Button>
          </div>

          <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-slate-500 tracking-[0.2em] uppercase">Account Overview</h3>
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Trading Profit</div>
                <div
                  className="text-2xl font-black text-white tabular-nums"
                  data-testid="text-forex-profit"
                >
                  {formatCurrency(totalForexProfit)}
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tradingAccounts.map((account) => (
                <div
                  key={account.id}
                  className="group relative glass rounded-2xl p-6 border-white/5 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02] overflow-hidden"
                  data-testid={`card-account-${account.id}`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-transparent opacity-50" />

                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-500/10 p-2.5 ring-1 ring-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                          <TrendingUp className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                          <div className="font-black text-white tracking-tight">
                            {account.brokerName}
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">
                            {account.fundedCompanyName || "Personal Account"}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-white/10 text-white font-black text-[10px] bg-white/5 uppercase px-3 py-1">
                        {account.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Account Type</div>
                        <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] font-black uppercase tracking-widest">
                          {account.accountType}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Capacity</div>
                        <div className="text-lg font-black text-white tabular-nums">
                          ${parseFloat(account.accountCapacity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {tradingAccounts.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-white/5 rounded-2xl border border-dashed border-white/10">
                  No accounts recorded yet.
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
            Trading Income
            <div className="h-px w-32 bg-white/5" />
          </h2>
          <div className="glass-card rounded-[2rem] p-6 border-white/5 shadow-2xl overflow-hidden">
            <div className="space-y-3">
              {businessIncome.map((income) => (
                <div
                  key={income.id}
                  className="group flex items-center justify-between rounded-2xl border border-white/5 p-4 hover:bg-white/5 cursor-pointer transition-all duration-300"
                  onClick={() =>
                    setEditingTransaction({ id: income.id, type: "income" })
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-emerald-400/10 p-2 border border-emerald-400/20">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-black text-white tracking-tight">{income.category}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">
                        {format(new Date(income.date), "MMM dd, yyyy")} •{" "}
                        {income.source}
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-black tabular-nums text-emerald-400 bg-emerald-400/10 px-4 py-1 rounded-xl border border-emerald-400/20">
                    +{formatCurrency(parseFloat(income.amount))}
                  </div>
                </div>
              ))}
              {businessIncome.length === 0 && (
                <div className="py-12 text-center text-slate-500 font-medium bg-white/5 rounded-2xl border border-dashed border-white/10">
                  No trading income recorded yet
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
            Trading Subscriptions
            <div className="h-px w-32 bg-white/5" />
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] pointer-events-none" />
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-purple-500/10 p-2.5 border border-purple-500/20">
                  <LayoutDashboard className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-black text-white tracking-tight">TradingView</h3>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Premium Monthly</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Renewal Date</span>
                <span className="text-xs font-black text-white bg-white/5 px-3 py-1 rounded-lg border border-white/10">Feb 01, 2026</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {editingTransaction && (
        <EditTransactionDialog
          transactionId={editingTransaction.id}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      <TradingAccountDialog
        open={isAccountDialogOpen}
        onOpenChange={setIsAccountDialogOpen}
      />
    </div>
  );
}