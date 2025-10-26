import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, LineChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Investment } from "@shared/schema";

export default function InvestmentsPage() {
  const { data: investmentData = [], isLoading } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalValue = investmentData.reduce((sum, inv) => sum + parseFloat(inv.currentValue), 0);

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
            {investmentData.map((investment) => (
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
                    {formatCurrency(parseFloat(investment.currentValue))}
                  </div>
                </div>
              </div>
            ))}
            {investmentData.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No investments added yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
