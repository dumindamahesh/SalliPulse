import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Car, TrendingUp, TrendingDown, Calendar as CalendarIcon, AlertCircle, LayoutDashboard } from "lucide-react";
import { FinancialSummaryCard } from "@/components/FinancialSummaryCard";
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
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Beta Je Rent A Car</h1>
          <p className="text-muted-foreground">Manage your rental fleet and business finances with elite precision</p>
        </div>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"ghost"}
                className={cn(
                  "w-[280px] justify-start text-left font-bold rounded-xl bg-slate-900/50 border border-white/5 hover:bg-slate-900/80 transition-all",
                  !dateRange && "text-muted-foreground"
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

      <div className="grid gap-6 md:grid-cols-3">
        <FinancialSummaryCard
          title="Business Income"
          value={formatCurrency(totalBusinessIncome)}
          icon={TrendingUp}
          iconColor="text-emerald-400"
        />
        <FinancialSummaryCard
          title="Business Expenses"
          value={formatCurrency(totalBusinessExpenses)}
          icon={TrendingDown}
          iconColor="text-rose-400"
        />
        <FinancialSummaryCard
          title="Net Profit"
          value={formatCurrency(businessProfit)}
          icon={TrendingUp}
          iconColor={businessProfit >= 0 ? "text-cyan-400" : "text-rose-400"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-card rounded-[2rem] p-6 border-white/5 shadow-2xl">
          <h2 className="mb-6 text-xs font-black text-purple-400 tracking-[0.2em] uppercase">
            Income vs Expenses
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[{ name: 'Total', income: totalBusinessIncome, expenses: totalBusinessExpenses }]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" hide />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} tickFormatter={(val) => `Rs.${val / 1000}k`} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Bar dataKey="income" fill="hsl(142, 71%, 45%)" name="Income" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="expenses" fill="hsl(12, 76%, 61%)" name="Expenses" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-[2rem] p-6 border-white/5 shadow-2xl">
          <h2 className="mb-6 text-xs font-black text-blue-400 tracking-[0.2em] uppercase">
            Income by Vehicle
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fleetData.map(v => ({
              name: v.model,
              value: businessIncome.filter(i => i.vehicleId === v.id).reduce((s, i) => s + parseFloat(i.amount), 0)
            }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} tickFormatter={(val) => `${val / 1000}k`} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                }}
              />
              <Bar dataKey="value" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-[2rem] p-6 border-white/5 shadow-2xl">
          <h2 className="mb-6 text-xs font-black text-amber-400 tracking-[0.2em] uppercase">
            Expenses by Vehicle
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fleetData.map(v => ({
              name: v.model,
              value: businessExpenses.filter(e => e.vehicleId === v.id).reduce((s, e) => s + parseFloat(e.amount), 0)
            }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} tickFormatter={(val) => `${val / 1000}k`} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                }}
              />
              <Bar dataKey="value" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Tabs defaultValue="fleet" className="space-y-6">
        <TabsList className="bg-slate-900/50 p-1 rounded-2xl border border-white/5 h-12">
          <TabsTrigger value="fleet" data-testid="tab-fleet" className="rounded-xl px-6 data-[state=active]:bg-gradient-purple-cyan data-[state=active]:text-white transition-all duration-300">Rental Fleet</TabsTrigger>
          <TabsTrigger value="income" data-testid="tab-income" className="rounded-xl px-6 data-[state=active]:bg-gradient-purple-cyan data-[state=active]:text-white transition-all duration-300">Business Income</TabsTrigger>
          <TabsTrigger value="expenses" data-testid="tab-expenses" className="rounded-xl px-6 data-[state=active]:bg-gradient-purple-cyan data-[state=active]:text-white transition-all duration-300">Business Expenses</TabsTrigger>
          <TabsTrigger value="reminders" data-testid="tab-reminders" className="rounded-xl px-6 data-[state=active]:bg-gradient-purple-cyan data-[state=active]:text-white transition-all duration-300">License & Insurance</TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
              Rental Fleet
              <div className="h-px w-32 bg-white/5" />
            </h2>
            <AddVehicleDialog />
          </div>

          <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-slate-500 tracking-[0.2em] uppercase">Fleet Status</h3>
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Fleet Value</div>
                <div className="text-2xl font-black text-white tabular-nums" data-testid="text-fleet-value">
                  {formatCurrency(totalFleetValue)}
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fleetData.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="group relative glass rounded-2xl p-6 border-white/5 hover:border-purple-500/30 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02] overflow-hidden"
                  data-testid={`card-vehicle-${vehicle.id}`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-transparent opacity-50" />

                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-purple-500/10 p-2.5 ring-1 ring-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                          <Car className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-black text-white tracking-tight">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">
                            {vehicle.licensePlate}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 text-[10px] font-black uppercase tracking-widest">
                        {vehicle.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Value</div>
                        <div className="text-lg font-black text-white tabular-nums">
                          {formatCurrency(parseFloat(vehicle.currentValue))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Daily Rate</div>
                        <div className="text-lg font-black text-emerald-400 tabular-nums">
                          {formatCurrency(parseFloat(vehicle.dailyRate))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <Badge variant="outline" className="border-white/10 text-white font-black text-[10px] bg-white/5 uppercase px-3 py-1">
                        Net Profit: {formatCurrency(
                          businessIncome.filter(i => i.vehicleId === vehicle.id).reduce((s, i) => s + parseFloat(i.amount), 0) -
                          businessExpenses.filter(e => e.vehicleId === vehicle.id).reduce((s, e) => s + parseFloat(e.amount), 0)
                        )}
                      </Badge>
                      <div className="text-[10px] font-black text-slate-500 uppercase">
                        Vehicle ID: {vehicle.id.toString().slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {fleetData.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-white/5 rounded-2xl border border-dashed border-white/10">
                  No vehicles in fleet yet. Add your first rental car!
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
            Business Income
            <div className="h-px w-32 bg-white/5" />
          </h2>
          <div className="glass-card rounded-[2rem] p-6 border-white/5 shadow-2xl overflow-hidden">
            <div className="space-y-3">
              {businessIncome.map((income) => (
                <div
                  key={income.id}
                  className="group flex items-center justify-between rounded-2xl border border-white/5 p-4 hover:bg-white/5 cursor-pointer transition-all duration-300"
                  onClick={() => setEditingTransaction({ id: income.id, type: "income" })}
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-emerald-400/10 p-2 border border-emerald-400/20">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-black text-white tracking-tight">{income.category}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">
                        {format(new Date(income.date), "MMM dd, yyyy")} • {income.source}
                        {income.vehicleId && (
                          <span className="ml-2 italic text-cyan-400">
                            ({fleetData.find(v => v.id === income.vehicleId)?.model})
                          </span>
                        )}
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
                  No business income recorded yet
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
            Business Expenses
            <div className="h-px w-32 bg-white/5" />
          </h2>
          <div className="glass-card rounded-[2rem] p-6 border-white/5 shadow-2xl overflow-hidden">
            <div className="space-y-3">
              {businessExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="group flex items-center justify-between rounded-2xl border border-white/5 p-4 hover:bg-white/5 cursor-pointer transition-all duration-300"
                  onClick={() => setEditingTransaction({ id: expense.id, type: "expense" })}
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-rose-400/10 p-2 border border-rose-400/20">
                      <TrendingDown className="h-5 w-5 text-rose-400" />
                    </div>
                    <div>
                      <div className="font-black text-white tracking-tight">{expense.category}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">
                        {format(new Date(expense.date), "MMM dd, yyyy")} • {expense.description}
                        {expense.vehicleId && (
                          <span className="ml-2 italic text-rose-400">
                            ({fleetData.find(v => v.id === expense.vehicleId)?.model})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-black tabular-nums text-rose-400 bg-rose-400/10 px-4 py-1 rounded-xl border border-rose-400/20">
                    -{formatCurrency(parseFloat(expense.amount))}
                  </div>
                </div>
              ))}
              {businessExpenses.length === 0 && (
                <div className="py-12 text-center text-slate-500 font-medium bg-white/5 rounded-2xl border border-dashed border-white/10">
                  No business expenses recorded yet
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reminders" className="space-y-6">
          <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
            License & Insurance Reminders
            <div className="h-px w-32 bg-white/5" />
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fleetData.map((vehicle) => {
              const licenseDue = vehicle.licenseDueDate ? new Date(vehicle.licenseDueDate) : null;
              const insuranceDue = vehicle.insuranceDueDate ? new Date(vehicle.insuranceDueDate) : null;
              const today = new Date();
              const next30Days = addDays(today, 30);

              const isLicenseSoon = licenseDue && isBefore(licenseDue, next30Days);
              const isInsuranceSoon = insuranceDue && isBefore(insuranceDue, next30Days);

              return (
                <div key={vehicle.id} className={cn("glass-card rounded-2xl p-6 border transition-all duration-300", (isLicenseSoon || isInsuranceSoon) ? "border-rose-500/30 bg-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.1)]" : "border-white/5")}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn("rounded-xl p-2.5 border", (isLicenseSoon || isInsuranceSoon) ? "bg-rose-500/20 border-rose-500/30" : "bg-white/5 border-white/10")}>
                      <Car className={cn("h-5 w-5", (isLicenseSoon || isInsuranceSoon) ? "text-rose-400" : "text-white")} />
                    </div>
                    <div>
                      <h3 className="font-black text-white tracking-tight">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{vehicle.licensePlate}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">License Due</span>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-black", isLicenseSoon ? "text-rose-400" : "text-white")}>
                          {vehicle.licenseDueDate ? format(new Date(vehicle.licenseDueDate), "MMM dd, yyyy") : "Not set"}
                        </span>
                        {isLicenseSoon && <AlertCircle className="h-4 w-4 text-rose-400 animate-pulse" />}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Insurance Due</span>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-black", isInsuranceSoon ? "text-rose-400" : "text-white")}>
                          {vehicle.insuranceDueDate ? format(new Date(vehicle.insuranceDueDate), "MMM dd, yyyy") : "Not set"}
                        </span>
                        {isInsuranceSoon && <AlertCircle className="h-4 w-4 text-rose-400 animate-pulse" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {fleetData.length === 0 && (
            <div className="py-12 text-center text-slate-500 font-medium bg-white/5 rounded-2xl border border-dashed border-white/10">
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
