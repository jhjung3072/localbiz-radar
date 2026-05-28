import type { RecentExploreSearch } from "@/features/explore/types";

export const RECENT_EXPLORE_SEARCHES_STORAGE_KEY =
  "localbiz-radar:recent-explore-searches";
export const MAX_RECENT_SEARCH_COUNT = 5;

export function addRecentExploreSearch(
  searches: RecentExploreSearch[],
  search: RecentExploreSearch,
) {
  const normalizedQuery = normalizeQuery(search.query);
  const nextSearch = {
    ...search,
    query: normalizedQuery,
    label: search.label.slice(0, 80),
  };
  const withoutDuplicate = searches.filter(
    (item) => !(item.path === nextSearch.path && normalizeQuery(item.query) === normalizedQuery),
  );

  return [nextSearch, ...withoutDuplicate].slice(0, MAX_RECENT_SEARCH_COUNT);
}

export function parseRecentExploreSearches(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as RecentExploreSearch[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item?.label && item?.path && typeof item.query === "string")
      .slice(0, MAX_RECENT_SEARCH_COUNT);
  } catch {
    return [];
  }
}

export function stringifyRecentExploreSearches(searches: RecentExploreSearch[]) {
  return JSON.stringify(searches.slice(0, MAX_RECENT_SEARCH_COUNT));
}

function normalizeQuery(query: string) {
  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  params.delete("token");
  params.delete("serviceKey");
  return params.toString();
}
