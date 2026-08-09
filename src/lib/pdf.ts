import { jsPDF } from "jspdf";
import type { PredictionResult } from "./genetics";

export function buildReportPdf(result: PredictionResult, name?: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 56;
  let y = 70;

  doc.setFontSize(22);
  doc.text("SicklePredict Report", left, y);
  y += 22;
  doc.setFontSize(11);
  doc.setTextColor(110);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, left, y);
  if (name) {
    y += 16;
    doc.text(`Prepared for: ${name}`, left, y);
  }

  doc.setTextColor(20);
  y += 40;
  doc.setFontSize(14);
  doc.text("Genotype combination", left, y);
  y += 20;
  doc.setFontSize(12);
  doc.text(`Your genotype: ${result.user}`, left, y);
  y += 18;
  doc.text(`Partner's genotype: ${result.partner}`, left, y);

  y += 34;
  doc.setFontSize(14);
  doc.text("Possible outcomes for each pregnancy", left, y);
  y += 20;
  doc.setFontSize(12);
  (["AA", "AS", "SS"] as const).forEach((g) => {
    doc.text(`${g}: ${result.percentages[g]}%`, left, y);
    y += 18;
  });

  y += 16;
  doc.setFontSize(14);
  doc.text(`Risk level: ${result.risk}`, left, y);
  y += 20;
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(result.description, 480), left, y);

  y += 90;
  doc.setTextColor(120);
  doc.setFontSize(9);
  doc.text(
    doc.splitTextToSize(
      "Medical disclaimer: SicklePredict provides educational genotype probability information based on Mendelian inheritance. It is not a diagnosis. Confirm genotypes with laboratory testing and consult a qualified genetic counselor or clinician.",
      480,
    ),
    left,
    y,
  );

  return doc;
}

export function reportFileName(result: PredictionResult) {
  return `SicklePredict-${result.user}-${result.partner}.pdf`;
}

export function downloadReport(result: PredictionResult, name?: string) {
  buildReportPdf(result, name).save(reportFileName(result));
}

export function reportSummaryText(result: PredictionResult) {
  return `SicklePredict report — ${result.user} + ${result.partner}: AA ${result.percentages.AA}%, AS ${result.percentages.AS}%, SS ${result.percentages.SS}%. Risk level: ${result.risk}. PDF report attached/downloaded from SicklePredict.`;
}
