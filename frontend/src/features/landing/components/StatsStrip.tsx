import { ShieldCheck, WifiOff, Users, Zap } from "lucide-react";
import type { ReactNode } from "react";

interface StatItem {
  icon: ReactNode;
  label: string;
  value: string;
}

const STATS: StatItem[] = [
  {
    icon: <ShieldCheck className="size-5" />,
    label: "Encryption",
    value: "Zero-Knowledge",
  },
  {
    icon: <WifiOff className="size-5" />,
    label: "Architecture",
    value: "Offline-First",
  },
  {
    icon: <Users className="size-5" />,
    label: "Collaboration",
    value: "Real-Time",
  },
  {
    icon: <Zap className="size-5" />,
    label: "Sync",
    value: "Instant",
  },
];

export function StatsStrip() {
  return (
    <div className="landing-stats-strip">
      {STATS.map((stat) => (
        <div key={stat.label} className="landing-stat-item">
          <div className="landing-stat-icon">{stat.icon}</div>
          <div>
            <div className="text-sm font-bold text-foreground">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
