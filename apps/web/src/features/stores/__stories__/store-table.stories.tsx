import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoreTable } from "@/features/stores/store-table";
import { storeQueryKeys } from "@/features/stores/api/store-query-keys";
import type { StoreListItem, StoreSearchParams } from "@/features/stores/types";

const initialParams: StoreSearchParams = {
  keyword: "",
  sido: "all",
  sigungu: "all",
  dong: "all",
  categoryLargeCode: "all",
  categoryMediumCode: "all",
  categorySmallCode: "all",
  page: 0,
  size: 10,
};

const stores: StoreListItem[] = [
  {
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
  },
];

function StoreTableStoryProvider({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        retry: false,
      },
    },
  });

  queryClient.setQueryData(storeQueryKeys.regions(), [
    {
      sidoCode: "11",
      sidoName: "서울특별시",
      sigunguList: [
        {
          sigunguCode: "11680",
          sigunguName: "강남구",
          dongList: [{ dongCode: "11680640", dongName: "역삼1동" }],
        },
      ],
    },
  ]);
  queryClient.setQueryData(storeQueryKeys.categories(), [
    {
      largeCode: "I2",
      largeName: "음식점",
      mediumCategories: [
        {
          mediumCode: "I212",
          mediumName: "비알코올",
          smallCategories: [{ smallCode: "I21201", smallName: "커피전문점" }],
        },
      ],
    },
  ]);
  queryClient.setQueryData(storeQueryKeys.list(initialParams), {
    content: stores,
    page: 0,
    size: 10,
    totalElements: stores.length,
    totalPages: 1,
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const meta = {
  title: "Stores/StoreTable",
  component: StoreTable,
  decorators: [
    (Story) => (
      <StoreTableStoryProvider>
        <Story />
      </StoreTableStoryProvider>
    ),
  ],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof StoreTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithData: Story = {};
