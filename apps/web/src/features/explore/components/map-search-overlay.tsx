import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type MapSearchOverlayProps = {
  visible: boolean;
  isLoading: boolean;
  onSearch: () => void;
};

export function MapSearchOverlay({
  visible,
  isLoading,
  onSearch,
}: MapSearchOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="absolute inset-x-4 top-16 flex justify-center">
      <Button
        type="button"
        className="bg-teal-700 text-white shadow-lg hover:bg-teal-800"
        onClick={onSearch}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Search className="size-4" aria-hidden="true" />
        )}
        {isLoading ? "지도 영역 조회 중" : "현재 지도 영역에서 검색"}
      </Button>
    </div>
  );
}
