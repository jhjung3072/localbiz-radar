import type { CompareSelection } from "@/features/compare/types";

const STORAGE_KEY = "localbiz-radar:recent-comparisons";
const MAX_RECENT_COUNT = 5;

export type RecentComparison = CompareSelection & {
  label: string;
  savedAt: string;
};

export function readRecentComparisons() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentComparison[]) : [];
  } catch {
    return [];
  }
}

export function saveRecentComparison(selection: CompareSelection, label: string) {
  if (typeof window === "undefined") {
    return [];
  }

  const recent = readRecentComparisons();
  const signature = selectionSignature(selection);
  const next = [
    { ...selection, label, savedAt: new Date().toISOString() },
    ...recent.filter((item) => selectionSignature(item) !== signature),
  ].slice(0, MAX_RECENT_COUNT);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function selectionSignature(selection: CompareSelection) {
  return [
    selection.baseSido,
    selection.baseSigungu,
    selection.baseDong,
    selection.targetSido,
    selection.targetSigungu,
    selection.targetDong,
    selection.large,
    selection.medium,
    selection.small,
  ].join("|");
}
