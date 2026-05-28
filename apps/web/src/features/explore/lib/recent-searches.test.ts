import { describe, expect, it } from "vitest";
import {
  addRecentExploreSearch,
  MAX_RECENT_SEARCH_COUNT,
} from "@/features/explore/lib/recent-searches";
import type { RecentExploreSearch } from "@/features/explore/types";

describe("recent-searches", () => {
  it("deduplicates equal path and query", () => {
    const search: RecentExploreSearch = {
      label: "점포 목록",
      path: "/stores",
      query: "keyword=coffee",
      createdAt: "2026-05-28T00:00:00.000Z",
    };

    expect(addRecentExploreSearch([search], search)).toHaveLength(1);
  });

  it("keeps only five recent searches", () => {
    const searches = Array.from({ length: 7 }).reduce((items, _, index) => {
      return addRecentExploreSearch(items, {
        label: `검색 ${index}`,
        path: "/map",
        query: `radius=${index + 1}`,
        createdAt: `2026-05-28T00:00:0${index}.000Z`,
      });
    }, [] as RecentExploreSearch[]);

    expect(searches).toHaveLength(MAX_RECENT_SEARCH_COUNT);
    expect(searches[0].label).toBe("검색 6");
  });
});
