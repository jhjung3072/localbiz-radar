"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  mergeExploreQuery,
  parseExploreSearchParams,
  serializeExploreQuery,
} from "@/features/explore/lib/explore-url-params";
import type { ExploreQueryState } from "@/features/explore/types";

type UpdateOptions = {
  replace?: boolean;
  scroll?: boolean;
};

export function useExploreUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(
    () => parseExploreSearchParams(searchParams),
    [searchParams],
  );
  const queryRef = useRef(query);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  function setQuery(patch: Partial<ExploreQueryState>, options?: UpdateOptions) {
    const nextQuery = mergeExploreQuery(queryRef.current, patch);
    queryRef.current = nextQuery;
    const serialized = serializeExploreQuery(nextQuery).toString();
    const nextUrl = serialized ? `${pathname}?${serialized}` : pathname;
    if (options?.replace) {
      router.replace(nextUrl, { scroll: options?.scroll ?? false });
      return;
    }
    router.push(nextUrl, { scroll: options?.scroll ?? false });
  }

  function replaceQuery(nextQuery: ExploreQueryState, options?: UpdateOptions) {
    queryRef.current = nextQuery;
    const serialized = serializeExploreQuery(nextQuery).toString();
    const nextUrl = serialized ? `${pathname}?${serialized}` : pathname;
    router.replace(nextUrl, { scroll: options?.scroll ?? false });
  }

  return {
    query,
    setQuery,
    replaceQuery,
    pathname,
  };
}
