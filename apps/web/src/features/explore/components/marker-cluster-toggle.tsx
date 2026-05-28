type MarkerClusterToggleProps = {
  enabled: boolean;
  markerCount: number;
  onChange: (enabled: boolean) => void;
};

export function MarkerClusterToggle({
  enabled,
  markerCount,
  onChange,
}: MarkerClusterToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
      <span>
        <span className="block font-semibold text-slate-800">마커 묶기</span>
        <span className="block text-xs text-slate-500">
          {markerCount.toLocaleString("ko-KR")}개 marker를 클러스터링합니다.
        </span>
      </span>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-teal-700"
        aria-label="마커 클러스터링 사용"
      />
    </label>
  );
}
