import { Bug, CheckCircle2, ShieldCheck, UploadCloud, XCircle } from "lucide-react";

type SentryStatusCardProps = {
  dsnConfigured: boolean;
  environment: string;
  tracingEnabled: boolean;
  replayEnabled: boolean;
  org?: string;
  project?: string;
};

export function SentryStatusCard({
  dsnConfigured,
  environment,
  tracingEnabled,
  replayEnabled,
  org,
  project,
}: SentryStatusCardProps) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-rose-50 p-2 text-rose-700">
          <Bug className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Sentry 상태</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            브라우저와 Next.js runtime 에러 수집 설정 상태입니다. DSN과 token
            원문은 화면에 표시하지 않습니다.
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <StatusItem
          label="DSN 설정"
          value={dsnConfigured ? "설정됨" : "설정되지 않음"}
          ok={dsnConfigured}
        />
        <StatusItem label="환경" value={environment} ok />
        <StatusItem
          label="Tracing"
          value={tracingEnabled ? "활성" : "비활성"}
          ok={tracingEnabled}
        />
        <StatusItem
          label="Session Replay"
          value={replayEnabled ? "낮은 sample rate로 활성" : "비활성"}
          ok={replayEnabled}
        />
        <StatusItem label="Sentry org" value={org || "미설정"} ok={Boolean(org)} />
        <StatusItem
          label="Sentry project"
          value={project || "미설정"}
          ok={Boolean(project)}
        />
      </dl>

      {!dsnConfigured ? (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
          Sentry DSN이 설정되지 않았습니다. 이벤트 전송을 확인하려면
          NEXT_PUBLIC_SENTRY_DSN을 설정해 주세요.
        </p>
      ) : null}

      <div className="mt-4 flex items-start gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
        <UploadCloud className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          source map upload는 local 화면에서 확인하지 않습니다. CI 또는
          SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT가 있는 build 환경에서만
          수행됩니다.
        </p>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          cookie, authorization, token, serviceKey 계열 값은 Sentry event에서
          제거하도록 설정했습니다.
        </p>
      </div>
    </section>
  );
}

function StatusItem({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  const Icon = ok ? CheckCircle2 : XCircle;

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Icon
          className={ok ? "size-4 text-teal-700" : "size-4 text-slate-400"}
          aria-hidden="true"
        />
        {label}
      </dt>
      <dd className="mt-2 break-all text-sm font-medium text-slate-950">{value}</dd>
    </div>
  );
}
