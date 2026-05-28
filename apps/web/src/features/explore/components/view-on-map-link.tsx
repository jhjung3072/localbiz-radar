import Link from "next/link";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  serializeExploreQuery,
} from "@/features/explore/lib/explore-url-params";
import type { ExploreQueryState } from "@/features/explore/types";

type ViewOnMapLinkProps = {
  query: ExploreQueryState;
  onClick?: () => void;
};

export function ViewOnMapLink({ query, onClick }: ViewOnMapLinkProps) {
  const searchParams = serializeExploreQuery(
    { ...query, page: 0 },
    { includePaging: false, includeMap: true },
  );
  const href = searchParams.toString()
    ? `/map?${searchParams.toString()}`
    : "/map";

  return (
    <Button asChild variant="outline" onClick={onClick}>
      <Link href={href}>
        <Map className="size-4" aria-hidden="true" />
        지도에서 보기
      </Link>
    </Button>
  );
}
