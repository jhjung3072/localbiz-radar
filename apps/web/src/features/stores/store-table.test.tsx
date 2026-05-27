import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getRegions,
  getStoreCategories,
  getStores,
} from "@/features/stores/api/store-api";
import { StoreTable } from "@/features/stores/store-table";

vi.mock("@/features/stores/api/store-api", () => ({
  getStores: vi.fn(),
  getStoreCategories: vi.fn(),
  getRegions: vi.fn(),
}));

const getStoresMock = vi.mocked(getStores);
const getStoreCategoriesMock = vi.mocked(getStoreCategories);
const getRegionsMock = vi.mocked(getRegions);

describe("StoreTable", () => {
  beforeEach(() => {
    getStoresMock.mockReset();
    getStoreCategoriesMock.mockReset();
    getRegionsMock.mockReset();
  });

  it("shows loading state while stores are being fetched", async () => {
    getStoresMock.mockReturnValue(
      new Promise<Awaited<ReturnType<typeof getStores>>>(() => {}),
    );
    getStoreCategoriesMock.mockResolvedValue([]);
    getRegionsMock.mockResolvedValue([]);

    renderWithQueryClient(<StoreTable />);

    expect(await screen.findByText("조회 중")).toBeInTheDocument();
  });
});

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}
