// src\components\SystemStatus.tsx
import { Circle } from "lucide-react";

interface StatusItemProps {
  label: string;
  status: string;
  isActive: boolean;
}

function StatusItem({ label, status, isActive }: StatusItemProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={isActive ? "text-success font-medium" : "text-destructive font-medium"}>
        {status}
      </span>
    </div>
  );
}

export function SystemStatus() {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          System Status
        </span>
        <Circle className="h-2.5 w-2.5 fill-success text-success" />
      </div>
      <div className="space-y-2">
        <StatusItem label="Proxy Pool" status="Active (US)" isActive={true} />
        <StatusItem label="Scraper Engine" status="Ready" isActive={true} />
        <StatusItem label="Queue" status="0 pending" isActive={true} />
      </div>
    </div>
  );
}
