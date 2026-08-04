import { Difficulty, DsaPattern } from "@devlog/types";

export const DIFFICULTY_ORDER: Difficulty[] = [
  Difficulty.EASY,
  Difficulty.MEDIUM,
  Difficulty.HARD,
];

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  [Difficulty.EASY]: "#4ade80",
  [Difficulty.MEDIUM]: "#f4c542",
  [Difficulty.HARD]: "#f87171",
};

export const PATTERN_COLOR: Record<DsaPattern, string> = {
  [DsaPattern.TWO_POINTERS]: "var(--devlog-accent)",
  [DsaPattern.SLIDING_WINDOW]: "#4ade80",
  [DsaPattern.BINARY_SEARCH]: "#5b9bd9",
  [DsaPattern.STACK]: "#f4c542",
  [DsaPattern.LINKED_LIST]: "#f87171",
  [DsaPattern.TREES]: "#a78bfa",
  [DsaPattern.GRAPHS]: "#34d399",
  [DsaPattern.DYNAMIC_PROGRAMMING]: "#fb923c",
  [DsaPattern.GREEDY]: "#e879f9",
  [DsaPattern.BACKTRACKING]: "#22d3ee",
  [DsaPattern.HASHING]: "#fda4af",
  [DsaPattern.HEAP]: "#a3e635",
  [DsaPattern.TWO_POINTERS_FAST_SLOW]: "#2dd4bf",
};

export function difficultyColor(difficulty: Difficulty): string {
  return DIFFICULTY_COLOR[difficulty] ?? "var(--devlog-text-muted)";
}

export function patternColor(pattern: DsaPattern): string {
  return PATTERN_COLOR[pattern] ?? "var(--devlog-text-muted)";
}
