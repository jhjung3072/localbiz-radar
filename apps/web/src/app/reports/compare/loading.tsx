export default function CompareReportLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-5" aria-label="리포트 로딩 중">
      <div className="h-32 animate-pulse rounded-[8px] bg-slate-100" />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-[8px] bg-slate-100" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-[8px] bg-slate-100" />
    </div>
  );
}
