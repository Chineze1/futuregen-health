import { cn } from "@/lib/utils";
import { riskToneClass, type RiskLevel } from "@/lib/genetics";

export function RiskBadge({ risk, className }: { risk: RiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold",
        riskToneClass(risk),
        className,
      )}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-70" />
      {risk}
    </span>
  );
}
