import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "http://localhost:9090/targets", label: "Prometheus 수집 상태" },
  { href: "http://localhost:3001", label: "Grafana 대시보드" },
];

export function ObservabilityGuideCard() {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">모니터링 안내</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        로컬 관측성 스택을 실행하면 Prometheus, Grafana, Loki에서 API 지표와
        로그를 확인할 수 있습니다.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {links.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm">
            <a href={link.href} target="_blank" rel="noreferrer">
              {link.label}
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </Button>
        ))}
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <Endpoint label="Health check" value="/actuator/health" />
        <Endpoint
          label="Prometheus metrics"
          value="http://localhost:8080/actuator/prometheus"
        />
        <Endpoint
          label="Prometheus scrape target"
          value="host.docker.internal:8080/actuator/prometheus"
        />
      </dl>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        Prometheus Targets 화면의 host.docker.internal 링크는 Docker container
        내부 기준 주소입니다. 브라우저에서 metrics를 직접 확인할 때는
        localhost 주소를 사용하세요. Loki 로그는 Grafana Explore에서
        datasource를 Loki로 선택한 뒤 traceId 또는 container label로 조회합니다.
      </p>
    </section>
  );
}

function Endpoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 break-all font-mono text-sm text-slate-950">{value}</dd>
    </div>
  );
}
