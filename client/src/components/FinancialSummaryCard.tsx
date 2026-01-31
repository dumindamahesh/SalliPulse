import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface FinancialSummaryCardProps {
  title: string;
  value: string;
  trend?: number;
  icon: LucideIcon;
  iconColor?: string;
}

export function FinancialSummaryCard({
  title,
  value,
  trend,
  icon: Icon,
  iconColor = "text-primary",
}: FinancialSummaryCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <Card
      className="glass-card group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-t-2 border-t-primary/30"
      data-testid={`card-summary-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />

      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 transition-colors group-hover:text-primary/80">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tabular-nums tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-purple-500 transition-all duration-500" data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        {trend !== undefined && (
          <div className="mt-3 flex items-center text-xs">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20' : 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20'}`}>
              {isPositive && <ArrowUpRight className="h-3 w-3" />}
              {isNegative && <ArrowDownRight className="h-3 w-3" />}
              <span className="font-bold">{isPositive ? '+' : ''}{trend}%</span>
            </div>
            <span className="ml-2 text-muted-foreground/60 font-medium">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
