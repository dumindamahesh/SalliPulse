import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Car, Briefcase } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  description?: string;
}

interface AssetsListProps {
  assets: Asset[];
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "property":
      return Building2;
    case "vehicle":
      return Car;
    default:
      return Briefcase;
  }
};

export function AssetsList({ assets }: AssetsListProps) {
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assets</CardTitle>
          <div className="text-2xl font-bold tabular-nums" data-testid="text-total-assets">
            {formatCurrency(totalValue)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assets.map((asset) => {
            const Icon = getCategoryIcon(asset.category);
            return (
              <div
                key={asset.id}
                className="flex items-center justify-between rounded-md border p-4"
                data-testid={`card-asset-${asset.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-md bg-muted p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{asset.name}</div>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {asset.category}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold tabular-nums">
                    {formatCurrency(asset.currentValue)}
                  </div>
                </div>
              </div>
            );
          })}
          {assets.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No assets added yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
