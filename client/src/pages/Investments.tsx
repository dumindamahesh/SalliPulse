import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, LineChart } from "lucide-react";

//todo: remove mock functionality
const mockInvestments = [
  { id: '1', name: 'S&P 500 Index Fund', category: 'Stocks', quantity: 150, currentValue: 75000 },
  { id: '2', name: 'Bitcoin', category: 'Crypto', quantity: 0.5, currentValue: 22000 },
  { id: '3', name: 'Corporate Bonds', category: 'Bonds', quantity: 50, currentValue: 25000 },
];

export default function Investments() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalValue = mockInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Investments</h1>
          <p className="text-muted-foreground">Track your investment portfolio</p>
        </div>
        <Button data-testid="button-add-investment">
          <Plus className="mr-2 h-4 w-4" />
          Add Investment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Total Portfolio Value</CardTitle>
            <div className="text-2xl font-bold tabular-nums text-chart-2" data-testid="text-total-investments">
              {formatCurrency(totalValue)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInvestments.map((investment) => (
              <div
                key={investment.id}
                className="flex items-center justify-between rounded-md border p-4"
                data-testid={`card-investment-${investment.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-md bg-muted p-2">
                    <LineChart className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <div className="font-semibold">{investment.name}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {investment.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Qty: {investment.quantity}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold tabular-nums">
                    {formatCurrency(investment.currentValue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
