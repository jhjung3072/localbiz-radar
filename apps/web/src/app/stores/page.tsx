import { Suspense } from "react";
import { StoreTable } from "@/features/stores/store-table";
import { getStoresBootstrap } from "@/features/explore/server/get-stores-bootstrap";

type StoresPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const params = await searchParams;
  const initialData = await getStoresBootstrap(toUrlSearchParams(params)).catch(
    () => null,
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-teal-700">상가 목록 목업</p>
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
            점포 목록
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Spring Boot API의 개발용 seed data를 조회해 지역과 업종 기준으로
            점포를 탐색합니다.
          </p>
        </div>
      </section>
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-[8px] border border-slate-200 bg-slate-100" />
        }
      >
        <StoreTable initialData={initialData} />
      </Suspense>
    </div>
  );
}

function toUrlSearchParams(
  params?: Record<string, string | string[] | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item));
      return;
    }
    if (value !== undefined) {
      searchParams.set(key, value);
    }
  });

  return searchParams;
}
