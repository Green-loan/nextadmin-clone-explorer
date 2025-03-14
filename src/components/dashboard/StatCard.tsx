
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  trend?: number;
  className?: string;
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) => {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className={cn("stat-card hover-scale", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="stat-card-title">{title}</p>
          <h3 className="stat-card-value">{value}</h3>
        </div>
        {Icon && (
          <div className="p-2 rounded-full bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      
      {(description || trend) && (
        <div className="mt-4 flex items-center">
          {trend !== undefined && (
            <span
              className={cn(
                "text-xs font-medium mr-2 px-2 py-0.5 rounded-full",
                isPositive && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                isNegative && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                !isPositive && !isNegative && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              )}
            >
              {isPositive && '+'}
              {trend}%
            </span>
          )}
          {description && (
            <span className="text-sm text-muted-foreground">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
