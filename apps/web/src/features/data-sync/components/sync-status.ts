import type { SyncStatus } from "@/features/data-sync/types";

export function statusLabel(status: SyncStatus) {
  switch (status) {
    case "RUNNING":
      return "진행 중";
    case "SUCCESS":
      return "성공";
    case "PARTIAL_SUCCESS":
      return "부분 성공";
    case "FAILED":
      return "실패";
  }
}

export function statusToneClassName(status: SyncStatus) {
  switch (status) {
    case "RUNNING":
      return "bg-blue-50 text-blue-800";
    case "SUCCESS":
      return "bg-teal-50 text-teal-800";
    case "PARTIAL_SUCCESS":
      return "bg-amber-50 text-amber-800";
    case "FAILED":
      return "bg-rose-50 text-rose-800";
  }
}
