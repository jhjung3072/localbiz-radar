import type { Meta, StoryObj } from "@storybook/nextjs";
import { CompareReportActions } from "@/features/reports/components/compare-report-actions";
import { CompareReportHeader } from "@/features/reports/components/compare-report-header";
import { CompareReportMetrics } from "@/features/reports/components/compare-report-metrics";
import { CompareReportSummary } from "@/features/reports/components/compare-report-summary";
import { CompareReportView } from "@/features/reports/components/compare-report-view";
import { PrintNotice } from "@/features/reports/components/print-notice";
import type { CompareReportData } from "@/features/reports/types";

const report: CompareReportData = {
  reportTitle: "강남구 vs 마포구 음식점 상권 비교 리포트",
  reportDescription:
    "음식점 기준으로 점포 수, 경쟁 강도, 업종 다양성, LocalBiz 점수를 비교한 리포트입니다.",
  comparePayload: {
    base: {
      ctprvnCd: "11",
      ctprvnNm: "서울특별시",
      signguCd: "11680",
      signguNm: "강남구",
    },
    target: {
      ctprvnCd: "11",
      ctprvnNm: "서울특별시",
      signguCd: "11440",
      signguNm: "마포구",
    },
    category: {
      indsLclsCd: "I2",
      indsLclsNm: "음식점",
    },
  },
  base: {
    regionLabel: "서울특별시 강남구",
    totalStores: 120,
    categoryStoreCount: 22,
    categoryShare: 18.3,
    totalCategories: 30,
    topCategoryName: "커피전문점",
    competitionIndex: 18.3,
    categoryDiversityScore: 76,
    densityScore: 84,
    localBizScore: 81,
    topCategories: [],
  },
  target: {
    regionLabel: "서울특별시 마포구",
    totalStores: 104,
    categoryStoreCount: 19,
    categoryShare: 18.2,
    totalCategories: 34,
    topCategoryName: "서양식",
    competitionIndex: 18.2,
    categoryDiversityScore: 82,
    densityScore: 78,
    localBizScore: 82,
    topCategories: [],
  },
  winner: {
    regionLabel: "서울특별시 마포구",
    scoreGap: 1,
    reason: "업종 다양성이 더 높아 후보 지역으로 더 적합합니다.",
  },
  metricComparisons: [
    {
      metricKey: "localBizScore",
      metricName: "LocalBiz 점수",
      baseValue: 81,
      targetValue: 82,
      winner: "TARGET",
    },
    {
      metricKey: "categoryDiversityScore",
      metricName: "업종 다양성",
      baseValue: 76,
      targetValue: 82,
      winner: "TARGET",
    },
  ],
  regionRanking: [
    {
      rank: 1,
      ctprvnCd: "11",
      ctprvnNm: "서울특별시",
      signguCd: "11440",
      signguNm: "마포구",
      adongCd: null,
      adongNm: null,
      regionLabel: "서울특별시 마포구",
      totalStores: 104,
      categoryStoreCount: 19,
      competitionIndex: 18.2,
      categoryDiversityScore: 82,
      densityScore: 78,
      localBizScore: 82,
    },
  ],
  categoryLabel: "음식점",
  generatedAt: "2026-05-29T10:00:00.000Z",
  sourceNotice:
    "현재 리포트는 공공 상가정보 및 stores 데이터 기반의 개발용 분석 지표를 사용합니다.",
  compareUrl: "/compare?baseCtprvnCd=11&baseSignguCd=11680&targetCtprvnCd=11&targetSignguCd=11440",
  reportUrl:
    "/reports/compare?baseCtprvnCd=11&baseSignguCd=11680&targetCtprvnCd=11&targetSignguCd=11440&indsLclsCd=I2",
};

const meta = {
  title: "Reports/Compare",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const FullReport: Story = {
  render: () => <CompareReportView report={report} />,
};

export const Header: Story = {
  render: () => <CompareReportHeader report={report} />,
};

export const Summary: Story = {
  render: () => <CompareReportSummary report={report} />,
};

export const Metrics: Story = {
  render: () => (
    <CompareReportMetrics
      base={report.base}
      target={report.target}
      metricComparisons={report.metricComparisons}
    />
  ),
};

export const Actions: Story = {
  render: () => <CompareReportActions report={report} />,
};

export const PrintGuide: Story = {
  render: () => <PrintNotice />,
};
