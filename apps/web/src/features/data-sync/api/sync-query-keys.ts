import type { SyncLogSearchParams } from "@/features/data-sync/types";

export const syncQueryKeys = {
  all: ["sync"] as const,
  logs: (params: SyncLogSearchParams) =>
    [...syncQueryKeys.all, "logs", params] as const,
  detail: (id: number) => [...syncQueryKeys.all, "logs", id] as const,
};
