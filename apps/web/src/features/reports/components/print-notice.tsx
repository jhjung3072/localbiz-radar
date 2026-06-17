export function PrintNotice() {
  return (
    <section className="rounded-[8px] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      <h2 className="font-semibold text-amber-950">리포트 활용 안내</h2>
      <p className="mt-2">
        브라우저 인쇄 기능에서 PDF로 저장할 수 있습니다. 현재 점수는 점포 데이터
        기반의 개발용 지표이며, 실제 유동인구와 추정매출은 향후 공공 데이터
        연동 단계에서 추가됩니다.
      </p>
    </section>
  );
}
