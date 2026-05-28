"use client";

import { RotateCcw, Shuffle, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategorySelectGroup } from "@/features/compare/components/category-select-group";
import { RegionSelectGroup } from "@/features/compare/components/region-select-group";
import type { CompareSelection } from "@/features/compare/types";
import type { MasterCategory, MasterRegion } from "@/features/master/types";

type CompareConditionFormProps = {
  selection: CompareSelection;
  regions: MasterRegion[];
  categories: MasterCategory[];
  isLoading: boolean;
  isComparing: boolean;
  onChange: (selection: CompareSelection) => void;
  onSubmit: () => void;
  onSwap: () => void;
  onReset: () => void;
};

export function CompareConditionForm({
  selection,
  regions,
  categories,
  isLoading,
  isComparing,
  onChange,
  onSubmit,
  onSwap,
  onReset,
}: CompareConditionFormProps) {
  return (
    <section
      aria-label="비교 조건"
      className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
            <SlidersHorizontal className="size-5 text-teal-700" aria-hidden="true" />
            비교 조건
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            마스터 데이터의 코드 체계를 사용해 기준 지역과 비교 지역을 선택합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onSwap}>
            <Shuffle className="size-4" aria-hidden="true" />
            지역 바꾸기
          </Button>
          <Button type="button" variant="outline" onClick={onReset}>
            <RotateCcw className="size-4" aria-hidden="true" />
            조건 초기화
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <RegionSelectGroup
          title="기준 지역"
          prefix="base"
          sido={selection.baseSido}
          sigungu={selection.baseSigungu}
          dong={selection.baseDong}
          regions={regions}
          disabled={isLoading}
          onSidoChange={(value) =>
            onChange({ ...selection, baseSido: value, baseSigungu: "all", baseDong: "all" })
          }
          onSigunguChange={(value) =>
            onChange({ ...selection, baseSigungu: value, baseDong: "all" })
          }
          onDongChange={(value) => onChange({ ...selection, baseDong: value })}
        />
        <RegionSelectGroup
          title="비교 지역"
          prefix="target"
          sido={selection.targetSido}
          sigungu={selection.targetSigungu}
          dong={selection.targetDong}
          regions={regions}
          disabled={isLoading}
          onSidoChange={(value) =>
            onChange({
              ...selection,
              targetSido: value,
              targetSigungu: "all",
              targetDong: "all",
            })
          }
          onSigunguChange={(value) =>
            onChange({ ...selection, targetSigungu: value, targetDong: "all" })
          }
          onDongChange={(value) => onChange({ ...selection, targetDong: value })}
        />
        <CategorySelectGroup
          large={selection.large}
          medium={selection.medium}
          small={selection.small}
          categories={categories}
          disabled={isLoading}
          onLargeChange={(value) =>
            onChange({ ...selection, large: value, medium: "all", small: "all" })
          }
          onMediumChange={(value) =>
            onChange({ ...selection, medium: value, small: "all" })
          }
          onSmallChange={(value) => onChange({ ...selection, small: value })}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-500">
          현재 점수는 점포 데이터 기반의 개발용 지표입니다.
        </p>
        <Button type="button" onClick={onSubmit} disabled={isLoading || isComparing}>
          비교하기
        </Button>
      </div>
    </section>
  );
}
