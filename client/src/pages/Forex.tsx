import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  AlertCircle,
} from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">DMG FX</h1>
          <p className="text-muted-foreground">
            Manage your forex trading income
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
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
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Forex Trading Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-chart-2">
              {formatCurrency(totalBusinessIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Total Trading Profit
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold tabular-nums text-chart-2`}
            >
              {formatCurrency(totalForexProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Income by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={Array.from(new Set(businessIncome.map(i => i.source))).map(source => ({
                  name: source,
                  value: businessIncome
                    .filter(i => i.source === source)
                    .reduce((s, i) => s + parseFloat(i.amount), 0)
                }))}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.1}
                />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => `Rs.${val / 1000}k`}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trades" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trades" data-testid="tab-trades">
            Forex Trading Accounts
          </TabsTrigger>
          <TabsTrigger value="income" data-testid="tab-income">
            Forex Trading Income
          </TabsTrigger>
          <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">
            Subscriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trades" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Forex Trading Accounts</h2>
            <Button data-testid="button-add-account" onClick={() => setIsAccountDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Total Trading Profit</CardTitle>
                <div
                  className="text-2xl font-bold tabular-nums text-chart-2"
                  data-testid="text-forex-profit"
                >
                  {formatCurrency(totalForexProfit)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tradingAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-md border p-4"
                    data-testid={`card-account-${account.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-md bg-muted p-2">
                        <TrendingUp className="h-5 w-5 text-chart-2" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {account.brokerName} {account.fundedCompanyName ? `(${account.fundedCompanyName})` : ""}
                        </div>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {account.accountType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {account.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Capacity: ${parseFloat(account.accountCapacity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {tradingAccounts.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No accounts recorded yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <h2 className="text-xl font-semibold">Trading Income</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {businessIncome.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() =>
                      setEditingTransaction({ id: income.id, type: "income" })
                    }
                  >
                    <div>
                      <div className="font-medium">{income.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(income.date).toLocaleDateString()} •{" "}
                        {income.source}
                      </div>
                    </div>
                    <div className="text-lg font-bold tabular-nums text-chart-2">
                      +{formatCurrency(parseFloat(income.amount))}
                    </div>
                  </div>
                ))}
                {businessIncome.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No trading income recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <h2 className="text-xl font-semibold">Trading Subscriptions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    TradingView
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Premium Monthly
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Renewal Date:</span>
                    <span className="font-medium">Feb 01, 2026</span>
                  </div>
                </CardContent>
             </Card>
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