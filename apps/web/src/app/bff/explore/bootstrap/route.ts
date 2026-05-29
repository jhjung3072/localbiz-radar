import { bffData, bffError } from "@/features/bff/server/bff-response";
import { getExploreBootstrap } from "@/features/explore/server/get-explore-bootstrap";

export async function GET() {
  try {
    return bffData(await getExploreBootstrap());
  } catch (error) {
    return bffError(error);
  }
}
