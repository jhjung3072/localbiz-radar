import { Database, KeyRound, ServerCog, ShieldAlert } from "lucide-react";

const envNames = [
  "STORE_OPENAPI_SERVICE_KEY",
  "SPRING_DATASOURCE_URL",
  "NEXT_PUBLIC_API_BASE_URL",
];

export default function ApiSetupPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-teal-700">API 설정 가이드</p>
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
            공공 API 설정 가이드
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            LocalBiz Radar는 실제 공공 데이터 연동을 이후 단계에서 추가합니다.
            이 페이지는 키 발급과 보안 원칙을 정리한 정적 안내입니다.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
          <KeyRound className="size-6 text-teal-700" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-slate-950">
            공공 API 키 발급
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            공공데이터포털 등 제공 기관에서 애플리케이션을 등록하고 서비스 키를
            발급받습니다. 이번 프로젝트에서는 실제 키를 커밋하지 않고 백엔드
            환경변수로만 주입합니다.
          </p>
        </article>
        <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
          <ShieldAlert className="size-6 text-rose-700" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-slate-950">
            프론트엔드 직접 호출 금지
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            브라우저 번들에 포함되는 값은 누구나 확인할 수 있습니다. 서비스 키가
            필요한 공공 API는 Next.js 화면에서 직접 호출하지 않습니다.
          </p>
        </article>
        <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
          <ServerCog className="size-6 text-indigo-700" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-slate-950">
            백엔드 프록시 패턴
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Spring Boot가 서비스 키를 사용해 공공 API를 호출하고, 프론트엔드는
            백엔드의 내부 API만 호출하는 구조로 확장합니다.
          </p>
        </article>
      </section>

      <section
        aria-labelledby="env-title"
        className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Database className="size-5 text-teal-700" aria-hidden="true" />
          <h2 id="env-title" className="text-xl font-semibold text-slate-950">
            환경 변수 예시
          </h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          아래 이름은 설정 위치 예시입니다. 공공데이터 service key는 백엔드
          환경변수로만 사용합니다.
          <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-slate-800">
            NEXT_PUBLIC_
          </code>
          접두사가 붙은 값은 브라우저에 노출될 수 있으므로 공개 가능한 값에만
          사용합니다.
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {envNames.map((name) => (
            <li
              key={name}
              className="rounded-md bg-slate-950 px-3 py-3 font-mono text-sm text-slate-100"
            >
              {name}
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="flow-title"
        className="rounded-[8px] border border-teal-200 bg-teal-50 p-5"
      >
        <h2 id="flow-title" className="text-xl font-semibold text-slate-950">
          이후 연동 흐름
        </h2>
        <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
          <li>1. 백엔드에서 공공 API 클라이언트와 응답 DTO를 정의합니다.</li>
          <li>2. 서비스 키는 Spring Boot 환경변수에서만 읽습니다.</li>
          <li>3. 프론트엔드는 백엔드의 조회 API를 통해 가공된 데이터만 받습니다.</li>
          <li>4. 캐시, 재시도, 오류 메시지는 백엔드 정책에 맞춰 추가합니다.</li>
        </ol>
      </section>
    </div>
  );
}
