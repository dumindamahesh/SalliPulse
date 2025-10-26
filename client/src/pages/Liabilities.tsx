import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Liability } from "@shared/schema";

export default function LiabilitiesPage() {
  const { data: liabilityData = [], isLoading } = useQuery<Liability[]>({
    queryKey: ["/api/liabilities"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalLiabilities = liabilityData.reduce((sum, liability) => sum + parseFloat(liability.amount), 0);

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
            {liabilityData.map((liability) => (
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
                    {formatCurrency(parseFloat(liability.amount))}
                  </div>
                </div>
              </div>
            ))}
            {liabilityData.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No liabilities added yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
