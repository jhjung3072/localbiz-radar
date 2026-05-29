import type { AdminOpsBffData } from "@/features/bff/server/types";
import { cookieForwardingHeaders } from "@/features/bff/server/cookie-forwarding";
import { buildUrl, toSearchParams } from "@/features/bff/server/query-param";
import { springApiFetch } from "@/features/bff/server/spring-api-client";
import type {
  OpsDataQuality,
  OpsOverview,
  OpsSyncSummary,
} from "@/features/ops/types";

export async function getAdminOpsBootstrap(
  cookieHeader: string | null,
): Promise<AdminOpsBffData> {
  const headers = cookieForwardingHeaders(cookieHeader);
  const [overview, syncSummary, dataQuality] = await Promise.all([
    springApiFetch<OpsOverview>("/api/admin/ops/overview", { headers }),
    springApiFetch<OpsSyncSummary>(
      buildUrl("/api/admin/ops/sync-summary", toSearchParams({ days: 7 })),
      { headers },
    ),
    springApiFetch<OpsDataQuality>("/api/admin/ops/data-quality", { headers }),
  ]);

  return {
    overview,
    syncSummary,
    dataQuality,
    generatedAt: new Date().toISOString(),
  };
}
