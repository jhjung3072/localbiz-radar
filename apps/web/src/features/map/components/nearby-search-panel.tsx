import { Crosshair, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  MapCenter,
  StoreMapItem,
  StoreNearbyItem,
} from "@/features/map/types";

type NearbySearchPanelProps = {
  center: MapCenter;
  radius: number;
  stores: StoreNearbyItem[];
  isLoading: boolean;
  isError: boolean;
  hasSearched: boolean;
  selectedStoreId?: number;
  onRetry: () => void;
  onSelectStore: (store: StoreMapItem | StoreNearbyItem) => void;
  onAddCandidate?: (store: StoreNearbyItem) => void;
};

export function NearbySearchPanel({
  center,
  radius,
  stores,
  isLoading,
  isError,
  hasSearched,
  selectedStoreId,
  onRetry,
  onSelectStore,
  onAddCandidate,
}: NearbySearchPanelProps) {
  return (
    <section
      aria-label="주변 점포"
      className="rounded-[8px] border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
            <Crosshair className="size-4 text-teal-700" aria-hidden="true" />
            주변 점포
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            중심 {center.lat.toFixed(5)}, {center.lng.toFixed(5)} · 반경{" "}
            {radius.toLocaleString("ko-KR")}m
          </p>
        </div>
        {stores.length > 0 ? (
          <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
            {stores.length.toLocaleString("ko-KR")}개
          </span>
        ) : null}
      </div>

      <div className="max-h-[320px] overflow-y-auto p-3">
        {isLoading ? <NearbyLoading /> : null}

        {isError ? (
          <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">
            <p className="font-semibold">주변 점포를 불러오지 못했습니다.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 border-rose-200 bg-white text-rose-800 hover:bg-rose-100"
              onClick={onRetry}
            >
              다시 시도
            </Button>
          </div>
        ) : null}

        {!hasSearched && !isLoading && !isError ? (
          <div className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-500">
            <LocateFixed className="mb-2 size-4 text-slate-400" aria-hidden="true" />
            지도 중심을 이동한 뒤 반경 검색을 실행하면 거리순 점포가 표시됩니다.
          </div>
        ) : null}

        {hasSearched && !isLoading && !isError && stores.length === 0 ? (
          <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
            조건에 맞는 점포가 없습니다.
          </div>
        ) : null}

        {stores.length > 0 && !isLoading && !isError ? (
          <ul className="space-y-2">
            {stores.map((store) => (
              <li key={store.id}>
                <div
                  className={
                    selectedStoreId === store.id
                      ? "rounded-md border border-amber-300 bg-amber-50 p-2"
                      : "rounded-md border border-slate-200 bg-white p-2"
                  }
                >
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 rounded-md px-1 py-1 text-left text-sm transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-amber-500/30"
                    onClick={() => onSelectStore(store)}
                  >
                    <span>
                      <span className="block font-semibold text-slate-950">
                        {store.storeName}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {store.categorySmallName} · {store.dong}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                      {formatDistance(store.distanceMeters)}
                    </span>
                  </button>
                  {onAddCandidate ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => onAddCandidate(store)}
                    >
                      후보에 추가
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function NearbyLoading() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-md border border-slate-100 bg-slate-50"
        />
      ))}
    </div>
  );
}

function formatDistance(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}km`;
  }

  return `${Math.round(value).toLocaleString("ko-KR")}m`;
}
