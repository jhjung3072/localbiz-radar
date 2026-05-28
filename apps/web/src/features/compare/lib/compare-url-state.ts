import type { CompareSelection } from "@/features/compare/types";

export const DEFAULT_COMPARE_SELECTION: CompareSelection = {
  baseSido: "11",
  baseSigungu: "11680",
  baseDong: "all",
  targetSido: "11",
  targetSigungu: "11440",
  targetDong: "all",
  large: "all",
  medium: "all",
  small: "all",
};

export function selectionFromSearchParams(params: URLSearchParams): CompareSelection {
  return {
    baseSido:
      params.get("baseCtprvnCd") ??
      params.get("baseSido") ??
      DEFAULT_COMPARE_SELECTION.baseSido,
    baseSigungu:
      params.get("baseSignguCd") ??
      params.get("baseSigungu") ??
      DEFAULT_COMPARE_SELECTION.baseSigungu,
    baseDong:
      params.get("baseAdongCd") ??
      params.get("baseDong") ??
      DEFAULT_COMPARE_SELECTION.baseDong,
    targetSido:
      params.get("targetCtprvnCd") ??
      params.get("targetSido") ??
      DEFAULT_COMPARE_SELECTION.targetSido,
    targetSigungu:
      params.get("targetSignguCd") ??
      params.get("targetSigungu") ??
      DEFAULT_COMPARE_SELECTION.targetSigungu,
    targetDong:
      params.get("targetAdongCd") ??
      params.get("targetDong") ??
      DEFAULT_COMPARE_SELECTION.targetDong,
    large:
      params.get("indsLclsCd") ??
      params.get("large") ??
      DEFAULT_COMPARE_SELECTION.large,
    medium:
      params.get("indsMclsCd") ??
      params.get("medium") ??
      DEFAULT_COMPARE_SELECTION.medium,
    small:
      params.get("indsSclsCd") ??
      params.get("small") ??
      DEFAULT_COMPARE_SELECTION.small,
  };
}

export function selectionToSearchParams(selection: CompareSelection) {
  const params = new URLSearchParams();

  Object.entries(selection).forEach(([key, value]) => {
    if (value && value !== "all") {
      params.set(key, value);
    }
  });

  return params;
}
