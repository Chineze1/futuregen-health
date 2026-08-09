import { cn } from "@/lib/utils";
import { GENOTYPES, type Genotype } from "@/lib/genetics";

export function GenotypePills({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Genotype;
  onChange: (g: Genotype) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="grid grid-cols-3 gap-3">
        {GENOTYPES.map((g) => {
          const active = value === g;
          return (
            <button
              key={g}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(g)}
              className={cn(
                "rounded-2xl border py-3 text-base font-semibold transition-all",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                  : "border-border bg-card text-foreground hover:border-primary/50",
              )}
            >
              {g}
            </button>
          );
        })}
      </div>
    </div>
  );
}
