import type { StoreSearchParams } from "@/features/stores/types";

export const storeQueryKeys = {
  all: ["stores"] as const,
  lists: () => [...storeQueryKeys.all, "list"] as const,
  list: (params: StoreSearchParams) => [...storeQueryKeys.lists(), params] as const,
  categories: () => [...storeQueryKeys.all, "categories"] as const,
  regions: () => ["regions"] as const,
};
