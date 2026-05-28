import type { MasterCategory } from "@/features/master/types";

const selectClassName =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400";

type CategorySelectGroupProps = {
  large: string;
  medium: string;
  small: string;
  categories: MasterCategory[];
  disabled?: boolean;
  onLargeChange: (value: string) => void;
  onMediumChange: (value: string) => void;
  onSmallChange: (value: string) => void;
};

export function CategorySelectGroup({
  large,
  medium,
  small,
  categories,
  disabled = false,
  onLargeChange,
  onMediumChange,
  onSmallChange,
}: CategorySelectGroupProps) {
  const selectedLarge = categories.find((category) => category.indsLclsCd === large);
  const mediumOptions = selectedLarge?.mediumCategories ?? [];
  const selectedMedium = mediumOptions.find(
    (category) => category.indsMclsCd === medium,
  );
  const smallOptions = selectedMedium?.smallCategories ?? [];

  return (
    <fieldset className="grid gap-3 rounded-md border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-950">관심 업종</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        <label htmlFor="compare-large" className="block text-sm font-medium text-slate-700">
          대분류
          <select
            id="compare-large"
            value={large}
            onChange={(event) => onLargeChange(event.target.value)}
            disabled={disabled}
            className={`${selectClassName} mt-2`}
          >
            <option value="all">전체 업종</option>
            {categories.map((category) => (
              <option key={category.indsLclsCd} value={category.indsLclsCd}>
                {category.indsLclsNm}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="compare-medium" className="block text-sm font-medium text-slate-700">
          중분류
          <select
            id="compare-medium"
            value={medium}
            onChange={(event) => onMediumChange(event.target.value)}
            disabled={disabled || large === "all"}
            className={`${selectClassName} mt-2`}
          >
            <option value="all">전체 중분류</option>
            {mediumOptions.map((category) => (
              <option key={category.indsMclsCd} value={category.indsMclsCd}>
                {category.indsMclsNm}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="compare-small" className="block text-sm font-medium text-slate-700">
          소분류
          <select
            id="compare-small"
            value={small}
            onChange={(event) => onSmallChange(event.target.value)}
            disabled={disabled || medium === "all"}
            className={`${selectClassName} mt-2`}
          >
            <option value="all">전체 소분류</option>
            {smallOptions.map((category) => (
              <option key={category.indsSclsCd} value={category.indsSclsCd}>
                {category.indsSclsNm}
              </option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}
