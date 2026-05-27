import { StoreTable } from "@/features/stores/store-table";

export default function StoresPage() {
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
      <StoreTable />
    </div>
  );
}
