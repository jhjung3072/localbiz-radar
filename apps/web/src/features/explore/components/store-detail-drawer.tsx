import { Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CandidateStore } from "@/features/explore/types";

type StoreDetailDrawerProps<TStore extends {
  id: number;
  storeName: string;
  categorySmallName: string;
  sido: string;
  sigungu: string;
  dong: string;
  roadAddress: string | null;
  latitude: number;
  longitude: number;
}> = {
  store: TStore | null;
  distanceMeters?: number;
  onAddCandidate?: (store: TStore) => void;
};

export function StoreDetailDrawer<TStore extends {
  id: number;
  storeName: string;
  categorySmallName: string;
  sido: string;
  sigungu: string;
  dong: string;
  roadAddress: string | null;
  latitude: number;
  longitude: number;
}>({ store, distanceMeters, onAddCandidate }: StoreDetailDrawerProps<TStore>) {
  if (!store) {
    return (
      <aside
        aria-label="선택한 점포 상세"
        className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-base font-semibold text-slate-950">점포 상세</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          지도 marker 또는 점포 목록을 선택하면 상세 정보가 표시됩니다.
        </p>
      </aside>
    );
  }

  return (
    <aside
      aria-label="선택한 점포 상세"
      className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
          <Building2 className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {store.storeName}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{store.categorySmallName}</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="font-medium text-slate-500">지역</dt>
          <dd className="mt-1 text-slate-800">
            {store.sido} {store.sigungu} {store.dong}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">주소</dt>
          <dd className="mt-1 flex items-start gap-2 text-slate-800">
            <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span>{store.roadAddress ?? "도로명 주소 없음"}</span>
          </dd>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <dt className="font-medium text-slate-500">위도</dt>
            <dd className="mt-1 text-slate-800">{store.latitude.toFixed(6)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">경도</dt>
            <dd className="mt-1 text-slate-800">{store.longitude.toFixed(6)}</dd>
          </div>
        </div>
        {typeof distanceMeters === "number" ? (
          <div>
            <dt className="font-medium text-slate-500">지도 중심과의 거리</dt>
            <dd className="mt-1 text-slate-800">{formatDistance(distanceMeters)}</dd>
          </div>
        ) : null}
      </dl>

      {onAddCandidate ? (
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full"
          onClick={() => onAddCandidate(store)}
        >
          후보에 추가
        </Button>
      ) : null}
    </aside>
  );
}

export function storeToCandidateShape(store: {
  id: number;
  storeName: string;
  categorySmallName: string;
  sido: string;
  sigungu: string;
  dong: string;
  latitude?: number | null;
  longitude?: number | null;
}): Omit<CandidateStore, "id" | "addedAt" | "ctprvnCd" | "signguCd"> {
  return {
    type: "STORE",
    storeId: store.id,
    storeName: store.storeName,
    categoryName: store.categorySmallName,
    ctprvnNm: store.sido,
    signguNm: store.sigungu,
    adongNm: store.dong,
    latitude: store.latitude ?? undefined,
    longitude: store.longitude ?? undefined,
  };
}

function formatDistance(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}km`;
  }

  return `${Math.round(value).toLocaleString("ko-KR")}m`;
}
