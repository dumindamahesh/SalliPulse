import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Car, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { RentalFleet, Income, Expense } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BusinessPage() {
  const { data: fleetData = [], isLoading: fleetLoading } = useQuery<RentalFleet[]>({
    queryKey: ["/api/rental-fleet"],
  });

  const { data: incomeData = [] } = useQuery<Income[]>({
    queryKey: ["/api/income"],
  });

  const { data: expenseData = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  // Filter business transactions
  const businessIncome = incomeData.filter(t => t.isBusiness);
  const businessExpenses = expenseData.filter(t => t.isBusiness);

  const totalBusinessIncome = businessIncome.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalBusinessExpenses = businessExpenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const businessProfit = totalBusinessIncome - totalBusinessExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalFleetValue = fleetData.reduce((sum, vehicle) => sum + parseFloat(vehicle.currentValue), 0);

  if (fleetLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Car Rental Business</h1>
          <p className="text-muted-foreground">Manage your rental fleet and business finances</p>
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

      <Tabs defaultValue="fleet" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fleet" data-testid="tab-fleet">Rental Fleet</TabsTrigger>
          <TabsTrigger value="income" data-testid="tab-income">Business Income</TabsTrigger>
          <TabsTrigger value="expenses" data-testid="tab-expenses">Business Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Rental Fleet</h2>
            <Button data-testid="button-add-vehicle">
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
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
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {vehicle.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {vehicle.licensePlate}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            • ${vehicle.dailyRate}/day
                          </span>
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
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <div className="font-medium">{income.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(income.date).toLocaleDateString()} • {income.source}
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
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <div className="font-medium">{expense.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString()} • {expense.description}
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
      </Tabs>
    </div>
  );
}
