import { bffData, bffError } from "@/features/bff/server/bff-response";
import { pickSearchParams } from "@/features/bff/server/query-param";
import { getDashboardBootstrap } from "@/features/dashboard/server/get-dashboard-bootstrap";

const DASHBOARD_KEYS = [
  "sido",
  "sigungu",
  "dong",
  "categoryLargeCode",
  "categoryMediumCode",
  "categorySmallCode",
];

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const dashboardParams = pickSearchParams(params, DASHBOARD_KEYS);
    return bffData(await getDashboardBootstrap(dashboardParams));
  } catch (error) {
    return bffError(error);
  }
}
