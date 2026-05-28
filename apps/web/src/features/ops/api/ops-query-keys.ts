export const opsQueryKeys = {
  all: ["ops"] as const,
  overview: () => [...opsQueryKeys.all, "overview"] as const,
  syncSummary: (days: number) => [...opsQueryKeys.all, "sync-summary", days] as const,
  dataQuality: () => [...opsQueryKeys.all, "data-quality"] as const,
};
