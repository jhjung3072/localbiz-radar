import { ApiError, apiClient, apiFetch } from "@/lib/api-client";
import type {
  StoreCsvImportResult,
  StoreOpenApiStatus,
  StoreOpenApiSyncPayload,
  StoreOpenApiSyncResult,
  SyncLogDetail,
  SyncLogPage,
  SyncLogSearchParams,
} from "@/features/data-sync/types";

type ImportStoreCsvParams = {
  file: File;
  dryRun: boolean;
};

export async function importStoreCsv({
  file,
  dryRun,
}: ImportStoreCsvParams) {
  const formData = new FormData();
  formData.set("file", file);

  const response = await apiFetch(
    `/api/admin/sync/stores/csv?dryRun=${dryRun}`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<StoreCsvImportResult>;
}

export function getSyncLogs(params: SyncLogSearchParams) {
  return apiClient<SyncLogPage>(
    `/api/admin/sync/logs?${toSearchParams(params).toString()}`,
  );
}

export function getSyncLogDetail(id: number) {
  return apiClient<SyncLogDetail>(`/api/admin/sync/logs/${id}`);
}

export function getOpenApiSyncStatus() {
  return apiClient<StoreOpenApiStatus>("/api/admin/sync/openapi/status");
}

export function syncStoresFromOpenApi(payload: StoreOpenApiSyncPayload) {
  return apiClient<StoreOpenApiSyncResult>("/api/admin/sync/stores/openapi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function dryRunStoresFromOpenApi(payload: StoreOpenApiSyncPayload) {
  return apiClient<StoreOpenApiSyncResult>(
    "/api/admin/sync/stores/openapi/dry-run",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export function updateOpenApiSchedule(schedulerEnabled: boolean) {
  return apiClient<StoreOpenApiStatus>("/api/admin/sync/openapi/schedule", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ schedulerEnabled }),
  });
}

function toSearchParams(
  params: Record<string, string | number | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "all" && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "CSV 업로드 요청에 실패했습니다.";
  } catch {
    return "CSV 업로드 요청에 실패했습니다.";
  }
}
