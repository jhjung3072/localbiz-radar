"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addCandidate,
  CANDIDATE_TRAY_STORAGE_KEY,
  parseCandidateTray,
  removeCandidate,
  stringifyCandidateTray,
} from "@/features/explore/lib/candidate-storage";
import type { CandidateItem } from "@/features/explore/types";
import { addSafeBreadcrumb } from "@/lib/sentry-utils";

export function useCandidateTray() {
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const candidatesRef = useRef<CandidateItem[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedCandidates = parseCandidateTray(
        window.localStorage.getItem(CANDIDATE_TRAY_STORAGE_KEY),
      );
      candidatesRef.current = storedCandidates;
      setCandidates(storedCandidates);
      setIsReady(true);
    }, 0);

    function handleStorage(event: StorageEvent) {
      if (event.key === CANDIDATE_TRAY_STORAGE_KEY) {
        const nextCandidates = parseCandidateTray(event.newValue);
        candidatesRef.current = nextCandidates;
        setCandidates(nextCandidates);
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const persist = useCallback((nextCandidates: CandidateItem[]) => {
    candidatesRef.current = nextCandidates;
    setCandidates(nextCandidates);
    window.localStorage.setItem(
      CANDIDATE_TRAY_STORAGE_KEY,
      stringifyCandidateTray(nextCandidates),
    );
  }, []);

  const add = useCallback(
    (candidate: CandidateItem) => {
      const nextCandidates = addCandidate(candidatesRef.current, candidate);
      persist(nextCandidates);
      addSafeBreadcrumb("candidate.add", "후보 바구니 추가", {
        candidateType: candidate.type,
        source: "source" in candidate ? candidate.source : undefined,
        hasRegionCode: Boolean(candidate.signguCd),
      });
    },
    [persist],
  );

  const remove = useCallback(
    (candidateId: string) => {
      persist(removeCandidate(candidatesRef.current, candidateId));
      addSafeBreadcrumb("candidate.remove", "후보 바구니 삭제", {
        candidateId,
      });
    },
    [persist],
  );

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  return {
    candidates,
    isReady,
    addCandidate: add,
    removeCandidate: remove,
    clearCandidates: clear,
  };
}
