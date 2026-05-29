import {
  findCategoryLabel,
  findRegionLabel,
} from "@/features/bff/server/master-mapper";
import type { StoresBffData } from "@/features/bff/server/types";
import {
  buildUrl,
  getNumberParam,
  pickSearchParams,
  toSearchParams,
} from "@/features/bff/server/query-param";
import { springApiFetch } from "@/features/bff/server/spring-api-client";
import { getExploreBootstrap } from "@/features/explore/server/get-explore-bootstrap";
import type { PageResponse, StoreListItem } from "@/features/stores/types";

const STORE_QUERY_KEYS = [
  "keyword",
  "sido",
  "sigungu",
  "dong",
  "ctprvnCd",
  "ctprvnNm",
  "signguCd",
  "signguNm",
  "adongCd",
  "adongNm",
  "categoryLargeCode",
  "categoryMediumCode",
  "categorySmallCode",
  "indsLclsCd",
  "indsLclsNm",
  "indsMclsCd",
  "indsMclsNm",
  "indsSclsCd",
  "indsSclsNm",
] as const;

export async function getStoresBootstrap(
  searchParams: URLSearchParams,
): Promise<StoresBffData> {
  const picked = pickSearchParams(searchParams, [...STORE_QUERY_KEYS]);
  const page = getNumberParam(searchParams, "page", 0);
  const size = getNumberParam(searchParams, "size", 20);
  const bootstrap = await getExploreBootstrap();
  const regionLabel = findRegionLabel(bootstrap.legacyRegions, picked);
  const categoryLabel = findCategoryLabel(bootstrap.legacyCategories, picked);
  const storeParams = toSearchParams({
    keyword: picked.keyword,
    sido: picked.sido ?? picked.ctprvnNm ?? regionLabel.split(" ")[0],
    sigungu: picked.sigungu ?? picked.signguNm ?? regionLabel.split(" ")[1],
    dong: picked.dong ?? picked.adongNm ?? regionLabel.split(" ")[2],
    categoryLargeCode: picked.categoryLargeCode ?? picked.indsLclsCd,
    categoryMediumCode: picked.categoryMediumCode ?? picked.indsMclsCd,
    categorySmallCode: picked.categorySmallCode ?? picked.indsSclsCd,
    page,
    size,
  });
  const requestParams = {
    keyword: picked.keyword,
    sido: picked.sido ?? picked.ctprvnNm ?? regionLabel.split(" ")[0],
    sigungu: picked.sigungu ?? picked.signguNm ?? regionLabel.split(" ")[1],
    dong: picked.dong ?? picked.adongNm ?? regionLabel.split(" ")[2],
    categoryLargeCode: picked.categoryLargeCode ?? picked.indsLclsCd,
    categoryMediumCode: picked.categoryMediumCode ?? picked.indsMclsCd,
    categorySmallCode: picked.categorySmallCode ?? picked.indsSclsCd,
    page,
    size,
  };

  const stores = await springApiFetch<PageResponse<StoreListItem>>(
    buildUrl("/api/stores", storeParams),
  );

  return {
    stores,
    requestParams,
    filters: {
      regions: bootstrap.legacyRegions,
      categories: bootstrap.legacyCategories,
      activeLabels: {
        regionLabel,
        categoryLabel,
        keyword: picked.keyword ?? "",
      },
    },
    generatedAt: new Date().toISOString(),
  };
}
