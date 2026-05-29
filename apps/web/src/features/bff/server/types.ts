import type {
  AnalysisSummary,
  CategoryDistributionItem,
} from "@/features/analysis/types";
import type {
  CompareRegionsResult,
  RegionRankingItem,
  RegionRankingParams,
} from "@/features/compare/types";
import type {
  MasterCategory,
  MasterRegion,
  MasterDataStatus,
} from "@/features/master/types";
import type {
  PageResponse,
  Region,
  StoreCategory,
  StoreListItem,
  StoreSearchParams,
} from "@/features/stores/types";
import type {
  StoreOpenApiStatus,
  SyncLogPage,
} from "@/features/data-sync/types";
import type {
  OpsDataQuality,
  OpsOverview,
  OpsSyncSummary,
} from "@/features/ops/types";

export type DashboardBffData = {
  summary: AnalysisSummary;
  categoryDistribution: CategoryDistributionItem[];
  regionRanking: RegionRankingItem[];
  generatedAt: string;
};

export type ExploreBootstrapData = {
  regions: MasterRegion[];
  categories: MasterCategory[];
  legacyRegions: Region[];
  legacyCategories: StoreCategory[];
  generatedAt: string;
};

export type StoresBffData = {
  stores: PageResponse<StoreListItem>;
  requestParams: StoreSearchParams;
  filters: {
    regions: Region[];
    categories: StoreCategory[];
    activeLabels: {
      regionLabel: string;
      categoryLabel: string;
      keyword: string;
    };
  };
  generatedAt: string;
};

export type CompareBootstrapData = {
  regions: MasterRegion[];
  categories: MasterCategory[];
  regionRanking: RegionRankingItem[];
  rankingParams: RegionRankingParams;
  generatedAt: string;
};

export type AdminOpsBffData = {
  overview: OpsOverview;
  syncSummary: OpsSyncSummary;
  dataQuality: OpsDataQuality;
  generatedAt: string;
};

export type AdminDataSyncBffData = {
  recentLogs: SyncLogPage;
  openApiStatus: StoreOpenApiStatus;
  masterStatus: MasterDataStatus;
  generatedAt: string;
};

export type ComparePreviewBffData = {
  result: CompareRegionsResult | null;
};
