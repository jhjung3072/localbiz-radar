import { cookies } from "next/headers";
import { AdminOpsPageClient } from "@/features/ops/components/admin-ops-page-client";
import { getAdminOpsBootstrap } from "@/features/ops/server/get-admin-ops-bootstrap";

export default async function AdminOpsPage() {
  const cookieHeader = (await cookies()).toString();
  const initialData = cookieHeader
    ? await getAdminOpsBootstrap(cookieHeader).catch(() => null)
    : null;

  return <AdminOpsPageClient initialData={initialData} />;
}
