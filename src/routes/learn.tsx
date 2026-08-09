import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { RequireAuth } from "@/components/RequireAuth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getLearnModules } from "@/lib/learn.functions";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn about genotypes & sickle cell — SicklePredict" },
      {
        name: "description",
        content:
          "Up-to-date explainers on genotypes, AA/AS/SS, safe and risky combinations and prevention, sourced from WHO, CDC and PubMed guidance.",
      },
      { property: "og:title", content: "Learn about genotypes & sickle cell — SicklePredict" },
      {
        property: "og:description",
        content: "Four living learning modules refreshed from authoritative medical sources.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <LearnPage />
    </RequireAuth>
  ),
});

function LearnPage() {
  const fetchModules = useServerFn(getLearnModules);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["learn-modules"],
    queryFn: () => fetchModules(),
    staleTime: 1000 * 60 * 60,
  });

  return (
    <div className="app-shell">
      <AppHeader title="Learn" subtitle="Fresh guidance from medical sources" />

      <div className="mb-4 flex items-center justify-between rounded-3xl bg-primary-soft p-4">
        <p className="text-xs text-secondary-foreground">
          Content is retrieved live from current WHO, CDC and PubMed-based guidance.
        </p>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Refresh content"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-3xl" />
          ))}
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {data?.map((module) => (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="rounded-3xl border-none bg-card px-5 shadow-soft"
            >
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                {module.title}
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-5">
                <p className="text-sm text-muted-foreground">{module.summary}</p>
                {module.sections?.map((section, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold">{section.heading}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {section.body}
                    </p>
                  </div>
                ))}
                {module.sources?.length ? (
                  <div className="rounded-2xl bg-muted p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Sources
                    </p>
                    <ul className="mt-1 space-y-1">
                      {module.sources.map((src) => (
                        <li key={src}>
                          <a
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-xs text-primary hover:underline"
                          >
                            {src}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <BottomNav />
    </div>
  );
}
