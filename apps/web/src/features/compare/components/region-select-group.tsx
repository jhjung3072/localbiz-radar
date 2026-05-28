import type { MasterRegion } from "@/features/master/types";

const selectClassName =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400";

type RegionSelectGroupProps = {
  title: string;
  prefix: string;
  sido: string;
  sigungu: string;
  dong: string;
  regions: MasterRegion[];
  disabled?: boolean;
  onSidoChange: (value: string) => void;
  onSigunguChange: (value: string) => void;
  onDongChange: (value: string) => void;
};

export function RegionSelectGroup({
  title,
  prefix,
  sido,
  sigungu,
  dong,
  regions,
  disabled = false,
  onSidoChange,
  onSigunguChange,
  onDongChange,
}: RegionSelectGroupProps) {
  const selectedSido = regions.find((region) => region.ctprvnCd === sido);
  const sigunguOptions = selectedSido?.sigunguList ?? [];
  const selectedSigungu = sigunguOptions.find(
    (option) => option.signguCd === sigungu,
  );
  const dongOptions = selectedSigungu?.adminDongList ?? [];

  return (
    <fieldset className="grid gap-3 rounded-md border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-950">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        <label htmlFor={`${prefix}-sido`} className="block text-sm font-medium text-slate-700">
          시도
          <select
            id={`${prefix}-sido`}
            value={sido}
            onChange={(event) => onSidoChange(event.target.value)}
            disabled={disabled}
            className={`${selectClassName} mt-2`}
          >
            <option value="all">시도 선택</option>
            {regions.map((region) => (
              <option key={region.ctprvnCd} value={region.ctprvnCd}>
                {region.ctprvnNm}
              </option>
            ))}
          </select>
        </label>
        <label
          htmlFor={`${prefix}-sigungu`}
          className="block text-sm font-medium text-slate-700"
        >
          시군구
          <select
            id={`${prefix}-sigungu`}
            value={sigungu}
            onChange={(event) => onSigunguChange(event.target.value)}
            disabled={disabled || sido === "all"}
            className={`${selectClassName} mt-2`}
          >
            <option value="all">시군구 선택</option>
            {sigunguOptions.map((option) => (
              <option key={option.signguCd} value={option.signguCd}>
                {option.signguNm}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`${prefix}-dong`} className="block text-sm font-medium text-slate-700">
          행정동
          <select
            id={`${prefix}-dong`}
            value={dong}
            onChange={(event) => onDongChange(event.target.value)}
            disabled={disabled || sigungu === "all"}
            className={`${selectClassName} mt-2`}
          >
            <option value="all">전체 행정동</option>
            {dongOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}
