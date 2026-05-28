"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addRecentExploreSearch,
  parseRecentExploreSearches,
  RECENT_EXPLORE_SEARCHES_STORAGE_KEY,
  stringifyRecentExploreSearches,
} from "@/features/explore/lib/recent-searches";
import type { RecentExploreSearch } from "@/features/explore/types";

export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentExploreSearch[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearches(
        parseRecentExploreSearches(
          window.localStorage.getItem(RECENT_EXPLORE_SEARCHES_STORAGE_KEY),
        ),
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const saveSearch = useCallback((search: Omit<RecentExploreSearch, "createdAt">) => {
    setSearches((currentSearches) => {
      const nextSearches = addRecentExploreSearch(currentSearches, {
        ...search,
        createdAt: new Date().toISOString(),
      });
      window.localStorage.setItem(
        RECENT_EXPLORE_SEARCHES_STORAGE_KEY,
        stringifyRecentExploreSearches(nextSearches),
      );
      return nextSearches;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setSearches([]);
    window.localStorage.removeItem(RECENT_EXPLORE_SEARCHES_STORAGE_KEY);
  }, []);

  return {
    searches,
    saveSearch,
    clearSearches,
  };
}
