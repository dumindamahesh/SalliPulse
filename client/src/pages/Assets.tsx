import { AssetsList } from "@/components/AssetsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

//todo: remove mock functionality
const mockAssets = [
  { id: '1', name: 'Primary Residence', category: 'Property', currentValue: 450000, description: 'Family home' },
  { id: '2', name: 'Car - Toyota Camry', category: 'Vehicle', currentValue: 25000 },
  { id: '3', name: 'Savings Account', category: 'Cash', currentValue: 35000, description: 'Emergency fund' },
  { id: '4', name: 'Retirement Account', category: 'Investment', currentValue: 125000 },
];

export default function Assets() {
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

      <AssetsList assets={mockAssets} />
    </div>
  );
}
