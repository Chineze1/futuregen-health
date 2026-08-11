import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { RiskBadge } from "@/components/RiskBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { RiskLevel } from "@/lib/genetics";

export const Route = createFileRoute("/profile/history")({
  head: () => ({
    meta: [
      { title: "My results history — SicklePredict" },
      { name: "description", content: "Chronological log of your past genotype compatibility checks." },
      { property: "og:title", content: "My results history — SicklePredict" },
      { property: "og:description", content: "Every genotype check you have run, with risk badges." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["predictions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="app-shell">
      <AppHeader title="My Results History" subtitle="Past genotype checks" backTo="/profile" />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-3xl" />
          ))}
        </div>
      ) : data?.length ? (
        <ul className="space-y-3">
          {data.map((row) => (
            <li key={row.id} className="rounded-3xl bg-card p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {row.user_genotype} + {row.partner_genotype}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    AA {row.aa_percent}% · AS {row.as_percent}% · SS {row.ss_percent}%
                  </p>
                </div>
                <RiskBadge risk={row.risk_level as RiskLevel} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl bg-card p-6 text-center text-sm text-muted-foreground shadow-soft">
          No checks yet. Run your first prediction from the Home screen.
        </p>
      )}

      <BottomNav />
      <AppFooter />
    </div>
  );
}
