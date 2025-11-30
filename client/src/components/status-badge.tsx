import { Badge } from "@/components/ui/badge";
import type { AttendanceStatus } from "@shared/schema";
import { Check, X, Clock, AlertTriangle } from "lucide-react";

interface StatusBadgeProps {
  status: AttendanceStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const statusConfig: Record<AttendanceStatus, { 
  label: string; 
  className: string;
  icon: typeof Check;
}> = {
  present: {
    label: "Present",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: Check,
  },
  absent: {
    label: "Absent",
    className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    icon: X,
  },
  late: {
    label: "Late",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: Clock,
  },
  "half-day": {
    label: "Half Day",
    className: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
    icon: AlertTriangle,
  },
};

export function StatusBadge({ status, size = "md", showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${sizeClasses[size]} font-medium gap-1.5 border animate-scale-in`}
    >
      {showIcon && <Icon className={size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"} />}
      {config.label}
    </Badge>
  );
}
