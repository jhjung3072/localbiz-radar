import { bffData, bffError } from "@/features/bff/server/bff-response";
import { getCompareReport } from "@/features/reports/server/get-compare-report";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    return bffData(await getCompareReport(params));
  } catch (error) {
    return bffError(error);
  }
}
