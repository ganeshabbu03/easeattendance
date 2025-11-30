import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  delay?: number;
}

const variantStyles = {
  default: {
    bg: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50",
    icon: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    border: "border-slate-200/50 dark:border-slate-700/50",
  },
  success: {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10",
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200/50 dark:border-emerald-700/30",
  },
  warning: {
    bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10",
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    border: "border-amber-200/50 dark:border-amber-700/30",
  },
  danger: {
    bg: "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10",
    icon: "bg-red-500/10 text-red-600 dark:text-red-400",
    border: "border-red-200/50 dark:border-red-700/30",
  },
  info: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10",
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    border: "border-blue-200/50 dark:border-blue-700/30",
  },
};

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  variant = "default",
  delay = 0 
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const styles = variantStyles[variant];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  return (
    <Card 
      className={`
        ${styles.bg} ${styles.border} border overflow-visible
        transform transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        hover-elevate
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight font-[Poppins]">
                {displayValue}
              </span>
              {trend && (
                <span className={`text-sm font-medium ${trend.isPositive ? "text-emerald-600" : "text-red-600"}`}>
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${styles.icon}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
