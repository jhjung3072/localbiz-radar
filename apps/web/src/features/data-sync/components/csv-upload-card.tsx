"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { FileUp, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type CsvUploadCardProps = {
  isUploading: boolean;
  onSubmit: (file: File, dryRun: boolean) => void;
};

export function CsvUploadCard({ isUploading, onSubmit }: CsvUploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(true);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      return;
    }
    onSubmit(file, dryRun);
  }

  return (
    <section
      aria-label="CSV 업로드"
      className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
          <FileUp className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            소상공인 상가정보 CSV 동기화
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            먼저 dry-run으로 파일 형식과 row 검증을 확인하세요. 실제 반영은
            stores table에 upsert하고 동기화 이력을 저장합니다.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="store-csv-file"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            CSV 파일
          </label>
          <input
            id="store-csv-file"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full rounded-md border border-slate-200 bg-white text-sm text-slate-700 file:mr-4 file:h-10 file:border-0 file:bg-slate-100 file:px-4 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200 focus:outline-none focus:ring-3 focus:ring-teal-500/20"
          />
        </div>

        <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(event) => setDryRun(event.target.checked)}
            className="mt-1 size-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
          />
          <span>
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ShieldCheck className="size-4 text-teal-700" aria-hidden="true" />
              검증만 실행
            </span>
            <span className="mt-1 block text-sm leading-6 text-slate-600">
              체크하면 DB 저장 없이 parsing과 row validation만 수행합니다.
            </span>
          </span>
        </label>

        <Button
          type="submit"
          disabled={!file || isUploading}
          className="w-full bg-teal-700 text-white hover:bg-teal-800 sm:w-auto"
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <FileUp className="size-4" aria-hidden="true" />
          )}
          {dryRun ? "검증 실행" : "실제 반영"}
        </Button>
      </form>
    </section>
  );
}
