"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { CloudDownload, KeyRound, Loader2, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  StoreOpenApiStatus,
  StoreOpenApiSyncPayload,
} from "@/features/data-sync/types";
import type { Region, StoreCategory } from "@/features/stores/types";

type OpenApiSyncCardProps = {
  status?: StoreOpenApiStatus;
  isStatusLoading: boolean;
  isRunning: boolean;
  isUpdatingSchedule: boolean;
  onDryRun: (payload: StoreOpenApiSyncPayload) => void;
  onSync: (payload: StoreOpenApiSyncPayload) => void;
  onRefreshStatus: () => void;
  onToggleSchedule: (enabled: boolean) => void;
  regions: Region[];
  categories: StoreCategory[];
  isFilterLoading: boolean;
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
  regions,
  categories,
  isFilterLoading,
}: OpenApiSyncCardProps) {
  const [operation, setOperation] =
    useState<StoreOpenApiSyncPayload["operation"]>("DONG");
  const [sidoCode, setSidoCode] = useState("11");
  const [sigunguCode, setSigunguCode] = useState("11680");
  const [dongCode, setDongCode] = useState("all");
  const [radius, setRadius] = useState(500);
  const [cx, setCx] = useState(127.0276368);
  const [cy, setCy] = useState(37.4979502);
  const [changedDate, setChangedDate] = useState("");
  const [categoryLargeCode, setCategoryLargeCode] = useState("all");
  const [categoryMediumCode, setCategoryMediumCode] = useState("all");
  const [categorySmallCode, setCategorySmallCode] = useState("all");
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [maxPages, setMaxPages] = useState(1);

  const selectedSido = regions.find((region) => region.sidoCode === sidoCode);
  const sigunguOptions = selectedSido?.sigunguList ?? [];
  const selectedSigungu = sigunguOptions.find(
    (option) => option.sigunguCode === sigunguCode,
  );
  const dongOptions = selectedSigungu?.dongList ?? [];
  const selectedDong = dongOptions.find((option) => option.dongCode === dongCode);
  const selectedLargeCategory = categories.find(
    (category) => category.largeCode === categoryLargeCode,
  );
  const mediumCategoryOptions = selectedLargeCategory?.mediumCategories ?? [];
  const selectedMediumCategory = mediumCategoryOptions.find(
    (category) => category.mediumCode === categoryMediumCode,
  );
  const smallCategoryOptions = selectedMediumCategory?.smallCategories ?? [];

  const canRun = Boolean(
    status?.enabled && status.serviceKeyConfigured && status.baseUrlConfigured,
  );

  function payload(): StoreOpenApiSyncPayload {
    const regionFilter = resolveRegionFilter({
      sidoCode,
      sigunguCode,
      dongCode,
    });

    return {
      operation,
      sidoName: operation === "DONG" ? selectedSido?.sidoName : undefined,
      sigunguName: operation === "DONG" ? selectedSigungu?.sigunguName : undefined,
      dongName: operation === "DONG" ? selectedDong?.dongName : undefined,
      divId: operation === "DONG" ? regionFilter.divId : undefined,
      key: operation === "DONG" ? regionFilter.key : undefined,
      radius: operation === "RADIUS" ? radius : undefined,
      cx: operation === "RADIUS" ? cx : undefined,
      cy: operation === "RADIUS" ? cy : undefined,
      changedDate: operation === "DATE" ? toOptional(changedDate) : undefined,
      categoryLargeCode: toOptionalSelect(categoryLargeCode),
      categoryMediumCode: toOptionalSelect(categoryMediumCode),
      categorySmallCode: toOptionalSelect(categorySmallCode),
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
              <Field label="시도" id="openapi-sido-code">
                <select
                  id="openapi-sido-code"
                  value={sidoCode}
                  onChange={(event) => {
                    setSidoCode(event.target.value);
                    setSigunguCode("all");
                    setDongCode("all");
                  }}
                  disabled={isFilterLoading}
                  className={inputClassName}
                >
                  <option value="all">전체 시도</option>
                  {regions.map((region) => (
                    <option key={region.sidoCode} value={region.sidoCode}>
                      {region.sidoName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="시군구" id="openapi-sigungu-code">
                <select
                  id="openapi-sigungu-code"
                  value={sigunguCode}
                  onChange={(event) => {
                    setSigunguCode(event.target.value);
                    setDongCode("all");
                  }}
                  disabled={sidoCode === "all" || isFilterLoading}
                  className={inputClassName}
                >
                  <option value="all">전체 시군구</option>
                  {sigunguOptions.map((sigungu) => (
                    <option key={sigungu.sigunguCode} value={sigungu.sigunguCode}>
                      {sigungu.sigunguName}
                    </option>
                  ))}
                </select>
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

        {operation === "DONG" ? (
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="행정동" id="openapi-dong-code">
              <select
                id="openapi-dong-code"
                value={dongCode}
                onChange={(event) => setDongCode(event.target.value)}
                disabled={sigunguCode === "all" || isFilterLoading}
                className={inputClassName}
              >
                <option value="all">전체 행정동</option>
                {dongOptions.map((dong) => (
                  <option key={dong.dongCode} value={dong.dongCode}>
                    {dong.dongName}
                  </option>
                ))}
              </select>
            </Field>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600 md:col-span-2">
              선택한 지역 코드로 divId/key를 자동 구성합니다. 시군구까지 선택하면
              signguCd, 행정동까지 선택하면 adongCd 기준으로 조회합니다.
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="대분류" id="openapi-large">
            <select
              id="openapi-large"
              value={categoryLargeCode}
              onChange={(event) => {
                setCategoryLargeCode(event.target.value);
                setCategoryMediumCode("all");
                setCategorySmallCode("all");
              }}
              disabled={isFilterLoading}
              className={inputClassName}
            >
              <option value="all">전체 대분류</option>
              {categories.map((category) => (
                <option key={category.largeCode} value={category.largeCode}>
                  {category.largeName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="중분류" id="openapi-medium">
            <select
              id="openapi-medium"
              value={categoryMediumCode}
              onChange={(event) => {
                setCategoryMediumCode(event.target.value);
                setCategorySmallCode("all");
              }}
              disabled={categoryLargeCode === "all" || isFilterLoading}
              className={inputClassName}
            >
              <option value="all">전체 중분류</option>
              {mediumCategoryOptions.map((category) => (
                <option key={category.mediumCode} value={category.mediumCode}>
                  {category.mediumName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="소분류" id="openapi-small">
            <select
              id="openapi-small"
              value={categorySmallCode}
              onChange={(event) => setCategorySmallCode(event.target.value)}
              disabled={categoryMediumCode === "all" || isFilterLoading}
              className={inputClassName}
            >
              <option value="all">전체 소분류</option>
              {smallCategoryOptions.map((category) => (
                <option key={category.smallCode} value={category.smallCode}>
                  {category.smallName}
                </option>
              ))}
            </select>
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

function toOptionalSelect(value: string) {
  return value !== "all" && value.trim().length > 0 ? value.trim() : undefined;
}

function resolveRegionFilter({
  sidoCode,
  sigunguCode,
  dongCode,
}: {
  sidoCode: string;
  sigunguCode: string;
  dongCode: string;
}) {
  if (dongCode !== "all") {
    return { divId: "adongCd" as const, key: dongCode };
  }
  if (sigunguCode !== "all") {
    return { divId: "signguCd" as const, key: sigunguCode };
  }
  if (sidoCode !== "all") {
    return { divId: "ctprvnCd" as const, key: sidoCode };
  }
  return { divId: "signguCd" as const, key: "11680" };
}
