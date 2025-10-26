import { AssetsList } from '../AssetsList'

const mockAssets = [
  { id: '1', name: 'Primary Residence', category: 'Property', currentValue: 450000 },
  { id: '2', name: 'Car - Toyota Camry', category: 'Vehicle', currentValue: 25000 },
  { id: '3', name: 'Savings Account', category: 'Cash', currentValue: 35000 },
]

export default function AssetsListExample() {
  return <AssetsList assets={mockAssets} />
}
