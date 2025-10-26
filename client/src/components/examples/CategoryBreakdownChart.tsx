import { CategoryBreakdownChart } from '../CategoryBreakdownChart'

const mockData = [
  { name: 'Food', value: 1200 },
  { name: 'Transportation', value: 800 },
  { name: 'Utilities', value: 600 },
  { name: 'Entertainment', value: 400 },
  { name: 'Other', value: 320 },
]

export default function CategoryBreakdownChartExample() {
  return <CategoryBreakdownChart data={mockData} title="Expense Breakdown" />
}
