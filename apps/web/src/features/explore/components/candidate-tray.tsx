"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ShoppingBasket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CandidateRegionCard } from "@/features/explore/components/candidate-region-card";
import { candidateToCompareSearchParams } from "@/features/explore/lib/candidate-storage";
import type { CandidateItem } from "@/features/explore/types";
import { addSafeBreadcrumb } from "@/lib/sentry-utils";

type CandidateTrayProps = {
  candidates: CandidateItem[];
  isReady?: boolean;
  onRemove: (candidateId: string) => void;
  onClear: () => void;
};

export function CandidateTray({
  candidates,
  isReady = true,
  onRemove,
  onClear,
}: CandidateTrayProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedCandidates = useMemo(
    () =>
      selectedIds
        .map((candidateId) => candidates.find((candidate) => candidate.id === candidateId))
        .filter((candidate): candidate is CandidateItem => Boolean(candidate)),
    [candidates, selectedIds],
  );
  const compareHref = useMemo(() => {
    if (selectedCandidates.length !== 2) {
      return "";
    }

    const params = candidateToCompareSearchParams(
      selectedCandidates[0],
      selectedCandidates[1],
    );
    return `/compare?${params.toString()}`;
  }, [selectedCandidates]);

  function toggleCandidate(candidate: CandidateItem) {
    setSelectedIds((currentIds) => {
      if (currentIds.includes(candidate.id)) {
        return currentIds.filter((candidateId) => candidateId !== candidate.id);
      }
      return [...currentIds, candidate.id].slice(-2);
    });
  }

  function handleCompareClick() {
    addSafeBreadcrumb("compare.from-candidate-tray", "후보 바구니에서 비교 실행", {
      selectedCount: selectedCandidates.length,
    });
  }

  return (
    <section
      aria-label="후보 바구니"
      className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
            <ShoppingBasket className="size-4 text-teal-700" aria-hidden="true" />
            후보 바구니
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            지역 또는 점포 후보를 최대 6개까지 저장합니다.
          </p>
        </div>
        {candidates.length > 0 ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-slate-300"
            onClick={() => {
              setSelectedIds([]);
              onClear();
            }}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            비우기
          </button>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        {!isReady ? (
          <div className="h-20 animate-pulse rounded-md bg-slate-100" />
        ) : null}

        {isReady && candidates.length === 0 ? (
          <p className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-500">
            아직 저장한 후보가 없습니다. 점포 목록이나 지도에서 후보를 추가해
            비교 흐름을 이어갈 수 있습니다.
          </p>
        ) : null}

        {candidates.map((candidate) => (
          <CandidateRegionCard
            key={candidate.id}
            candidate={candidate}
            selected={selectedIds.includes(candidate.id)}
            onSelect={toggleCandidate}
            onRemove={(candidateId) => {
              setSelectedIds((currentIds) =>
                currentIds.filter((selectedId) => selectedId !== candidateId),
              );
              onRemove(candidateId);
            }}
          />
        ))}
      </div>

      <div className="mt-4">
        {compareHref ? (
          <Button asChild className="w-full" onClick={handleCompareClick}>
            <Link href={compareHref}>선택 후보로 비교하기</Link>
          </Button>
        ) : (
          <Button type="button" className="w-full" disabled>
            후보 2개 선택 필요
          </Button>
        )}
      </div>
    </section>
  );
}
