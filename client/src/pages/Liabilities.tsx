import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard } from "lucide-react";

//todo: remove mock functionality
const mockLiabilities = [
  { id: '1', name: 'Mortgage', category: 'Loan', amount: 280000, description: 'Primary residence' },
  { id: '2', name: 'Car Loan', category: 'Loan', amount: 18000 },
  { id: '3', name: 'Credit Card', category: 'Debt', amount: 3500 },
];

export default function Liabilities() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalLiabilities = mockLiabilities.reduce((sum, liability) => sum + liability.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Liabilities</h1>
          <p className="text-muted-foreground">Manage your debts and obligations</p>
        </div>
        <Button data-testid="button-add-liability">
          <Plus className="mr-2 h-4 w-4" />
          Add Liability
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Total Liabilities</CardTitle>
            <div className="text-2xl font-bold tabular-nums text-destructive" data-testid="text-total-liabilities">
              {formatCurrency(totalLiabilities)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockLiabilities.map((liability) => (
              <div
                key={liability.id}
                className="flex items-center justify-between rounded-md border p-4"
                data-testid={`card-liability-${liability.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-md bg-muted p-2">
                    <CreditCard className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <div className="font-semibold">{liability.name}</div>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {liability.category}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold tabular-nums text-destructive">
                    {formatCurrency(liability.amount)}
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
