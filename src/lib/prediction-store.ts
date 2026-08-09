import { useCallback, useEffect, useState } from "react";
import type { Genotype } from "./genetics";

const KEY = "sicklepredict:last";

export interface StoredPair {
  user: Genotype;
  partner: Genotype;
}

const listeners = new Set<(v: StoredPair | null) => void>();

export function readPair(): StoredPair | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredPair) : null;
  } catch {
    return null;
  }
}

export function savePair(pair: StoredPair) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(pair));
  }
  listeners.forEach((l) => l(pair));
}

export function useLastPair() {
  const [pair, setPair] = useState<StoredPair | null>(null);

  useEffect(() => {
    setPair(readPair());
    const listener = (v: StoredPair | null) => setPair(v);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const update = useCallback((next: StoredPair) => savePair(next), []);

  return { pair, update };
}
