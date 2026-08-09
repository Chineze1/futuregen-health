import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { GenotypePills } from "@/components/GenotypePills";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { predict, type Genotype } from "@/lib/genetics";
import { savePair, readPair } from "@/lib/prediction-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SicklePredict — Know Today, Protect Tomorrow" },
      {
        name: "description",
        content:
          "Pick your genotype and your partner's to predict the possible genotypes of your future children.",
      },
      { property: "og:title", content: "SicklePredict — Know Today, Protect Tomorrow" },
      {
        property: "og:description",
        content: "Genotype compatibility checker with Punnett square odds and sickle cell risk levels.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <HomePage />
    </RequireAuth>
  ),
});

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userGenotype, setUserGenotype] = useState<Genotype>("AS");
  const [partnerGenotype, setPartnerGenotype] = useState<Genotype>("AS");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, genotype, partner_genotype")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    const stored = readPair();
    if (stored) {
      setUserGenotype(stored.user);
      setPartnerGenotype(stored.partner);
    } else if (profile?.genotype) {
      setUserGenotype(profile.genotype as Genotype);
      if (profile.partner_genotype) setPartnerGenotype(profile.partner_genotype as Genotype);
    }
  }, [profile]);

  const firstName = (profile?.full_name || user?.email?.split("@")[0] || "there").split(" ")[0];

  return (
    <div className="app-shell">
      <AppHeader title={`Hi, ${firstName}`} subtitle="Welcome back to SicklePredict" />

      <section className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-card">
        <Sparkles className="absolute -right-4 -top-4 h-28 w-28 opacity-15" />
        <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Featured</p>
        <h2 className="mt-2 text-2xl font-semibold">Genotype Compatibility Checker</h2>
        <p className="mt-2 text-sm opacity-90">Predict possible genotypes of future children.</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" /> Know Today, Protect Tomorrow
        </p>
      </section>

      <section className="mt-6 space-y-5 rounded-3xl bg-card p-5 shadow-soft">
        <GenotypePills label="Your Genotype" value={userGenotype} onChange={setUserGenotype} />
        <GenotypePills
          label="Partner's Genotype"
          value={partnerGenotype}
          onChange={setPartnerGenotype}
        />
        <Button
          size="lg"
          className="h-13 w-full rounded-2xl py-6 text-base font-semibold"
          onClick={() => {
            savePair({ user: userGenotype, partner: partnerGenotype });
            const outcome = predict(userGenotype, partnerGenotype);
            if (user) {
              void supabase.from("predictions").insert({
                user_id: user.id,
                user_genotype: outcome.user,
                partner_genotype: outcome.partner,
                aa_percent: outcome.percentages.AA,
                as_percent: outcome.percentages.AS,
                ss_percent: outcome.percentages.SS,
                risk_level: outcome.risk,
              });
            }
            navigate({ to: "/predictor" });
          }}
        >
          Predict Future Babies
        </Button>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <Link
          to="/learn"
          className="rounded-3xl bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <p className="text-sm font-semibold">Learn</p>
          <p className="mt-1 text-xs text-muted-foreground">Up-to-date medical explainers</p>
        </Link>
        <Link
          to="/profile/history"
          className="rounded-3xl bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <p className="text-sm font-semibold">My Results</p>
          <p className="mt-1 text-xs text-muted-foreground">Review past genotype checks</p>
        </Link>
      </section>

      <BottomNav />
    </div>
  );
}
