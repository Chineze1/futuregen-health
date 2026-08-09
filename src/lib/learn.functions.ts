import { createServerFn } from "@tanstack/react-start";
import { fallbackModules, fetchLearnModules, type LearnModule } from "./learn.server";

export type { LearnModule };

export const getLearnModules = createServerFn({ method: "GET" }).handler(async () => {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return fallbackModules();
  return fetchLearnModules(apiKey);
});
