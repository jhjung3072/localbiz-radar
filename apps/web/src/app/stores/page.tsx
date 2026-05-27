import { StoreTable } from "@/features/stores/store-table";

export default function StoresPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-teal-700">상가 목록 목업</p>
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
            상가 목록
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            공공 상가업소 데이터 연동 전, 테이블 구조와 검색 경험을 확인하기
            위한 목업 목록입니다.
          </p>
        </div>
      </section>
      <StoreTable />
    </div>
  );
}
