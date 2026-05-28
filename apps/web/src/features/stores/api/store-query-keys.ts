import type { StoreSearchParams } from "@/features/stores/types";

export const storeQueryKeys = {
  all: ["stores"] as const,
  lists: () => [...storeQueryKeys.all, "list"] as const,
  list: (params: StoreSearchParams) =>
    [...storeQueryKeys.lists(), normalizeStoreSearchParams(params)] as const,
  categories: () => [...storeQueryKeys.all, "categories"] as const,
  regions: () => ["regions"] as const,
};

export function normalizeStoreSearchParams(params: StoreSearchParams): StoreSearchParams {
  return {
    keyword: params.keyword?.trim() ?? "",
    sido: normalizeSelect(params.sido),
    sigungu: normalizeSelect(params.sigungu),
    dong: normalizeSelect(params.dong),
    categoryLargeCode: normalizeSelect(params.categoryLargeCode),
    categoryMediumCode: normalizeSelect(params.categoryMediumCode),
    categorySmallCode: normalizeSelect(params.categorySmallCode),
    page: Math.max(params.page ?? 0, 0),
    size: Math.min(Math.max(params.size ?? 20, 1), 100),
  };
}

function normalizeSelect(value?: string) {
  return value && value !== "all" ? value : undefined;
}
