import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Car, TrendingUp, TrendingDown, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { RentalFleet, Income, Expense } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, isWithinInterval, addDays, isBefore } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  Cell,
} from "recharts";

import { AddVehicleDialog } from "@/components/AddVehicleDialog";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";

export default function BusinessPage() {
  const [editingTransaction, setEditingTransaction] = useState<{ id: string; type: "income" | "expense" } | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { data: fleetData = [], isLoading: fleetLoading } = useQuery<RentalFleet[]>({
    queryKey: ["/api/rental-fleet"],
  });

  const { data: incomeData = [] } = useQuery<Income[]>({
    queryKey: ["/api/income"],
  });

  const { data: expenseData = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const businessIncome = useMemo(() => 
    incomeData.filter(t => t.isBusiness && isWithinInterval(new Date(t.date), { start: dateRange.from, end: dateRange.to })),
    [incomeData, dateRange]
  );

  const businessExpenses = useMemo(() => 
    expenseData.filter(t => t.isBusiness && isWithinInterval(new Date(t.date), { start: dateRange.from, end: dateRange.to })),
    [expenseData, dateRange]
  );

  const totalBusinessIncome = businessIncome.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalBusinessExpenses = businessExpenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const businessProfit = totalBusinessIncome - totalBusinessExpenses;

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const totalFleetValue = fleetData.reduce((sum, vehicle) => sum + parseFloat(vehicle.currentValue), 0);

  if (fleetLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Beta Je Rent A Car</h1>
          <p className="text-muted-foreground">Manage your rental fleet and business finances</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Business Income
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
              Business Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              {formatCurrency(totalBusinessExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Profit
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold tabular-nums ${businessProfit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
              {formatCurrency(businessProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[{ name: 'Total', income: totalBusinessIncome, expenses: totalBusinessExpenses }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" hide />
                <YAxis tick={{fontSize: 10}} tickFormatter={(val) => `Rs.${val/1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Income by Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={fleetData.map(v => ({
                name: v.model,
                value: businessIncome.filter(i => i.vehicleId === v.id).reduce((s, i) => s + parseFloat(i.amount), 0)
              }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Expenses by Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={fleetData.map(v => ({
                name: v.model,
                value: businessExpenses.filter(e => e.vehicleId === v.id).reduce((s, e) => s + parseFloat(e.amount), 0)
              }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fleet" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fleet" data-testid="tab-fleet">Rental Fleet</TabsTrigger>
          <TabsTrigger value="income" data-testid="tab-income">Business Income</TabsTrigger>
          <TabsTrigger value="expenses" data-testid="tab-expenses">Business Expenses</TabsTrigger>
          <TabsTrigger value="reminders" data-testid="tab-reminders">License & Insurance</TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Rental Fleet</h2>
            <AddVehicleDialog />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Total Fleet Value</CardTitle>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-fleet-value">
                  {formatCurrency(totalFleetValue)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fleetData.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between rounded-md border p-4"
                    data-testid={`card-vehicle-${vehicle.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-md bg-muted p-2">
                        <Car className="h-5 w-5 text-chart-1" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {vehicle.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {vehicle.licensePlate}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            • Rs. {vehicle.dailyRate}/day
                          </span>
                          <Badge variant="outline" className="text-[10px] text-chart-2">
                            Net: {formatCurrency(
                              businessIncome.filter(i => i.vehicleId === vehicle.id).reduce((s, i) => s + parseFloat(i.amount), 0) -
                              businessExpenses.filter(e => e.vehicleId === vehicle.id).reduce((s, e) => s + parseFloat(e.amount), 0)
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold tabular-nums">
                        {formatCurrency(parseFloat(vehicle.currentValue))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Purchase: {formatCurrency(parseFloat(vehicle.purchasePrice))}
                      </div>
                    </div>
                  </div>
                ))}
                {fleetData.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No vehicles in fleet yet. Add your first rental car!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <h2 className="text-xl font-semibold">Business Income</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {businessIncome.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setEditingTransaction({ id: income.id, type: "income" })}
                  >
                    <div>
                      <div className="font-medium">{income.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(income.date).toLocaleDateString()} • {income.source}
                        {income.vehicleId && (
                          <span className="ml-2 italic text-chart-1">
                            ({fleetData.find(v => v.id === income.vehicleId)?.model})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-bold tabular-nums text-chart-2">
                      +{formatCurrency(parseFloat(income.amount))}
                    </div>
                  </div>
                ))}
                {businessIncome.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No business income recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <h2 className="text-xl font-semibold">Business Expenses</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {businessExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setEditingTransaction({ id: expense.id, type: "expense" })}
                  >
                    <div>
                      <div className="font-medium">{expense.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString()} • {expense.description}
                        {expense.vehicleId && (
                          <span className="ml-2 italic text-destructive">
                            ({fleetData.find(v => v.id === expense.vehicleId)?.model})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-bold tabular-nums">
                      -{formatCurrency(parseFloat(expense.amount))}
                    </div>
                  </div>
                ))}
                {businessExpenses.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No business expenses recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reminders" className="space-y-4">
          <h2 className="text-xl font-semibold">License & Insurance Reminders</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fleetData.map((vehicle) => {
              const licenseDue = vehicle.licenseDueDate ? new Date(vehicle.licenseDueDate) : null;
              const insuranceDue = vehicle.insuranceDueDate ? new Date(vehicle.insuranceDueDate) : null;
              const today = new Date();
              const next30Days = addDays(today, 30);

              const isLicenseSoon = licenseDue && isBefore(licenseDue, next30Days);
              const isInsuranceSoon = insuranceDue && isBefore(insuranceDue, next30Days);

              return (
                <Card key={vehicle.id} className={cn((isLicenseSoon || isInsuranceSoon) && "border-destructive/50")}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{vehicle.licensePlate}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">License Due:</span>
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium", isLicenseSoon && "text-destructive")}>
                          {vehicle.licenseDueDate ? format(new Date(vehicle.licenseDueDate), "MMM dd, yyyy") : "Not set"}
                        </span>
                        {isLicenseSoon && <AlertCircle className="h-4 w-4 text-destructive" />}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Insurance Due:</span>
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium", isInsuranceSoon && "text-destructive")}>
                          {vehicle.insuranceDueDate ? format(new Date(vehicle.insuranceDueDate), "MMM dd, yyyy") : "Not set"}
                        </span>
                        {isInsuranceSoon && <AlertCircle className="h-4 w-4 text-destructive" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {fleetData.length === 0 && (
            <div className="py-8 text-center text-muted-foreground border rounded-lg border-dashed">
              No vehicles in fleet to track.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {editingTransaction && (
        <EditTransactionDialog
          transactionId={editingTransaction.id}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
}
