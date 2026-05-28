import type { Meta, StoryObj } from "@storybook/nextjs";
import { ComparisonSummaryCards } from "@/features/compare/components/comparison-summary-cards";
import { WinnerInsightCard } from "@/features/compare/components/winner-insight-card";
import type { CompareAreaResult, CompareRegionsResult } from "@/features/compare/types";

const base: CompareAreaResult = {
  regionLabel: "서울특별시 강남구 역삼1동",
  totalStores: 1280,
  categoryStoreCount: 218,
  categoryShare: 17,
  totalCategories: 74,
  topCategoryName: "커피전문점",
  competitionIndex: 17,
  categoryDiversityScore: 72,
  densityScore: 88,
  localBizScore: 81.4,
  topCategories: [
    { categoryCode: "I21201", categoryName: "커피전문점", storeCount: 86, ratio: 6.7 },
  ],
};

const target: CompareAreaResult = {
  regionLabel: "서울특별시 마포구 서교동",
  totalStores: 1040,
  categoryStoreCount: 185,
  categoryShare: 17.8,
  totalCategories: 82,
  topCategoryName: "서양식",
  competitionIndex: 17.8,
  categoryDiversityScore: 78,
  densityScore: 83,
  localBizScore: 82.1,
  topCategories: [
    { categoryCode: "I20401", categoryName: "서양식", storeCount: 74, ratio: 7.1 },
  ],
};

const result: CompareRegionsResult = {
  base,
  target,
  winner: {
    regionLabel: target.regionLabel,
    scoreGap: 0.7,
    reason: "업종 다양성과 점포 밀도 점수가 균형 있게 나타납니다.",
  },
  metricComparisons: [],
};

const meta = {
  title: "Compare/Result",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const WinnerInsight: Story = {
  render: () => <WinnerInsightCard result={result} />,
};

export const SummaryCards: Story = {
  render: () => <ComparisonSummaryCards base={base} target={target} />,
};
