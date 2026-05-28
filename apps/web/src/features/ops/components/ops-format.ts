export function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export function formatRate(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDuration(seconds: number) {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);

  if (days > 0) {
    return `${days}일 ${hours}시간`;
  }
  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }
  return `${minutes}분`;
}

export function syncStatusLabel(status: string | null) {
  if (!status) {
    return "-";
  }
  const labels: Record<string, string> = {
    RUNNING: "실행 중",
    SUCCESS: "성공",
    PARTIAL_SUCCESS: "부분 성공",
    FAILED: "실패",
  };
  return labels[status] ?? status;
}

export function syncTypeLabel(syncType: string | null) {
  if (!syncType) {
    return "-";
  }
  const labels: Record<string, string> = {
    STORE_CSV_IMPORT: "CSV 점포 동기화",
    STORE_OPENAPI_SYNC: "OpenAPI 점포 동기화",
    REGION_MASTER_OPENAPI_SYNC: "행정구역 마스터",
    CATEGORY_MASTER_OPENAPI_SYNC: "업종 마스터",
  };
  return labels[syncType] ?? syncType;
}
