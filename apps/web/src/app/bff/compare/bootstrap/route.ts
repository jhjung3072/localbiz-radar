import { bffData, bffError } from "@/features/bff/server/bff-response";
import { pickSearchParams } from "@/features/bff/server/query-param";
import { getCompareBootstrap } from "@/features/compare/server/get-compare-bootstrap";

const COMPARE_BOOTSTRAP_KEYS = [
  "ctprvnCd",
  "signguCd",
  "groupBy",
  "indsLclsCd",
  "indsMclsCd",
  "indsSclsCd",
  "limit",
];

export async function GET(request: Request) {
  try {
    const params = pickSearchParams(
      new URL(request.url).searchParams,
      COMPARE_BOOTSTRAP_KEYS,
    );
    return bffData(await getCompareBootstrap(params));
  } catch (error) {
    return bffError(error);
  }
}
