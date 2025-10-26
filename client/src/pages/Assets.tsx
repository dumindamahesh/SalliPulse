import { AssetsList } from "@/components/AssetsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Asset } from "@shared/schema";

export default function AssetsPage() {
  const { data: assetData = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  const assets = assetData.map(a => ({
    id: a.id,
    name: a.name,
    category: a.category,
    currentValue: parseFloat(a.currentValue),
    description: a.description || undefined,
  }));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-muted-foreground">Track your valuable possessions and investments</p>
        </div>
        <Button data-testid="button-add-asset">
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>

      <AssetsList assets={assets} />
    </div>
  );
}
