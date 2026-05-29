import { bffData, bffError } from "@/features/bff/server/bff-response";
import { BFF_ERROR_CODES, BffUpstreamError } from "@/features/bff/server/bff-error";
import { hasAuthCookie } from "@/features/bff/server/cookie-forwarding";
import { getAdminOpsBootstrap } from "@/features/ops/server/get-admin-ops-bootstrap";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!hasAuthCookie(cookieHeader)) {
    return bffError(
      new BffUpstreamError({
        code: BFF_ERROR_CODES.UNAUTHORIZED,
        message: "로그인이 필요합니다.",
        status: 401,
        upstreamPath: "/api/admin/ops",
      }),
    );
  }

  try {
    return bffData(await getAdminOpsBootstrap(cookieHeader));
  } catch (error) {
    return bffError(error);
  }
}
