import { TransactionsTable } from '../TransactionsTable'

const mockTransactions = [
  { id: '1', date: '2024-01-15', category: 'Salary', description: 'Monthly salary', amount: 5000, type: 'income' as const },
  { id: '2', date: '2024-01-14', category: 'Food', description: 'Grocery shopping', amount: -120.50, type: 'expense' as const },
  { id: '3', date: '2024-01-12', category: 'Transportation', description: 'Gas', amount: -45.00, type: 'expense' as const },
  { id: '4', date: '2024-01-10', category: 'Freelance', description: 'Website project', amount: 800, type: 'income' as const },
]

export default function TransactionsTableExample() {
  return <TransactionsTable transactions={mockTransactions} />
}
