import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ActiveFilterChips } from "@/features/explore/components/active-filter-chips";
import { CandidateRegionCard } from "@/features/explore/components/candidate-region-card";
import { CandidateTray } from "@/features/explore/components/candidate-tray";
import { DebouncedSearchInput } from "@/features/explore/components/debounced-search-input";
import { ExploreFilterBar } from "@/features/explore/components/explore-filter-bar";
import { MapSearchOverlay } from "@/features/explore/components/map-search-overlay";
import { MapStoreList } from "@/features/explore/components/map-store-list";
import { MarkerClusterToggle } from "@/features/explore/components/marker-cluster-toggle";
import { PerformanceNotice } from "@/features/explore/components/performance-notice";
import { RecentSearches } from "@/features/explore/components/recent-searches";
import { StoreDetailDrawer } from "@/features/explore/components/store-detail-drawer";
import { VirtualizedStoreList } from "@/features/stores/components/virtualized-store-list";
import type { CandidateItem, ExploreQueryState } from "@/features/explore/types";
import type { StoreMapItem } from "@/features/map/types";
import type { StoreListItem } from "@/features/stores/types";

const meta = {
  title: "Explore/Integrated UX",
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

const query: ExploreQueryState = {
  keyword: "커피",
  ctprvnCd: "11",
  ctprvnNm: "서울특별시",
  signguCd: "11680",
  signguNm: "강남구",
  adongCd: "11680640",
  adongNm: "역삼1동",
  indsLclsCd: "I2",
  indsLclsNm: "음식점",
  indsMclsCd: "I212",
  indsMclsNm: "비알코올",
  indsSclsCd: "I21201",
  indsSclsNm: "커피전문점",
  page: 0,
  size: 10,
  radius: 500,
};

const candidates: CandidateItem[] = [
  {
    type: "REGION",
    id: "region:11:11680:11680640",
    ctprvnCd: "11",
    ctprvnNm: "서울특별시",
    signguCd: "11680",
    signguNm: "강남구",
    adongCd: "11680640",
    adongNm: "역삼1동",
    source: "STORES",
    addedAt: "2026-05-28T00:00:00.000Z",
  },
  {
    type: "STORE",
    id: "store:1",
    storeId: 1,
    storeName: "역삼 모닝커피",
    categoryName: "커피전문점",
    ctprvnCd: "11",
    ctprvnNm: "서울특별시",
    signguCd: "11680",
    signguNm: "강남구",
    adongCd: "11680640",
    adongNm: "역삼1동",
    latitude: 37.499,
    longitude: 127.032,
    addedAt: "2026-05-28T00:01:00.000Z",
  },
];

const store: StoreMapItem = {
  id: 1,
  storeName: "역삼 모닝커피",
  categoryLargeCode: "I2",
  categoryLargeName: "음식점",
  categoryMediumCode: "I212",
  categoryMediumName: "비알코올",
  categorySmallCode: "I21201",
  categorySmallName: "커피전문점",
  sido: "서울특별시",
  sigungu: "강남구",
  dong: "역삼1동",
  roadAddress: "서울특별시 강남구 테헤란로 128",
  latitude: 37.499,
  longitude: 127.032,
};
const storeRows: StoreListItem[] = Array.from({ length: 80 }).map((_, index) => ({
  ...store,
  id: index + 1,
  storeName: `역삼 모닝커피 ${index + 1}`,
}));
const storeColumns: ColumnDef<StoreListItem>[] = [
  { accessorKey: "storeName", header: "상호명" },
  { accessorKey: "categoryLargeName", header: "대분류" },
  { accessorKey: "categorySmallName", header: "소분류" },
  { accessorKey: "sido", header: "시도" },
  { accessorKey: "sigungu", header: "시군구" },
  { accessorKey: "dong", header: "동" },
  { accessorKey: "roadAddress", header: "주소" },
];

export const ExploreFilterBarStory: Story = {
  name: "ExploreFilterBar",
  render: () => <ExploreFilterBar query={query} resultLabel="검색 결과 24개" />,
};

export const ActiveFilterChipsStory: Story = {
  name: "ActiveFilterChips",
  render: () => (
    <ActiveFilterChips
      query={query}
      onClearKeyword={() => undefined}
      onClearRegion={() => undefined}
      onClearCategory={() => undefined}
      onClearAll={() => undefined}
    />
  ),
};

export const CandidateTrayStory: Story = {
  name: "CandidateTray",
  render: () => (
    <CandidateTray
      candidates={candidates}
      onRemove={() => undefined}
      onClear={() => undefined}
    />
  ),
};

export const CandidateRegionCardStory: Story = {
  name: "CandidateRegionCard",
  render: () => <CandidateRegionCard candidate={candidates[0]} selected />,
};

export const RecentSearchesStory: Story = {
  name: "RecentSearches",
  render: () => (
    <RecentSearches
      searches={[
        {
          label: "점포 목록: 커피",
          path: "/stores",
          query: "keyword=%EC%BB%A4%ED%94%BC&ctprvnCd=11",
          createdAt: "2026-05-28T00:00:00.000Z",
        },
      ]}
    />
  ),
};

export const MapStoreListStory: Story = {
  name: "MapStoreList",
  render: () => (
    <MapStoreList
      stores={[store]}
      selectedStoreId={1}
      isLoading={false}
      isError={false}
      onSelectStore={() => undefined}
      onAddCandidate={() => undefined}
      onRetry={() => undefined}
    />
  ),
};

export const StoreDetailDrawerStory: Story = {
  name: "StoreDetailDrawer",
  render: () => (
    <StoreDetailDrawer store={store} onAddCandidate={() => undefined} />
  ),
};

export const VirtualizedStoreListStory: Story = {
  name: "VirtualizedStoreList",
  render: () => <VirtualizedStoreListDemo />,
};

export const MarkerClusterToggleStory: Story = {
  name: "MarkerClusterToggle",
  render: () => (
    <div className="max-w-sm">
      <MarkerClusterToggle
        enabled
        markerCount={1280}
        onChange={() => undefined}
      />
    </div>
  ),
};

export const MapSearchOverlayStory: Story = {
  name: "MapSearchOverlay",
  render: () => (
    <div className="relative h-40 rounded-[8px] bg-slate-100">
      <MapSearchOverlay
        visible
        isLoading={false}
        onSearch={() => undefined}
      />
    </div>
  ),
};

export const PerformanceNoticeStory: Story = {
  name: "PerformanceNotice",
  render: () => (
    <PerformanceNotice message="표시 성능을 위해 최대 1,000개 점포만 지도에 표시합니다. 지도를 확대하거나 필터를 조정해보세요." />
  ),
};

export const DebouncedSearchInputStory: Story = {
  name: "DebouncedSearchInput",
  render: () => (
    <DebouncedSearchInput
      id="storybook-debounced-search"
      label="키워드로 점포 검색"
      value="커피"
      debounceLabel="입력 후 잠시 멈추면 검색 조건이 자동 반영됩니다."
      onChange={() => undefined}
    />
  ),
};

function VirtualizedStoreListDemo() {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: storeRows,
    columns: storeColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-[8px] border border-slate-200 bg-white">
      <VirtualizedStoreList
        table={table}
        columns={storeColumns}
        isLoading={false}
        isError={false}
        onRetry={() => undefined}
      />
    </div>
  );
}
