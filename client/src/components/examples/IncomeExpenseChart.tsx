import { IncomeExpenseChart } from '../IncomeExpenseChart'

const mockData = [
  { month: 'Jan', income: 5800, expenses: 4200 },
  { month: 'Feb', income: 6200, expenses: 3800 },
  { month: 'Mar', income: 5900, expenses: 4500 },
  { month: 'Apr', income: 6500, expenses: 4100 },
  { month: 'May', income: 6100, expenses: 4400 },
  { month: 'Jun', income: 6800, expenses: 4300 },
]

export default function IncomeExpenseChartExample() {
  return <IncomeExpenseChart data={mockData} />
}
