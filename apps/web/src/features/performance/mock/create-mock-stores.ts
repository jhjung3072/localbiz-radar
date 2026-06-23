import type { MockStore } from "@/features/performance/types";

const regions = [
  {
    sidoCode: "11",
    sidoName: "서울특별시",
    sigunguCode: "11680",
    sigunguName: "강남구",
    dongCode: "11680640",
    dongName: "역삼1동",
    lat: 37.5004,
    lng: 127.0365,
  },
  {
    sidoCode: "11",
    sidoName: "서울특별시",
    sigunguCode: "11440",
    sigunguName: "마포구",
    dongCode: "11440660",
    dongName: "서교동",
    lat: 37.5551,
    lng: 126.9228,
  },
  {
    sidoCode: "11",
    sidoName: "서울특별시",
    sigunguCode: "11200",
    sigunguName: "성동구",
    dongCode: "11200690",
    dongName: "성수2가3동",
    lat: 37.5444,
    lng: 127.0565,
  },
  {
    sidoCode: "11",
    sidoName: "서울특별시",
    sigunguCode: "11110",
    sigunguName: "종로구",
    dongCode: "11110615",
    dongName: "종로1.2.3.4가동",
    lat: 37.5704,
    lng: 126.9911,
  },
  {
    sidoCode: "11",
    sidoName: "서울특별시",
    sigunguCode: "11170",
    sigunguName: "용산구",
    dongCode: "11170650",
    dongName: "한강로동",
    lat: 37.5297,
    lng: 126.9647,
  },
];

const categories = [
  {
    categoryLargeCode: "I2",
    categoryLargeName: "음식점",
    categoryMediumCode: "I212",
    categoryMediumName: "비알코올",
    categorySmallCode: "I21201",
    categorySmallName: "커피전문점",
    suffix: "커피",
  },
  {
    categoryLargeCode: "I2",
    categoryLargeName: "음식점",
    categoryMediumCode: "I204",
    categoryMediumName: "서양식",
    categorySmallCode: "I20401",
    categorySmallName: "파스타",
    suffix: "키친",
  },
  {
    categoryLargeCode: "G2",
    categoryLargeName: "소매",
    categoryMediumCode: "G211",
    categoryMediumName: "종합소매",
    categorySmallCode: "G21101",
    categorySmallName: "편의점",
    suffix: "마켓",
  },
  {
    categoryLargeCode: "S2",
    categoryLargeName: "수리·개인",
    categoryMediumCode: "S207",
    categoryMediumName: "미용",
    categorySmallCode: "S20701",
    categorySmallName: "헤어샵",
    suffix: "살롱",
  },
];

const namePrefixes = [
  "모닝",
  "브릿지",
  "오피스",
  "그린",
  "스퀘어",
  "시티",
  "라이트",
  "포인트",
];

export function createMockStores(count: number, seed = 20260617): MockStore[] {
  const random = createSeededRandom(seed);

  return Array.from({ length: count }, (_, index) => {
    const region = regions[index % regions.length];
    const category = categories[index % categories.length];
    const latOffset = (random() - 0.5) * 0.018;
    const lngOffset = (random() - 0.5) * 0.018;
    const block = Math.floor(index / regions.length) + 1;
    const prefix = namePrefixes[index % namePrefixes.length];

    return {
      id: index + 1,
      storeName: `${region.sigunguName} ${prefix}${category.suffix} ${String(index + 1).padStart(4, "0")}`,
      ...category,
      sidoCode: region.sidoCode,
      sidoName: region.sidoName,
      sigunguCode: region.sigunguCode,
      sigunguName: region.sigunguName,
      dongCode: region.dongCode,
      dongName: region.dongName,
      roadAddress: `${region.sidoName} ${region.sigunguName} 성능로 ${block}`,
      latitude: roundCoordinate(region.lat + latOffset),
      longitude: roundCoordinate(region.lng + lngOffset),
    };
  });
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function roundCoordinate(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}
