import { FinancialSummaryCard } from '../FinancialSummaryCard'
import { DollarSign } from 'lucide-react'

export default function FinancialSummaryCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <FinancialSummaryCard
        title="Total Income"
        value="$12,450"
        trend={8.2}
        icon={DollarSign}
        iconColor="text-chart-2"
      />
      <FinancialSummaryCard
        title="Total Expenses"
        value="$8,320"
        trend={-3.1}
        icon={DollarSign}
        iconColor="text-destructive"
      />
    </div>
  )
}
