import { ImageResponse } from "next/og";
import { searchParamsFromRecord } from "@/features/reports/api/report-query-params";
import { getCompareReport } from "@/features/reports/server/get-compare-report";

export const runtime = "edge";
export const alt = "LocalBiz Radar 상권 비교 리포트";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type OpenGraphImageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Image({ searchParams }: OpenGraphImageProps) {
  const params = searchParamsFromRecord(await searchParams);
  const report = await getCompareReport(params).catch(() => null);

  const title = report?.reportTitle ?? "상권 비교 리포트";
  const baseLabel = report?.base.regionLabel ?? "기준 지역";
  const targetLabel = report?.target.regionLabel ?? "비교 지역";
  const winnerLabel = report?.winner.regionLabel ?? "추천 지역";
  const scoreSummary = report
    ? `${report.base.localBizScore.toFixed(1)} vs ${report.target.localBizScore.toFixed(1)}`
    : "LocalBiz Radar";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f8fafc",
        color: "#0f172a",
        padding: 64,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#0f766e" }}>
          LocalBiz Radar
        </div>
        <div style={{ fontSize: 24, color: "#475569" }}>상권 비교 리포트</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.15 }}>
          {title}
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 44,
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              flex: 1,
              padding: 28,
              background: "white",
              borderRadius: 16,
            }}
          >
            {baseLabel}
          </div>
          <div
            style={{
              flex: 1,
              padding: 28,
              background: "white",
              borderRadius: 16,
            }}
          >
            {targetLabel}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 28,
        }}
      >
        <div style={{ display: "flex" }}>{`추천 지역: ${winnerLabel}`}</div>
        <div style={{ color: "#0f766e", fontWeight: 800 }}>{scoreSummary}</div>
      </div>
    </div>,
    size,
  );
}
