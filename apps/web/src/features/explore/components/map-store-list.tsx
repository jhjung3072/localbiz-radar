import { ListChecks, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoreMapItem } from "@/features/map/types";

type MapStoreListProps = {
  stores: StoreMapItem[];
  selectedStoreId?: number;
  isLoading: boolean;
  isError: boolean;
  onSelectStore: (store: StoreMapItem) => void;
  onAddCandidate?: (store: StoreMapItem) => void;
  onRetry: () => void;
};

export function MapStoreList({
  stores,
  selectedStoreId,
  isLoading,
  isError,
  onSelectStore,
  onAddCandidate,
  onRetry,
}: MapStoreListProps) {
  return (
    <section
      aria-label="지도 점포 목록"
      className="rounded-[8px] border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
          <ListChecks className="size-4 text-teal-700" aria-hidden="true" />
          지도 내 점포
        </h2>
        <span className="text-sm text-slate-500">
          {stores.length.toLocaleString("ko-KR")}개
        </span>
      </div>

      <div className="max-h-[320px] overflow-y-auto p-3">
        {isLoading ? <MapStoreListLoading /> : null}

        {isError ? (
          <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">
            <p className="font-semibold">점포 정보를 불러오지 못했습니다.</p>
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

        {!isLoading && !isError && stores.length === 0 ? (
          <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
            조건에 맞는 점포가 없습니다.
          </div>
        ) : null}

        {!isLoading && !isError && stores.length > 0 ? (
          <ul className="space-y-2">
            {stores.map((store) => {
              const selected = selectedStoreId === store.id;
              return (
                <li key={store.id}>
                  <div
                    className={
                      selected
                        ? "rounded-md border border-teal-300 bg-teal-50 p-2"
                        : "rounded-md border border-slate-200 bg-white p-2"
                    }
                  >
                    <button
                      type="button"
                      className="flex w-full items-start gap-3 rounded-md px-1 py-1 text-left transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-teal-500/30"
                      onClick={() => onSelectStore(store)}
                    >
                      <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                        <MapPin className="size-4" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-950">
                          {store.storeName}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {store.categorySmallName} · {store.sigungu} {store.dong}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {store.roadAddress ?? "도로명 주소 없음"}
                        </span>
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
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function MapStoreListLoading() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-md border border-slate-100 bg-slate-50"
        />
      ))}
    </div>
  );
}
