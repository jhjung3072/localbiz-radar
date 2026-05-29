import type { MasterCategory, MasterRegion } from "@/features/master/types";
import type { Region, StoreCategory } from "@/features/stores/types";

export function masterRegionsToLegacyRegions(regions: MasterRegion[]): Region[] {
  return regions.map((region) => ({
    sidoCode: region.ctprvnCd,
    sidoName: region.ctprvnNm,
    sigunguList: region.sigunguList.map((sigungu) => ({
      sigunguCode: sigungu.signguCd,
      sigunguName: sigungu.signguNm,
      dongList: sigungu.adminDongList.map((dong) => ({
        dongCode: dong.code,
        dongName: dong.name,
      })),
    })),
  }));
}

export function masterCategoriesToLegacyCategories(
  categories: MasterCategory[],
): StoreCategory[] {
  return categories.map((category) => ({
    largeCode: category.indsLclsCd,
    largeName: category.indsLclsNm,
    mediumCategories: category.mediumCategories.map((mediumCategory) => ({
      mediumCode: mediumCategory.indsMclsCd,
      mediumName: mediumCategory.indsMclsNm,
      smallCategories: mediumCategory.smallCategories.map((smallCategory) => ({
        smallCode: smallCategory.indsSclsCd,
        smallName: smallCategory.indsSclsNm,
      })),
    })),
  }));
}

export function findRegionLabel(
  regions: Region[],
  params: {
    ctprvnCd?: string;
    ctprvnNm?: string;
    signguCd?: string;
    signguNm?: string;
    adongCd?: string;
    adongNm?: string;
  },
) {
  const sido = regions.find((region) => region.sidoCode === params.ctprvnCd);
  const sigungu = sido?.sigunguList.find(
    (item) => item.sigunguCode === params.signguCd,
  );
  const dong = sigungu?.dongList.find((item) => item.dongCode === params.adongCd);

  return [
    sido?.sidoName ?? params.ctprvnNm,
    sigungu?.sigunguName ?? params.signguNm,
    dong?.dongName ?? params.adongNm,
  ]
    .filter(Boolean)
    .join(" ");
}

export function findCategoryLabel(
  categories: StoreCategory[],
  params: {
    indsLclsCd?: string;
    indsLclsNm?: string;
    indsMclsCd?: string;
    indsMclsNm?: string;
    indsSclsCd?: string;
    indsSclsNm?: string;
  },
) {
  const large = categories.find((category) => category.largeCode === params.indsLclsCd);
  const medium = large?.mediumCategories.find(
    (category) => category.mediumCode === params.indsMclsCd,
  );
  const small = medium?.smallCategories.find(
    (category) => category.smallCode === params.indsSclsCd,
  );

  return [
    large?.largeName ?? params.indsLclsNm,
    medium?.mediumName ?? params.indsMclsNm,
    small?.smallName ?? params.indsSclsNm,
  ]
    .filter(Boolean)
    .join(" > ");
}
