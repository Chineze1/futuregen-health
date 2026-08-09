export type Genotype = "AA" | "AS" | "SS";
export const GENOTYPES: Genotype[] = ["AA", "AS", "SS"];

export type RiskLevel = "Safe" | "Moderate Risk" | "High Risk" | "Very High Risk";

export interface PredictionResult {
  user: Genotype;
  partner: Genotype;
  square: Genotype[]; // 4 cells, row = partner allele, col = user allele
  userAlleles: string[];
  partnerAlleles: string[];
  percentages: Record<Genotype, number>;
  risk: RiskLevel;
  description: string;
}

const alleles = (g: Genotype) => g.split("");

const normalize = (a: string, b: string): Genotype =>
  (a === "A" && b === "A" ? "AA" : a === "S" && b === "S" ? "SS" : "AS") as Genotype;

const DESCRIPTIONS: Record<RiskLevel, string> = {
  Safe: "None of your possible children would have sickle cell disease. Carrier (AS) children are still possible and healthy.",
  "Moderate Risk":
    "There is a 25% chance of a child with sickle cell disease (SS) in every pregnancy. Genetic counseling is strongly advised.",
  "High Risk":
    "This combination carries a high risk of sickle cell disease. Genetic counseling is advised before planning children.",
  "Very High Risk":
    "Every child from this combination would inherit sickle cell disease (SS). Speak with a genetic counselor about your options.",
};

export function predict(user: Genotype, partner: Genotype): PredictionResult {
  const userAlleles = alleles(user);
  const partnerAlleles = alleles(partner);
  const square: Genotype[] = [];
  for (const p of partnerAlleles) {
    for (const u of userAlleles) {
      square.push(normalize(u, p));
    }
  }

  const percentages: Record<Genotype, number> = { AA: 0, AS: 0, SS: 0 };
  for (const cell of square) percentages[cell] += 25;

  let risk: RiskLevel = "Safe";
  if (percentages.SS === 100) risk = "Very High Risk";
  else if (percentages.SS >= 50) risk = "High Risk";
  else if (percentages.SS > 0) risk = "Moderate Risk";

  return {
    user,
    partner,
    square,
    userAlleles,
    partnerAlleles,
    percentages,
    risk,
    description: DESCRIPTIONS[risk],
  };
}

export function riskToneClass(risk: RiskLevel) {
  if (risk === "Safe") return "bg-safe text-safe-foreground";
  if (risk === "Moderate Risk") return "bg-moderate text-moderate-foreground";
  return "bg-danger text-danger-foreground";
}
