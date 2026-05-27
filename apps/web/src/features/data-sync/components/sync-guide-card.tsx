import Link from "next/link";
import type { ReactNode } from "react";
import { Database, FileSpreadsheet, KeyRound } from "lucide-react";

export function SyncGuideCard() {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">사용 가이드</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <GuideItem
          icon={<FileSpreadsheet className="size-4" aria-hidden="true" />}
          title="샘플 CSV"
          description="docs/samples/store-import-sample.csv 형식으로 header를 맞춥니다."
        />
        <GuideItem
          icon={<Database className="size-4" aria-hidden="true" />}
          title="반영 범위"
          description="externalStoreId와 sourceSystem 기준으로 stores table에 upsert합니다."
        />
        <GuideItem
          icon={<KeyRound className="size-4" aria-hidden="true" />}
          title="보안 원칙"
          description="공공 데이터 API key는 frontend에 두지 않습니다."
        />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        이 기능은 인증 도입 전까지 개발용 도구입니다. 자세한 CSV header와 오류
        처리 정책은{" "}
        <Link href="/api-setup" className="font-semibold text-teal-700 underline-offset-4 hover:underline">
          API 설정
        </Link>
        과 문서를 함께 확인해 주세요.
      </p>
    </section>
  );
}

function GuideItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <span className="flex size-7 items-center justify-center rounded-md bg-white text-teal-700">
          {icon}
        </span>
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
