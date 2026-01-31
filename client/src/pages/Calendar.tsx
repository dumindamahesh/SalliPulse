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
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Calendar</h1>
          <p className="text-muted-foreground">View your financial activity across time</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          data-testid="button-add-data"
          className="bg-gradient-purple-cyan hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] border-none transition-all duration-300 rounded-xl px-6 h-11 font-bold"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Data
        </Button>
      </div>

      {/* Calendar Container */}
      <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] pointer-events-none" />

        {/* Calendar Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-10 w-10 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              data-testid="button-prev-month"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="w-56 text-center">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-10 w-10 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              data-testid="button-next-month"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={goToToday}
            className="rounded-xl px-6 hover:bg-white/5 text-slate-400 hover:text-white font-bold transition-all"
            data-testid="button-today"
          >
            Today
          </Button>
        </div>

        {/* Day headers */}
        <div className="mb-4 grid grid-cols-7 gap-2">
          {days.map((day) => (
            <div
              key={day}
              className="flex items-center justify-center py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const transactions = day ? getTransactionsForDate(day) : null;
            const isCurrentDay = isToday(day);

            return (
              <div
                key={index}
                className={`relative min-h-[120px] rounded-2xl border transition-all duration-300 group ${day
                    ? "bg-slate-900/40 border-white/5 hover:border-purple-500/30 hover:bg-slate-900/60"
                    : "bg-transparent border-transparent"
                  } ${isCurrentDay ? "ring-2 ring-purple-500 bg-purple-500/10 border-purple-500/20" : ""}`}
                data-testid={day ? `calendar-day-${day}` : undefined}
              >
                {day && (
                  <div className="h-full p-4 flex flex-col">
                    <div className={`text-sm font-black mb-2 ${isCurrentDay ? "text-purple-400" : "text-slate-400 group-hover:text-white"}`}>
                      {day}
                    </div>
                    {transactions && (transactions.income > 0 || transactions.expense > 0) && (
                      <div className="space-y-1.5 mt-auto">
                        {transactions.income > 0 && (
                          <div className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20 tabular-nums">
                            +{transactions.income.toFixed(0)}
                          </div>
                        )}
                        {transactions.expense > 0 && (
                          <div className="text-[10px] font-black text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-md border border-rose-400/20 tabular-nums">
                            -{transactions.expense.toFixed(0)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
