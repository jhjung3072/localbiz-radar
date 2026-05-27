import { apiClient } from "@/lib/api-client";
import type {
  PageResponse,
  Region,
  StoreCategory,
  StoreListItem,
  StoreSearchParams,
} from "@/features/stores/types";

export function getStores(params: StoreSearchParams) {
  const searchParams = new URLSearchParams();

  appendParam(searchParams, "keyword", params.keyword);
  appendParam(searchParams, "sido", params.sido);
  appendParam(searchParams, "sigungu", params.sigungu);
  appendParam(searchParams, "dong", params.dong);
  appendParam(searchParams, "categoryLargeCode", params.categoryLargeCode);
  appendParam(searchParams, "categoryMediumCode", params.categoryMediumCode);
  appendParam(searchParams, "categorySmallCode", params.categorySmallCode);
  searchParams.set("page", String(params.page));
  searchParams.set("size", String(params.size));

  return apiClient<PageResponse<StoreListItem>>(
    `/api/stores?${searchParams.toString()}`,
  );
}

export function getStoreCategories() {
  return apiClient<StoreCategory[]>("/api/stores/categories");
}

export function getRegions() {
  return apiClient<Region[]>("/api/regions");
}

function appendParam(
  searchParams: URLSearchParams,
  key: string,
  value?: string,
) {
  if (value && value !== "all") {
    searchParams.set(key, value);
  }
}
