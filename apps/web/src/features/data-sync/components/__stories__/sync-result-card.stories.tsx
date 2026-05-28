import type { Meta, StoryObj } from "@storybook/nextjs";
import { SyncResultCard } from "@/features/data-sync/components/sync-result-card";
import type { StoreOpenApiSyncResult } from "@/features/data-sync/types";

const meta = {
  title: "DataSync/SyncResultCard",
  component: SyncResultCard,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof SyncResultCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const result: StoreOpenApiSyncResult = {
  syncLogId: 12,
  status: "PARTIAL_SUCCESS",
  dryRun: false,
  requestedPages: 1,
  fetchedRows: 100,
  successRows: 96,
  failedRows: 4,
  skippedRows: 0,
  insertedRows: 84,
  updatedRows: 12,
  message: "일부 row를 제외하고 상가정보 OpenAPI 동기화가 완료되었습니다.",
  errors: [
    {
      pageNo: 1,
      rowNumber: 17,
      message: "필수 주소 정보가 없습니다.",
    },
  ],
};

export const Empty: Story = {
  args: {
    result: null,
  },
};

export const WithResult: Story = {
  args: {
    result,
  },
};
