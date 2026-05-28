import type { Meta, StoryObj } from "@storybook/nextjs";
import { ActiveFilterChips } from "@/features/explore/components/active-filter-chips";
import { CandidateRegionCard } from "@/features/explore/components/candidate-region-card";
import { CandidateTray } from "@/features/explore/components/candidate-tray";
import { ExploreFilterBar } from "@/features/explore/components/explore-filter-bar";
import { MapStoreList } from "@/features/explore/components/map-store-list";
import { RecentSearches } from "@/features/explore/components/recent-searches";
import { StoreDetailDrawer } from "@/features/explore/components/store-detail-drawer";
import type { CandidateItem, ExploreQueryState } from "@/features/explore/types";
import type { StoreMapItem } from "@/features/map/types";

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
