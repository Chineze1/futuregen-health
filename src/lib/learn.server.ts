export interface LearnSection {
  heading: string;
  body: string;
}

export interface LearnModule {
  id: string;
  title: string;
  summary: string;
  sections: LearnSection[];
  sources: string[];
}

export const MODULE_PROMPTS: { id: string; title: string; ask: string }[] = [
  {
    id: "what-is-genotype",
    title: "What is Genotype?",
    ask: "Basics of genes, alleles, haemoglobin and how a haemoglobin genotype is inherited and tested.",
  },
  {
    id: "understanding-genotypes",
    title: "Understanding Genotypes",
    ask: "In-depth breakdown of AA, AS and SS haemoglobin genotypes: what each means clinically, symptoms, life expectancy and management.",
  },
  {
    id: "safe-risky-combinations",
    title: "Safe & Risky Combinations",
    ask: "Genetic cross probabilities between partner genotypes and which combinations are safe, moderate risk and high risk for sickle cell disease.",
  },
  {
    id: "prevention-tips",
    title: "Prevention Tips",
    ask: "Current medical guidance on prevention: premarital and newborn screening, genetic counselling, IVF with preimplantation genetic diagnosis, hydroxyurea and care for affected children.",
  },
];

const FALLBACK_NOTE =
  "Live medical summary is temporarily unavailable. Please retry, or consult WHO, CDC and NHLBI sickle cell resources directly.";

export function fallbackModules(): LearnModule[] {
  return MODULE_PROMPTS.map((m) => ({
    id: m.id,
    title: m.title,
    summary: FALLBACK_NOTE,
    sections: [{ heading: m.title, body: m.ask }],
    sources: [
      "https://www.who.int/news-room/fact-sheets",
      "https://www.cdc.gov/sickle-cell/",
      "https://pubmed.ncbi.nlm.nih.gov/",
    ],
  }));
}

export async function fetchLearnModules(apiKey: string): Promise<LearnModule[]> {
  const prompt = `You are a medical content editor for a sickle cell genotype education app.
Using current, real-world public health guidance from WHO, CDC, NHLBI and PubMed-indexed literature, write up-to-date explanations for these four learning modules:
${MODULE_PROMPTS.map((m, i) => `${i + 1}. ${m.title} — ${m.ask}`).join("\n")}

Return JSON only, matching:
{"modules":[{"id":"<module id>","title":"<title>","summary":"<1-2 sentence plain-language summary>","sections":[{"heading":"<short heading>","body":"<2-4 sentence explanation>"}],"sources":["<authoritative url>"]}]}
Use the exact ids: ${MODULE_PROMPTS.map((m) => m.id).join(", ")}. Give 3-5 sections per module and 2-3 real authoritative source URLs (who.int, cdc.gov, nhlbi.nih.gov, pubmed.ncbi.nlm.nih.gov). Plain text only, no markdown.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3.5-flash",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    console.error("AI gateway error", response.status, await response.text());
    return fallbackModules();
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return fallbackModules();

  try {
    const parsed = JSON.parse(content) as { modules?: LearnModule[] };
    const modules = parsed.modules?.filter((m) => m && m.title && Array.isArray(m.sections));
    if (!modules?.length) return fallbackModules();
    return modules;
  } catch (error) {
    console.error("Failed to parse AI learn content", error);
    return fallbackModules();
  }
}
