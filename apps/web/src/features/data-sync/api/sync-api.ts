import { ApiError, apiClient, getApiBaseUrl } from "@/lib/api-client";
import type {
  StoreCsvImportResult,
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

  const response = await fetch(
    `${getApiBaseUrl()}/api/admin/sync/stores/csv?dryRun=${dryRun}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
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
