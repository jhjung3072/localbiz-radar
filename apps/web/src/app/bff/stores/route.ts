import { bffData, bffError } from "@/features/bff/server/bff-response";
import { getStoresBootstrap } from "@/features/explore/server/get-stores-bootstrap";

export async function GET(request: Request) {
  try {
    return bffData(await getStoresBootstrap(new URL(request.url).searchParams));
  } catch (error) {
    return bffError(error);
  }
}
