import { cookies } from "next/headers";
import { DataSyncPageClient } from "@/features/data-sync/components/data-sync-page-client";
import { getAdminDataSyncBootstrap } from "@/features/data-sync/server/get-admin-data-sync-bootstrap";

export default async function DataSyncPage() {
  const cookieHeader = (await cookies()).toString();
  const initialData = cookieHeader
    ? await getAdminDataSyncBootstrap(cookieHeader).catch(() => null)
    : null;

  return <DataSyncPageClient initialData={initialData} />;
}
