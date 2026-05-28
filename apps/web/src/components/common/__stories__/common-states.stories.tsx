import type { Meta, StoryObj } from "@storybook/nextjs";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";

const meta = {
  title: "Common/States",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const PageHeaderDefault: Story = {
  render: () => (
    <PageHeader
      eyebrow="상권 분석"
      title="프론트엔드 품질 점검"
      description="페이지 제목, 설명, 액션 영역이 일관되게 보이도록 사용하는 공통 헤더입니다."
    />
  ),
};

export const MetricCardDefault: Story = {
  render: () => (
    <MetricCard
      title="LocalBiz 점수"
      value="76.4"
      description="점포 데이터 기반 개발용 지표입니다."
      icon={<BarChart3 className="size-5" />}
      accent="teal"
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <LoadingState
      title="점포 데이터를 불러오는 중입니다"
      description="API 응답을 기다리는 동안 화면 전환 없이 상태를 안내합니다."
    />
  ),
};

export const Error: Story = {
  render: () => (
    <ErrorState
      title="데이터를 불러오지 못했습니다"
      description="API 서버 상태와 네트워크 설정을 확인한 뒤 다시 시도해 주세요."
      onRetry={() => undefined}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <EmptyState
      title="조건에 맞는 점포가 없습니다"
      description="검색어 또는 필터 조건을 변경해 주세요."
    />
  ),
};

export const SectionCardDefault: Story = {
  render: () => (
    <SectionCard
      title="품질 기준"
      description="반복되는 섹션 카드의 제목, 설명, 본문 구조를 확인합니다."
    >
      <p className="text-sm leading-6 text-slate-600">
        Storybook에서는 실제 API 호출 없이 presentation component를 검토합니다.
      </p>
    </SectionCard>
  ),
};
