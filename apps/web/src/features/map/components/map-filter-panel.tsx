import { Filter, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Region, StoreCategory } from "@/features/stores/types";

const selectClassName =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400";

const radiusOptions = [300, 500, 1000, 2000];

type MapFilterPanelProps = {
  sido: string;
  sigungu: string;
  dong: string;
  categoryLargeCode: string;
  categoryMediumCode: string;
  categorySmallCode: string;
  radius: number;
  regions: Region[];
  categories: StoreCategory[];
  isLoading: boolean;
  markerCount: number;
  isNearbyLoading: boolean;
  onSidoChange: (value: string) => void;
  onSigunguChange: (value: string) => void;
  onDongChange: (value: string) => void;
  onCategoryLargeChange: (value: string) => void;
  onCategoryMediumChange: (value: string) => void;
  onCategorySmallChange: (value: string) => void;
  onRadiusChange: (value: number) => void;
  onNearbySearch: () => void;
};

export function MapFilterPanel({
  sido,
  sigungu,
  dong,
  categoryLargeCode,
  categoryMediumCode,
  categorySmallCode,
  radius,
  regions,
  categories,
  isLoading,
  markerCount,
  isNearbyLoading,
  onSidoChange,
  onSigunguChange,
  onDongChange,
  onCategoryLargeChange,
  onCategoryMediumChange,
  onCategorySmallChange,
  onRadiusChange,
  onNearbySearch,
}: MapFilterPanelProps) {
  const selectedSido = regions.find((region) => region.sidoCode === sido);
  const sigunguOptions = selectedSido?.sigunguList ?? [];
  const selectedSigungu = sigunguOptions.find(
    (option) => option.sigunguCode === sigungu,
  );
  const dongOptions = selectedSigungu?.dongList ?? [];
  const selectedLargeCategory = categories.find(
    (category) => category.largeCode === categoryLargeCode,
  );
  const mediumCategoryOptions = selectedLargeCategory?.mediumCategories ?? [];
  const selectedMediumCategory = mediumCategoryOptions.find(
    (category) => category.mediumCode === categoryMediumCode,
  );
  const smallCategoryOptions = selectedMediumCategory?.smallCategories ?? [];

  return (
    <section
      aria-label="지도 필터"
      className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
          <Filter className="size-4 text-teal-700" aria-hidden="true" />
          지도 필터
        </h2>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
          marker {markerCount.toLocaleString("ko-KR")}개
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        <div>
          <label htmlFor="map-sido" className="mb-2 block text-sm font-medium text-slate-700">
            시도
          </label>
          <select
            id="map-sido"
            value={sido}
            onChange={(event) => onSidoChange(event.target.value)}
            disabled={isLoading}
            className={selectClassName}
          >
            <option value="all">전체 시도</option>
            {regions.map((option) => (
              <option key={option.sidoCode} value={option.sidoCode}>
                {option.sidoName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="map-sigungu" className="mb-2 block text-sm font-medium text-slate-700">
            시군구
          </label>
          <select
            id="map-sigungu"
            value={sigungu}
            onChange={(event) => onSigunguChange(event.target.value)}
            disabled={sido === "all" || isLoading}
            className={selectClassName}
          >
            <option value="all">전체 시군구</option>
            {sigunguOptions.map((option) => (
              <option key={option.sigunguCode} value={option.sigunguCode}>
                {option.sigunguName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="map-dong" className="mb-2 block text-sm font-medium text-slate-700">
            행정동
          </label>
          <select
            id="map-dong"
            value={dong}
            onChange={(event) => onDongChange(event.target.value)}
            disabled={sigungu === "all" || isLoading}
            className={selectClassName}
          >
            <option value="all">전체 동</option>
            {dongOptions.map((option) => (
              <option key={option.dongCode} value={option.dongCode}>
                {option.dongName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        <div>
          <label
            htmlFor="map-category-large"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            대분류
          </label>
          <select
            id="map-category-large"
            value={categoryLargeCode}
            onChange={(event) => onCategoryLargeChange(event.target.value)}
            disabled={isLoading}
            className={selectClassName}
          >
            <option value="all">전체 업종</option>
            {categories.map((option) => (
              <option key={option.largeCode} value={option.largeCode}>
                {option.largeName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="map-category-medium"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            중분류
          </label>
          <select
            id="map-category-medium"
            value={categoryMediumCode}
            onChange={(event) => onCategoryMediumChange(event.target.value)}
            disabled={categoryLargeCode === "all" || isLoading}
            className={selectClassName}
          >
            <option value="all">전체 중분류</option>
            {mediumCategoryOptions.map((option) => (
              <option key={option.mediumCode} value={option.mediumCode}>
                {option.mediumName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="map-category-small"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            소분류
          </label>
          <select
            id="map-category-small"
            value={categorySmallCode}
            onChange={(event) => onCategorySmallChange(event.target.value)}
            disabled={categoryMediumCode === "all" || isLoading}
            className={selectClassName}
          >
            <option value="all">전체 소분류</option>
            {smallCategoryOptions.map((option) => (
              <option key={option.smallCode} value={option.smallCode}>
                {option.smallName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <span className="block text-sm font-medium text-slate-700">반경 선택</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {radiusOptions.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={radius === option}
              className={
                radius === option
                  ? "h-9 rounded-md bg-slate-950 text-sm font-semibold text-white"
                  : "h-9 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              }
              onClick={() => onRadiusChange(option)}
            >
              {option.toLocaleString("ko-KR")}m
            </button>
          ))}
        </div>
        <Button
          type="button"
          className="mt-3 w-full bg-teal-700 text-white hover:bg-teal-800"
          onClick={onNearbySearch}
          disabled={isNearbyLoading}
        >
          <LocateFixed className="size-4" aria-hidden="true" />
          반경 검색
        </Button>
      </div>
    </section>
  );
}
