import { Button } from "@/components/ui/button";

export function CompareErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section
      role="alert"
      className="rounded-[8px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"
    >
      <h2 className="font-semibold">비교 데이터를 불러오지 못했습니다.</h2>
      <p className="mt-2 leading-6">{message}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 border-rose-200 bg-white text-rose-800 hover:bg-rose-100"
        onClick={onRetry}
      >
        다시 시도
      </Button>
    </section>
  );
}
