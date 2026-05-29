import { DashboardBootstrapView } from "@/features/dashboard/components/dashboard-bootstrap-view";
import { getDashboardBootstrap } from "@/features/dashboard/server/get-dashboard-bootstrap";

export default async function DashboardPage() {
  const initialData = await getDashboardBootstrap({ sido: "서울특별시" }).catch(
    () => null,
  );

  return <DashboardBootstrapView initialData={initialData} />;
}
