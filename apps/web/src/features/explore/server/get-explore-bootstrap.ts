import {
  masterCategoriesToLegacyCategories,
  masterRegionsToLegacyRegions,
} from "@/features/bff/server/master-mapper";
import type { ExploreBootstrapData } from "@/features/bff/server/types";
import { buildUrl, toSearchParams } from "@/features/bff/server/query-param";
import { springApiFetch } from "@/features/bff/server/spring-api-client";
import type { MasterCategory, MasterRegion } from "@/features/master/types";

export async function getExploreBootstrap(): Promise<ExploreBootstrapData> {
  const regionParams = toSearchParams({
    includeAdminDong: true,
    includeLegalDong: false,
  });

  const [regions, categories] = await Promise.all([
    springApiFetch<MasterRegion[]>(buildUrl("/api/master/regions", regionParams)),
    springApiFetch<MasterCategory[]>("/api/master/categories"),
  ]);

  return {
    regions,
    categories,
    legacyRegions: masterRegionsToLegacyRegions(regions),
    legacyCategories: masterCategoriesToLegacyCategories(categories),
    generatedAt: new Date().toISOString(),
  };
}
