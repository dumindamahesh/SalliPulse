import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import type { Income, Expense } from "@shared/schema";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: incomeData = [] } = useQuery<Income[]>({
    queryKey: ["/api/income"],
  });

  const { data: expenseData = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get calendar days
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get transactions for a specific date
  const getTransactionsForDate = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const dayIncome = incomeData
      .filter((t) => {
        const tDate = new Date(t.date);
        const tDateStr = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}-${String(tDate.getDate()).padStart(2, '0')}`;
        return tDateStr === dateStr;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const dayExpense = expenseData
      .filter((t) => {
        const tDate = new Date(t.date);
        const tDateStr = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}-${String(tDate.getDate()).padStart(2, '0')}`;
        return tDateStr === dateStr;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return { income: dayIncome, expense: dayExpense };
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Button onClick={() => setShowAddForm(true)} data-testid="button-add-data">
          <Plus className="mr-2 h-4 w-4" />
          Add Data
        </Button>
      </div>

      {/* Calendar Header */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={prevMonth}
              data-testid="button-prev-month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="w-48 text-center">
              <h2 className="text-xl font-semibold">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              data-testid="button-next-month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday} data-testid="button-today">
            Today
          </Button>
        </div>

        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {days.map((day) => (
            <div
              key={day}
              className="flex items-center justify-center py-2 text-sm font-semibold"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const transactions = day ? getTransactionsForDate(day) : null;
            const isCurrentDay = isToday(day);

            return (
              <div
                key={index}
                className={`relative min-h-24 rounded border p-2 ${
                  day ? "bg-background" : "bg-muted"
                } ${isCurrentDay ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-950" : ""}`}
                data-testid={day ? `calendar-day-${day}` : undefined}
              >
                {day && (
                  <>
                    <div className="mb-1 font-semibold">{day}</div>
                    {transactions && (transactions.income > 0 || transactions.expense > 0) && (
                      <div className="space-y-1 text-xs">
                        {transactions.income > 0 && (
                          <div className="text-green-600 dark:text-green-400">
                            +Rs. {transactions.income.toFixed(0)}
                          </div>
                        )}
                        {transactions.expense > 0 && (
                          <div className="text-red-600 dark:text-red-400">
                            -Rs. {transactions.expense.toFixed(0)}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Transaction Dialog - Modal Overlay */}
      {showAddForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowAddForm(false)}
          data-testid="modal-overlay"
        >
          <div
            className="relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <AddTransactionDialog />
          </div>
        </div>
      )}
    </div>
  );
}
