import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Mail, MessageCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { RequireAuth } from "@/components/RequireAuth";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { predict, type Genotype } from "@/lib/genetics";
import { downloadReport, reportSummaryText } from "@/lib/pdf";
import { useLastPair } from "@/lib/prediction-store";

export const Route = createFileRoute("/share")({
  head: () => ({
    meta: [
      { title: "Share your PDF report — SicklePredict" },
      {
        name: "description",
        content:
          "Export your genotype compatibility summary as a PDF and share it by email, WhatsApp or SMS.",
      },
      { property: "og:title", content: "Share your PDF report — SicklePredict" },
      {
        property: "og:description",
        content: "PDF-only sharing of your genotype result summary and risk level.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <SharePage />
    </RequireAuth>
  ),
});

function SharePage() {
  const { user } = useAuth();
  const { pair } = useLastPair();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [phone, setPhone] = useState("");

  const result = useMemo(
    () => predict(pair?.user ?? "AS", pair?.partner ?? "AS"),
    [pair?.user, pair?.partner],
  );

  const { data: profile } = useQuery({
    queryKey: ["profile-name", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const fullName = profile?.full_name || undefined;
  const summary = reportSummaryText(result);

  function exportPdf() {
    downloadReport(result, fullName);
    toast.success("PDF report downloaded");
  }

  function shareVia(target: "email" | "whatsapp" | "sms") {
    exportPdf();
    const encoded = encodeURIComponent(summary);
    let url = "";
    if (target === "email") {
      url = `mailto:${recipientEmail}?subject=${encodeURIComponent("My SicklePredict PDF Report")}&body=${encoded}`;
    } else if (target === "whatsapp") {
      url = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encoded}`;
    } else {
      url = `sms:${phone.replace(/\s/g, "")}?&body=${encoded}`;
    }
    window.open(url, "_blank");
    toast.info("Attach the downloaded PDF to complete sharing");
  }

  return (
    <div className="app-shell">
      <AppHeader title="Share Results" subtitle="PDF report only" backTo="/predictor" />

      <section className="rounded-3xl bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Your Genotype</p>
            <p className="text-xl font-semibold">{result.user}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Partner's Genotype</p>
            <p className="text-xl font-semibold">{result.partner}</p>
          </div>
        </div>
        <div className="mt-4">
          <RiskBadge risk={result.risk} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {(["AA", "AS", "SS"] as Genotype[]).map((g) => (
            <div key={g} className="rounded-2xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">{g}</p>
              <p className="text-lg font-semibold">{result.percentages[g]}%</p>
            </div>
          ))}
        </div>
      </section>

      <Button onClick={exportPdf} className="mt-5 w-full gap-2 rounded-2xl py-6">
        <Download className="h-5 w-5" /> Download PDF report
      </Button>

      <section className="mt-5 space-y-4 rounded-3xl bg-card p-5 shadow-soft">
        <p className="text-sm font-medium text-muted-foreground">
          Share the PDF report (PDF format only)
        </p>

        <div className="space-y-2">
          <Label htmlFor="recipient">Email / Gmail</Label>
          <div className="flex gap-2">
            <Input
              id="recipient"
              type="email"
              placeholder="doctor@clinic.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
            <Button variant="outline" className="gap-2" onClick={() => shareVia("email")}>
              <Mail className="h-4 w-4" /> Send
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number (WhatsApp / SMS)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+234 800 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2" onClick={() => shareVia("whatsapp")}>
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => shareVia("sms")}>
              <Smartphone className="h-4 w-4" /> SMS
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Sharing is restricted to the generated PDF report. The PDF downloads first, then your
          chosen app opens with the summary ready to attach.
        </p>
      </section>

      <BottomNav />
      <AppFooter />
    </div>
  );
}
