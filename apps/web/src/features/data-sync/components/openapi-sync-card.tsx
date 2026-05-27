"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { CloudDownload, KeyRound, Loader2, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  StoreOpenApiStatus,
  StoreOpenApiSyncPayload,
} from "@/features/data-sync/types";

type OpenApiSyncCardProps = {
  status?: StoreOpenApiStatus;
  isStatusLoading: boolean;
  isRunning: boolean;
  isUpdatingSchedule: boolean;
  onDryRun: (payload: StoreOpenApiSyncPayload) => void;
  onSync: (payload: StoreOpenApiSyncPayload) => void;
  onRefreshStatus: () => void;
  onToggleSchedule: (enabled: boolean) => void;
};

const inputClassName =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20";

export function OpenApiSyncCard({
  status,
  isStatusLoading,
  isRunning,
  isUpdatingSchedule,
  onDryRun,
  onSync,
  onRefreshStatus,
  onToggleSchedule,
}: OpenApiSyncCardProps) {
  const [operation, setOperation] =
    useState<StoreOpenApiSyncPayload["operation"]>("DONG");
  const [sidoName, setSidoName] = useState("서울특별시");
  const [sigunguName, setSigunguName] = useState("강남구");
  const [dongName, setDongName] = useState("");
  const [divId, setDivId] =
    useState<NonNullable<StoreOpenApiSyncPayload["divId"]>>("signguCd");
  const [key, setKey] = useState("11680");
  const [radius, setRadius] = useState(500);
  const [cx, setCx] = useState(127.0276368);
  const [cy, setCy] = useState(37.4979502);
  const [changedDate, setChangedDate] = useState("");
  const [categoryLargeCode, setCategoryLargeCode] = useState("");
  const [categoryMediumCode, setCategoryMediumCode] = useState("");
  const [categorySmallCode, setCategorySmallCode] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [maxPages, setMaxPages] = useState(1);

  const canRun = Boolean(
    status?.enabled && status.serviceKeyConfigured && status.baseUrlConfigured,
  );

  function payload(): StoreOpenApiSyncPayload {
    return {
      operation,
      sidoName: operation === "DONG" ? toOptional(sidoName) : undefined,
      sigunguName: operation === "DONG" ? toOptional(sigunguName) : undefined,
      dongName: operation === "DONG" ? toOptional(dongName) : undefined,
      divId: operation === "DONG" ? divId : undefined,
      key: operation === "DONG" ? toOptional(key) : undefined,
      radius: operation === "RADIUS" ? radius : undefined,
      cx: operation === "RADIUS" ? cx : undefined,
      cy: operation === "RADIUS" ? cy : undefined,
      changedDate: operation === "DATE" ? toOptional(changedDate) : undefined,
      categoryLargeCode: toOptional(categoryLargeCode),
      categoryMediumCode: toOptional(categoryMediumCode),
      categorySmallCode: toOptional(categorySmallCode),
      pageNo,
      pageSize,
      maxPages,
    };
  }

  function handleDryRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onDryRun({ ...payload(), dryRun: true });
  }

  function handleSync() {
    onSync({ ...payload(), dryRun: false });
  }

  return (
    <section
      aria-label="OpenAPI 동기화"
      className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
            <CloudDownload className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              OpenAPI 동기화
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              공공데이터포털 service key는 backend application.yml에서만
              사용됩니다. 먼저 dry-run으로 호출과 파싱 결과를 확인하세요.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onRefreshStatus}>
          <RefreshCw className="size-4" aria-hidden="true" />
          상태 갱신
        </Button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <StatusPill label="기능" active={Boolean(status?.enabled)} loading={isStatusLoading} />
        <StatusPill
          label="service key"
          active={Boolean(status?.serviceKeyConfigured)}
          loading={isStatusLoading}
        />
        <StatusPill
          label="baseUrl"
          active={Boolean(status?.baseUrlConfigured)}
          loading={isStatusLoading}
        />
        <StatusPill
          label="scheduler"
          active={Boolean(status?.schedulerEnabled)}
          loading={isStatusLoading}
        />
      </div>

      {!canRun ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          service key, baseUrl, enabled 설정이 모두 준비되어야 실제 반영을 실행할
          수 있습니다. 설정 전에도 상태 확인은 가능합니다.
        </div>
      ) : null}

      <form onSubmit={handleDryRun} className="mt-5 space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="오퍼레이션" id="openapi-operation">
            <select
              id="openapi-operation"
              value={operation}
              onChange={(event) =>
                setOperation(event.target.value as StoreOpenApiSyncPayload["operation"])
              }
              className={inputClassName}
            >
              <option value="DONG">행정구역 점포 조회</option>
              <option value="RADIUS">반경 내 점포 조회</option>
              <option value="DATE">수정일자 점포 조회</option>
            </select>
          </Field>
          {operation === "DONG" ? (
            <>
              <Field label="divId" id="openapi-div-id">
                <select
                  id="openapi-div-id"
                  value={divId}
                  onChange={(event) =>
                    setDivId(event.target.value as NonNullable<StoreOpenApiSyncPayload["divId"]>)
                  }
                  className={inputClassName}
                >
                  <option value="ctprvnCd">ctprvnCd</option>
                  <option value="signguCd">signguCd</option>
                  <option value="adongCd">adongCd</option>
                </select>
              </Field>
              <Field label="key" id="openapi-key">
                <input
                  id="openapi-key"
                  value={key}
                  onChange={(event) => setKey(event.target.value)}
                  className={inputClassName}
                />
              </Field>
            </>
          ) : null}
          {operation === "DATE" ? (
            <Field label="수정일자" id="openapi-changed-date">
              <input
                id="openapi-changed-date"
                value={changedDate}
                onChange={(event) => setChangedDate(event.target.value)}
                placeholder="YYYYMMDD"
                className={inputClassName}
              />
            </Field>
          ) : null}
        </div>

        {operation === "RADIUS" ? (
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="반경(m)" id="openapi-radius">
              <input
                id="openapi-radius"
                type="number"
                min={1}
                max={2000}
                value={radius}
                onChange={(event) => setRadius(Number(event.target.value))}
                className={inputClassName}
              />
            </Field>
            <Field label="경도(cx)" id="openapi-cx">
              <input
                id="openapi-cx"
                type="number"
                step="0.0000001"
                value={cx}
                onChange={(event) => setCx(Number(event.target.value))}
                className={inputClassName}
              />
            </Field>
            <Field label="위도(cy)" id="openapi-cy">
              <input
                id="openapi-cy"
                type="number"
                step="0.0000001"
                value={cy}
                onChange={(event) => setCy(Number(event.target.value))}
                className={inputClassName}
              />
            </Field>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="시도명" id="openapi-sido">
            <input
              id="openapi-sido"
              value={sidoName}
              onChange={(event) => setSidoName(event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="시군구명" id="openapi-sigungu">
            <input
              id="openapi-sigungu"
              value={sigunguName}
              onChange={(event) => setSigunguName(event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="행정동명" id="openapi-dong">
            <input
              id="openapi-dong"
              value={dongName}
              onChange={(event) => setDongName(event.target.value)}
              placeholder="선택"
              className={inputClassName}
            />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="대분류 코드" id="openapi-large">
            <input
              id="openapi-large"
              value={categoryLargeCode}
              onChange={(event) => setCategoryLargeCode(event.target.value)}
              placeholder="예: Q"
              className={inputClassName}
            />
          </Field>
          <Field label="중분류 코드" id="openapi-medium">
            <input
              id="openapi-medium"
              value={categoryMediumCode}
              onChange={(event) => setCategoryMediumCode(event.target.value)}
              placeholder="예: Q12"
              className={inputClassName}
            />
          </Field>
          <Field label="소분류 코드" id="openapi-small">
            <input
              id="openapi-small"
              value={categorySmallCode}
              onChange={(event) => setCategorySmallCode(event.target.value)}
              placeholder="예: Q12A01"
              className={inputClassName}
            />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="시작 page" id="openapi-page-no">
            <input
              id="openapi-page-no"
              type="number"
              min={1}
              value={pageNo}
              onChange={(event) => setPageNo(Number(event.target.value))}
              className={inputClassName}
            />
          </Field>
          <Field label="page size" id="openapi-page-size">
            <input
              id="openapi-page-size"
              type="number"
              min={1}
              max={1000}
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className={inputClassName}
            />
          </Field>
          <Field label="최대 page" id="openapi-max-pages">
            <input
              id="openapi-max-pages"
              type="number"
              min={1}
              max={10}
              value={maxPages}
              onChange={(event) => setMaxPages(Number(event.target.value))}
              className={inputClassName}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="submit" disabled={!canRun || isRunning}>
            {isRunning ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="size-4" aria-hidden="true" />
            )}
            dry-run 실행
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canRun || isRunning}
            onClick={handleSync}
          >
            실제 반영 실행
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isUpdatingSchedule}
            onClick={() => onToggleSchedule(!status?.schedulerEnabled)}
          >
            <KeyRound className="size-4" aria-hidden="true" />
            {status?.schedulerEnabled ? "예약 동기화 끄기" : "예약 동기화 켜기"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function StatusPill({
  label,
  active,
  loading,
}: {
  label: string;
  active: boolean;
  loading: boolean;
}) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-3">
      <span className="block text-xs font-medium text-slate-500">{label}</span>
      <span
        className={
          active
            ? "mt-1 inline-flex rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800"
            : "mt-1 inline-flex rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-600"
        }
      >
        {loading ? "확인 중" : active ? "설정됨" : "미설정"}
      </span>
    </div>
  );
}

function toOptional(value: string) {
  return value.trim().length > 0 ? value.trim() : undefined;
}
