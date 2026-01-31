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
    <Card data-testid={`card-summary-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums" data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        {trend !== undefined && (
          <div className="mt-2 flex items-center text-sm">
            {isPositive && (
              <>
                <ArrowUpRight className="mr-1 h-4 w-4 text-chart-2" />
                <span className="font-medium text-chart-2">+{Math.abs(trend)}%</span>
              </>
            )}
            {isNegative && (
              <>
                <ArrowDownRight className="mr-1 h-4 w-4 text-destructive" />
                <span className="font-medium text-destructive">{trend}%</span>
              </>
            )}
            {!isPositive && !isNegative && (
              <span className="font-medium text-muted-foreground">No change</span>
            )}
            <span className="ml-1 text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
