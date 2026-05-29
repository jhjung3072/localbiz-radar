import type { AdminDataSyncBffData } from "@/features/bff/server/types";
import { cookieForwardingHeaders } from "@/features/bff/server/cookie-forwarding";
import { buildUrl, toSearchParams } from "@/features/bff/server/query-param";
import { springApiFetch } from "@/features/bff/server/spring-api-client";
import type {
  StoreOpenApiStatus,
  SyncLogPage,
} from "@/features/data-sync/types";
import type { MasterDataStatus } from "@/features/master/types";

export async function getAdminDataSyncBootstrap(
  cookieHeader: string | null,
): Promise<AdminDataSyncBffData> {
  const headers = cookieForwardingHeaders(cookieHeader);
  const [recentLogs, openApiStatus, masterStatus] = await Promise.all([
    springApiFetch<SyncLogPage>(
      buildUrl("/api/admin/sync/logs", toSearchParams({ page: 0, size: 10 })),
      { headers },
    ),
    springApiFetch<StoreOpenApiStatus>("/api/admin/sync/openapi/status", {
      headers,
    }),
    springApiFetch<MasterDataStatus>("/api/admin/sync/master/status", {
      headers,
    }),
  ]);

  return {
    recentLogs,
    openApiStatus,
    masterStatus,
    generatedAt: new Date().toISOString(),
  };
}
